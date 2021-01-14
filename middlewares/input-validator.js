/*eslint indent: [2, 4, {"SwitchCase": 1}]*/

const { body, check } = require('express-validator');

exports.validate = (method) => {
    switch(method) {
        case 'register': {
            return [
                body('email', 'Invalid Email Address').exists().isLength({max: 64}).isEmail().normalizeEmail().trim(),
                body('firstName', 'First Name must be between 2-26 Characters, and can only contain Letters').exists().matches('^[a-zA-Z_ ]*$').isLength({min: 2, max: 26}).trim(),
                body('lastName', 'Last Name must be between 2-26 Characters, and can only contain Letters').exists().matches('^[a-zA-Z_ ]*$').isLength({min: 2, max: 26}).trim(),
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
                body('name', 'Product title must be between 2-255 Characters, and cannot contain Special Characters').exists().matches('^[a-zA-Z0-9_ ]*$').isLength({min: 2, max: 255}).trim(),
                body('description', 'Description must be between 2-1000 Characters').exists().isLength({min: 2, max: 1000}).trim(),
                body('type', 'Type must be between 2-255 Characters, and cannot contain Numbers or Special Characters').exists().matches('^[a-zA-Z_ ]*$').isLength({min: 2, max: 255}).trim(),
                body('price', 'Price can only be Float').exists().isFloat(),
                body('stock', 'Stock can only be Number').exists().isNumeric()
            ];
        }
        case 'profile': {
            return [
                body('email', 'Invalid Email Address').exists().isLength({max: 64}).isEmail().normalizeEmail().trim(),
                body('firstName', 'First Name must be between 2-26 Characters, and can only contain Letters').exists().matches('^[a-zA-Z_ ]*$').isLength({min: 2, max: 26}).trim(),
                body('lastName', 'Last Name must be between 2-26 Characters, and can only contain Letters').exists().matches('^[a-zA-Z_ ]*$').isLength({min: 2, max: 26}).trim(),
                body('username', 'Username must be between 2-32 Characters, and can only contain Letters, and Numbers').exists().isAlphanumeric().isLength({min: 2, max: 32}).trim(),
                body('password', 'Invalid Password').optional({checkFalsy: true}).isLength({min: 1}).trim(),
                body('newPassword', 'Password must be at least 8 characters, and must contain at least one Uppercase letter, one Special character, and one Number').optional({checkFalsy: true}).isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).trim(),
                body('newConfirmPassword', 'Passwords do not Match!').optional({checkFalsy: true}).isLength({min: 1}).trim().custom((value, {req}) => value === req.body.newPassword),
                body('phoneNumber', 'Phone Number must be valid, and between 0-15 Characters').optional({checkFalsy: true}).isLength({max: 15}).isMobilePhone().trim(),
                body('bio', 'Bio must be less 500 Characters').optional({checkFalsy: true}).isLength({max: 500}).trim(),
                body('country', 'Country must be valid, and in ISO_3166-1_alpha-3 format').optional({checkFalsy: true}).isLength({min: 3, max: 3}).isISO31661Alpha3().trim(),
                body('state', 'States must be valid, and in Two-letter acronym').optional({checkFalsy: true}).isLength({min: 2, max: 2}).trim(),
                body('zip', 'Zipcode must be a valid, and 5 Characters').optional({checkFalsy: true}).isLength({min: 5, max:5}).isPostalCode('any').trim(),
                body('address', 'Address must be valid, and less than 255 Characters').optional({checkFalsy: true}).isLength({max: 255}).trim(),
                body('company', 'Company name must be valid, and less than 32 Characters').optional({checkFalsy: true}).isLength({max: 32}).trim()
            ];
        }
    }
};
