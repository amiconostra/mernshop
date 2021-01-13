const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const { validationResult } = require('express-validator');

// Models
const Product = require(path.join(rootdir, 'models/product'));

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        .then((products) => {
            res.render(path.join(config.theme.name, 'products'), {
                pageTitle: 'Products',
                path: '/dashboard/products',
                products: products
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        });
};

exports.getAddProduct = (req, res, next) => {
    res.render(path.join(config.theme.name, 'edit-product'), {
        pageTitle: 'Add Product',
        path: '/dashboard/products/add',
        editing: false,
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        validationBox: false,
        validationError: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const type = req.body.type;
    const price = req.body.price;
    const stock = req.body.stock;
    const imageUrl = req.body.imageUrl;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render(path.join(config.theme.name, 'edit-product'), {
            pageTitle: 'Add Product',
            path: '/dashboard/products/add',
            editing: false,
            success: '',
            error: errors.array()[0].msg,
            product: {name: name, description: description, type: type, price: price, stock: stock, imageUrl: imageUrl},
            validationBox: true,
            validationError: errors.array()
        });
    }
    
    const product = new Product({name: name, description: description, type: type, price: price, stock: stock, imageUrl: imageUrl, userId: req.user});
    product.save()
        .then(result => {
            res.redirect('/dashboard/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    const editMode = req.query.edit;

    if(!editMode) {
        return res.redirect('/dashboard/products');
    }

    Product.findById(productId)
        .then(product => {
            if(!product) {
                return res.redirect('/dashboard/products');
            }
            res.render(path.join(config.theme.name, 'edit-product'), {
                pageTitle: 'Edit Product',
                path: '/dashboard/products/edit',
                editing: editMode,
                product: product,
                success: req.flash('success')[0],
                error: req.flash('error')[0],
                validationBox: false,
                validationError: []       
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedName = req.body.name;
    const updatedDescription = req.body.description;
    const updatedType = req.body.type;
    const updatedPrice = req.body.price;
    const updatedStock = req.body.stock;
    const updatedImageUrl = req.body.imageUrl;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render(path.join(config.theme.name, 'edit-product'), {
            pageTitle: 'Edit Product',
            path: '/dashboard/products/edit',
            editing: true,
            success: '',
            error: errors.array()[0].msg,
            product: {_id: productId, name: updatedName, description: updatedDescription, type: updatedType, price: updatedPrice, stock: updatedStock, imageUrl: updatedImageUrl},
            validationBox: true,
            validationError: errors.array()
        });
    }

    Product.findById(productId)
        .then(product => {
            if(product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }

            product.name = updatedName;
            product.description = updatedDescription;
            product.type = updatedType;
            product.price = updatedPrice;
            product.stock = updatedStock;
            product.imageUrl = updatedImageUrl;
            product.save()
                .then(result => {
                    res.redirect('/dashboard/products');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({_id: productId, userId: req.user._id})
        .then(result => {
            res.redirect('/dashboard/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        });
};
