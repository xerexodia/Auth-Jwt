const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config");

const app = express();


// settings
app.set("port", config.port);


// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


// Routes
app.use(require("./src/routes/auth.routes"));

module.exports = app;
