const categoryRepository = require('../repositories/categories.repository');
const { createCategoryValidation, updateCategoryValidation } = require('../utils/categoryValidation');
const mongoose = require('mongoose'); // For ObjectId validation
const productRepository = require('../repositories/products.repository'); // Import product repository

/**
 * Creates a new category.
 * The 'type' field is automatically inferred by the model based on 'parent'.
 * @param {object} categoryData - Data for the new category (name, description, parent?).
 * @returns {Promise<Category>} - The newly created category document.
 * @throws {Error} - If category data is invalid, name exists, or parent is invalid.
 */
async function createCategory(categoryData) {
    // 1. Validate category data (using Joi/whatever 'createCategoryValidation' uses)
    // The frontend should NOT send the 'type' field.
    const { error, value } = createCategoryValidation(categoryData);
    if (error) {
        throw new Error(error.details[0].message);
    }

    // 2. Check for duplicate category name
    const existingCategory = await categoryRepository.getCategoryByName(value.name);
    if (existingCategory) {
        throw new Error('Category name already exists');
    }

    // 3. Validate parent category if provided
    if (value.parent) {
        if (!mongoose.Types.ObjectId.isValid(value.parent)) {
            throw new Error('Invalid parent category ID provided.');
        }
        const parentCategory = await categoryRepository.getCategoryById(value.parent);
        if (!parentCategory) {
            throw new Error('Parent category not found.');
        }
        // Ensure the chosen parent is a 'main' category (if you want to prevent sub-sub-categories)
        if (parentCategory.type === 'sub') {
            throw new Error('A subcategory cannot be a parent. Please select a main category as parent.');
        }
    }

    // 4. Create the category. The model's pre-save hook will set the 'type'.
    const newCategory = await categoryRepository.createCategory(value);
    return newCategory;
}

/**
 * Get all categories.
 * @returns {Promise<Array<Category>>} - An array of all category documents.
 */
async function getAllCategories() {
    const categories = await categoryRepository.getAllCategories();
    return categories;
}

/**
 * Get a single category by ID.
 * @param {string} id - The ID of the category.
 * @returns {Promise<Category>} - The category document.
 * @throws {Error} - If ID is invalid or category not found.
 */
async function getCategoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid category ID');
    }
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
}

/**
 * Get a single category by Name.
 * @param {string} name - The name of the category.
 * @returns {Promise<Category>} - The category document.
 * @throws {Error} - If name is invalid.
 */
async function getCategoryByName(name) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Category name is required');
    }
    const category = await categoryRepository.getCategoryByName(name);
    return category;
}

/**
 * Get a single category by Slug.
 * @param {string} slug - The slug of the category.
 * @returns {Promise<Category>} - The category document.
 * @throws {Error} - If slug is invalid.
 */
async function getCategoryBySlug(slug) {
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        throw new Error('Category slug is required');
    }
    const category = await categoryRepository.getCategoryBySlug(slug);
    return category;
}

/**
 * Retrieves all main categories (categories with no parent).
 * @returns {Promise<Array<Category>>} - An array of main category documents.
 */
async function getMainCategories() {
    const mainCategories = await categoryRepository.getMainCategories();
    return mainCategories;
}

/**
 * Retrieves subcategories for a given parent category ID.
 * @param {string} parentId - The ID of the parent category.
 * @returns {Promise<Array<Category>>} - An array of subcategory documents.
 * @throws {Error} - If parent ID is invalid or parent category not found/is not a main type.
 */
async function getSubcategories(parentId) {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new Error('Invalid parent category ID.');
    }
    // Optional: Validate that the parentId refers to an actual 'main' category
    const parentCategory = await categoryRepository.getCategoryById(parentId);
    if (!parentCategory || parentCategory.type !== 'main') {
        throw new Error('Parent category not found or is not a main category.');
    }

    const subcategories = await categoryRepository.getSubcategoriesByParent(parentId);
    return subcategories;
}

/**
 * Updates an existing category.
 * The 'type' field is automatically inferred by the model based on 'parent'.
 * @param {string} id - The ID of the category to update.
 * @param {object} updateData - Data to update the category with (name?, description?, parent?).
 * @returns {Promise<Category>} - The updated category document.
 * @throws {Error} - If category ID is invalid, category not found, update data is invalid, or parent/type transition is invalid.
 */
