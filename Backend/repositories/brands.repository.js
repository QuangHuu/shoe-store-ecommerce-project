const Brand = require('../models/brands.model'); // Import the Brand model 

// Create a new brand
async function createBrand(brandData) {
    const brand = new Brand(brandData);
    return brand.save();
}

// Get all brands
async function getAllBrands() {
    return Brand.find().exec();
}

// Get a single brand by ID
async function getBrandById(id) {
    return Brand.findById(id).exec();
}

// Get a single brand by Name (useful for checking duplicates)
async function getBrandByName(name) {
    return Brand.findOne({ name: name }).exec();
}

// Update a brand by ID
async function updateBrand(id, updateData) {
    return Brand.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
}

// Delete a brand by ID
async function deleteBrand(id) {
    return Brand.findByIdAndDelete(id).exec();
}

module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    getBrandByName, 
    updateBrand,
    deleteBrand,
};
