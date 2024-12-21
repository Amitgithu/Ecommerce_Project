const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Importing the Product model
const Review = require('../models/review'); // Importing the Review model
const { validateReview, isLoggedIn } = require('../middleware'); // Importing middleware for validation and login check

// Route to add a review to a product
router.post('/products/:productid/review', isLoggedIn, validateReview, async (req, res) => {
    try {
        // Extracting product ID from the URL parameters
        const { productid } = req.params;
        
        // Extracting review details (rating, comment, name, email) from the request body
        const { rating, comment, name, email } = req.body;

        // Logging the extracted values (for debugging purposes)
        console.log(productid);
        console.log(rating + " " + comment + " " + name + " " + email);

        // Fetching the product by its ID
        const product = await Product.findById(productid);

        // Creating a new Review object using the extracted data
        const review = new Review({ rating, comment, name, email });

        // Calculating the new average rating for the product
        // Formula: ((previous average rating * number of reviews) + new rating) / (number of reviews + 1)
        const newAverageRating = ((product.avgRating * product.reviews.length) + parseInt(rating)) / (product.reviews.length + 1);
        product.avgRating = parseFloat(newAverageRating.toFixed(1)); // Updating the average rating and rounding to 1 decimal place

        // Adding the new review to the product's reviews array
        product.reviews.push(review);

        // Saving the review and the updated product
        await review.save();
        await product.save();

        // Flash message indicating the review was added successfully
        req.flash('success', 'Your Review is Added Successfully!!!');

        // Redirecting the user back to the product page to display the updated reviews
        res.redirect(`/products/${productid}`);
    } catch (err) {
        // Catching any errors and logging them
        console.log("Error");
        
        // Rendering the error page with the error message
        res.status(500).render('error', { err: err.message });
    }
});

module.exports = router;
