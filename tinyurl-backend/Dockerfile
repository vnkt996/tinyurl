# Use the official Node.js image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/backend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
