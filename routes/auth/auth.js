const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');

// Controllers
const authController = require(path.join(rootdir, 'controllers', 'auth', 'auth'));

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);

router.post('/register', authController.postRegister);

router.post('/logout', authController.postLogout);

module.exports = router;