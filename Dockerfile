# Use official Node.js image
FROM node:20-slim

# Install required system dependencies for Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

# Optional: install Chromium manually if you're using puppeteer-core
RUN apt-get update && apt-get install -y chromium

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available
# COPY package.json ./

# Copy your project files into the container
COPY . .

# Install dependencies
#RUN npm install

# Run the script
CMD ["node", "index.js"]

