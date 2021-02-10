const crypto = require('crypto');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const mailConfig = require(path.join(rootdir, 'config', 'mail'));
const geoip = require('geoip-lite');

const mailTransporter = nodemailer.createTransport(mailConfig.smtp);

// Models
const User = require(path.join(rootdir, 'models', 'user'));

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        input: {email: '', firstName: '', lastName: '', username: ''},
        validationBox: false,
        validationError: []
    });
};

exports.postLogin = async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            error: errors.array()[0].msg,
            success: '',
            input: {email: email},
            validationBox: true,
            validationError: errors.array(),
        });
    }

    try { 
        const user = await User.findOne({email: email});
        if(!user) {
            req.flash('error', 'Invalid Email');
            return res.redirect('/login');
        }

        const matches = await bcrypt.compare(password, user.password);
        if(matches) {
            req.session.user = user;
            req.session.isAuthenticated = true;

            // Activity Log
            if(user.settings.activityLog) {
                const ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.ip;
                const device = `${req.useragent.browser} - ${req.useragent.os}`
                let geo = geoip.lookup(ip);
                if(geo) {
                    geo = `${geo.city}, ${geo.region}, ${geo.country}`;
                }
                const time = new Date();

                const activityLog = {ip: ip, device: device, location: geo, time: time};
                user.activityLog.push(activityLog);
                await user.save();
            }
            return req.session.save(err => {
                res.redirect('/');
            });
        } else {
            req.flash('error', 'Invalid Password');
            res.redirect('/login');
        }
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getRegister = (req, res, next) => {   
    res.render('auth/register', {
        pageTitle: 'Register',
        path: '/register',
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        input: {email: '', firstName: '', lastName: '', username: ''},
        validationBox: false,
        validationError: []
    });
};

exports.postRegister = (req, res, next) => {
    const serverUrl = req.protocol + '://' + req.get('host');
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/register', {
            pageTitle: 'Register',
            path: '/register',
            error: errors.array()[0].msg,
            success: '',
            input: {email: email, firstName: firstName, lastName: lastName, username: username},
            validationBox: true,
            validationError: errors.array(),
        });
    }

    crypto.randomBytes(32, async(err, buffer) => {
        if(err) {
            console.log(err);
            req.flash('error', 'Unknown Error');
            return res.redirect('/register');
        }

        const token = buffer.toString('hex');

        try {
            const user = await User.findOne({$or: [{email: email}, {username: username}]});
            if(user) {
                req.flash('error', 'Username or Email Already Exists!');
                return res.redirect('/register');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = new User({email: email, firstName: firstName, lastName: lastName, username: username, password: hashedPassword, verifyToken: token, verifyTokenExpiration: Date.now() + 600000});
            const result = await newUser.save();

            req.flash('success', 'User successfully registered! Check your Email for Verification!');
            res.redirect('/login');

            mailTransporter.sendMail({
                to: email,
                from: mailConfig.general.noreply_mail,
                subject: 'Registration Successful!',
                html: `
                    <h1>You Successfully Signed Up!</h1>
                    <p>Email Verification</p>
                    <p>Token: ${token}</p>
                    <p>Click <a href="${serverUrl}/verify/${token}?userId=${result._id}">${serverUrl}/verify/${token}?userId=${result._id}</a> To Verify Your Email</p>
                    <p>Or Do it manually at <a href="${serverUrl}/verify/email">${serverUrl}/verify/email</a></p>
                `
            });
        } catch(err) {
            console.log("ERR: ", err);
            const error = new Error(err);
            error.status = 500;
            return next(error);
        }   
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/login');
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/verify-reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        verifyEmail: false,
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        input: {email: ''},
        validationBox: false,
        validationError: []
    });
};

exports.postReset = (req, res, next) => {
    const serverUrl = req.protocol + '://' + req.get('host');
    const email = req.body.email;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/verify-reset', {
            pageTitle: 'Reset Password',
            path: '/reset',
            verifyEmail: false,
            error: errors.array()[0].msg,
            success: '',
            input: {email: email},
            validationBox: true,
            validationError: errors.array(),
        });
    }

    crypto.randomBytes(32, async(err, buffer) => {
        if(err) {
            console.log(err);
            req.flash('error', 'Unknown Error');
            return res.redirect('/reset');
        }
        
        const token = buffer.toString('hex');

        try {
            const user = await User.findOne({email: email});
            if(!user) {
                req.flash('error', 'No such User with this Email');
                return res.redirect('/reset');
            }
            
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 600000; //10 Minutes

            await user.save();
            req.flash('csrf', req.csrfToken());
            res.redirect('/confirmation?type=reset&email=' + email);
            return mailTransporter.sendMail({
                to: email,
                from: mailConfig.general.noreply_mail,
                subject: 'Password Reset',
                html: `
                    <p>Requested Password Reset</p>
                    <p>Click <a href="${serverUrl}/reset/${token}">LINK</a> To Reset password</p>
                `
            });
        } catch(err) {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        }
    });
};

