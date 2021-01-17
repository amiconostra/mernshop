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
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: Number
        },
        location: {
            type: Object
        }
    },
    buyer: {
        email: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);