const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const states = require('us-state-converter');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Models
const User = require(path.join(rootdir, 'models', 'user'));

exports.getProfile = (req, res, next) => {
    res.render(path.join(config.theme.name, 'user', 'profile', 'profile'), {
        pageTitle: 'Profile Overview',
        path: '/dashboard/profile',
        user: req.user,
        states: states
    });
};

exports.getProfileSettings = (req, res, next) => {
    res.render(path.join(config.theme.name, 'user', 'profile', 'profile-settings'), {
        pageTitle: 'Profile Settings',
        path: '/dashboard/profile-settings',
        user: req.user,
        states: states,
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        validationBox: false,
        validationError: []
    });
};

exports.postProfileSettings = (req, res, next) => {
    const updatedFirstName = req.body.firstName;
    const updatedLastName = req.body.lastName;
    const updatedEmail = req.body.email;
    const updatedUsername = req.body.username;
    const updatedPhoneNumber = req.body.phoneNumber;
    const updatedCountry = req.body.country;
    const updatedState = req.body.state;
    const updatedAddress = req.body.address;
    const updatedZip = req.body.zip;
    const updatedBio = req.body.bio;
    const updatedCompany = req.body.company;
    const currentPassword = req.body.password;
    const newPassword = req.body.newPassword;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const input = {
            firstName: updatedFirstName, 
            lastName: updatedLastName, 
            email: updatedEmail,
            username: updatedUsername,
            phoneNumber: updatedPhoneNumber, 
            location: {
                country: updatedCountry,
                state: updatedState,
                address: updatedAddress,
                zip: updatedZip
            },
            bio: updatedBio,
            company: updatedCompany,
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        return res.status(422).render(path.join(config.theme.name, 'user', 'profile', 'profile-settings'), {
            pageTitle: 'Profile Settings',
            path: '/dashboard/profile-settings',
            user: input,
            states: states,
            success: '',
            error: errors.array()[0].msg,
            validationBox: true,
            validationError: errors.array()
        });
    }
    
    User.findOne({_id: req.user._id})
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid Session');
                return res.redirect('/login');
            }

            user.firstName = updatedFirstName;
            user.lastName = updatedLastName;
            user.email = updatedEmail;
            user.username = updatedUsername;
            user.phoneNumber = updatedPhoneNumber;
            user.location.country = updatedCountry;
            user.location.state = updatedState;
            user.location.address = updatedAddress;
            user.location.zip = updatedZip;
            user.bio = updatedBio;
            user.company = updatedCompany;

            // Updated Password
            if(currentPassword && newPassword) {
                return bcrypt.compare(currentPassword, user.password)
                    .then(matches => {
                        if(matches) {
                            return bcrypt.hash(newPassword, 12)
                                .then(hashedPassword => {
                                    user.password = hashedPassword;
                                    return user.save();
                                })
                                .then(result => {
                                    req.flash('success', 'User & Password has been updated!');
                                    res.redirect('/dashboard/profile-settings');
                                })
                                .catch(err => {
                                    const error = new Error(err);
                                    error.status = 500;
                                    return next(error);
                                });
                        }
                        req.flash('error', 'Invalid Current Password');
                        return res.redirect('/dashboard/profile-settings');
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.status = 500;
                        return next(error);
                    });
            }

            return user.save()
                .then(result => {
                    req.flash('success', 'User has been updated!');
                    res.redirect('/dashboard/profile-settings');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        });
};