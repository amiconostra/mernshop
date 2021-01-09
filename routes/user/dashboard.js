const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));

// Controllers
const dashboardController = require(path.join(rootdir, 'controllers', 'user', 'dashboard'));

const router = express.Router();

router.get('/', dashboardController.getDashboard);

module.exports = router;