const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));

// Models
const User = require(rootdir, 'models', 'user');

exports.getDashboard = (req, res, next) => {
    if(!req.user.verifiedEmail) {
        req.session.isAuthenticated = false;
        req.flash('error', 'Please Verify your account');
        res.redirect('/login');
    }

    res.render(path.join(config.theme.name, 'dashboard'), {
        pageTitle: 'Dashboard',
        path: '/dashboard'
    });
};