const brandService = require('../services/brands.service'); // Import the brand service

// Create a new brand
async function createBrand(req, res) {
    try {
        const newBrand = await brandService.createBrand(req.body);
        res.status(201).json(newBrand); // 201 Created
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request (e.g., validation errors, duplicate name)
    }
}

// Get all brands
async function getAllBrands(req, res) {
    try {
        const brands = await brandService.getAllBrands();
        res.status(200).json(brands); // 200 OK
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve brands' }); // 500 Internal Server Error
    }
}

// Get a single brand by ID
async function getBrandById(req, res) {
    try {
        const brand = await brandService.getBrandById(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' }); // 404 Not Found
        }
        res.status(200).json(brand); // 200 OK
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request (e.g., invalid ID format)
    }
}

// Get a single brand by Name
async function getBrandByName(req, res) {
    try {
        const brand = await brandService.getBrandByName(req.params.name); // Assuming name is in params or query
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }
        res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve brand by name' });
    }
}

// Update a brand by ID
async function updateBrand(req, res) {
    try {
        const updatedBrand = await brandService.updateBrand(req.params.id, req.body);
        if (!updatedBrand) {
            return res.status(404).json({ message: 'Brand not found' }); // 404 Not Found
        }
        res.status(200).json(updatedBrand); // 200 OK
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request (e.g., validation errors, duplicate name)
    }
}

// Delete a brand by ID
async function deleteBrand(req, res) {
    try {
        const deletedBrand = await brandService.deleteBrand(req.params.id);
        if (!deletedBrand) {
            return res.status(404).json({ message: 'Brand not found' }); // 404 Not Found
        }
        res.status(200).json({ message: 'Brand deleted successfully' }); // 200 OK
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request (e.g., invalid ID format, associated products)
    }
}

module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    getBrandByName,
    updateBrand,
    deleteBrand,
};
