// Import mongoose for MongoDB interactions
const mongoose = require("mongoose");
const Review = require('./review'); // Import Review model for handling product reviews

// Define the schema for the Product model
const productSchema = new mongoose.Schema({
  name: {
    type: String, // Product name
    trim: true, // Remove leading and trailing whitespaces
    required: true, // Name is mandatory
  },
  image: {
    type: String, // URL or path for the product image
    trim: true, // Remove leading and trailing whitespaces
  },
  price: {
    type: Number, // Original price of the product
    min: 0, // Minimum price cannot be negative
    default: 50, // Default price if not provided
    required: true, // Price is mandatory
  },
  quantity:{
    type:Number,  // Quantity which user want to buy
    min: 0,     // Minimum quantity cannot be negative
    default: 1 // Default quantity if not provided
  },
  stockQuantity: {
    type: Number,
    // required: true,
    default: 50, // Default stock quantity for new products
  },
  selling_price: {
    type: Number, // Discounted price for the product
    min: 0, // Minimum selling price cannot be negative
    default: 50, // Default selling price if not provided
    required: true, // Selling price is mandatory
  },
  desc: {
    type: String, // Description of the product
    trim: true, // Remove leading and trailing whitespaces
  },
  category: {
    type: String, // Category to which the product belongs
    trim: true, // Remove leading and trailing whitespaces
    required: true, // Category is mandatory
  },
  avgRating: {
    type: Number, // Average rating of the product
    default: 0, // Default rating is 0 if no reviews are available
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user who created the product
    ref: 'User', // Refers to the User model
  },
  discount: {
    type: String, // Discount details for the product
    trim: true, // Remove leading and trailing whitespaces
    required: true, // Discount information is mandatory
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId, // Reference to associated reviews
      ref: 'Review', // Refers to the Review model
    },
  ],
});

// Mongoose middleware function to delete all associated reviews when a product is deleted
productSchema.post('findOneAndDelete', async function(product) {
  if (product.reviews.length > 0) { // Check if the product has associated reviews
    await Review.deleteMany({ _id: { $in: product.reviews } }); // Delete all reviews linked to the product
  }
});

// Create and export the Product model
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
