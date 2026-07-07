#!/bin/bash

# Deploy script for Customer Survey App
# Usage: ./scripts/deploy.sh

set -e

echo "=== Deploying Customer Survey App ==="

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "Error: backend/.env not found. Copy from backend/.env.example"
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo "Error: frontend/.env not found. Copy from frontend/.env.example"
    exit 1
fi

echo "1. Building and starting containers..."
docker-compose up --build -d

echo "2. Checking container status..."
docker-compose ps

echo "=== Deployment complete ==="
echo "Application is available at: http://localhost:${NGINX_PORT:-8080}"
echo "Admin panel: http://localhost:${NGINX_PORT:-8080}/admin"