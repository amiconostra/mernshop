const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    order: {
        product: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        purchaseDate: {
            type: Date,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        payment: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
    },
    seller: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
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
        },
        phoneNumber: {
            type: Number
        },
        location: {
            type: Object
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);