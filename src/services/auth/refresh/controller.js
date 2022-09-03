const cnx = require("../../../connection");
const sql = require("mssql");
const Logger = require("../../../utils/logger");
const ApiError = require("../../../error/api.error");
const HttpStatusCode = require("../../../error/error.status");
const logger = new Logger("refreshToken");
const jwt = require("jsonwebtoken");
const { findUser } = require("../refresh/query");
require("dotenv").config();

const handleRefresh = async (req, res) => {
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
  try {
      const pool = await cnx();


  // searching for user by refresh token
  const foundUser = await pool
    .request()
    .input("RefreshToken", sql.NVarChar, refreshToken)
    .query(findUser);
  if (!foundUser.recordset[0]) {
    logger.info("forbidden no user found");
    return res.sendStatus(403);
  }

  // verifying the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
    if (err) {
      logger.info("error occured while verifying token", err);
      return res.sendStatus(403);
    } else if (foundUser.recordset[0].User_Id !== decoded.id) {
      logger.info("Wrong user");
      return res.sendStatus(403);
    }

    
    // updating the acccess token
    const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN, {
      expiresIn: "30s",
    });
    res.json({ accessToken });
  });
  } catch (error) {
      logger.error('error occured while refreshing token',error)
      throw new ApiError('failed to refresh',HttpStatusCode.Internal_Server_Error,'error occured while refreshing token',true)
  }
  
};

module.exports = handleRefresh;
