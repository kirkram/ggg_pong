FROM node:18

# Create app directory
WORKDIR /app

# Copy both package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Copy the rest of the app code
COPY . .

# Expose port if needed
EXPOSE 3000

# Start using ts-node and your dev script
CMD ["npm", "run", "dev"]