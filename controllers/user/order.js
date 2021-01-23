const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const dateFormatter = require(path.join(rootdir, 'helpers', 'date-formatter'));
const { validationResult } = require('express-validator');
const countryjs = require('countryjs');

// Models
const Order = require(path.join(rootdir, 'models', 'order'));
const User = require(path.join(rootdir, 'models', 'user'));
const Product = require(path.join(rootdir, 'models', 'product'));

const ROWS_PER_PAGE = 10;

exports.getOrders = async(req, res, next) => {
    const page = +req.query.page || 1;

    try {
        const orders = await Order.find({'seller.userId': req.user._id}).skip((page - 1) * ROWS_PER_PAGE).limit(ROWS_PER_PAGE);
        const totalItems = await Order.find({'seller.userId': req.user._id}).countDocuments();

        res.render(path.join(config.theme.name, 'user', 'orders'), {
            pageTitle: 'Orders',
            path: '/dashboard/orders',
            orders: orders,
            dateFormatter: dateFormatter,
            user: req.user,
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
            success: req.flash('success')[0],
            error: req.flash('error')[0]
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getInvoices = async(req, res, next) => {
    const page = +req.query.page || 1;

    try {
        const orders = await Order.find({'seller.userId': req.user._id, 'order.status': 'completed'}).skip((page - 1) * ROWS_PER_PAGE).limit(ROWS_PER_PAGE);;
        const totalItems = await Order.find({'seller.userId': req.user._id, 'order.status': 'completed'}).countDocuments();

        res.render(path.join(config.theme.name, 'user', 'invoices'), {
            pageTitle: 'Invoices',
            path: '/dashboard/invoices',
            orders: orders,
            dateFormatter: dateFormatter,
            user: req.user,
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
            success: req.flash('success')[0],
            error: req.flash('error')[0]
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getInvoice = async(req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        if(!order) {
            req.flash('error', 'Invoice Not Found');
            return res.redirect('/dashboard/invoices');
        }

        if(order.seller.userId.toString() !== req.user._id.toString()) {
            req.flash('error', 'unauthorized');
            return res.redirect('/dashboard');
        }

        res.render(path.join(config.theme.name, 'user', 'invoice'), {
            pageTitle: 'Invoice',
            path: '/dashboard/invoices',
            order: order,
            user: req.user,
            dateFormatter: dateFormatter,
            country: countryjs,
            success: req.flash('success')[0],
            error: req.flash('error')[0]
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getDownloadInvoice = async(req, res, next) => {
    const orderId = req.params.orderId;
    const downloadType = req.query.type;

    if(downloadType !== 'pdf') {
        req.flash('error', 'Currently we only support PDF Format!');
        return res.redirect(`/dashboard/invoices/${orderId}`);
    }

    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);
    const invoiceUrl = `http://localhost:3000/dashboard/invoices/${orderId}`

    try {
        const order = await Order.findById(orderId);
        if(!order) {
            req.flash('error', 'Invoice Not Found');
            return res.redirect('/dashboard/invoices');
        }

        if(order.seller.userId.toString() !== req.user._id.toString()) {
            req.flash('error', 'unauthorized');
            return res.redirect('/dashboard');
        }
        
        //IMPLEMENT IT
        
        req.flash('error', 'feature is not supported!\nUse print -> Save as PDF');
        return res.redirect(invoiceUrl);
        
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

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
            input: {location: {}},
            country: countryjs,
            validationBox: false,
            validationError: []
        });

    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.postCheckout = async(req, res, next) => {
    const buyerEmail = req.body.email;
    const buyerPhoneNumber = req.body.phoneNumber;
    const buyerFirstName = req.body.firstName;
    const buyerLastName = req.body.lastName;
    const quantity = req.body.quantity;
    const productId = req.body.productId;
    const address = req.body.address;
    const city = req.body.city;
    const country = req.body.country;
    const state = req.body.state;
    const zip = req.body.zip;
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
                input: {email: buyerEmail, firstName: buyerFirstName, lastName: buyerLastName, quantity: quantity, location: { country: country, state: state, city: city, zip: zip, address: address }},
                country: countryjs,
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
                input: {email: buyerEmail, firstName: buyerFirstName, lastName: buyerLastName, quantity: quantity, location: { country: country, state: state, city: city, zip: zip, address: address }},
                country: countryjs,
                validationBox: true,
                validationError: errors.array()
            });
        }

        // Seller Details
        const sellerId = seller._id;
        const sellerAccountType = seller.accountType;
        const sellerEmail = seller.email;
        const sellerFirstName = seller.firstName;
        const sellerLastName = seller.lastName;
        const sellerLocation = seller.location;
        const sellerPhoneNumber = seller.phoneNumber;

        // Order Details
        const totalPrice = quantity * product.price;

        const sellerInfo = {userId: sellerId, accountType: sellerAccountType, email: sellerEmail, firstName: sellerFirstName, lastName: sellerLastName, phoneNumber: sellerPhoneNumber, location: sellerLocation};
        const buyerInfo = {email: buyerEmail, phoneNumber: buyerPhoneNumber, firstName: buyerFirstName, lastName: buyerLastName, location: { country: country, state: state, city: city, zip: zip, address: address }};
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
};