const Product = require('../models/Product');
const auth = require("../auth.js");
const {errorHandler} = require("../auth.js")

// Create a new product (Admin only)
module.exports.createProduct = (req, res) => {
    let newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    });

    Product.findOne({ name: req.body.name })
    .then(existingProduct => {
        if (existingProduct) {
            res.status(409).send({ message: 'Product already exists' });
        } else {
            return newProduct.save().then(result => res.status(201).send(result
            )).catch(error => auth.errorHandler(error, req, res)); 
        }
    }).catch(error => auth.errorHandler(error, req, res)); 
};

// Retrieve all products
module.exports.retrieveAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send(products);
    } catch (error) {
        res.status(403).send({ error: error.message });
    }
};

// Retrieve all active products
module.exports.getAllActive = (req, res) => {
    Product.find({ isActive: true })
        .then(result => {
            console.log(result); 
            if (result.length > 0) {
                return res.status(200).send(result);
            } else {
                return res.status(404).send({ message: 'No active product found'});
            }
        })
        .catch(error => errorHandler(error, req, res));
};

// Retrieve a single product by ID
module.exports.retrieveSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product information (Admin only)
module.exports.UpdateProductInfo = (req, res) => {
    let UpdatedProductInfo = {
        name : req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Product.findByIdAndUpdate(req.params.productId, UpdatedProductInfo)
    .then(product => {

        if(product){
            res.status(200).send( { success: true, message: 'Product updated successfully' } );
        }else{
            res.status(404).send( { error: 'Product not found'} );
        }

    })
    .catch(error => errorHandler(error, req, res));
}

// activate product (Admin only)
module.exports.activateProduct = async (req, res) => {
    try {
    
        const product = await Product.findById(req.params.productId);

        if (!product) {
            // If no product is found, return a 404 error
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!product.isActive) {
            return res.status(200).json({
                message: 'Product already active',
                activatedProduct: product
            });
        }
        product.isActive = true;
        const activatedProduct = await product.save();

        // Return success message
        res.status(200).json({
            success: true,
            message: 'Product activated successfully'
        });

    } catch (error) 
    {
        // Handle any unexpected errors
        res.status(500).json({ error: error.message });
    }
};

// archive
module.exports.archiveProduct = async (req, res) => {
    try {
        // Find and update the product, setting isActive to false (archiving it)
        const product = await Product.findById(req.params.productId);

        if (!product) {
            // If no product is found, return a 404 error
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!product.isActive) {
            // If the product is already archived, return a message
            return res.status(200).json({
                message: 'Product already archived',
                archivedProduct: product
            });
        }
        // Archive the product by setting isActive to false
        product.isActive = false;
        const archivedProduct = await product.save();

        // Return success message
        res.status(200).json({
            success: true,
            message: 'Product archived successfully',
            
        });

    } catch (error) {
        // Handle any unexpected errors
        res.status(500).json({ error: error.message });
    }
};

// Search by name
module.exports.searchByName = async (req, res) => {
try {

const products = await Product.find({ name: { $regex:req.body.name, $options: 'i' } });

if (products.length > 0) {
    return res.status(200).send(products);
} else {
return res.status(404).send({ message: 'No products found matching the search term.' });
} 

}catch (error) { 
    errorHandler(error,req, res);

}

};

// Search by price 
module.exports.searchByPriceRange = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        // Ensure minPrice and maxPrice are provided and valid numbers
        if (minPrice === undefined || maxPrice === undefined) {
            return res.status(400).json({ message: "Both minPrice and maxPrice are required" });
        }

        if (isNaN(minPrice) || isNaN(maxPrice)) {
            return res.status(400).json({ message: "minPrice and maxPrice must be valid numbers" });
        }

        const products = await Product.find({
            price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found within this price range" });
        }

        res.status(200).json( products);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}; 

