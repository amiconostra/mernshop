const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const isAuth = require(path.join(rootdir, 'middlewares', 'is-authenticated'));

// Controllers
const dashboardController = require(path.join(rootdir, 'controllers', 'user', 'dashboard'));

const router = express.Router();

router.get('/', isAuth, dashboardController.getDashboard);

module.exports = router;