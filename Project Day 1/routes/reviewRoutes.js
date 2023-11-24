const express = require("express");
const Product = require('../models/Product')
const Review = require('../models/Review')
const router = express.Router()  //mini application/instance

router.post('/products/:id/review',async (req, res)=>{
    let{id} = req.params;
    let{rating, comment} = req.body;
    let product = await Product.findById(id);
    let review = new Review({rating, comment});
    console.log(review);

    product.reviews.push(review);
    await product.save();
    await review.save();

    let foundProduct = await Product.findById(id).populate('reviews');
    // console.log(foundProduct);
    res.render('products/show' , {foundProduct})
})  

// export so that you can use in app.js
module.exports = router;
