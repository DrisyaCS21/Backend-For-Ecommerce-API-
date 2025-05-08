const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.js");
const { verify, verifyAdmin } = require("../auth.js");


router.post('/checkout', verify , orderController.checkout);

router.get('/my-orders',  verify ,  orderController.getUserOrders);

router.get('/all-orders', verify , verifyAdmin, orderController.getAllOrders);


module.exports = router;