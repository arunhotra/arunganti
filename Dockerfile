# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for better terminal support
RUN apk add --no-cache bash git

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Default command runs tests in watch mode
CMD ["npm", "test"]
