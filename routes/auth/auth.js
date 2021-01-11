const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const inputValidator = require(path.join(rootdir, 'middlewares', 'input-validator'));

// Controllers
const authController = require(path.join(rootdir, 'controllers', 'auth', 'auth'));

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', inputValidator.validate('login'), authController.postLogin);

router.get('/register', authController.getRegister);

router.post('/register', inputValidator.validate('register'), authController.postRegister);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', inputValidator.validate('email'), authController.postReset);

router.get('/reset/:token', authController.getResetPassword);

router.post('/reset/password', inputValidator.validate('resetPassword'), authController.postResetPassword);

router.get('/verify', authController.getVerifyEmail);

router.post('/verify', inputValidator.validate('email'), authController.postVerifyEmail);

router.get('/verify/email', authController.getVerifyAccount);

router.post('/verify/email', inputValidator.validate('email'), authController.postVerifyAccount);

router.get('/verify/:token', authController.getVerifyToken);

router.get('/confirmation', authController.getConfirmation);

module.exports = router;