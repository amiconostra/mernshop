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
const multer = require('multer');
const cookieParser = require('cookie-parser');

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

// Multer Settings
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.fieldname == 'avatar') {
            cb(null, 'public/tinydash/assets/avatars');
        } else if(file.fieldname == 'productImage') {
            cb(null, 'public/tinydash/assets/products');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// Express APP
const app = express();

// Express Settings
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', path.join(config.theme.name, 'layout'));

// Express Middlewares
app.use(cookieParser());
app.use(expressLayouts);
app.use(express.static(path.join('public', config.theme.name)));
app.use('/public/' + config.theme.name, express.static(path.join('public', config.theme.name)));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).fields(
    [
        { name: 'productImage', maxCount: 1 },
        { name: 'avatar', maxCount: 1 }
    ]
));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: { secure: true }
}));
app.use(csrfProtection);
app.use(flash());

// Shared Across Views (Requests)
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// User Handler
app.use(async(req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    
    try {
        const user = await User.findById(req.session.user._id);
        if(!user) {
            return next();
        }
        
        req.user = user;
        return next();
    } catch(err) {
        next(new Error(err));
    }
});

// Routes
app.use('/', require('./routes/router'));

// Internal Error Handler
// Development Error Handler
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render(path.join(config.theme.name, 'error/500'), {
            pageTitle: '500',
            path: '/500',
            message: err.message,
            error: err
        });
    });
}

// Production Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render(path.join(config.theme.name, 'error/500'), {
        pageTitle: '500',
        path: '/500',
        message: err.message,
        error: {}
    });
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then((result) => {
        app.listen(process.env.PORT || 3000, () => {
            console.log('Running on Port', process.env.PORT || 3000);
        });
    })
    .catch((err) => {
        console.log(err);
    });