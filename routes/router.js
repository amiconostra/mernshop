const express = require('express');

// Home Routes
const indexRoute = require('./home/index');

// User Routes
const dashboardRoutes = require('./user/dashboard');
const productRoutes = require('./user/product');
const profileRoutes = require('./user/profile');
const userRoutes = require('./user/user');

// Auth Routes
const authRoutes = require('./auth/auth');

// Error Routes
const errorRoutes = require('./error/error');

// MAIN ROUTERS
const router = express.Router();

// Home Route
router.use(indexRoute);

// User Routes
router.use('/dashboard', dashboardRoutes);
router.use('/dashboard', productRoutes);
router.use('/dashboard', profileRoutes);
router.use(userRoutes);

// Auth Routes
router.use(authRoutes);

// Error Routes
router.use(errorRoutes);

module.exports = router;