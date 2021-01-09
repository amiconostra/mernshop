const express = require('express');

// Controllers
const indexController = require('../../controllers/home/index');

const router = express.Router();

router.get('/', indexController.getIndex);

module.exports = router;