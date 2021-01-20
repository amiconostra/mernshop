const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');

// Controllers
const userController = require(path.join(rootdir, 'controllers', 'user', 'user'));

const router = express.Router();

router.get('/user/:username', userController.getUser);

router.get('/user/:username/product/:productId', userController.getProduct);

module.exports = router;