exports.getResetPassword = async(req, res, next) => {
    const token = req.params.token;
    try {
        const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});
        if(!user) {
            req.flash('error', 'Invalid Token');
            return res.redirect('/');
        }

        res.render('auth/reset-password', {
            pageTitle: 'Reset Password',
            path: '/reset',
            success: req.flash('success')[0],
            error: req.flash('error')[0],
            input: {},
            validationBox: false,
            validationError: [],
            userId: user._id.toString(),
            resetToken: token
        });
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);   
    }
};

exports.postResetPassword = async(req, res, next) => {
    const token = req.body.resetToken;
    const userId = req.body.userId;
    const password = req.body.password;
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect(`/reset/${token}`);
    }

    try {
        const user = await User.findOne({_id: userId, resetToken: token, resetTokenExpiration: {$gt: Date.now()}});
        if(!user) {
            req.flash('error', 'Invalid Token');
            return res.redirect('/');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        req.flash('success', 'Password Successfully Reset');
        res.redirect('/login');
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getVerifyEmail = (req, res, next) => {
    res.render('auth/verify-reset', {
        pageTitle: 'Verify Email',
        path: '/verify',
        verifyEmail: true,
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        input: {email: ''},
        validationBox: false,
        validationError: []
    });
};

exports.postVerifyEmail = (req, res, next) => {
    const serverUrl = req.protocol + '://' + req.get('host');
    const email = req.body.email;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/verify-reset', {
            pageTitle: 'Verify Email',
            path: '/verify',
            verifyEmail: true,
            error: errors.array()[0].msg,
            success: '',
            input: {email: email},
            validationBox: true,
            validationError: errors.array(),
        });
    }

    crypto.randomBytes(32, async(err, buffer) => {
        if(err) {
            console.log(err);
            req.flash('error', 'Unknown Error');
            return res.redirect('/verify');
        }
        
        const token = buffer.toString('hex');
        
        try {
            const user = await User.findOne({email: email});

            if(!user) {
                req.flash('error', 'No such User with this Email');
                return res.redirect('/verify');
            }
            
            if(user.verifiedEmail) {
                req.flash('error', 'User already Verified');
                return res.redirect('/');
            }

            user.verifyToken = token;
            user.verifyTokenExpiration = Date.now() + 600000; // 10 Minutes in milliseconds
            await user.save();
            req.flash('csrf', req.csrfToken());
            res.redirect('/confirmation?type=verify&email=' + email);
            
            mailTransporter.sendMail({
                to: email,
                from: mailConfig.general.noreply_mail,
                subject: 'Email Verification',
                html: `
                    <p>Requested Email Verification</p>
                    <p>Token: ${token}</p>
                    <p>Click <a href="${serverUrl}/verify/${token}?userId=${user._id}">${serverUrl}/verify/${token}?userId=${user._id}</a> To Verify Your Email</p>
                    <p>Or Do it manually at <a href="${serverUrl}/verify/email">${serverUrl}/verify/email</a></p>
                `
            });
        } catch(err) {
            const error = new Error(err);
            error.status = 500;
            return next(error);
        }
    });
};

exports.getVerifyAccount = (req, res, next) => {
    res.render('auth/verify-email', {
        pageTitle: 'Verify Email',
        path: '/verify/email',
        success: req.flash('success')[0],
        error: req.flash('error')[0],
        input: {email: ''},
        validationBox: false,
        validationError: []
    });
};

exports.postVerifyAccount = async(req, res, next) => {
    const email = req.body.email;
    const token = req.body.verifyToken;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/verify-email', {
            pageTitle: 'Verify Email',
            path: '/verify/email',
            verifyEmail: true,
            error: errors.array()[0].msg,
            success: '',
            input: {email: email},
            validationBox: true,
            validationError: errors.array(),
        });
    }

    try {
        const user = await User.findOne({email: email, verifyToken: token, verifyTokenExpiration: {$gt: Date.now()}});
        if(!user) {
            req.flash('error', 'Invalid Token');
            return res.redirect('/');
        }

        user.verifiedEmail = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiration = undefined;
        req.flash('success', 'Email has been Verified');
        await user.save();
        res.redirect('/login');
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getVerifyToken = async(req, res, next) => {
    const userId = req.query.userId;
    const token = req.params.token;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect(`/verify/${token}`);
    }

    try {
        const user = await User.findOne({_id: userId, verifyToken: token, verifyTokenExpiration: {$gt: Date.now()}});
        if(!user) {
            req.flash('error', 'Invalid Token');
            return res.redirect('/');
        }

        if(user.verifiedEmail) {
            req.flash('error', 'User already Verified');
            return res.redirect('/');
        }

        user.verifiedEmail = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiration = undefined;
        await user.save();
        req.flash('success', 'Email has been Verified');
        res.redirect('/login');
    } catch(err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
    }
};

exports.getConfirmation = (req, res, next) => {
    const confirmType = req.query.type;
    const email = req.query.email;
    const csrf = req.flash('csrf');

    if(csrf.length <= 0) {
        return res.redirect('/');
    }

    res.render('auth/confirmation', {
        pageTitle: 'Confirm',
        confirmType: confirmType,
        email: email
    });
};