const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const { validationResult } = require('express-validator');
const states = require('us-state-converter');

// Models
const User = require(path.join(rootdir, 'models', 'user'));
const Product = require(path.join(rootdir, 'models', 'product'));
const Order = require(path.join(rootdir, 'models', 'order'));

exports.getUser = async(req, res, next) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({username: username});
        if(!user) {
            req.flash('error', 'User not found');
            res.redirect('/login');
        }

        const products = await Product.find({userId: user._id});

        res.render(path.join(config.theme.name, 'user', 'user'), {
            pageTitle: user.username,
            user: user,
            products: products,
            states: states
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        next(error);
    }
}

exports.getProduct = async(req, res, next) => {
    const username = req.params.username;
    const productId = req.params.productId;

    try {
        const user = await User.findOne({username: username});
        if(!user) {
            req.flash('error', 'User not found');
            res.redirect('/login');
        }

        const product = await Product.findOne({_id: productId, userId: user._id});
        if(!product) {
            req.flash('error', 'Product not found');
            res.redirect(`/user/${username}`);
        }

        res.render(path.join(config.theme.name, 'user', 'product-details'), {
            pageTitle: user.username,
            user: user,
            product: product,
            states: states,
            success: req.flash('success')[0],
            error: req.flash('error')[0]
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        next(error);
    }
}

exports.getCheckout = async(req, res, next) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findOne({_id: productId}).populate('userId', '-password');
        const seller = product.userId;

        if(product.stock <= 0) {
            req.flash('error', 'out of stock');
            return res.redirect(`/user/${seller.username}/product/${product._id}`);
        }

        res.render(path.join(config.theme.name, 'user', 'checkout'), {
            pageTitle: 'Checkout',
            path: '/checkout',
            seller: seller,
            product: product,
            success: req.flash('success')[0],
            error: req.flash('error')[0],
            input: {},
            validationBox: false,
            validationError: []
        });

    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
}

exports.postCheckout = async(req, res, next) => {
    const buyerEmail = req.body.email;
    const buyerFirstName = req.body.firstName;
    const buyerLastName = req.body.lastName;
    const quantity = req.body.quantity;
    const productId = req.body.productId;
    const errors = validationResult(req);

    try {
        const product = await Product.findOne({_id: productId});
        const seller = await User.findOne({_id: product.userId}).select('-password');

        if(!errors.isEmpty()) {
            return res.status(422).render(path.join(config.theme.name, 'user', 'checkout'), {
                pageTitle: 'Checkout',
                path: '/checkout',
                seller: seller,
                product: product,
                success: '',
                error: errors.array()[0].msg,
                input: {email: buyerEmail, firstName: buyerFirstName, lastName: buyerLastName, quantity: quantity},
                validationBox: true,
                validationError: errors.array()
            });
        }

        if(product.stock <= 0) {
            req.flash('error', 'out of stock');
            return res.redirect(`/user/${seller.username}/product/${product._id}`);
        }

        if(quantity > product.stock) {
            return res.status(422).render(path.join(config.theme.name, 'user', 'checkout'), {
                pageTitle: 'Checkout',
                path: '/checkout',
                seller: seller,
                product: product,
                success: '',
                error: 'Quantity cant be more than Product Stock',
                input: {email: buyerEmail, firstName: buyerFirstName, lastName: buyerLastName, quantity: quantity},
                validationBox: true,
                validationError: errors.array()
            });
        }

        // Seller Details
        const sellerId = seller._id;
        const sellerEmail = seller.email;
        const sellerFirstName = seller.firstName;
        const sellerLastName = seller.lastName;
        const sellerLocation = seller.location;
        const sellerPhoneNumber = seller.phoneNumber;

        // Order Details
        const totalPrice = quantity * product.price;

        const sellerInfo = {userId: sellerId, email: sellerEmail, firstName: sellerFirstName, lastName: sellerLastName, phoneNumber: sellerPhoneNumber, location: sellerLocation};
        const buyerInfo = {email: buyerEmail, firstName: buyerFirstName, lastName: buyerLastName};
        const orderInfo = {
            order: {
                product: product,
                quantity: quantity,
                purchaseDate: new Date(),
                totalPrice: totalPrice,
                payment: 'Paypal',
                status: 'pending'
            },
            seller: sellerInfo,
            buyer: buyerInfo
        };

        const order = new Order(orderInfo);
        product.stock = product.stock - quantity;
        await order.save();
        await product.save();
        await seller.addSale(order._id);

        req.flash('success', 'Item has been purchased!');
        res.redirect(`/checkout/${product._id}`);        
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
}