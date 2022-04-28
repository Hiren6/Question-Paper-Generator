const LocalStrategy = require('passport-local').Strategy;
const client = require('../models/db').client
const bcrypt = require('bcrypt');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'email',passwordField: 'password'},(email,password,done)=>{
            console.log(email)
            client.query(
                `SELECT * FROM users WHERE email = $1`, [email],
                (err, results) => {
                    if (err) {
                        throw err;
                    }
                    console.log(results.rows)
                    if (results.rows.length > 0) {
                        const user = results.rows[0];
                
                        bcrypt.compare(password, user.password, (err, isMatch) => {
                            if (err) {
                            console.log(err);
                            }
                            if (isMatch) {
                            return done(null, user);
                            } else {
                            //password is incorrect
                            return done(null, false, { message: "Password is incorrect" });
                            }
                        });
                    } 
                    else {
                        // No user
                        return done(null, false, {message: "User with these credentials does not exist"});
                    }
                }
            )
        })
    )

    passport.serializeUser(function(user,done) {
        done(null,user.user_id);
    })
    
    passport.deserializeUser(function(id,done){
        client.query(`SELECT * FROM users WHERE user_id = $1`, [id], (err, results) => {
            if (err) {
              return done(err);
            }
            return done(null, results.rows[0]);
        });
    })
}