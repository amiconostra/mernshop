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