// requiring necessary modules
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const User = require('./models/model.js');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const initializepassport = require('./passport-config.js');
initializepassport(passport);

// init app
const app = express();

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(flash());

// database URI
// DATABASE URI
dbURI = "";
//  CONNECTING TO THE DATABASE
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((function(result) {
        // if successfully connected, start listening
        app.listen(5000);
    
    })).catch(function(err) {
        // in case an error occurs while connecting
        console.log(err);
    });

// this function checks if an object is empty or not
// returns true if empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}



// @route GET /
// @desc homepage
app.get('/', checkAuthenticated, function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// @route GET /login
// @desc login page
app.get('/login', checkNotAuthenticated, function(req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
}))

// @route GET /register
// @desc register page
app.get('/register', checkNotAuthenticated, function(req, res) {
    res.sendFile(__dirname + '/views/register.html');
});

// @route POST
// @desc for registering the user
app.post('/register', checkNotAuthenticated, function(req, res) {
    async function registerUser() {
        // register user
        try {
            console.log('okay')
            // hashing the password
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            // now saving the information to the database
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            })
            user.save()
                .then(function(result) {
                    console.log(result);
                }).catch(function(err) {
                    console.log(err);
                });
            // if registration is successful, redirect to login page
            res.redirect('/login');
        } catch {
            res.redirect('/register')
        }
    }

    
    // first check if a user with the same email exists
    User.findOne({ email: req.body.email })
        .then(function(result) {
            const regUser = isEmpty(result);
            console.log(regUser);
            // if there are no users, regUser will be true, otherwise false

            if (regUser == false) {
                // will redirect to register again
                res.redirect('/register');
                 
            } else {
                // otherise register the user
                registerUser();
            }

        }).catch(function(err) {
            console.log(err)
        })
})

app.get('/profile', checkAuthenticated, function(req, res) {
    res.send(req.user);
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    } 
    next();
}
