const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const isAuth = require(path.join(rootdir, 'middlewares', 'is-authenticated'));

// Controllers
const orderController = require(path.join(rootdir, 'controllers', 'user', 'order'));

const router = express.Router();

router.get('/orders', isAuth, orderController.getOrders);

module.exports = router;