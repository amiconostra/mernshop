const mongoose = require('mongoose');

const saleSchema = mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Order',
        required: true
    }
});

module.exports = mongoose.model('Sale', saleSchema);