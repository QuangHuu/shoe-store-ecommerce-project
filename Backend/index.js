require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors middleware
// const bcrypt = require('bcrypt'); // No longer needed if not creating admin
// const User = require('./models/users.model'); // No longer needed if not creating admin

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Import all routes
const userRoutes = require('./routes/users.route');
const cartRoutes = require('./routes/carts.route');
const categoryRoutes = require('./routes/categories.route');
const orderRoutes = require('./routes/orders.route');
const wishlistRoutes = require('./routes/wishlists.route');
const productRoutes = require('./routes/products.route');
const brandRoutes = require('./routes/brands.route');


// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables. Please set it in your .env file or Cloud Run environment variables.');
    process.exit(1); // Exit the process if essential environment variable is missing
}

mongoose.connect(mongoUri)
    .then(async () => {
        console.log("Connected to database!");

        // Start the server *after* the database connection is established
        const port = process.env.PORT || 3000; // PORT can still have a fallback
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    })
    .catch((error) => {
        console.log("MongoDB Connection failed:", error);
        process.exit(1); // Exit if DB connection fails, as the app can't function
    });


// Mount Routes (Middleware) - Ensure all routes are mounted
app.use('/api/users', userRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);


// Default route for testing API health
app.get('/', (req, res) => {
    res.send('Welcome to the Shoe Store API!');
});

// Global Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});
