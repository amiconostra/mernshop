const path = require('path');
const rootdir = require('../../helpers/rootdir');

// Models
const User = require(path.join(rootdir, 'models', 'user'));

exports.getDashboard = (req, res, next) => {
    if(!req.user.verifiedEmail) {
        req.session.isAuthenticated = false;
        req.flash('error', 'Please Verify your account');
        res.redirect('/login');
    }

    res.render('dashboard', {
        pageTitle: 'Dashboard',
        path: '/dashboard',
        user: req.user,
        success: req.flash('success')[0],
        error: req.flash('error')[0]
    });
};