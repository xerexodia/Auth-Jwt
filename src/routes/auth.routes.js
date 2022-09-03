const express = require('express');
const router = express.Router();
const createUser = require('../services/auth/register/controller');
const handleRefresh = require('../services/auth/refresh/controller')
const handleLogin = require('../services/auth/login/controller');
const {getAutoCompletion} = require('../services/api/controller');


router.post("/authApi/register",createUser);
router.get("/authApi/refresh",handleRefresh)
router.post("/authApi/login",handleLogin)


module.exports = router;

