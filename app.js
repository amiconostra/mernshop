const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('./config.json');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Models
const User = require('./models/user');

// Database
const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_DATABASE}`;

const app = express();

// Express Settings
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', path.join(config.theme.name, config.theme.color, 'layout'));

// Express Middlewares
app.use(expressLayouts);
app.use(express.static(path.join('public', config.theme.name, config.theme.color)));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

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

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        app.listen(process.env.PORT || 3000, () => {
            console.log('Running on Port', process.env.PORT || 3000);
        });
    })
    .catch((err) => {
        console.log(err);
    });