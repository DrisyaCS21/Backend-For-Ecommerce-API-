const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.js");
const { verify } = require("../auth.js");


// Get User Details (Authenticated users)
router.get("/get-cart", verify, cartController.getCart);

//add cart
router.post("/add-to-cart", verify, cartController.addToCart);

// change product qunatities in cart
router.patch("/update-cart-quantity",verify, cartController.updateCart);

//remove item from cart
router.patch("/:productId/remove-from-cart",verify, cartController.removeFromCart);

//clear cart
router.put("/clear-cart",verify, cartController.clearCart);

module.exports = router;