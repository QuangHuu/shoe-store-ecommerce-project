Shoe Store Full-Stack E-commerce Application
Project Overview
Welcome to our full-stack e-commerce application for a shoe store! This project is a comprehensive online platform that brings together a robust backend API and an intuitive frontend user interface. We've built it to handle everything from showcasing our product catalog to seamlessly processing customer orders, all while keeping scalability, security, and a great user experience at the forefront.

Project Structure
This is a monorepo, which means both our backend and frontend applications live together in the same Git repository, but organized neatly into separate subdirectories:

backend/: This folder contains all the server-side logic and the API endpoints that power our store.

frontend/: This is where our user-facing web application lives, providing the interactive interface customers use.

shoe-store-ecommerce-project/
├── backend/                  # Our Node.js/Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── Dockerfile            # For containerizing the backend
│   ├── index.js
│   ├── package.json
│   └── ... (other backend files)
├── frontend/                 # Our React.js web application (where your friend's code will be)
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── ... (other frontend files)
├── .gitignore                # Our main ignore file for both backend and frontend
├── README.md                 # This very document you're reading!
└── Dockerfile.backend        # (Optional: if you decide to keep a separate backend Dockerfile)

Key Features
We've packed our application with essential features to deliver a complete and smooth e-commerce experience:

Secure User Management: Customers can easily register, log in, and manage their profiles. We use JWT for secure authentication and bcrypt to keep passwords safe, with special roles for admins.

Comprehensive Product Catalog: We can easily add, update, and manage our shoe products, complete with details, images, and variations like sizes and colors. It's also ready for searching and filtering!

Intuitive Category System: Products are well-organized into main and subcategories, making browsing simple and enjoyable for shoppers.

Seamless Shopping Cart: Customers can build their perfect order, with easy options to add items, adjust quantities, and remove products from their cart.

Robust Order Processing: Our system handles everything from order creation to managing order and payment statuses (including cancellations). It's all integrated to ensure our inventory is always accurate.

Smart Inventory System: This was a big focus! Stock is automatically reduced when an order is placed, and crucially, it's intelligently returned to inventory if an order is deleted or cancelled. This works specifically for products with different sizes and/or colors.

Admin Tools: For us, the store administrators, there are powerful tools accessible via the backend API to manage products, categories, orders, and user accounts.

Modern User Interface: The frontend is designed to be responsive and user-friendly, providing a pleasant shopping journey on any device.

Technologies We Used
We chose a modern and reliable set of tools to build this platform:

Backend Stack (backend/ directory)
Node.js: Our JavaScript runtime environment for server-side logic.

Express.js: A fast and minimalist web framework for building our RESTful APIs.

MongoDB: Our flexible NoSQL database, hosted on MongoDB Atlas.

Mongoose ODM: Helps us interact with our MongoDB database in an organized way.

Backend Libraries & Tools
JSON Web Tokens (JWT): For secure and stateless authentication.

Bcrypt: Essential for robust password hashing.

Joi (or similar library): (If used elsewhere in your project) Used for data validation to ensure the integrity of data coming into our API.

Mongoose Sessions/Transactions: Crucial for multi-operation atomicity, ensuring that complex actions (like an order and its stock update) either fully succeed or completely fail together.

Frontend Stack (frontend/ directory)
React: Our core library for building dynamic and interactive user interfaces.

React Router DOM: Handles client-side navigation, making page transitions smooth without full page reloads.

React Hooks: We leverage hooks for efficient state management and component lifecycle in React.

Vite: Our blazing-fast build tool and development server, making frontend development incredibly quick.

ESLint: Helps us maintain high code quality and consistency by identifying potential issues.

Tailwind CSS: A utility-first CSS framework that allowed us to build custom designs directly in our HTML/JSX with speed and flexibility.

PostCSS: Used for processing our CSS, especially with Tailwind.

Deployment
Docker: We use Docker to containerize our backend application, ensuring consistent environments from development to production.

Google Cloud Run: Our backend is deployed on Cloud Run, providing a serverless platform that automatically scales to handle traffic and ensures high availability.

Getting Started (Local Development)
Ready to set up and run the project on your machine? You'll need to set up both the backend and the frontend.

Prerequisites
Before you start, make sure you have these installed:

Node.js (LTS version recommended)

