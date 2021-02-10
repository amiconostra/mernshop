const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const isAuth = require(path.join(rootdir, 'middlewares', 'is-authenticated'));
const inputValidator = require(path.join(rootdir, 'middlewares', 'input-validator'));
const upload = require(path.join(rootdir, 'config', 'multer'));

// Controllers
const profileController = require(path.join(rootdir, 'controllers', 'user', 'profile'));

const router = express.Router();

router.get('/profile', isAuth, profileController.getProfile);

router.get('/profile-settings', isAuth, profileController.getProfileSettings);

router.post('/profile-settings', isAuth, upload.single('avatar'), inputValidator.validate('profile'), profileController.postProfileSettings);

router.get('/profile-security', isAuth, profileController.getProfileSecurity);

router.put('/profile-security/:userId', isAuth, profileController.putProfileSecurity);

module.exports = router;