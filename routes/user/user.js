const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const isAuth = require(path.join(rootdir, 'middlewares', 'is-authenticated'));
const inputValidator = require(path.join(rootdir, 'middlewares', 'input-validator'));

// Controllers
const userController = require(path.join(rootdir, 'controllers', 'user', 'user'));

const router = express.Router();

router.get('/user/:username', userController.getUser);

router.get('/user/:username/product/:productId', userController.getProduct);

module.exports = router;