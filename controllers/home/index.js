const path = require('path');
const rootdir = require('../../helpers/rootdir');

exports.getIndex = (req, res, next) => {
    res.redirect('/dashboard');
};