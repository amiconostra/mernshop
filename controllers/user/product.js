const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const { validationResult } = require('express-validator');

// Models
const Product = require(path.join(rootdir, 'models/product'));

const ROWS_PER_PAGE = 10;

exports.getProducts = async(req, res, next) => {
    const page = +req.query.page || 1;

    try {
        const products = await Product.find({userId: req.user._id}).skip((page - 1) * ROWS_PER_PAGE).limit(ROWS_PER_PAGE);
        const totalItems = await Product.find({userId: req.user._id}).countDocuments();
        
        res.render(path.join(config.theme.name, 'user', 'products'), {
            pageTitle: 'Products',
            path: '/dashboard/products',
            products: products,
            pagination: {
                totalItems: totalItems,
                minRow: (ROWS_PER_PAGE * page) - ROWS_PER_PAGE,
                maxRow: (ROWS_PER_PAGE * page),
                currentPage: page,
                hasNextPage: ROWS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ROWS_PER_PAGE)
            },
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
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

exports.postAddProduct = async(req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const type = req.body.type;
    const price = req.body.price;
    const stock = req.body.stock;
    const image = req.file;
    const errors = validationResult(req);

    if(!image) {
        return res.status(422).render(path.join(config.theme.name, 'edit-product'), {
            pageTitle: 'Add Product',
            path: '/dashboard/products/add',
            editing: false,
            success: '',
            error: 'Please attach an Image file',
            product: {name: name, description: description, type: type, price: price, stock: stock},
            validationBox: false,
            validationError: []
        });
    }

    if(!errors.isEmpty()) {
        return res.status(422).render(path.join(config.theme.name, 'edit-product'), {
            pageTitle: 'Add Product',
            path: '/dashboard/products/add',
            editing: false,
            success: '',
            error: errors.array()[0].msg,
            product: {name: name, description: description, type: type, price: price, stock: stock},
            validationBox: true,
            validationError: errors.array()
        });
    }

    const imageUrl = image.path;
    
    const product = new Product({name: name, description: description, type: type, price: price, stock: stock, imageUrl: imageUrl, userId: req.user});

    try {
        await product.save();
        res.redirect('/dashboard/products');
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getEditProduct = async(req, res, next) => {
    const productId = req.params.productId;
    const editMode = req.query.edit;

    if(!editMode) {
        return res.redirect('/dashboard/products');
    }

    try {
        const product = await Product.findById(productId);
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
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.postEditProduct = async(req, res, next) => {
    const productId = req.body.productId;
    const updatedName = req.body.name;
    const updatedDescription = req.body.description;
    const updatedType = req.body.type;
    const updatedPrice = req.body.price;
    const updatedStock = req.body.stock;
    const image = req.file;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render(path.join(config.theme.name, 'edit-product'), {
            pageTitle: 'Edit Product',
            path: '/dashboard/products/edit',
            editing: true,
            success: '',
            error: errors.array()[0].msg,
            product: {_id: productId, name: updatedName, description: updatedDescription, type: updatedType, price: updatedPrice, stock: updatedStock},
            validationBox: true,
            validationError: errors.array()
        });
    }

    try {
        const product = await Product.findById(productId);
        if(product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }

        product.name = updatedName;
        product.description = updatedDescription;
        product.type = updatedType;
        product.price = updatedPrice;
        product.stock = updatedStock;
        if(image) {
            product.imageUrl = image.path;
        }

        await product.save();
        res.redirect('/dashboard/products');
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.deleteProduct = async(req, res, next) => {
    const productId = req.body.productId;
    
    try {
        await Product.deleteOne({_id: productId, userId: req.user._id});
        res.redirect('/dashboard/products');
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};
