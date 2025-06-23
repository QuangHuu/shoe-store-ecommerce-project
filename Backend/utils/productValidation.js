const Joi = require('joi');

// Schema for creating a new product
const createProductValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().trim().messages({
            'any.required': 'Product name is required',
            'string.empty': 'Product name cannot be empty',
        }),
        description: Joi.string().required().messages({
            'any.required': 'Product description is required',
            'string.empty': 'Product description cannot be empty',
        }),
        price: Joi.number().required().min(0).messages({
            'any.required': 'Product price is required',
            'number.base': 'Price must be a number',
            'number.min': 'Price cannot be negative',
        }),
        category: Joi.string().required().messages({  // Changed to string to expect ID
            'any.required': 'Product category is required',
            'string.empty': 'Product category cannot be empty',
        }),
        images: Joi.array().items(Joi.string().uri()).messages({
            'string.uri': 'Each image must be a valid URL',
        }),
        stock: Joi.number().required().min(0).messages({
            'any.required': 'Product stock is required',
            'number.base': 'Stock must be a number',
            'number.min': 'Stock cannot be negative',
        }),
        sizes: Joi.array().items(
            Joi.object({
                size: Joi.string().required().trim().messages({
                    'any.required': 'Size is required',
                    'string.empty': 'Size cannot be empty',
                }),
                stock: Joi.number().required().min(0).messages({
                    'any.required': 'Stock for size is required',
                    'number.base': 'Stock for size must be a number',
                    'number.min': 'Stock for size cannot be negative',
                }),
            })
        ),
        colors: Joi.array().items(
            Joi.object({
                color: Joi.string().required().trim().messages({
                    'any.required': 'Color is required',
                    'string.empty': 'Color cannot be empty',
                }),
                // hexCode field removed from validation
                images: Joi.array().items(Joi.string().uri()).messages({
                    'string.uri': 'Each image URL for color must be a valid URL',
                }),
                stock: Joi.number().required().min(0).messages({
                    'any.required': 'Stock for color is required',
                    'number.base': 'Stock for color must be a number',
                    'number.min': 'Stock for color cannot be negative'
                })
            })
        ),
        brand: Joi.string().required().messages({  // Changed to string to expect ID
            'any.required': 'Product brand is required',
            'string.empty': 'Product brand cannot be empty',
        }),
        // --- New Fields Validation for Creation ---
        isNewArrival: Joi.boolean().default(false),
        isExclusive: Joi.boolean().default(false),
        status: Joi.string().valid('available', 'coming_soon', 'discontinued').default('available').messages({
            'any.only': 'Status must be one of "available", "coming_soon", or "discontinued"',
        }),
        onSale: Joi.boolean().default(false),
        salePrice: Joi.number().min(0).when('onSale', {
            is: true,
            then: Joi.required().messages({
                'any.required': 'Sale price is required when product is on sale',
            }),
            otherwise: Joi.optional(),
        }).messages({
            'number.base': 'Sale price must be a number',
            'number.min': 'Sale price cannot be negative',
        }),
    });

    return schema.validate(data);
};

// Schema for updating an existing product
const updateProductValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().messages({
            'string.empty': 'Product name cannot be empty',
        }),
        description: Joi.string().messages({
            'string.empty': 'Product description cannot be empty',
        }),
        price: Joi.number().min(0).messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price cannot be negative',
        }),
        category: Joi.string().messages({  // Changed to string to expect ID
            'string.empty': 'Product category cannot be empty',
        }),
        images: Joi.array().items(Joi.string().uri()).messages({
            'string.uri': 'Each image must be a valid URL',
        }),
        stock: Joi.number().min(0).messages({
            'number.base': 'Stock must be a number',
            'number.min': 'Stock cannot be negative',
        }),
        sizes: Joi.array().items(
            Joi.object({
                size: Joi.string().trim().messages({
                    'string.empty': 'Size cannot be empty',
                }),
                stock: Joi.number().min(0).messages({
                    'number.base': 'Stock for size must be a number',
                    'number.min': 'Stock for size cannot be negative',
                }),
            })
        ),
        colors: Joi.array().items(
            Joi.object({
                color: Joi.string().trim().messages({
                    'string.empty': 'Color cannot be empty',
                }),
                // hexCode field removed from validation
                images: Joi.array().items(Joi.string().uri()).messages({
                    'string.uri': 'Each image URL for color must be a valid URL',
                }),
                stock: Joi.number().min(0).messages({
                    'number.base': 'Stock for color must be a number',
                    'number.min': 'Stock for color cannot be negative'
                })
            })
        ),
        brand: Joi.string().messages({ // Changed to string to expect ID
            'string.empty': 'Product brand cannot be empty',
        }),
        // --- New Fields Validation for Update ---
        isNewArrival: Joi.boolean(),
        isExclusive: Joi.boolean(),
        status: Joi.string().valid('available', 'coming_soon', 'discontinued').messages({
            'any.only': 'Status must be one of "available", "coming_soon", or "discontinued"',
        }),
        onSale: Joi.boolean(),
        salePrice: Joi.number().min(0).when('onSale', {
            is: true,
            then: Joi.required().messages({
                'any.required': 'Sale price is required when product is on sale',
            }),
            otherwise: Joi.optional(),
        }).messages({
            'number.base': 'Sale price must be a number',
            'number.min': 'Sale price cannot be negative',
        }),
    }).min(1); // At least one field must be present for update

    return schema.validate(data);
};

module.exports = {
    createProductValidation,
    updateProductValidation,
};
