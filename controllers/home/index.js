const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));

exports.getIndex = (req, res, next) => {
    res.redirect('/dashboard');
};