async function updateCategory(id, updateData) {
    // 1. Validate category ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid category ID');
    }

    // 2. Validate update data (using Joi/whatever 'updateCategoryValidation' uses)
    // The frontend should NOT send the 'type' field.
    const { error, value } = updateCategoryValidation(updateData);
    if (error) {
        throw new Error(error.details[0].message);
    }

    // 3. Check if the category exists
    const existingCategory = await categoryRepository.getCategoryById(id);
    if (!existingCategory) {
        throw new Error('Category not found');
    }

    // 4. Check for duplicate category name if name is being updated
    if (value.name && value.name !== existingCategory.name) {
        const categoryWithSameName = await categoryRepository.getCategoryByName(value.name);
        if (categoryWithSameName && categoryWithSameName._id.toString() !== id) {
            throw new Error('Category name already exists');
        }
    }

    // 5. Hierarchy-specific validation based on parent changes
    // If 'parent' is explicitly set to null (attempting to make it a main category)
    if (value.parent === null) {
        // Prevent converting a main category with children to a top-level category without children
        // if it has existing subcategories (these would become orphans).
        // Check if it was previously a main category OR if it currently has children
        if (existingCategory.type === 'main') { // Check if it's currently a main category
            const subcategories = await categoryRepository.getSubcategoriesByParent(id);
            if (subcategories && subcategories.length > 0) {
                throw new Error('Cannot remove parent from a main category that has subcategories. Re-parent its children first.');
            }
        }
    }
    // If 'parent' is being added or changed
    else if (value.parent !== undefined) { // Check for undefined vs null
        if (!mongoose.Types.ObjectId.isValid(value.parent)) {
            throw new Error('Invalid parent category ID provided.');
        }
        const parentCategory = await categoryRepository.getCategoryById(value.parent);
        if (!parentCategory) {
            throw new Error('Provided parent category not found.');
        }
        // Prevent a category from being its own parent
        if (parentCategory._id.toString() === id) {
            throw new Error('A category cannot be its own parent.');
        }
        // Prevent a subcategory from becoming a parent to another category
        if (parentCategory.type === 'sub') {
            throw new Error('A subcategory cannot be a parent. Please select a main category as parent.');
        }
        // Prevent setting a parent if the current category has children (would create invalid deep hierarchy)
        if (existingCategory.type === 'main') { // If it was a main category
            const subcategories = await categoryRepository.getSubcategoriesByParent(id);
            if (subcategories && subcategories.length > 0) {
                throw new Error('Cannot assign a parent to a main category that has existing subcategories. Re-parent its children first.');
            }
        }
    }

    // 6. Update the category. The model's pre-save hook will set the 'type'.
    const updatedCategory = await categoryRepository.updateCategory(id, value);
    return updatedCategory;
}

/**
 * Deletes a category by its ID.
 * @param {string} id - The ID of the category to delete.
 * @returns {Promise<Category>} - The deleted category document.
 * @throws {Error} - If ID is invalid, category not found, or has associated products/subcategories.
 */
async function deleteCategory(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid category ID');
    }

    // Check if the category exists before deleting
    const existingCategory = await categoryRepository.getCategoryById(id);
    if (!existingCategory) {
        throw new Error('Category not found');
    }

    // Prevent deleting categories that have associated products.
    const productsInCategory = await productRepository.getProductsByCategory(id); // Use the product repository
    if (productsInCategory && productsInCategory.length > 0) {
        throw new Error('Cannot delete category with associated products. Please reassign or delete products first.');
    }

    // NEW: Prevent deleting a main category if it has subcategories
    if (existingCategory.type === 'main') {
        const subcategories = await categoryRepository.getSubcategoriesByParent(id);
        if (subcategories && subcategories.length > 0) {
            throw new Error('Cannot delete a main category that has subcategories. Delete subcategories first.');
        }
    }

    const deletedCategory = await categoryRepository.deleteCategory(id);
    return deletedCategory;
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    getCategoryBySlug,
    getMainCategories,      
    getSubcategories,       
    updateCategory,
    deleteCategory,
};
