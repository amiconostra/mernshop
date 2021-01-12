/*eslint indent: [2, 4, {"SwitchCase": 1}]*/

const { body, check } = require('express-validator');

exports.validate = (method) => {
    switch(method) {
        case 'register': {
            return [
                body('email', 'Invalid Email Address').exists().isLength({max: 64}).isEmail().normalizeEmail().trim(),
                body('firstName', 'First Name must be between 2-26 Characters, and can only contain Letters').exists().isAlpha().isLength({min: 2, max: 26}).trim(),
                body('lastName', 'Last Name must be between 2-26 Characters, and can only contain Letters').exists().isAlpha().isLength({min: 2, max: 26}).trim(),
                body('username', 'Username must be between 2-32 Characters, and can only contain Letters, and Numbers').exists().isAlphanumeric().isLength({min: 2, max: 32}).trim(),
                body('password', 'Password must be at least 8 characters, and must contain at least one Uppercase letter, one Special character, and one Number').exists().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).trim(),
                body('confirmPassword', 'Passwords do not Match!').isLength({min: 1}).trim().custom((value, {req}) => value === req.body.password)
            ];
        }
        case 'login': {
            return [
                body('email', 'Invalid Email Address').exists().isLength({max: 64}).isEmail().normalizeEmail().trim(),
                body('password', 'Invalid Password').exists().isLength({min: 1}).trim()
            ];
        }
        case 'email': {
            return body('email', 'Invalid Email Address').exists().isLength({max: 64}).isEmail().normalizeEmail().trim();
        }
        case 'resetPassword': {
            return [
                body('password', 'Password must be at least 8 characters, and must contain at least one Uppercase letter, one Special character, and one Number').exists().isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).trim(),
                body('confirmPassword', 'Passwords do not Match!').isLength({min: 1}).trim().custom((value, {req}) => value === req.body.password)
            ];
        }
        case 'product': {
            return [
                body('name', 'Product title must be between 2-255 Characters, and cannot contain Special Characters').exists().isAlphanumeric().isLength({min: 2, max: 255}).trim(),
                body('description', 'Description must be between 2-1000 Characters').exists().isLength({min: 2, max: 1000}).trim(),
                body('type', 'Type must be between 2-255 Characters, and cannot contain Numbers or Special Characters').exists().isAlpha().isLength({min: 2, max: 255}).trim(),
                body('price', 'Price can only be Float').exists().isFloat(),
                body('stock', 'Stock can only be Number').exists().isNumeric(),
                body('imageUrl', 'Image can only be a URL').exists().isURL()
            ];
        }
    }
};