MongoDB (You can use a local instance or connect to a MongoDB Atlas cluster)

Git

1. Clone the Monorepo
First, grab the entire project by cloning this repository:

git clone https://github.com/YOUR_GITHUB_USERNAME/shoe-store-ecommerce-project.git
cd shoe-store-ecommerce-project

(Please replace YOUR_GITHUB_USERNAME and shoe-store-ecommerce-project with your actual GitHub username and the exact repository name.)

2. Backend Setup (backend/ directory)
Navigate into the backend folder to set up the API:

cd backend
npm install

Backend Environment Variables (backend/.env)
Create a .env file right inside your backend/ directory (e.g., shoe-store-ecommerce-project/backend/.env). This file holds your sensitive configuration:

# MongoDB Connection URI (e.g., from MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority

# Secret key for JWT token signing (use a strong, random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Optional: Admin credentials for initial setup/testing if applicable
# ADMIN_EMAIL=admin@example.com
# ADMIN_PASSWORD=adminpassword123

MONGODB_URI: Get your specific connection string from your MongoDB Atlas dashboard or local MongoDB setup.

JWT_SECRET: Use a long, complex, and random string for security.

Running the Backend
Once .env is set up, you can start the backend API server:

npm start

The backend will typically run on http://localhost:3000 (locally). You should see a confirmation message in your console.

3. Frontend Setup (frontend/ directory)
Now, let's get the user interface ready. If you have the frontend code, place all its files into the frontend/ directory first. Then, navigate into that folder and install its dependencies:

cd ../frontend # Go up one level (from backend/), then into 'frontend'
npm install

Frontend Environment Variables (frontend/.env)
If your frontend uses environment variables (e.g., to point to the backend API), create a .env file inside your frontend/ directory. For example, if your local backend is running on http://localhost:3000:

VITE_API_BASE_URL=http://localhost:3000/api

(Note: The exact variable name might vary based on your frontend's configuration, e.g., REACT_APP_API_BASE_URL for Create React App.)

Running the Frontend
To start the frontend development server:

npm run dev # Or 'npm start' if that's your frontend's main script

The frontend will typically open in your browser at http://localhost:5173 (Vite default) or http://localhost:3000 (Create React App default).

Key API Endpoints (Examples)
Here's a brief overview of some primary API endpoints provided by our backend:

Authentication
POST /api/auth/register: Register a new user.

POST /api/auth/login: Authenticate and get a JWT token.

GET /api/auth/profile: Get authenticated user's profile (requires JWT).

Products
GET /api/products: Retrieve all products (supports filtering/pagination).

GET /api/products/:id: Get a single product by ID.

POST /api/admin/products: Create a new product (Admin only).

PUT /api/admin/products/:id: Update an existing product (Admin only).

DELETE /api/admin/products/:id: Delete a product (Admin only).

Categories
GET /api/categories: Retrieve all categories.

POST /api/admin/categories: Create a new category (Admin only).

Carts
GET /api/carts/my-cart: Get authenticated user's shopping cart.

POST /api/carts/add: Add an item to the cart.

PUT /api/carts/update/:productId: Update the quantity of an item in the cart.

DELETE /api/carts/remove/:productId: Remove an item from the cart.

Orders
POST /api/orders: Create a new order (requires authentication).

GET /api/orders/my-orders: Retrieve orders placed by the authenticated user.

GET /api/admin/orders: Retrieve all orders (Admin only).

GET /api/admin/orders/:id: Get a specific order by ID (Admin only).

PUT /api/admin/orders/:id/status: Update an order's status (Admin only).

DELETE /api/admin/orders/:id: Delete an order (Admin only).

Deployment
Our application is designed for cloud-native deployment. The backend is containerized using Docker and deployed to Google Cloud Run, leveraging its serverless capabilities for automatic scaling and high availability. The frontend, once built, can be deployed to any static site hosting service (e.g., Firebase Hosting, Netlify, Vercel, Cloudflare Pages, or even served by the backend if configured for that).

Team member
Nguyen Huu Minh Quang - Backend lead, Database design

Vu Duy Thanh - Frontend lead, UI/UX design

Nguyen Duy Vinh Khang - Tester, Document writer, UI/UX design

Nguyen Kim Minh Thanh - Tester, Document writer, UI/UX design