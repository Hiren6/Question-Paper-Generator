const express = require('express');
const router = express.Router();
const User = require("../models/user");
const passport = require('passport');
const bcrypt = require('bcrypt');

// Login page
router.get('/login', (req, res) => {
    res.render('login');
})

// Register page
router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/login', (req, res) => {
    passport.authenticate('local', {
        successRedirect : '/dashboard',
        failureRedirect: '/users/login',
        failureFlash : true
    })(req,res)
})

// Register post handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    console.log('Name: ' + name + '\nEmail: ' + email + '\nPassword: ' + password + '\n');
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all the fields" })
    }
    //check if match
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
        })
    } 
    else {
        //validation passed
        // User.findOne({ email: email }).exec((err, user) => {
        //     console.log(user);
        //     if (user) {
        //         errors.push({ msg: 'User is already registered' });
        //         res.render('register', { errors, name, email, password, password2 })
        //     } 
        //     else {
        //         const newUser = new User({
        //             name: name,
        //             email: email,
        //             password: password
        //         });

        //         // Hash password
        //         bcrypt.genSalt(10,(err,salt) => 
        //         bcrypt.hash(newUser.password, salt, (err,hash) => {
        //             if(err) throw err;
        //             // Encrypt the password 
        //             newUser.password = hash;
        //             // Save user
        //             newUser.save()
        //             .then((value) => {
        //                 console.log(value)
        //                 req.flash('success_msg', 'You are now registered!')
        //                 res.redirect('/users/login');
        //             })
        //             .catch(value => console.log(value));    
        //         }));
        //     }
        // })
    }
})

// Logout
router.get('/logout', (req, res) => { })
module.exports = router;