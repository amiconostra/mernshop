const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const states = require('us-state-converter');

// Models
const User = require(path.join(rootdir, 'models', 'user'));
const Product = require(path.join(rootdir, 'models', 'product'));

exports.getUser = async(req, res, next) => {
    const username = req.params.username;

    try {
        const user = await User.findOne({username: username});
        if(!user) {
            req.flash('error', 'User not found');
            res.redirect('/login');
        }

        const products = await Product.find({userId: user._id});

        res.render(path.join(config.theme.name, 'user', 'profile', 'user'), {
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

        res.render(path.join(config.theme.name, 'user', 'profile', 'product-details'), {
            pageTitle: user.username,
            user: user,
            product: product,
            states: states
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        next(error);
    }
}
