const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const country = require('countryjs');
const fileHelper = require(path.join(rootdir, 'helpers', 'file'));

// Models
const User = require(path.join(rootdir, 'models', 'user'));

exports.getProfile = (req, res, next) => {
    res.render(path.join(config.theme.name, 'user', 'profile', 'profile'), {
        pageTitle: 'Profile Overview',
        path: '/dashboard/profile',
        user: req.user,
        country: country
    });
};

exports.getProfileSettings = (req, res, next) => {
    res.render(path.join(config.theme.name, 'user', 'profile', 'profile-settings'), {
        pageTitle: 'Profile Settings',
        path: '/dashboard/profile-settings',
        user: req.user,
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        validationBox: false,
        validationError: [],
        country: country
    });
};

exports.postProfileSettings = async(req, res, next) => {
    let avatar;
    if(req.files.avatar) {
        avatar = req.files.avatar[0];
    }
    const updatedFirstName = req.body.firstName;
    const updatedLastName = req.body.lastName;
    const updatedEmail = req.body.email;
    const updatedUsername = req.body.username;
    const updatedPhoneNumber = req.body.phoneNumber;
    const updatedCountry = req.body.country;
    const updatedState = req.body.state;
    const updatedCity = req.body.city;
    const updatedZip = req.body.zip;
    const updatedAddress = req.body.address;
    const updatedBio = req.body.bio;
    const updatedCompany = req.body.company;
    const currentPassword = req.body.password;
    const newPassword = req.body.newPassword;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        if(avatar) {
            fileHelper.deleteFile(avatar.path);
        }

        const input = {
            avatarUrl: req.user.avatarUrl,
            firstName: updatedFirstName, 
            lastName: updatedLastName, 
            email: updatedEmail,
            username: updatedUsername,
            phoneNumber: updatedPhoneNumber, 
            location: {
                country: updatedCountry,
                state: updatedState,
                city: updatedCity,
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
            success: '',
            error: errors.array()[0].msg,
            validationBox: true,
            validationError: errors.array(),
            country: country
        });
    }

    try {
        const user = await User.findOne({_id: req.user._id});
        if(!user) {
            req.flash('error', 'Invalid Session');
            return res.redirect('/login');
        }

        // Checks if Username or Email is taken
        const emailExists = await User.findOne({_id: {$ne: req.user._id}, email: updatedEmail});
        const usernameExists = await User.findOne({_id: {$ne: req.user._id}, username: updatedUsername});

        if(emailExists && usernameExists) {
            req.flash('error', 'Username or Email is already taken');
            return res.redirect('/dashboard/profile-settings');
        } else if(emailExists) {
            req.flash('error', 'Email is already taken');
            return res.redirect('/dashboard/profile-settings');
        } else if(usernameExists) {
            req.flash('error', 'Username is already taken');
            return res.redirect('/dashboard/profile-settings');
        }

        if(avatar) {
            if(user.avatarUrl.split('\\').pop() === 'default-avatar.png') {
                user.avatarUrl = avatar.path;
            } else {
                fileHelper.deleteFile(user.avatarUrl);
                user.avatarUrl = avatar.path;
            }
        }
        user.firstName = updatedFirstName;
        user.lastName = updatedLastName;
        user.email = updatedEmail;
        user.username = updatedUsername;
        user.phoneNumber = updatedPhoneNumber;
        user.location.country = updatedCountry;
        user.location.state = updatedState;
        user.location.city = updatedCity;
        user.location.address = updatedAddress;
        user.location.zip = updatedZip;
        user.bio = updatedBio;
        user.company = updatedCompany;

        // Updated Password
        if(currentPassword && newPassword) {
            const matches = await bcrypt.compare(currentPassword, user.password);
            if(matches) {
                const hashedPassword = await bcrypt.hash(newPassword, 12);
                user.password = hashedPassword;
                await user.save();
                req.flash('success', 'User & Password has been updated!');
                return res.redirect('/dashboard/profile-settings');
            } else {
                req.flash('error', 'Invalid Current Password');
                return res.redirect('/dashboard/profile-settings');
            }  
        }

        await user.save();
        req.flash('success', 'User has been updated!');
        return res.redirect('/dashboard/profile-settings');
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};