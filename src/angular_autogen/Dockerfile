# Use Node 18.14 base image
FROM node:18.14

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g @angular/cli

# Copy application code
COPY . .

# Expose port
EXPOSE 4200

# Start Angular frontend
CMD ["ng", "serve", "--host", "0.0.0.0"]
