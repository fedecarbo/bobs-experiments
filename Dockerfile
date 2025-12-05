FROM node:20-alpine

WORKDIR /app

# Install Dart Sass and http-server
RUN npm install -g sass http-server

# Copy package files if they exist
COPY package*.json ./

# Install dependencies
RUN npm install || true

# Copy the rest of the application
COPY . .

# Expose port 8080
EXPOSE 8080

# Serve the public folder
CMD ["http-server", "public", "-p", "8080", "-c-1"]
