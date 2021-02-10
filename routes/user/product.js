const express = require('express');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const isAuth = require(path.join(rootdir, 'middlewares', 'is-authenticated'));
const inputValidator = require(path.join(rootdir, 'middlewares', 'input-validator'));
const upload = require(path.join(rootdir, 'config', 'multer'));

// Controllers
const productController = require(path.join(rootdir, 'controllers/user/product'));

const router = express.Router();

router.get('/products', isAuth, productController.getProducts);

router.get('/products/add', isAuth, productController.getAddProduct);

router.post('/products/add', isAuth, upload.single('productImage'), inputValidator.validate('product'), productController.postAddProduct);

router.get('/products/edit/:productId', isAuth, productController.getEditProduct);

router.post('/products/edit', isAuth, upload.single('productImage'), inputValidator.validate('product'), productController.postEditProduct);

router.delete('/products/:productId', isAuth, productController.deleteProduct);

module.exports = router;