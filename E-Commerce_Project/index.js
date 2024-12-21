// Define the port on which the server will listen
const PORT = 8080;

// Importing required modules
const express = require("express"); // Express framework for creating server and handling routes
const app = express(); // Initializing the Express application
const path = require("path"); // Built-in module to work with file and directory paths
const mongoose = require("mongoose"); // ODM (Object Data Modeling) library for MongoDB


const ejsMate = require('ejs-mate'); // EJS layout engine to reuse common template parts
const methodOverride = require('method-override'); // Allows the use of HTTP verbs like PUT or DELETE in places where they aren’t supported
const session = require('express-session'); // Middleware for managing sessions
const flash = require('connect-flash'); // Middleware for displaying flash messages


const passport = require('passport'); // Authentication middleware
const LocalStrategy = require('passport-local'); // Passport strategy for local authentication
const User = require('./models/user'); // User model for authentication
const mongoSanitize = require('express-mongo-sanitize'); // Middleware to sanitize user inputs to prevent NoSQL injection attacks


// Connecting to the MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/ecom') // Local MongoDB connection
  .then(() => { console.log("DB Connected!!!"); }) // Log message if connection is successful
  .catch((err) => { console.log(err); }); // Log error if connection fails
  

// Setting up the view engine and views directory
app.set("view engine", "ejs"); // Setting EJS as the view engine
app.set("views", path.join(__dirname, "views")); // Setting the directory for views
app.engine('ejs', ejsMate); // Using EJS-Mate as the templating engine

// Middleware for serving static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());


// Middleware to enable method override (e.g., for PUT and DELETE requests via forms)
app.use(methodOverride('_method'));


// Configuring session settings
const sessionConfig = {
  secret: 'weneedsomebettersecret', // Secret key for signing session ID cookies
  resave: false, // Do not save session if unmodified
  saveUninitialized: true, // Save uninitialized sessions
  cookie: {
    httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Set cookie expiration (1 week from now)
    maxAge: 1000 * 60 * 60 * 24 * 7, // Maximum age of the cookie (1 week)
  }
};

// Using the session middleware
app.use(session(sessionConfig));

// Middleware for flash messages
app.use(flash());

// Initializing Passport middleware for authentication
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Use session-based authentication

// Passport configuration for user authentication
passport.serializeUser(User.serializeUser()); // Serialize user data into session
passport.deserializeUser(User.deserializeUser()); // Deserialize user data from session
passport.use(new LocalStrategy(User.authenticate())); // Configure Passport to use local strategy for authentication

// Middleware to set up global variables for templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Store the current user in res.locals
  res.locals.success = req.flash('success'); // Store success flash messages
  res.locals.error = req.flash('error'); // Store error flash messages
  next(); // Pass control to the next middleware
});

// Importing API and route files
const productApis = require('./routes/api/productapi'); // Product APIs
const ProductRoutes = require('./routes/productRoutes'); // Product-related routes
const ReviewRoutes = require('./routes/reviewRoutes'); // Review-related routes
const authRoutes = require('./routes/authRoutes'); // Authentication-related routes
const cartRoutes = require('./routes/cartRoutes'); // Cart-related routes

// Using the imported routes
app.use(ReviewRoutes); // Register review routes
app.use(ProductRoutes); // Register product routes
app.use(authRoutes); // Register authentication routes
app.use(productApis); // Register product APIs
app.use(cartRoutes); // Register cart routes

// Define the home route
app.get('/', (req, res) => {
  res.render('home'); // Render the 'home' template
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Live at port ${PORT}`); // Log a message when the server starts
});
