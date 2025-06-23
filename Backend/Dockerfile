# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# This helps if only source code changes, not dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install --omit=dev

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port your Express.js app listens on
# Cloud Run expects your application to listen on the port specified by the PORT environment variable.
# The default for Node.js is usually 3000 or 8080. Check your index.js or app.js.
ENV PORT 8080
EXPOSE 8080

# Command to run your application
# This should be the command that starts your Express.js server (e.g., node index.js)
CMD [ "node", "index.js" ]