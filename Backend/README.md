Shoe Store Backend API
Project Overview
This repository hosts the backend API for a comprehensive e-commerce platform specializing in shoes. It's built to provide a robust and scalable foundation for managing all core functionalities of an online store, from product catalog to order fulfillment.

Key Features
User Authentication & Authorization: Secure user registration, login, and JWT-based authentication for protected routes, including admin roles.

Product Management: Full CRUD (Create, Read, Update, Delete) operations for products, with capabilities for filtering and searching.

Hierarchical Category System: Flexible main and subcategory management for organized product display and navigation.

Shopping Cart Functionality: Robust cart creation and management, allowing users to add, update, and remove items.

Order Processing: Handles order creation, status updates (including cancelled), payment status, and integrates with inventory for accurate stock tracking.

Dynamic Inventory Management: Automatically decrements product stock upon order creation and intelligently re-increments stock upon order deletion or cancellation, specifically handling products with size and/or color variations.

Admin Capabilities: Provides privileged access for comprehensive management of products, categories, orders, and users.

Technologies Used

Backend Stack
Node.js: The JavaScript runtime environment.

Express.js: Minimalist web framework for building RESTful APIs.

MongoDB: NoSQL database for flexible data storage.

Mongoose ODM: Object Data Modeling for MongoDB, simplifying data interaction.

Libraries & Tools
JSON Web Tokens (JWT): For secure, stateless authentication.

Bcrypt: For robust password hashing.

Joi (or similar): (If used elsewhere in your project) For data validation to ensure data integrity.

Transactions: Mongoose sessions for multi-operation atomicity (e.g., order creation with stock update, order deletion with stock revert).

Deployment
Docker: For containerization, ensuring consistent environments.

Google Cloud Run: Serverless platform for scalable and easy deployment.

Setup and Local Development
Prerequisites
Before you begin, ensure you have the following installed:

Node.js (LTS version recommended)

MongoDB (either a local instance or access to a MongoDB Atlas cluster)

Git

Installation Steps
Clone the repository:

git clone https://github.com/YOUR_GITHUB_USERNAME/shoe-store-backend-api.git

(Remember to replace YOUR_GITHUB_USERNAME and shoe-store-backend-api with your actual GitHub details).

Navigate into the project directory:

cd shoe-store-backend-api

Install project dependencies:

npm install

Environment Variables (.env)
Create a .env file in the root of your project directory. This file will hold your sensitive configuration details.

# MongoDB Connection URI (e.g., from MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority

# Secret key for JWT token signing (use a strong, random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Optional: Admin credentials for initial setup/testing if applicable
# ADMIN_EMAIL=admin@example.com
# ADMIN_PASSWORD=adminpassword123

MONGODB_URI: Get this from your MongoDB Atlas dashboard or your local MongoDB setup.

JWT_SECRET: Generate a long, random string. You can use online tools for this.

Running the Application
To start the development server:

npm start

The server will typically run on the port specified by the PORT environment variable (defaulting to 3000 locally, or 8080 when deployed on Cloud Run). You should see a message in your console indicating the port it's listening on.

Key API Endpoints (Examples)
Here's a brief overview of some primary API endpoints:

Authentication
POST /api/auth/register: Register a new user.

POST /api/auth/login: Authenticate and get a JWT token.

GET /api/auth/profile: Get authenticated user's profile (requires JWT).

Products
GET /api/products: Get all products (with optional filtering/pagination).

GET /api/products/:id: Get a single product by ID.

POST /api/admin/products: Create a new product (admin only).

PUT /api/admin/products/:id: Update an existing product (admin only).

DELETE /api/admin/products/:id: Delete a product (admin only).

Categories
GET /api/categories: Get all categories.

POST /api/admin/categories: Create a new category (admin only).

Carts
GET /api/carts/my-cart: Get authenticated user's cart.

POST /api/carts/add: Add item to cart.

PUT /api/carts/update/:productId: Update item quantity in cart.

DELETE /api/carts/remove/:productId: Remove item from cart.

Orders
POST /api/orders: Create a new order (requires authentication).

GET /api/orders/my-orders: Get orders for the authenticated user.

GET /api/admin/orders: Get all orders (admin only).

GET /api/admin/orders/:id: Get a specific order by ID (admin only).

PUT /api/admin/orders/:id/status: Update order status (admin only).

DELETE /api/admin/orders/:id: Delete an order (admin only).

Deployment
This backend application is designed for cloud-native deployment. It is containerized using Docker and deployed to Google Cloud Run, leveraging its serverless capabilities for automatic scaling and high availability.

Project Contributors
Nguyen Huu Minh Quang - Backend lead, database design

Vu Duy Thanh - Frontend lead, UI/UX design

Nguyen Duy Vinh Khang - Tester, document writer, UI/UX design

Nguyen Kim Minh Thanh - Tester, document writer, UI/UX design