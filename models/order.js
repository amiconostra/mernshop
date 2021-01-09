const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    products: {
        product: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    },
    seller: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        email: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    buyer: {
        email: {
            type: String,
            required: true
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);