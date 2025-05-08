const Cart = require("../models/Cart.js");
const auth = require("../auth.js");
const { errorHandler } = require("../auth.js");

module.exports.getCart = (req, res) => {
  return Cart.findOne({ userId: req.user.id })
    .then((cart) => res.status(200).send({ cart }))
    .catch((err) => res.status(500).send({ error: "Internal Server Error" }));
};

module.exports.addToCart = (req, res) => {
  const userId = req.user.id;

  Cart.findOne({ userId })
    .then((userCart) => {
      if (!userCart) {
        userCart = new Cart({
          userId: userId,
          cartItems: [],
          totalPrice: 0,
        });
      }

      const { productId, quantity, subtotal } = req.body;

      const cartItemIndex = userCart.cartItems.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (cartItemIndex !== -1) {
        userCart.cartItems[cartItemIndex].quantity += quantity;
        userCart.cartItems[cartItemIndex].subtotal += subtotal;
      } else {
        userCart.cartItems.push({ productId, quantity, subtotal });
      }

      userCart.totalPrice = userCart.cartItems.reduce(
        (acc, item) => acc + item.subtotal,
        0
      );

      return userCart.save();
    })
    .then((updatedCart) => {
      res.status(201).send({
        message: "Item added to cart successfully",
        cart: updatedCart,
      });
    })
    .catch((error) => {
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    });
};

//update Cart Quantity
module.exports.updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, newQuantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found!' });

        const productIndex = cart.cartItems.findIndex(item => String(item.productId) === String(productId));
        if (productIndex === -1) return res.status(404).json({ message: 'Product not found in cart!' });

        const item = cart.cartItems[productIndex];
        item.subtotal = (item.subtotal / item.quantity) * newQuantity;
        item.quantity = newQuantity;

        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);
        await cart.save();

        res.status(200).json({ message: 'Cart updated successfully!', cart });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while updating the cart', error });
    }
};

//remove from cart
module.exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).send({
        message: "Unauthorized access",
        error: "Invalid token",
      });
    }

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).send({
        message: "No cart found for the user",
      });
    }

    const { productId } = req.params;

    const cartItemIndex = userCart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex !== -1) {
      userCart.cartItems.splice(cartItemIndex, 1);

      // Update the total price of the cart
      userCart.totalPrice = userCart.cartItems.reduce(
        (acc, item) => acc + item.subtotal,
        0
      );

      await userCart.save();

      res.status(200).send({
        message: "Item removed from cart successfully ",
        updatedCart: userCart,
      });
    } else {
      return res.status(404).send({
        message: "Item not found in cart",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//clear cart
module.exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).send({
        message: "Unauthorized access",
        error: "Invalid token",
      });
    }

    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).send({
        message: "No cart found for the user",
      });
    }

    if (userCart.cartItems.length > 0) {
      userCart.cartItems = [];
      userCart.totalPrice = 0;

      await userCart.save();

      res.status(200).send({
        message: "Cart cleared successfully",
        cart: userCart,
      });
    } else {
      return res.status(404).send({
        message: "Cart is already empty",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
