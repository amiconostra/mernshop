const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: String,
    location: {
        country: String,
        state: String,
        address: String,
        zip: Number
    },
    phoneNumber: Number,
    company: String,
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    verifyToken: String,
    verifyTokenExpiration: Date,
    resetToken: String,
    resetTokenExpiration: Date,
    sales: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Order'
    }
});

module.exports = mongoose.model('User', userSchema);