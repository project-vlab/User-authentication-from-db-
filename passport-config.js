// requiring local strategy and bcrypt
const bcrypt = require('bcrypt');
//const passport = require('passport');
const User = require('./models/model.js');
const LocalStrategy = require('passport-local').Strategy;

function initializepassport(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {
        // match user
        User.findOne({ email: email})
            .then(function(user) {  // result == user - if you're confused check the findOne in the documentation
                // if there is no user
                if (!user) {
                    return done(null, false, { message: "No user with this email"});
                }
                // if a user is found, match the password
                bcrypt.compare(password, user.password, function(err, isMatch) {
                    if (err) {done(err);}
                    
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: "Incorrect Password"})
                    }


                })

            })
            .catch(function(err) {
                console.log(err)
            })

    }));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        })
    })

}
module.exports = initializepassport;