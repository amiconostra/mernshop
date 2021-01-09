const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const isAuth = require(path.join(rootdir, 'middlewares', 'is-authenticated'));

// Controllers
const productController = require(path.join(rootdir, 'controllers/user/product'));

const router = express.Router();

router.get('/products', isAuth, productController.getProducts);

router.get('/products/add', isAuth, productController.getAddProduct);

router.post('/products/add', isAuth, productController.postAddProduct);

router.get('/products/edit/:productId', isAuth, productController.getEditProduct);

router.post('/products/edit', isAuth, productController.postEditProduct);

router.post('/products/delete', isAuth, productController.deleteProduct);

module.exports = router;