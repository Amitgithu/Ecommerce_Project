const express = require("express");
const router = express.Router();
const { isLoggedIn } = require('../../middleware'); // Importing middleware to check if the user is logged in
const User = require('../../models/user'); // Importing the User model

// Route to handle the like/unlike functionality for products
router.post('/products/:productid/like', isLoggedIn, async (req, res) => {
    const { productid } = req.params; // Extracting the product ID from the URL parameters
    
    // Grab the current logged-in user from the request object
    const user = req.user;
    
    // Check if the product is already in the user's wishlist
    const isLiked = user.wishList.includes(productid);
    
    // If the product is already liked (i.e., it is in the wishlist), we remove it
    // If the product is not liked (i.e., not in the wishlist), we add it
    const option = isLiked ? '$pull' : '$addToSet'; // Decide whether to pull (remove) or add the product from/to the wishlist
    
    // Update the user's wishlist by either adding or removing the product
    req.user = await User.findByIdAndUpdate(req.user._id, { [option]: { wishList: productid } }, { new: true });
    
    // Send a response to indicate the like/unlike operation was performed (for now, it's a placeholder response)
    res.send('Like API');
});

module.exports = router;
