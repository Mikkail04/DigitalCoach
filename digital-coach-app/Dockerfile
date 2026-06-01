# --- Stage 1: Install Dependencies only when needed --- 
# Base image is node alpine image to keep the image size small 
FROM node:22-alpine

# Alpine is very lightweight and may be missing some libraries needed to build some npm packages
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install dependencies specified in package.json
# package.lock is included to ensure consistent versions of packages are installed
COPY package.json package-lock.json ./
RUN npm install

# Start Next.js app
CMD ["npm", "run", "dev"]
