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
    phoneNumber: Number,
    bio: String,
    location: {
        country: String,
        state: String,
        zip: Number,
        address: String
    },
    company: String,
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    sales: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Order'
    },
    verifyToken: String,
    verifyTokenExpiration: Date,
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('User', userSchema);