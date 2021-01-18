const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const dateFormatter = require(path.join(rootdir, 'helpers', 'date-formatter'));

// Models
const Order = require(path.join(rootdir, 'models', 'order'));

exports.getOrders = async(req, res, next) => {

    try {
        const orders = await Order.find({'seller.userId': req.user._id});
        res.render(path.join(config.theme.name, 'user', 'orders'), {
            pageTitle: 'Orders',
            path: '/dashboard/orders',
            orders: orders,
            dateFormatter: dateFormatter,
            success: req.flash('success')[0],
            error: req.flash('error')[0]
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
}