// Import Joi for schema validation
const Joi = require('joi'); // Joi is a validation library for defining schemas

// Define a schema for validating product data
module.exports.productSchema = Joi.object({
    name: Joi.string().required(), // Name must be a string and is required
    img: Joi.string().required(), // Image URL must be a string and is required
    price: Joi.number().min(0).required(), // Price must be a non-negative number and is required
    desc: Joi.string().required() // Description must be a string and is required
});

// Define a schema for validating review data
module.exports.reviewSchema = Joi.object({
    rating: Joi.number().min(0).max(5).required(), // Rating must be between 0 and 5 and is required
    comment: Joi.string().required(), // Comment must be a string and is required
    name: Joi.string().required(), // Name must be a string and is required
    email: Joi.string().required() // Email must be a string and is required
});