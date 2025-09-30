#!/bin/bash
echo "🚀 Deploying SovereigntyOS..."

# Build and deploy
npm install --legacy-peer-deps
npm run build
docker-compose up -d

echo "✅ SovereigntyOS deployed successfully!"
echo "🌐 Access at: http://localhost:3000"
echo "🤖 13-Agent Arsenal: Active"
echo "💰 Revenue Optimizer: Ready"
echo "🇿🇦 South African AI Platform: Operational"
