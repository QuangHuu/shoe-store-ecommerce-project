const Joi = require('joi');

// Schema for creating a new brand
const createBrandValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().trim().min(2).max(100).messages({
            'any.required': 'Brand name is required.',
            'string.empty': 'Brand name cannot be empty.',
            'string.min': 'Brand name must be at least 2 characters long.',
            'string.max': 'Brand name cannot exceed 100 characters.',
        }),
        description: Joi.string().optional().trim().max(500).messages({
            'string.max': 'Brand description cannot exceed 500 characters.',
        }),
        logoUrl: Joi.string().uri().optional().trim().messages({
            'string.uri': 'Logo URL must be a valid URL.',
        }),
    });
    return schema.validate(data);
};

// Schema for updating an existing brand
const updateBrandValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(2).max(100).messages({
            'string.empty': 'Brand name cannot be empty.',
            'string.min': 'Brand name must be at least 2 characters long.',
            'string.max': 'Brand name cannot exceed 100 characters.',
        }),
        description: Joi.string().optional().trim().max(500).messages({
            'string.max': 'Brand description cannot exceed 500 characters.',
        }),
        logoUrl: Joi.string().uri().optional().trim().messages({
            'string.uri': 'Logo URL must be a valid URL.',
        }),
    }).min(1); // At least one field must be present for update

    return schema.validate(data);
};

module.exports = {
    createBrandValidation,
    updateBrandValidation,
};
