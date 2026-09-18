const express = require('express');
const router = express.Router();
const AuthControllerMVC = require('../controllers/AuthControllerMVC');

router.post('/login', AuthControllerMVC.login);

module.exports = router;