# backend/Dockerfile
FROM node:18

WORKDIR /app

# Copy only package.json and package-lock.json first
COPY package*.json ./

# Install both dependencies and devDependencies
RUN npm install

# Copy rest of the backend code
COPY . .

# Run the local ts-node (installed in node_modules)
CMD ["npm", "run", "dev"]