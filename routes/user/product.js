const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');

// Controllers
const productController = require(path.join(rootdir, 'controllers/user/product'));

const router = express.Router();

router.get('/products', productController.getProducts);

router.get('/products/add', productController.getAddProduct);

router.post('/products/add', productController.postAddProduct);

router.get('/products/edit/:productId', productController.getEditProduct);

router.post('/products/edit', productController.postEditProduct);

router.post('/products/delete', productController.deleteProduct);

module.exports = router;