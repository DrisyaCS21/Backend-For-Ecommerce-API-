const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.js");
const { verify, verifyAdmin } = require("../auth.js");


// Route to create a product (admin only)
router.post("/",verify,verifyAdmin, productController.createProduct);

// Route to retrieve all products
router.get('/all', verify , verifyAdmin, productController.retrieveAllProducts);

// Route to retrieve all active products
router.get("/active", productController.getAllActive);

// Route to retrieve a single product by ID
router.get('/:productId',  productController.retrieveSingleProduct);

// Route to update a product's information (admin only)
router.patch("/:productId/update", verify, verifyAdmin , productController.UpdateProductInfo);

// Route to archive a product (admin only)
router.patch('/:productId/archive',  verify, verifyAdmin, productController.archiveProduct);

// Route to activate an archived product (admin only)
router.patch('/:productId/activate',  verify, verifyAdmin, productController.activateProduct);

//Routes to search product by name
router.post("/search-by-name", productController.searchByName);

//Routes to search by price
router.post("/search-by-price", productController.searchByPriceRange);

module.exports = router;