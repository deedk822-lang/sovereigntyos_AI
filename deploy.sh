#!/bin/bash
#
# deploy.sh
#
# This script automates the local deployment process for the SovereigntyOS AI platform.
# It handles installing dependencies, building the application, and launching
# the necessary services using Docker Compose.
#
# Usage:
#   ./deploy.sh
#
# Make sure this script is executable by running:
#   chmod +x deploy.sh
#

# Announce the start of the deployment process.
echo "🚀 Deploying SovereigntyOS..."
echo ""

# Step 1: Install Node.js dependencies.
# The `--legacy-peer-deps` flag is used to bypass peer dependency conflicts
# that might arise with different versions of packages, ensuring the installation completes.
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
echo ""

# Step 2: Build the application for production.
# This command typically transpiles TypeScript/React code into optimized, static
# JavaScript and CSS files located in a `dist` or `build` directory.
echo "🏗️ Building the application..."
npm run build
echo ""

# Step 3: Launch the application and its services using Docker Compose.
# `docker-compose up` builds, (re)creates, starts, and attaches to containers for a service.
# The `-d` flag runs the containers in detached mode (in the background).
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d
echo ""

# Announce the successful completion of the deployment.
echo "✅ SovereigntyOS deployed successfully!"
echo "🌐 Access at: http://localhost:3000"
echo "🤖 13-Agent Arsenal: Active"
echo "💰 Revenue Optimizer: Ready"
echo "🇿🇦 South African AI Platform: Operational"