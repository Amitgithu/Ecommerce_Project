// Importing required libraries
const express = require('express');
const router = express.Router();
const Product = require('../models/product');  // Importing the Product model to interact with the database
// Importing middleware functions for validation, authentication, and authorization
const { validateProduct, isLoggedIn, isSeller, isProductAuthor } = require('../middleware');

// Route to display products categorized into different sections (Men, Women, Shoes, Electronics)
router.get('/products', async (req, res) => {
    try {
        // Fetching products based on their category
        const menProducts = await Product.find({ category: 'Men' });
        const womenProducts = await Product.find({ category: 'Women' });
        const shoeProducts = await Product.find({ category: 'Shoes' });
        const electronicProducts = await Product.find({ category: 'Electronics' });

        // Rendering the 'products/home' view and passing the categorized products
        res.render('products/products-home', { menProducts, womenProducts, shoeProducts, electronicProducts });
    }
    catch (e) {
        // If there is an error, render an error page
        res.status(500).render('error', { err: e.message });
    }
});

// Route to display the initial filter page with all products
router.get('/filter', async (req, res) => {
    // Fetching all products from the database
    const product = await Product.find();
    // Rendering the 'filter' view with the fetched products
    res.render('products/product-filter', { product });
});

// Route to handle the filtered product results
router.get('/filter/products', async (req, res) => {
    // Initialize an empty query object that will hold the filter conditions
    const query = {};

    // Check if 'category' query parameter is provided, if so, add it to the query
    if (req.query.category) {
        query.category = { $in: req.query.category }; // Use $in to match any category in the provided array
    }

    // Check if 'price' query parameter is provided, if so, add it to the query
    if (req.query.price) {
        query.price = { $lte: parseInt(req.query.price) }; // Use $lte to filter products that are less than or equal to the price
    }

    // Check if 'color' query parameter is provided, if so, add it to the query
    if (req.query.color) {
        query.color = { $in: Array.isArray(req.query.color) ? req.query.color : [req.query.color] }; 
        // Use $in to match any color from the array. Ensure that the color is handled as an array even if a single color is provided
    }

    // Check if 'rating' query parameter is provided, if so, add it to the query
    if (req.query.rating) {
        query.rating = { $gte: parseFloat(req.query.rating) }; // Use $gte to filter products with a rating greater than or equal to the provided value
    }

    // Log the final query object to check the filter criteria
    console.log(query);

    // Fetch products from the database based on the constructed query
    const product = await Product.find(query);

    // Log the filtered products to verify the results
    console.log(product);

    // Render the 'filter' view with the filtered products
    res.render('products/product-filter', { product });
});


// Route to display the form for adding a new product
router.get('/products/new', isLoggedIn, (req, res) => {
    try {
        // Render the 'products/new' view to add a new product
        res.render('products/product-create');
    }
    catch (e) {
        // If there is an error, render an error page
        res.status(500).render('error', { err: e.message });
    }
});

// Route to get the seller's products
router.get('/products/seller_products', isLoggedIn, async (req, res) => {
    // Get the username of the logged-in user
    let name = req.user.username;

    // Find user details by the username
    let user_details = await User.find({ username: name });
    console.log(user_details);

    // Extract the user's ID from the user details
    let user_id = user_details[0]._id;
    console.log(user_id);

    // Log message indicating we will populate the 'author' field
    console.log("Populate Author");

    // Fetch all products and populate the 'author' field (assuming 'author' refers to the user who added the product)
    const products = await Product.find().populate('author');

    // Initialize an empty array to hold the seller's products
    let product = [];

    // Loop through the fetched products to filter those belonging to the logged-in user (seller)
    for (let item of products) {
        if (item.author) {
            // Check if the product's author ID matches the logged-in user's ID
            console.log(item.author._id);
            if (item.author._id.equals(user_id)) {
                // If the product's author is the logged-in user, add it to the 'product' array
                product.push(item);
            }
        }
    }

    // Log the list of products belonging to the logged-in user
    console.log(product);

    // Render the 'seller_product' view with the filtered list of products
    res.render('products/seller-products', { product });
});


// Route to handle POST request for adding a new product to the database
router.post('/products', isLoggedIn, isSeller, validateProduct, async (req, res) => {
    try {
        // Extracting product details from the request body
        const { name, img, desc, price } = req.body;

        // Creating a new product in the database
        await Product.create({ name, img, price: parseFloat(price), author: req.user._id, desc });

        // Flash success message and redirect to the products page
        req.flash('success', 'Product Added Successfully!!!');
        res.redirect('/products');
    }
    catch (e) {
        // If there is an error, render an error page
        res.status(500).render('error', { err: e.message });
    }
});

// Route to display details of a specific product using its ID
router.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;  // Getting the product ID from the URL parameters
        // Fetching the product by ID and populating its reviews
        const product = await Product.findById(id).populate('reviews');
        // Rendering the 'products/detail' view to display the product details
        res.render('products/product-detail', { product });
    }
    catch (e) {
        // If there is an error, render an error page
        res.status(500).render('error', { err: e.message });
    }
});


// Route to display the form for editing a specific product
router.get('/products/:id/edit', isLoggedIn, isProductAuthor, async (req, res) => {
    try {
        const { id } = req.params;  // Getting the product ID from the URL parameters
        // Fetching the product by ID
        const product = await Product.findById(id);
        // Rendering the 'products/edit' view to edit the product
        res.render('products/product-edit', { product });
    }
    catch (e) {
        // If there is an error, render an error page
        res.status(500).render('error', { err: e.message });
    }
});

// Route to handle PATCH request for updating a specific product
router.patch('/products/:id', validateProduct, isLoggedIn, isProductAuthor, async (req, res) => {
    try {
        const { id } = req.params;  // Getting the product ID from the URL parameters
        const { name, price, img, desc } = req.body;  // Extracting product details from the request body
        // Updating the product in the database by its ID
        await Product.findByIdAndUpdate(id, { name, price, desc, img });

        // Flash success message and redirect to the product's details page
        req.flash('success', 'Product Edited Successfully!!!');
        res.redirect(`/products/${id}`);
    }
    catch (e) {
        // If there is an error, render an error page
        res.status(500).render('error', { err: e.message });
    }
});

// Route to handle DELETE request for deleting a specific product
router.delete('/products/:id', isLoggedIn, isProductAuthor, async (req, res) => {
    try {
        const { id } = req.params;  // Getting the product ID from the URL parameters
        // Deleting the product by ID from the database
        await Product.findByIdAndDelete(id);

        // Flash success message and redirect to the products page
        req.flash('success', 'Product Deleted Successfully!');
        res.redirect('/products');
    }
    catch (e) {
        // If there is an error, render an error page
        res.status(500).render('error', { err: e.message });
    }
});

// Exporting the router to be used in other parts of the application
module.exports = router;
