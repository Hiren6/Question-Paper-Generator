const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const {ensureAuthenticated} = require("../config/auth.js")
const client = require('../models/db').client

// Login page
router.get('/login', (req, res) => { 
    if(req.isAuthenticated()) {
        res.redirect('/dashboard')
    }
    else
        res.render('login');
})

// Take login information and try to login 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect : '/dashboard',
        failureRedirect: '/users/login',
        failureFlash : true
    })(req, res, next)
})

// Register page
router.get('/register', ensureAuthenticated, (req, res) => {
    res.render('register');
})

// Register post handle
router.post('/register', ensureAuthenticated, async (req, res) => {
    const { name, email, authorization_level, roll, password, password2 } = req.body;
    console.log(req.body);
    let errors = [];
    // console.log('Name: ' + name + '\nEmail: ' + email + '\nAuth: ' + authorization_level + '\nPassword: ' + password + '\n');
    if (!name || !email || !authorization_level || !password || !password2 || (authorization_level == "TA" && !roll)) {
        errors.push({ msg: "Please fill in all the fields" })
    }
    //check if password and confirm password match
    if (password !== password2) {
        errors.push({ msg: "Password and confirm password do not match" });
    }

    //check if password is atleast 6 characters
    if (password.length < 6) {
        errors.push({ msg: 'Password must be atleast 6 characters' })
    }
    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password,
            password2: password2
        });
    } 
    else {
        //validation passed
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        try {
            const results = await client.query(`select * from users where email = $1`, [email]);
            console.log(results.rows);
            if (results.rows.length > 0) {  // user already exists
                return res.render("register", {message: "The user is already registered"})
            }
            else {  // add new user
                try {
                    const q = `insert into users (user_name, authorization_level, email, password)
                               values ($1, $2, $3, $4)
                    `;
                    const insert_user = await client.query(q, [name, authorization_level, email, hashedPassword]);
                    req.flash("success_msg", "User successfully registered");
                    res.redirect('/users/register')
                }
                catch (e) { console.error(e.message); }
            }
        }
        catch (e) { console.error(e.message); }
    }
})

// Logout
router.get('/logout', (req, res) => {
    if(req.isAuthenticated()) {
        req.logout();
        req.flash('success_msg','You have successfully logged out!');
        res.redirect('/users/login');
    }
    else
        res.redirect('/users/login')
})

module.exports = router;