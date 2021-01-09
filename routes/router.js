const express = require('express');

// Home Routes
const indexRoute = require('./home/index');

// User Routes
const dashboardRoutes = require('./user/dashboard');
const productRoutes = require('./user/product');

const router = express.Router();

router.use(indexRoute);

// User Routes
router.use('/dashboard', dashboardRoutes);
router.use('/dashboard', productRoutes);

module.exports = router;