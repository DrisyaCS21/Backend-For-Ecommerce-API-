const Cart = require('../models/Cart');  
const Order = require('../models/Order'); 
const auth = require("../auth.js");

// Create Order (Checkout)
module.exports.checkout = async (req, res) => {
    try {
        const userId = req.user.id;

        // Step 3: Find the user's cart
        const cart = await Cart.findOne({ userId: userId });

        // Step 4: If no cart found for the user, return a message
        if (!cart) {
            return res.status(404).send({
                message: 'No cart found for this user',
            });
        }

        // Step 5: Check if the cart has items
        if (cart.cartItems.length === 0) {
            return res.status(400).send({
                error: 'No Items to Checkout',
            });
        }

        // Step 5a: If there are items, create a new order
        const newOrder = new Order({
            userId: userId,
            productsOrdered: cart.cartItems,   
            totalPrice: cart.totalPrice,       
        });

        // Step 6: Save the new order
        const savedOrder = await newOrder.save();

        // After placing the order, delete the cart
        await Cart.findByIdAndDelete(cart._id);

        // Step 6a: Return success message with order details
        return res.status(200).send({
            message: 'ordered Successfully'
        });
    } catch (error) {
        // Step 7: Catch any errors and return to client
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// Retrieve User's Orders
module.exports.getUserOrders = async (req, res) => {
    try {
        // Step 2: Extract user ID from the JWT (handled by the auth middleware)
        const userId = req.user.id;

        // Step 3: Find all orders associated with the user
        const orders = await Order.find({ userId: userId });

        // Step 4: If no orders found, return a message
        if (orders.length ===0) {
            return res.status(404).send({
                message: 'No orders found ',
            });
        }

        // Step 5: Send the found orders to the client
        return res.status(200).send({
            orders
        });

    } catch (error) {
        // Step 6: Catch any errors and send the details to the client
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// Retrieve All Orders (Admin only)
module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        // Step 4: Send the found orders to the client
        return res.status(200).send({ 
            success: true,
            orders
        });

    } catch (error) {
        // Step 5: Catch any errors and send the details to the client
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        });
    }
};