# Use Node 18.14 base image
FROM node:18.14

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm install && npm install ts-node -g

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start API backend
CMD ["bash", "-c", "ts-node src/app.ts"]