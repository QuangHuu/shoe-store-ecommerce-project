const productRepository = require('../repositories/products.repository');
const { createProductValidation, updateProductValidation } = require('../utils/productValidation'); // Import Joi validation schemas
const categoryRepository = require('../repositories/categories.repository'); // Import category repository
const brandRepository = require('../repositories/brands.repository'); // Import brand repository
const mongoose = require('mongoose');

// Helper function to calculate percentage off
function calculatePercentageOff(product) {
    if (product.onSale && product.price > 0 && product.salePrice !== undefined && product.salePrice < product.price) {
        return ((product.price - product.salePrice) / product.price) * 100;
    }
    return 0; // Return 0 if not on sale or calculation is not possible
}

// --- Product Service Functions ---

// Create a new product
async function createProduct(productData) {
    // 1. Validate the product data using Joi schema
    const { error, value } = createProductValidation(productData);
    if (error) {
        throw new Error(error.details[0].message); // Throw user-friendly error
    }

    // 2. Check if category exists.
    if (!mongoose.Types.ObjectId.isValid(value.category)) {
        throw new Error('Invalid category ID format.');
    }
    const category = await categoryRepository.getCategoryById(value.category);
    if (!category) {
        throw new Error('Category does not exist.');
    }

    // 3. Check if brand exists (if brand is provided).
    if (value.brand) {
        if (!mongoose.Types.ObjectId.isValid(value.brand)) {
            throw new Error('Invalid brand ID format.');
        }
        const brand = await brandRepository.getBrandById(value.brand);
        if (!brand) {
            throw new Error('Brand does not exist.');
        }
    }

    // 4. Create the product using the repository
    const newProduct = await productRepository.createProduct(value);
    return newProduct;
}

// Get all products
async function getAllProducts() {
    const products = await productRepository.getAllProducts();
    // Apply percentageOff calculation
    return products.map(product => {
        const productObject = product.toObject(); // Convert Mongoose document to plain JavaScript object
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

// Get a single product by ID
async function getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID');
    }
    const product = await productRepository.getProductById(id);
    if (product) {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    }
    return null;
}

// Update a product by ID
async function updateProduct(id, updateData) {
    // 1. Validate the product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID');
    }
    // 2. Validate the update data using Joi schema
    const { error, value } = updateProductValidation(updateData);
    if (error) {
        throw new Error(error.details[0].message); // Throw user-friendly error
    }

    // 3. Check if the product exists before updating
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
        throw new Error('Product not found');
    }

    // 4. If category is being updated, validate and check its existence
    if (value.category) {
        if (!mongoose.Types.ObjectId.isValid(value.category)) {
            throw new Error('Invalid category ID format.');
        }
        const category = await categoryRepository.getCategoryById(value.category);
        if (!category) {
            throw new Error('Category does not exist.');
        }
    }

    // 5. If brand is being updated, validate and check its existence
    if (value.brand) {
        if (!mongoose.Types.ObjectId.isValid(value.brand)) {
            throw new Error('Invalid brand ID format.');
        }
        const brand = await brandRepository.getBrandById(value.brand);
        if (!brand) {
            throw new Error('Brand does not exist.');
        }
    }

    // 6. Update the product using the repository
    const updatedProduct = await productRepository.updateProduct(id, value);
    return updatedProduct;
}

// Delete a product by ID
async function deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID');
    }
    // 1. Check if the product exists before deleting
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
        throw new Error('Product not found');
    }
    const deletedProduct = await productRepository.deleteProduct(id);
    return deletedProduct;
}
// Get products by category
async function getProductsByCategory(categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error('Invalid category ID');
    }
    const products = await productRepository.getProductsByCategory(categoryId);
    // Apply percentageOff calculation
    return products.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

