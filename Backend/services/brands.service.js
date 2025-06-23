const brandRepository = require('../repositories/brands.repository'); // Import brand repository
const { createBrandValidation, updateBrandValidation } = require('../utils/brandValidation'); // Import Joi validation schemas
const mongoose = require('mongoose'); // For ObjectId validation
const productRepository = require('../repositories/products.repository'); // Import product repository

// Create a new brand
async function createBrand(brandData) {
    // 1. Validate brand data
    const { error, value } = createBrandValidation(brandData);
    if (error) {
        throw new Error(error.details[0].message);
    }

    // 2. Check for duplicate brand name
    const existingBrand = await brandRepository.getBrandByName(value.name);
    if (existingBrand) {
        throw new Error('Brand name already exists');
    }

    // 3. Create the brand
    const newBrand = await brandRepository.createBrand(value);
    return newBrand;
}

// Get all brands
async function getAllBrands() {
    const brands = await brandRepository.getAllBrands();
    return brands;
}

// Get a single brand by ID
async function getBrandById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid brand ID');
    }
    const brand = await brandRepository.getBrandById(id);
    if (!brand) {
        throw new Error('Brand not found');
    }
    return brand;
}

// Get a single brand by Name
async function getBrandByName(name) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Brand name is required');
    }
    const brand = await brandRepository.getBrandByName(name);
    // No explicit 'not found' error here, as the controller handles 404
    return brand;
}

// Update a brand by ID
async function updateBrand(id, updateData) {
    // 1. Validate brand ID
    if (!mongoose.Types.ObjectId.isValid(id)) { // Using isValidObjectId for Mongoose ObjectIds
        throw new Error('Invalid brand ID');
    }

    // 2. Validate update data
    const { error, value } = updateBrandValidation(updateData);
    if (error) {
        throw new Error(error.details[0].message);
    }

    // 3. Check if the brand exists
    const existingBrand = await brandRepository.getBrandById(id);
    if (!existingBrand) {
        throw new Error('Brand not found');
    }

    // 4. Check for duplicate brand name if name is being updated
    if (value.name && value.name.toLowerCase() !== existingBrand.name.toLowerCase()) { // Case-insensitive check
        const brandWithSameName = await brandRepository.getBrandByName(value.name);
        // Ensure the found brand is not the current brand being updated
        if (brandWithSameName && brandWithSameName._id.toString() !== id) {
            throw new Error('Brand name already exists');
        }
    }

    // 5. Update the brand
    const updatedBrand = await brandRepository.updateBrand(id, value);
    return updatedBrand;
}

// Delete a brand by ID
async function deleteBrand(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid brand ID');
    }

    // Check if the brand exists before deleting
    const existingBrand = await brandRepository.getBrandById(id);
    if (!existingBrand) {
        throw new Error('Brand not found');
    }

    // Prevent deleting brands that have associated products.
    const productsWithBrand = await productRepository.getProductsByBrand(id);
    if (productsWithBrand && productsWithBrand.length > 0) {
        throw new Error('Cannot delete brand with associated products. Please reassign or delete products first.');
    }

    const deletedBrand = await brandRepository.deleteBrand(id);
    return deletedBrand;
}

module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    getBrandByName,
    updateBrand,
    deleteBrand,
};
