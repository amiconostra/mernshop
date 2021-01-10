const crypto = require('crypto');
const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport(config.mail.smtp);

// Models
const User = require(path.join(rootdir, 'models/user'));

exports.getLogin = (req, res, next) => {
    const errorFlash = req.flash('error')[0];
    const successFlash = req.flash('success')[0];
    let flashMessage = [];

    if(errorFlash) {
        flashMessage[0] = 'error';
        flashMessage[1] = errorFlash;
    } else if(successFlash) {
        flashMessage[0] = 'success';
        flashMessage[1] = successFlash;
    } else {
        flashMessage = null;
    }
    
    res.render(path.join(config.theme.name, 'auth/login'), {
        pageTitle: 'Login',
        flashMessage: flashMessage
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid Email');
                return res.redirect('/login');
            }

            bcrypt.compare(password, user.password)
                .then(matches => {
                    if(matches) {
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        return req.session.save(err => {
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid Password');
                    return res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getRegister = (req, res, next) => {
    const errorFlash = req.flash('error')[0];
    const successFlash = req.flash('success')[0];
    let flashMessage = [];

    if(errorFlash) {
        flashMessage[0] = 'error';
        flashMessage[1] = errorFlash;
    } else if(successFlash) {
        flashMessage[0] = 'success';
        flashMessage[1] = successFlash;
    } else {
        flashMessage = null;
    }
    
    res.render(path.join(config.theme.name, 'auth/register'), {
        pageTitle: 'Register',
        flashMessage: flashMessage
    });
};

exports.postRegister = (req, res, next) => {
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({$or: [{email: email}, {username: username}]})
        .then(user => {
            if(user) {
                req.flash('error', 'Username or Email Already Exists!');
                return res.redirect('/register');
            }

            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({email: email, firstName: firstName, lastName: lastName, username: username, password: hashedPassword});
                    return newUser.save();
                })
                .then(result => {
                    res.redirect('/login');
                    return mailTransporter.sendMail({
                        to: email,
                        from: config.mail.general.from,
                        subject: 'Registration Successful!',
                        html: '<h1>You Successfully Signed Up!</h1>'
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/login');
    });
};

exports.getReset = (req, res, next) => {
    const errorFlash = req.flash('error')[0];
    const successFlash = req.flash('success')[0];
    let flashMessage = [];

    if(errorFlash) {
        flashMessage[0] = 'error';
        flashMessage[1] = errorFlash;
    } else if(successFlash) {
        flashMessage[0] = 'success';
        flashMessage[1] = successFlash;
    } else {
        flashMessage = null;
    }

    res.render(path.join(config.theme.name, 'auth/reset'), {
        pageTitle: 'Reset Password',
        flashMessage: flashMessage
    });
};

exports.postReset = (req, res, next) => {
    const email = req.body.email;
    let token;

    // Generate Random Token
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            req.flash('error', 'Unknown Error');
            return res.redirect('/reset');
        }
        token = buffer.toString('hex');
    });

    User.findOne({email: email})
        .then(user => {
            if(!user) {
                req.flash('error', 'No such User with this Email');
                return res.redirect('/reset');
            }

            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 600000; // 10 Minutes in milliseconds
            user.save()
                .then(result => {
                    req.flash('csrf', req.csrfToken());
                    res.redirect('/confirmation?type=reset&email=' + email);
                    return mailTransporter.sendMail({
                        to: email,
                        from: config.mail.general.from,
                        subject: 'Password Reset',
                        html: `
                        <p>Requested Password Reset</p>
                        <p>Click <a href="${config.server.url}/reset/${token}">LINK</a> To Reset password</p>
                        `
                    });
                })
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
};

exports.getResetPassword = (req, res, next) => {
    const token = req.params.token;
    const errorFlash = req.flash('error')[0];
    const successFlash = req.flash('success')[0];
    let flashMessage = [];

    if(errorFlash) {
        flashMessage[0] = 'error';
        flashMessage[1] = errorFlash;
    } else if(successFlash) {
        flashMessage[0] = 'success';
        flashMessage[1] = successFlash;
    } else {
        flashMessage = null;
    }

    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid Token');
                return res.redirect('/');
            }

            res.render(path.join(config.theme.name, 'auth/reset-password'), {
                pageTitle: 'Reset Password',
                path: '/auth/reset-password',
                flashMessage: flashMessage,
                userId: user._id.toString(),
                resetToken: token
            });
        })
        .catch(error => console.log(error));
};

exports.postResetPassword = (req, res, next) => {
    const token = req.body.resetToken;
    const userId = req.body.userId;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    let selectUser;

    User.findOne({_id: userId, resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid Token');
                return res.redirect('/');
            }
            selectUser = user;
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    selectUser.password = hashedPassword;
                    selectUser.resetToken = undefined;
                    selectUser.resetTokenExpiration = undefined;
                    return selectUser.save();
                })
                .then(result => {
                    req.flash('success', 'Password Successfully Reset');
                    res.redirect('/login');
                })
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
};

exports.getConfirmation = (req, res, next) => {
    const confirmType = req.query.type;
    const email = req.query.email;
    let csrf = req.flash('csrf');

    if(csrf.length <= 0) {
        return res.redirect('/');
    }

    res.render(path.join(config.theme.name, 'auth/confirmation'), {
        pageTitle: 'Confirm',
        confirmType: confirmType,
        email: email
    });
};