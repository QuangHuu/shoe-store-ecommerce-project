const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Ensure category names are unique
        trim: true,   // Remove leading/trailing spaces
    },
    description: {
        type: String,
        required: false, // Description is optional
    },
    
    slug: { // Add a slug field for URL-friendly access
        type: String,
        required: false,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    parent: { // To support subcategories
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference the Category model itself
        default: null,    // Top-level categories have no parent
    },
    ancestors: [ // For efficient retrieval of parent categories
        {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
            name: String,
            slug: String
        }
    ],
    // NEW FIELD: Type of category (main or sub) for explicit querying
    type: {
        type: String,
        enum: ['main', 'sub'], // Enforce 'main' or 'sub' types
        required: true, // Make it required to ensure type is always defined
        default: 'main', // Default to 'main' for new categories if not specified
    },
}, {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
});


// Pre-save hook to generate and ensure unique slug
categorySchema.pre('save', async function(next) {
    // Only generate if the name is new or modified
    if (this.isModified('name') || this.isNew) {
        let newSlug = this.name.toLowerCase()
                                .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars except spaces and hyphens
                                .replace(/\s+/g, '-')        // Replace spaces with hyphens
                                .replace(/-+/g, '-')        // Replace multiple hyphens with single
                                .trim();

        let originalSlug = newSlug;
        let counter = 1;
        let existingCategory;

        do {
            // Check if a category with this slug already exists, excluding the current document if it's an update
            existingCategory = await mongoose.models.Category.findOne({ slug: newSlug });
            if (existingCategory && existingCategory._id.toString() !== this._id.toString()) {
                newSlug = `${originalSlug}-${counter++}`;
            } else {
                break; // Slug is unique
            }
        } while (existingCategory);

        this.slug = newSlug;
    }
    next();
});

// Pre-save hook to automatically populate ancestors
categorySchema.pre('save', async function(next) {
    // Only update ancestors if parent is new or modified
    if (this.isModified('parent') || this.isNew) {
        if (this.parent) {
            // Find the parent category
            const parentCategory = await this.constructor.findById(this.parent);
            if (parentCategory) {
                // Combine parent's ancestors with parent's own details
                this.ancestors = [
                    ...parentCategory.ancestors,
                    {
                        _id: parentCategory._id,
                        name: parentCategory.name,
                        slug: parentCategory.slug
                    }
                ];
                // Ensure type is 'sub' if a parent is assigned, unless explicitly overridden
                if (this.type !== 'main') { // Only set to sub if not already 'main'
                    this.type = 'sub';
                }
            } else {
                // If parent ID is provided but parent category doesn't exist,
                // this indicates an invalid parent. Throw an error here to prevent saving.
                return next(new Error('Parent category not found.'));
            }
        } else {
            // If no parent, it's a top-level category, so ancestors array is empty
            this.ancestors = [];
            // Ensure type is 'main' if no parent is assigned, unless explicitly overridden
            if (this.type !== 'sub') { // Only set to main if not already 'sub'
                this.type = 'main';
            }
        }
    }
    next();
});


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
