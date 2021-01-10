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

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getResetPassword);

router.post('/reset/password', authController.postResetPassword);

router.get('/confirmation', authController.getConfirmation);

module.exports = router;