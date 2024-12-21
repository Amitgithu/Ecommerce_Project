const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Importing the User model
const passport = require('passport'); // Importing passport for user authentication

// Route to render the registration form
router.get('/register', (req, res) => {
    // Rendering the signup page where users can register
    res.render('auth/signup');
});

// POST route to handle user registration
router.post('/register', async (req, res) => {
    try {
        // Destructuring the data from the request body (username, password, email, role)
        const { username, password, email, role } = req.body;

        // Creating a new User object with the provided data
        const user = new User({ username, email, role });

        // Registering the user using the User model's register method
        // This method hashes the password and stores the user in the database
        const newUser = await User.register(user, password);

        // Log the new user in immediately after registration
        req.login(newUser, function(err) {
            if (err) {
                // If an error occurs during login, pass it to the next middleware
                return next(err);
            }

            // Set a success flash message
            req.flash('success', 'Welcome, You are Registered Successfully');

            // Redirect the user to the '/products' page after successful registration
            return res.redirect('/products');
        });
    }
    catch (e) {
        // If an error occurs (e.g., email already exists), flash an error message and redirect to register page
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

// Route to render the login form
router.get('/login', (req, res) => {
    // Rendering the login page where users can log in
    res.render('auth/login');
});

// POST route to handle user login
router.post('/login', 
    // Using Passport.js to authenticate the user using the 'local' strategy
    passport.authenticate('local', { 
        failureRedirect: '/login', // If login fails, redirect to the login page
        keepSessionInfo: true, // Keeps the session information during authentication
        failureFlash: true // If authentication fails, show a flash message
    }),
    (req, res) => {
        // This block is executed if the login is successful

        // Capitalizing the first letter of the username for a personalized greeting
        let name = req.user.username;
        name = name[0].toUpperCase() + name.slice(1);

        // Flash a success message with the user's name
        req.flash('success', `Welcome Back Again!! ${name}`);

        // Check if the user tried to access a specific page before login (e.g., a product review page)
        let redirectUrl = req.session.returnUrl || '/products'; // Default redirect is to '/products'

        // If the redirect URL contains 'review', clean it up to avoid directing the user to the review form
        if (redirectUrl && redirectUrl.indexOf('review') !== -1) {
            redirectUrl = redirectUrl.split('/');
            redirectUrl.pop(); // Removing the review part from the URL
            redirectUrl = redirectUrl.join('/'); // Rejoin the URL without the 'review' part
        }

        // Redirect the user to the correct page (either the page they tried to access or the products page)
        res.redirect(redirectUrl);

        // Delete the returnUrl session variable after it's been used for redirection
        delete req.session.returnUrl;
    }
);

// Route to log the user out
router.get('/logout', function(req, res, next) {
    // Using Passport.js's logout function to end the user session
    req.logout(function(err) {
        if (err) { 
            // If an error occurs during logout, pass it to the next middleware
            return next(err); 
        }

        // Flash a goodbye message after the user logs out
        req.flash('success', 'Goodbye!!');

        // Redirect the user to the '/products' page after logout
        res.redirect('/products');
    });
});

module.exports = router;
