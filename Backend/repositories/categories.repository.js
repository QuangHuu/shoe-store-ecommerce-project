const Category = require('../models/categories.model');
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Create a new category
async function createCategory(categoryData) {
    const category = new Category(categoryData);
    return category.save();
}

/**
 * Get all categories.
 * This will fetch both main and subcategories and populate their parent details.
 * @returns {Promise<Array<Category>>} - An array of all category documents.
 */
async function getAllCategories() {
    return Category.find({})
        .populate('parent', 'name slug') // Populate parent category's name and slug
        .sort({ name: 1 }) // Sort by name for consistent order
        .exec();
}

// Get a single category by ID
async function getCategoryById(id) {
    return Category.findById(id)
        .populate('parent', 'name slug') // Populate parent category's name and slug
        .exec();
}

// Get a single category by Name
async function getCategoryByName(name) {
    return Category.findOne({ name: name })
        .populate('parent', 'name slug') // Populate parent category's name and slug
        .exec();
}

// Get a single category by Slug
async function getCategoryBySlug(slug) {
    return Category.findOne({ slug: slug })
        .populate('parent', 'name slug') // Populate parent category's name and slug
        .exec();
}

/**
 * Retrieves all main categories (categories with no parent).
 * @returns {Promise<Array<Category>>} - An array of main category documents.
 */
async function getMainCategories() {
    // Queries for categories where 'parent' is null AND 'type' is 'main'
    return Category.find({ parent: null, type: 'main' })
        .sort({ name: 1 }) // Sort by name for consistent order
        .exec();
}

/**
 * Retrieves subcategories for a given parent category ID.
 * @param {string} parentId - The ID of the parent category.
 * @returns {Promise<Array<Category>>} - An array of subcategory documents.
 */
async function getSubcategoriesByParent(parentId) {
    // Queries for categories where 'parent' matches parentId AND 'type' is 'sub'
    return Category.find({ parent: parentId, type: 'sub' })
        .sort({ name: 1 }) // Sort by name for consistent order
        .exec();
}

// Update a category by ID
async function updateCategory(id, updateData) {
    return Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
}

// Delete a category by ID
async function deleteCategory(id) {
    return Category.findByIdAndDelete(id).exec();
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    getCategoryBySlug,
    getMainCategories,      
    getSubcategoriesByParent, 
    updateCategory,
    deleteCategory,
};
