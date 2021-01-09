const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('./config.json');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const csrf = require('csurf');

// Models
const User = require('./models/user');

// Database
const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_DATABASE}`;

// Session DB
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

// CSRF Settings
const csrfProtection = csrf();

// Express APP
const app = express();

// Express Settings
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', path.join(config.theme.name, 'layout'));

// Express Middlewares
app.use(expressLayouts);
app.use(express.static(path.join('public', config.theme.name)));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: { secure: true }
}));
app.use(csrfProtection);
app.use(flash());

// User Handler
app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            return next();
        })
        .catch(err => {
            console.log(err);
        });
});

// Shared Across Views (Requests)
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Routes
app.use('/', require('./routes/router'));

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then((result) => {
        app.listen(process.env.PORT || 3000, () => {
            console.log('Running on Port', process.env.PORT || 3000);
        });
    })
    .catch((err) => {
        console.log(err);
    });