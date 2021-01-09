const express = require('express');

// Home Routes
const indexRoute = require('./home/index');

// User Routes
const dashboardRoutes = require('./user/dashboard');
const productRoutes = require('./user/product');

// Auth Routes
const authRoutes = require('./auth/auth');

const router = express.Router();

router.use(indexRoute);

// User Routes
router.use('/dashboard', dashboardRoutes);
router.use('/dashboard', productRoutes);
router.use(authRoutes);

module.exports = router;