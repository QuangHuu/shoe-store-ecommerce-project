const productService = require('../services/products.service'); // Corrected import to plural

// --- Product Controller Functions ---

// Create a new product
async function createProduct(req, res) {
    try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json(newProduct); // 201 Created
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request
    }
}

// Get all products
async function getAllProducts(req, res) {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json(products); // 200 OK
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve products' }); // 500 Internal Server Error
    }
}

// Get a single product by ID
async function getProductById(req, res) {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
        }
        res.status(200).json(product); // 200 OK
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request. Could also be 500 for DB error.
    }
}

// Update a product by ID
async function updateProduct(req, res) {
    try {
        const updatedProduct = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json(updatedProduct); // 200 OK
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request
    }
}

// Delete a product by ID
async function deleteProduct(req, res) {
    try {
        const deletedProduct = await productService.deleteProduct(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
        }
        res.status(200).json({ message: 'Product deleted successfully' }); // 200 OK
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request
    }
}

// Get products by category
async function getProductsByCategory(req, res) {
    try {
        const products = await productService.getProductsByCategory(req.params.categoryId);
        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get products by search query
async function getProductsBySearch(req, res) {
    try {
        const query = req.query.q; // Assuming the query parameter is 'q'
        const products = await productService.getProductsBySearch(query);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve products' });
    }
}

// --- Rating Controller Functions ---
async function addRating(req, res) {
    try {
        const { productId, userId, rating, comment } = req.body; // Extract data from request
        const updatedProduct = await productService.addRating(productId, userId, rating, comment);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getRatingsByProduct(req, res) {
    try {
        const productId = req.params.productId;
        const ratings = await productService.getRatingsByProduct(productId);
        res.status(200).json(ratings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// --- Comment Controller Functions ---
async function addComment(req, res) {
    try {
        const { productId, userId, text } = req.body;
        const updatedProduct = await productService.addComment(productId, userId, text);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getCommentsByProduct(req, res) {
    try {
        const productId = req.params.productId;
        const comments = await productService.getCommentsByProduct(productId);
        res.status(200).json(comments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// --- Recommendation Controller Function ---
/**
 * Gets recommended products for a given product ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getProductRecommendations(req, res) {
    try {
        const productId = req.params.productId;
        const recommendations = await productService.getProductRecommendations(productId);
        res.status(200).json(recommendations); // 200 OK
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request, or other appropriate status
    }
}

/**
 * Gets products by brand ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getProductsByBrand(req, res) {
    try {
        const brandId = req.params.brandId; // Assuming brandId is passed as a URL parameter
        const products = await productService.getProductsByBrand(brandId);
        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// --- New Listing Controller Functions ---

/**
 * Gets all products marked as new arrivals.
 */
async function getNewArrivalProductsController(req, res) {
    try {
        const products = await productService.getNewArrivalProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Gets all products marked as on sale.
 */
async function getOnSaleProductsController(req, res) {
    try {
        const products = await productService.getOnSaleProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Gets all products marked as exclusive.
 */
async function getExclusiveProductsController(req, res) {
    try {
        const products = await productService.getExclusiveProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Gets all products with status 'coming_soon'.
 */
async function getComingSoonProductsController(req, res) {
    try {
        const products = await productService.getComingSoonProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsBySearch,
    addRating,
    getRatingsByProduct,
    addComment,
    getCommentsByProduct,
    getProductRecommendations,
    getProductsByBrand,
    getNewArrivalProductsController, // Export new controller function
    getOnSaleProductsController,     // Export new controller function
    getExclusiveProductsController,  // Export new controller function
    getComingSoonProductsController  // Export new controller function
};
