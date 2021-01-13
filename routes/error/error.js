const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');

// Controllers
const errorController = require(path.join(rootdir, 'controllers', 'error', 'error'));

const router = express.Router();

router.use(errorController.get404);

module.exports = router;