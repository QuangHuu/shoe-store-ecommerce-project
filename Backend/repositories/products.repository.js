const Product = require('../models/products.model');

// Create a new product
async function createProduct(productData) {
    const product = new Product(productData);
    return product.save();
}

// Get all products
async function getAllProducts() {
    return Product.find()
        .populate('category') // Populate the category field
        .populate('brand')    // Populate the brand field
        .exec();
}

// Get a single product by ID
async function getProductById(id) {
    return Product.findById(id)
        .populate('category') // Populate the category field
        .populate('brand')    // Populate the brand field
        .populate('ratings.user', 'username') // Populate user in ratings
        .populate('comments.user', 'username') // Populate user in comments
        .exec();
}

// Update a product by ID
async function updateProduct(id, updateData) {
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .exec();
}

// Delete a product by ID
async function deleteProduct(id) {
    return Product.findByIdAndDelete(id).exec();
}

// Get products by category
async function getProductsByCategory(categoryId) {
    return Product.find({ category: categoryId })
        .populate('category')
        .populate('brand')
        .exec();
}

// Get products by search query
async function getProductsBySearch(query) {
    const searchQuery = {
        $or: [
            { name: { $regex: query, $options: 'i' } }, // Case-insensitive search on name
            { description: { $regex: query, $options: 'i' } }, // Case-insensitive search on description
        ],
    };
    return Product.find(searchQuery)
        .populate('category')
        .populate('brand')
        .exec();
}

// Add a rating to a product
async function addRating(productId, userId, rating, comment) {
    return Product.findByIdAndUpdate(
        productId,
        {
            $push: {
                ratings: {
                    user: userId,
                    rating: rating,
                    comment: comment
                }
            }
        },
        { new: true, runValidators: true }
    ).exec();
}

// Add a comment to a product
async function addComment(productId, userId, text) {
    return Product.findByIdAndUpdate(
        productId,
        {
            $push: {
                comments: {
                    user: userId,
                    text: text
                }
            }
        },
        { new: true, runValidators: true }
    ).exec();
}
//Get ratings by product
async function getRatingsByProduct(productId) {
    return Product.findById(productId)
        .populate('ratings.user', 'username')
        .select('ratings')
        .exec();
}

//Get comments by product
async function getCommentsByProduct(productId) {
    return Product.findById(productId)
        .populate('comments.user', 'username')
        .select('comments')
        .exec();
}

/**
 * Finds products by category, excluding a specific product ID.
 * @param {string} categoryId - The ID of the category.
 * @param {string} excludeId - The ID of the product to exclude from the results.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of products.
 */
async function findProductsByCategory(categoryId, excludeId) {
    return Product.find({
        category: categoryId,
        _id: { $ne: excludeId } // Exclude the product with this ID
    })
        .populate('category')
        .populate('brand')
        .exec();
}

/**
 * Gets products by brand ID.
 * @param {string} brandId - The ID of the brand.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of products from the specified brand.
 */
async function getProductsByBrand(brandId) {
    return Product.find({ brand: brandId })
        .populate('category')
        .populate('brand')
        .exec();
}

/**
 * Gets all products marked as new arrivals.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of new arrival products.
 */
async function getNewArrivalProducts() {
    return Product.find({ isNewArrival: true })
        .populate('category')
        .populate('brand')
        .exec();
}

/**
 * Gets all products marked as on sale.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of on-sale products.
 */
async function getOnSaleProducts() {
    return Product.find({ onSale: true })
        .populate('category')
        .populate('brand')
        .exec();
}

/**
 * Gets all products marked as exclusive.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of exclusive products.
 */
async function getExclusiveProducts() {
    return Product.find({ isExclusive: true })
        .populate('category')
        .populate('brand')
        .exec();
}

/**
 * Gets all products with status 'coming_soon'.
 * @returns {Promise<Array<Product>>} - A promise that resolves to an array of coming soon products.
 */
async function getComingSoonProducts() {
    return Product.find({ status: 'coming_soon' })
        .populate('category')
        .populate('brand')
        .exec();
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
    addComment,
    getRatingsByProduct,
    getCommentsByProduct,
    findProductsByCategory,
    getProductsByBrand,
    getNewArrivalProducts, // Export new function
    getOnSaleProducts,     // Export new function
    getExclusiveProducts,  // Export new function
    getComingSoonProducts  // Export new function
};
