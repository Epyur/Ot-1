#!/bin/bash

# Build script for Customer Survey App
# Usage: ./scripts/build.sh

set -e

echo "=== Building Customer Survey App ==="

echo "1. Installing backend dependencies..."
cd backend
npm ci
echo "2. Building backend..."
npm run build
cd ..

echo "3. Installing frontend dependencies..."
cd frontend
npm ci
echo "4. Building frontend..."
npm run build
cd ..

echo "5. Building Docker images..."
docker-compose build

echo "=== Build complete ==="
echo "Run 'docker-compose up -d' to start the application"