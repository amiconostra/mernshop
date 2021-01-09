const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));

exports.getDashboard = (req, res, next) => {
    res.render(path.join(config.theme.name, config.theme.color, 'dashboard'), {
        pageTitle: 'Dashboard',
        path: '/dashboard'
    });
};