// Get products by search query
async function getProductsBySearch(query) {
    const products = await productRepository.getProductsBySearch(query);
    // Apply percentageOff calculation
    return products.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

// --- Rating Service Functions ---

/**
 * Adds a rating to a product.
 * @param {string} productId - The ID of the product to rate.
 * @param {string} userId - The ID of the user adding the rating.
 * @param {number} rating - The rating value (1-5).
 * @param {string} comment - Optional comment text.
 * @returns {Promise<Product>} - The updated product object.
 * @throws {Error} - If product not found, or if rating/comment cannot be added.
 */
async function addRating(productId, userId, rating, comment) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
    }
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    const updatedProduct = await productRepository.addRating(productId, userId, rating, comment);
    if (!updatedProduct) {
        throw new Error('Product not found');
    }
    return updatedProduct;
}

/**
 * Gets the ratings for a specific product.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Array>} - A list of ratings for the product.
 */
async function getRatingsByProduct(productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
    }
    const ratings = await productRepository.getRatingsByProduct(productId);
    return ratings;
}

// --- Comment Service Functions ---

/**
 * Adds a comment to a product.
 * @param {string} productId - The ID of the product.
 * @param {string} userId - The ID of the user adding the comment.
 * @param {string} text - The comment text.
 * @returns {Promise<Product>} - The updated product.
 * @throws {Error}
 */
async function addComment(productId, userId, text) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
    }
    if (!text || text.trim() === "") {
        throw new Error("Comment text cannot be empty");
    }
    const updatedProduct = await productRepository.addComment(productId, userId, text);
    if (!updatedProduct) {
        throw new Error('Product not found');
    }
    return updatedProduct;
}

/**
 * Gets the comments for a product
 * @param {string} productId
 * @returns {Promise<Array>}
 */
async function getCommentsByProduct(productId) {
    if (!mongoose.Types.isValid(productId)) {
        throw new Error('Invalid product ID');
    }
    const comments = await productRepository.getCommentsByProduct(productId);
    return comments;
}

// --- Recommendation Service Function ---
/**
 * Gets recommended products for a given product ID.
 * @param {string} productId - The ID of the product to get recommendations for.
 * @returns {Promise<Array<Product>>} - A list of recommended products.
 * @throws {Error} - If the product ID is invalid or the product is not found.
 */
async function getProductRecommendations(productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
    }

    const currentProduct = await productRepository.getProductById(productId);
    if (!currentProduct) {
        throw new Error('Product not found');
    }

    // Example: Recommend products from the same category, excluding the current product
    const recommendations = await productRepository.findProductsByCategory(currentProduct.category, productId);
    // Apply percentageOff calculation
    return recommendations.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

/**
 * Gets products by brand ID.
 * @param {string} brandId - The ID of the brand.
 * @returns {Promise<Array<Product>>} - A list of products from the specified brand.
 * @throws {Error} - If the brand ID is invalid or no products are found for the brand.
 */
async function getProductsByBrand(brandId) {
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
        throw new Error('Invalid brand ID');
    }
    const products = await productRepository.getProductsByBrand(brandId);
    if (!products || products.length === 0) {
        throw new Error('No products found for this brand.');
    }
    // Apply percentageOff calculation
    return products.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

// --- New Listing Functions (with percentageOff calculation) ---

/**
 * Gets all products marked as new arrivals.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of new arrival products.
 */
async function getNewArrivalProducts() {
    const products = await productRepository.getNewArrivalProducts();
    return products.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

/**
 * Gets all products marked as on sale.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of on-sale products.
 */
async function getOnSaleProducts() {
    const products = await productRepository.getOnSaleProducts();
    return products.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

/**
 * Gets all products marked as exclusive.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of exclusive products.
 */
async function getExclusiveProducts() {
    const products = await productRepository.getExclusiveProducts();
    return products.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
}

/**
 * Gets all products with status 'coming_soon'.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of coming soon products.
 */
async function getComingSoonProducts() {
    const products = await productRepository.getComingSoonProducts();
    return products.map(product => {
        const productObject = product.toObject();
        productObject.percentageOff = calculatePercentageOff(productObject);
        return productObject;
    });
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
    getNewArrivalProducts,
    getOnSaleProducts,
    getExclusiveProducts,
    getComingSoonProducts
};
