# Step 1: Use Node.js to build the React app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json from the client folder
COPY ./package.json ./package-lock.json ./

# Install dependencies (node_modules will be created inside the container)
RUN npm install

# Copy the rest of the application code from the client folder (excluding node_modules)
COPY ./ .

# Build the React app
RUN npm run build

# Step 2: Use Nginx to serve the built React app
FROM nginx:alpine

WORKDIR /app

# Copy the React build files to the Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist ./dist

# Copy a custom Nginx configuration file (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
