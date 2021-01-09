const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('./config.json');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// Models
const User = require('./models/user');

// Database
const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_DATABASE}`;

const app = express();

// Session DB
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

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

// User
app.use((req, res, next) => {
    User.findById('ID')
        .then(user => {
            req.user = user;
            return next();
        })
        .catch(err => {
            console.log(err);
        });
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