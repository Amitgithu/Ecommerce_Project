// Importing required modules and middleware
const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Importing the User model to interact with user data
const { isLoggedIn } = require("../middleware"); // Middleware to ensure user authentication
const Product = require("../models/product"); // Importing the Product model to interact with product data

const stripe = require("stripe")(
  "sk_test_51OI9XuSDvaj3CBe925ZKNySvvstBK8ef2TkGw6lPO1Sswvdfwiw7daFIkdGIjIeA2upJA7qWMwOk3yOH1HZ97zVu00B7t6Pu55"
); // Stripe API for handling payments

// Route to display the user's cart
router.get("/user/cart", isLoggedIn, async (req, res) => {
  // Fetching the currently logged-in user by their ID and populating their cart with product details
  const user = await User.findById(req.user._id).populate("cart");

  // Calculating the total cost of all products in the user's cart
  const totalAmount = user.cart.reduce(
    (sum, curr) => sum + curr.selling_price,
    0
  );

  // Flashing a success message indicating the product was added (if applicable)
  req.flash("success", "Product added successfully");

  // Rendering the cart page, passing the user's cart and total amount
  res.render("cart/addToCard-page", { user, totalAmount });
});


router.post('/updateCart', async (req, res) => {
  const { updatedCartData } = req.body;  // Extract updated cart data from the request body
  console.log("Cart data:", updatedCartData);

  try {
    // Loop through the updatedCartData to process each product update
    for (let { productId, quantity } of updatedCartData) {
      // Find the product in the Product collection
      const product = await Product.findById(productId);

      console.log("Product ID : ", productId, "Quantity : ", quantity);
      

      // Check if the product exists
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }

      // Check if there is enough stock for the requested quantity
      if (product.stockQuantity < quantity) {
        req.flash('error', `Not enough stock for product ${productId}. Available: ${product.stockQuantity}`);
        return res.status(400).json({
          message: `Not enough stock for product ${productId}. Available: ${product.stockQuantity}`
        });
      }


      // Reduce the stock quantity of the product based on the new quantity
      product.stockQuantity -= quantity;
      product.quantity = quantity;
      await product.save();
    }

    // Send a success response
    res.json({ message: 'Cart and product stock updated successfully' });

  } catch (error) {
    console.error('Error updating cart:', error);
    req.flash('error', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Route to render the checkout page
router.get("/user/checkout", isLoggedIn, async (req, res) => {
  // Fetching the user's data and their populated cart
  const user = await User.findById(req.user._id).populate("cart");

  // Calculating the total amount for the checkout process including quantity and price per item
  let totalAmount = 0;

  user.cart.forEach((product) => {
    totalAmount += product.selling_price * product.quantity; // Calculate total based on quantity
  });

  // console.log("User Cart : ", user);

  // Rendering the checkout page with the user's cart, total amount, and product details
  res.render("cart/checkout-page", { user, totalAmount });
});

// Route to render the payment page
router.get("/checkout/payment", (req, res) => {
  // Rendering the payment form page where users can enter their payment details
  res.render("cart/payment");
});

// Route to handle a direct product checkout (buying a single product without adding to the cart)
router.get("/user/:id/checkout", isLoggedIn, async (req, res) => {
  // Extracting the product ID from the route parameters
  const { id } = req.params;

  // Finding the specific product being purchased
  const product = await Product.findById(id);

  // Setting the total amount to the price of the single product
  const totalAmount = product.selling_price;

  // Check if there is enough stock for the requested quantity
  if (product.stockQuantity < quantity) {
    return res.status(400).json({
      message: `Not enough stock for product ${productId}. Available: ${product.stockQuantity}`
    });
  }

  // Reduce the stock quantity of the product based on the new quantity
  product.stockQuantity -= quantity;

  // Rendering the direct buy page with product details and the total amount
  res.render("cart/direct_buy", { product, totalAmount });
});

// Route to handle Stripe payment process
router.post("/checkout/payment/:amount", async (req, res) => {
  // Destructuring user details from the request body
  const {
    first_name,
    last_name,
    phone,
    email,
    address,
    city,
    state,
    postal_code,
  } = req.body;
  console.log(req.body); // Logging user details for debugging purposes

  // Creating a Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // Only accepting card payments
    line_items: [
      {
        price_data: {
          currency: "INR", // Currency for payment
          product_data: {
            name: "all items", // General name for all items in the cart
          },
          unit_amount: req.params.amount * 100, // Total amount in the smallest currency unit (paise for INR)
        },
        quantity: 1, // Fixed quantity for simplicity
        adjustable_quantity: {
          enabled: true, // Allowing users to adjust the quantity
          minimum: 1, // Minimum quantity allowed
          maximum: 10, // Maximum quantity allowed
        },
      },
    ],
    shipping_address_collection: {
      allowed_countries: ["IN"], // Restricting shipping to India
    },
    phone_number_collection: {
      enabled: true, // Collecting user's phone number
    },
    mode: "payment", // One-time payment mode
    success_url: "http://localhost:8080/products", // Redirect URL on successful payment
    cancel_url: "http://localhost:8080/products", // Redirect URL on canceled payment
  });

  // Redirecting the user to the Stripe payment page
  res.redirect(303, session.url);
});

// Route to render the order confirmation page after payment
router.get("/checkout/payment/order", (req, res) => {
  // Rendering the order confirmation page
  res.render("cart/order");
});

// Route to delete a product from the user's cart
router.delete("/user/:userid", async (req, res) => {
  try {
    // Extracting user ID and cart item ID from the request
    const { userid } = req.params;
    const { cartid } = req.query;

    // Fetching the user's cart
    let user = await User.findById(userid).populate("cart");

    // Removing the specified product from the user's cart
    let updatedCart = user.cart.filter((cartItem) => cartItem._id != cartid);

    // Updating the user's cart with the remaining items
    user.cart = updatedCart;
    user.save();

    // Flashing success message
    req.flash("success", "Product Deleted Successfully!");

    // Redirecting the user to their cart
    res.redirect("/user/cart");
  } catch (e) {
    // Rendering an error page in case of issues
    res.status(500).render("error", { err: e.message });
  }
});

// Route to add a product to the user's cart
router.post("/user/:productid/add", isLoggedIn, async (req, res) => {
  // Extracting the product ID from the request parameters
  const { productid } = req.params;

  // Finding the product by ID
  const product = await Product.findById(productid);

  // Fetching the logged-in user's data
  const user = await User.findById(req.user._id);

  // Adding the product to the user's cart
  user.cart.push(product);

  // Saving the updated user data to the database
  user.save();

  // Redirecting the user to their cart page
  res.redirect("/user/cart");
});

module.exports = router;
