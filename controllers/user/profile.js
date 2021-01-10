const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const states = require('us-state-converter');
const bcrypt = require('bcryptjs');

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
        pageTitle: 'Profile Overview',
        path: '/dashboard/profile-settings',
        user: req.user,
        states: states
    });
};

exports.postProfileSettings = (req, res, next) => {
    const updatedFirstName = req.body.firstName;
    const updatedLastName = req.body.lastName;
    const updatedEmail = req.body.email;
    const updatedPhoneNumber = req.body.phoneNumber;
    const updatedCountry = req.body.country;
    const updatedState = req.body.state;
    const updatedAddress = req.body.address;
    const updatedZip = req.body.zip;
    const updatedCompany = req.body.company;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const newConfirmPassword = req.body.newConfirmPassword;
    
    User.findOne({_id: req.user._id})
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid Session');
                return res.redirect('/login');
            }

            user.firstName = updatedFirstName;
            user.lastName = updatedLastName;
            user.email = updatedEmail;
            user.phoneNumber = updatedPhoneNumber;
            user.location.country = updatedCountry;
            user.location.state = updatedState;
            user.location.address = updatedAddress;
            user.location.zip = updatedZip;
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
                                });
                        }
                        req.flash('error', 'Invalid Current Password');
                        return res.redirect('/dashboard/profile-settings');
                    })
                    .catch(err => console.log(err));
            }

            return user.save()
                .then(result => {
                    req.flash('success', 'User has been updated!');
                    res.redirect('/dashboard/profile-settings');
                });
        })
        .catch(err => console.log(err)); 
};