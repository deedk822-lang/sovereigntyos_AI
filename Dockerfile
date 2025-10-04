#
# Dockerfile for SovereigntyOS AI Lab
#
# This Dockerfile uses a multi-stage build process to create a lean,
# optimized production image for the React frontend application.
#

# --- Build Stage ---
# The first stage, named "builder," is responsible for building the
# static assets for the application. It uses a Node.js base image
# to ensure the build environment has the necessary tools (npm).
FROM node:20-alpine as builder

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker's layer caching.
# This step ensures that dependencies are only re-installed if these files change.
COPY package*.json ./

# Install dependencies using 'npm ci'. This is generally faster and more
# reliable for CI/CD environments than 'npm install' because it uses the
# package-lock.json file to ensure a consistent dependency tree.
# NOTE: The original Dockerfile used `--only=production`, but the build script
# requires devDependencies like Vite and TypeScript. So, we install all dependencies.
RUN npm ci

# Copy the rest of the application source code into the container.
COPY . .

# Run the build script defined in package.json.
# This command transpiles TypeScript/React code into static HTML, CSS, and JavaScript
# files and places them in the /app/dist directory.
RUN npm run build

# --- Production Stage ---
# The second stage creates the final, lightweight production image.
# It uses an Nginx base image, which is a high-performance web server,
# to serve the static files generated in the builder stage.
FROM nginx:alpine

# Copy the built static assets from the "builder" stage to the Nginx
# public HTML directory where they can be served.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file into the container.
# This file configures Nginx to correctly serve the React application,
# including handling client-side routing.
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80, the standard port for HTTP traffic, which Nginx listens on.
EXPOSE 80

# The command to start the Nginx server.
# The "-g 'daemon off;'" directive ensures that Nginx runs in the foreground,
# which is the standard practice for Docker containers.
CMD ["nginx", "-g", "daemon off;"]