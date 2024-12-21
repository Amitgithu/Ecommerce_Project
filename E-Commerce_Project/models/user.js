// Importing mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Importing passport-local-mongoose, a plugin that simplifies integrating authentication with Passport.js
const passportLocalMongoose = require('passport-local-mongoose');

// Defining the userSchema for the User collection in MongoDB
const userSchema = new mongoose.Schema({
  
  // The 'email' field stores the user's email address
  email: {
    type: String,   // Email is expected to be a string
    trim: true,     // This option removes any leading or trailing whitespace from the email address
    required: true  // Makes the 'email' field mandatory for every user
  },
  
  // The 'role' field specifies the user's role in the system
  role: {
    type: String,         // Role is expected to be a string (e.g., "buyer", "admin")
    default: 'buyer'      // Default value is 'buyer' if no role is provided
  },

  // The 'cart' field stores an array of product IDs representing the products in the user's shopping cart
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,   // The cart will store ObjectIds referring to Product documents
      ref: 'Product'                           // Refers to the 'Product' model, which will allow for population of product details
    }
  ],

  // The 'wishList' field stores an array of product IDs representing the products in the user's wishlist
  wishList: [
    {
      type: mongoose.Schema.Types.ObjectId,   // Similar to 'cart', it stores ObjectIds referring to Product documents
      ref: 'Product'                           // Refers to the 'Product' model
    }
  ]
});

// Adding the passport-local-mongoose plugin to handle user authentication functionality like hashing passwords, etc.
userSchema.plugin(passportLocalMongoose);

// Creating the 'User' model using the defined userSchema
const User = mongoose.model('User', userSchema);

// Exporting the 'User' model so it can be used in other parts of the application (like controllers, routes, etc.)
module.exports = User;
