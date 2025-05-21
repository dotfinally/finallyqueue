# Use an official Node runtime as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY src src
COPY .env .env
COPY tsconfig.json tsconfig.json

# Build the TypeScript code
RUN npm run build

COPY ./src/prompts /prompts

# Expose port (if your app exposes one)
EXPOSE 3000

# Start the app
CMD ["node", "dist/consumer.js"]
