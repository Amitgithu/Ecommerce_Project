// Import required modules and schemas
const Product = require('./models/product'); // Product model for database interactions
const { productSchema } = require('./schemas'); // Schema for validating product data
const { reviewSchema } = require('./schemas'); // Schema for validating review data

// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    // Save the current URL for redirecting after login
    req.session.returnUrl = req.originalUrl;

    // Handle AJAX requests when the user is not authenticated
    if (req.xhr && !req.isAuthenticated()) {
        if (req.session.returnUrl) {
            delete req.session.returnUrl; // Clear the saved URL
        }
        return res.status(401).json({ msg: 'You need to Login First' }); // Respond with unauthorized status
    }

    // Handle non-AJAX requests when the user is not authenticated
    if (!req.isAuthenticated()) {
        req.flash('error', 'You need to login First!!'); // Set an error flash message
        return res.redirect('/login'); // Redirect to the login page
    }

    next(); // Proceed to the next middleware or route handler
};

// Middleware to validate product data
module.exports.validateProduct = (req, res, next) => {
    const { name, img, desc, price } = req.body; // Extract product details from the request body
    const { error } = productSchema.validate({ name, img, price, desc }); // Validate the product data

    if (error) {
        const msg = error.details.map((err) => err.message); // Extract error messages
        return res.render('error', { err: msg }); // Render the error page with messages
    }

    next(); // Proceed to the next middleware or route handler
};

// Middleware to validate review data
module.exports.validateReview = (req, res, next) => {
    const { rating, comment, name, email } = req.body; // Extract review details from the request body
    console.log(req.body); // Log the review data for debugging
    const { error } = reviewSchema.validate({ rating, comment, email, name }); // Validate the review data

    if (error) {
        const msg = error.details.map((err) => err.message); // Extract error messages
        console.log("Error : " + msg); // Log the error messages
        return res.render('error', { err: msg }); // Render the error page with messages
    }

    next(); // Proceed to the next middleware or route handler
};

// Middleware to check if the user is a seller
module.exports.isSeller = (req, res, next) => {
    if (!(req.user.role && req.user.role === 'seller')) { // Check if the user has a seller role
        req.flash('error', 'Access restricted!'); // Set an error flash message
        console.log('Access restricted for non-sellers');
        return res.redirect('/products'); // Redirect to the products page
    }

    next(); // Proceed to the next middleware or route handler
};

// Middleware to check if the logged-in user is the author of the product
module.exports.isProductAuthor = async (req, res, next) => {
    const { id } = req.params; // Extract product ID from the route parameters
    const product = await Product.findById(id); // Fetch the product from the database

    if (!(product.author && product.author.equals(req.user._id))) { // Check if the user is the author
        req.flash('error', 'You don’t have permissions to do that'); // Set an error flash message
        return res.redirect(`/products/${id}`); // Redirect to the product page
    }

    next(); // Proceed to the next middleware or route handler
};
