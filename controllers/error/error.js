const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));

// Models
const Product = require(path.join(rootdir, 'models/product'));

exports.get404 = (req, res, next) => {
    res.render(path.join(config.theme.name, 'error/404'), {
        pageTitle: '404',
        path: '/404'
    });
};

exports.get500 = (err, req, res, next) => {
    res.status(err.status || 500);
    res.render(path.join(config.theme.name), 'error/500', {
        pageTitle: '500',
        path: '/500',
        message: err.message,
        error: {}
    });
};