require("dotenv").config();
const jwt = require("jsonwebtoken");
const errorStatus = require("../../../error/error.status");
const Logger = require("../../../utils/logger");
const ApiError = require("../../../error/api.error");
const HttpStatusCode = require("../error/error.status");
const logger = new Logger("verifyUser");

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logger.error("User not authorized"), res.sendStatus(403);
    throw new ApiError(
      "forbidden",
      HttpStatusCode.Forbidden,
      "Forbidden:unauthorized user",
      true
    );
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOEKN, (err, decoded) => {
    if (err) {
      logger.error("invalid token", err);
      return res.sendStatus(403);
    }
    req.Id = decoded.Id;
    next();
  });
};

module.exports = verifyJwt
