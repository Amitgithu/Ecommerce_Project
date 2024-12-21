// Importing mongoose library to interact with MongoDB
const mongoose = require("mongoose");

// Defining the reviewSchema for the review collection in MongoDB
const reviewSchema = new mongoose.Schema({
  // The 'rating' field will store the rating value, which is expected to be a number
  rating: {
    type: String,  // Storing the rating as a string, but should ideally be a Number (to handle numerical ratings)
    min: 1,        // Minimum value for rating is 1
    max: 5,        // Maximum value for rating is 5
  },
  
  // The 'comment' field will store any comments provided by the reviewer
  comment: {
    type: String,   // Data type is String, suitable for text input
    trim: true,     // This option removes any leading or trailing whitespace from the comment text
  },
  
  // The 'name' field stores the name of the reviewer
  name: {
    type: String,   // Name is expected to be a string
    trim: true,     // Removes any leading/trailing spaces from the name
    required: true  // Makes the 'name' field mandatory
  },
  
  // The 'email' field stores the email of the reviewer
  email: {
    type: String,   // Email is expected to be a string
    trim: true,     // Removes leading/trailing spaces from the email
    required: true  // Makes the 'email' field mandatory
  },
  
}, {
  // 'timestamps' automatically adds 'createdAt' and 'updatedAt' fields to the schema
  timestamps: true
});

// Creating a Mongoose model called 'Review' using the reviewSchema defined above
const Review = mongoose.model("Review", reviewSchema);

// Exporting the 'Review' model so it can be used in other parts of the application
module.exports = Review;
