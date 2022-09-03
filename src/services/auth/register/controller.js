const cnx = require("../../../connection");
const query = require("./query");
const sql = require("mssql");
const Logger = require("../../../utils/logger");
const ApiError = require("../../../error/api.error");
const HttpStatusCode = require("../../../error/error.status");
const { findUser, addUser, addLogin } = require("./query");
const logger = new Logger("addUser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createUser = async (req, res) => {
  const { Mail, FirstName, LastName, Password, CurrentLanguage } = req.body;
  const Role = process.env.AGENCY_ROLE;
  const UserType = process.env.USER_TYPE_AGENCY;
  // verfiying empty fields
  if (Mail == "" || Password == "") {
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
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(Mail)) {
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

    //verifying password length
  } else if (Password.length < 8) {
    res.json({
      status: "Echec",
      msg: "Mot de passe trop courte",
    });
    throw new ApiError(
      "passwrd faible",
      HttpStatusCode.Internal_Server_Error,
      "passwrd faible:cette mot de passe est faible",
      true
    );
  } else {
    try {
      // cheking for user existence
      const pool = await cnx();
      const user = await pool
        .request()
        .input("Mail", sql.NVarChar, Mail)
        .query(findUser);
      if (user.recordset[0]) {
        res.json({
          status: "Echec",
          msg: "Utilisateur existe déja",
        });
      } else {
        // hashing pwd
        const pwdCrypted = bcrypt.hashSync(Password, 10);

        // registring user
        const registerUser = await pool
          .request()
          .input("Mail", sql.NVarChar, Mail)
          .input("Password", sql.NVarChar, pwdCrypted)
          .query(addUser);

        // create JSON WEB TOKENS
        const accessToken = jwt.sign(
          {
            id: registerUser.recordset[0].Id,
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: "30s" }
        );
        const refreshToken = jwt.sign(
          {
            id: registerUser.recordset[0].Id,
          },
          process.env.REFRESH_TOKEN,
          { expiresIn: "1d" }
        );
        const loginUser = await pool
          .request()
          .input(
            "User_Id",
            sql.NVarChar,
            registerUser.recordset[0].Id.toString()
          )
          .input("RefreshToken", sql.NVarChar, refreshToken)
          .query(addLogin);
        // storing the refresh token in a http only cookie
        res.cookie("token", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.json({
          status: "Success",
          msg: "Bienvenue",
          user: {
            email: registerUser.recordset[0].Mail
          },
          accessToken,
        });
        logger.info("addUser", registerUser.recordset[0]);
      }

      (await cnx()).close();
    } catch (error) {
      logger.error("addUser", error);
    }
  }
};


module.exports = createUser;
