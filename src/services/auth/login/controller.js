const cnx = require("../../../connection");
const sql = require("mssql");
const Logger = require("../../../utils/logger");
const ApiError = require("../../../error/api.error");
const HttpStatusCode = require("../../../error/error.status");
const logger = new Logger("login");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUser, findLogin } = require("./query");
require("dotenv").config();

const handleLogin = async (req, res) => {
  const { password, email } = req.body;
  const cookie = req.cookies;
  
  // verifying the existence of the cookie and the token
  if (!cookie?.token) {
    logger.error("unauthorized");
    throw new ApiError(
      "unauthorized",
      HttpStatusCode.Unauthorized,
      "no token was found",
      true
    );
  }
  const refreshToken = cookie.token;
  if (email == "" || password == "") {
    res.json({
      status: "Echec",
      msg: "champs obligatoire",
    });
    throw new ApiError(
      "champs vide",
      HttpStatusCode.Internal_Server_Error,
      "champs vide:tout les champs sont obligatoire",
      true
    );
    //verifying email
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "Echec",
      msg: "Addresse email invalide",
    });
    throw new ApiError(
      "email invalide",
      HttpStatusCode.Internal_Server_Error,
      "email invalide:cette adresse email est invalide",
      true
    );
  }
  try {
    // searching for user by mail
    const pool = await cnx();
    const foundUser = await pool
      .request()
      .input("Mail", sql.NVarChar, email)
      .query(findUser);
    if (!foundUser.recordset[0]) {
      logger.error("no record found");
      res.sendStatus(401);
      throw new ApiError(
        "User not found",
        HttpStatusCode.Internal_Server_Error,
        "there is no user with such email",
        true
      );
    }
    // maching the password
    const match = bcrypt.compareSync(password, foundUser.recordset[0].Password);
    if (!match) {
      return res.json({
        status: "Echec",
        msg: "mot de passe incorrecte",
      });
    } else {
      // cheking for user login and tokens
      const foundLogin = await pool
        .request()
        .input("User_Id", sql.Int, foundUser.recordset[0].Id)
        .query(findLogin);
      if (!foundLogin.recordset[0]) {
        logger.fatal("fatal error user reigstred and does not exist in login");
        throw new ApiError(
          "fatal error",
          HttpStatusCode.Internal_Server_Error,
          "can't find login of user",
          true
        );
      }
      // verifying refresh token
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
        if (err) {
          logger.info("error occured while verifying token", err);
          return res.sendStatus(403);
        } else if (foundUser.recordset[0].Id !== decoded.id) {
          logger.info("Wrong user");
          return res.sendStatus(403);
        }
        // updating access token
        const accessToken = jwt.sign(
          { id: decoded.id},
          process.env.ACCESS_TOKEN,
          {
            expiresIn: "30s",
          }
        );
        res.json({
          status: "Success",
          msg: "Bienvenue",
          user: {
            email: foundUser.recordset[0].Mail,
          },
          accessToken,
        });
      });
    }
  } catch (error) {
    logger.error("unexpexted error", error);
  }
};

module.exports = handleLogin;
