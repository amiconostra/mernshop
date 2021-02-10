const path = require('path');

exports.get404 = (req, res, next) => {
    res.render('error/404', {
        pageTitle: '404',
        path: '/404'
    });
};