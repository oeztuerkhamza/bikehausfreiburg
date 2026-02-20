#!/bin/bash
# ============================================
# BikeHaus Freiburg - Deploy Script
# Run this on your Netcup server
# ============================================

set -e

APP_DIR="/opt/bikehaus"

echo "=== Deploying BikeHaus Freiburg ==="

cd "$APP_DIR"

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo ">> Pulling latest changes..."
    git pull origin main
fi

# Build and start containers
echo ">> Building and starting containers..."
docker compose down
docker compose up -d --build

# Wait for app to be ready
echo ">> Waiting for application to start..."
sleep 10

# Health check
if curl -sf http://localhost:5000/api/settings > /dev/null 2>&1; then
    echo ">> Application is running!"
else
    echo ">> Warning: Health check failed. Check logs:"
    echo "   docker compose logs bikehaus"
fi

echo ""
echo "=== Deployment Complete ==="
echo ">> View logs: docker compose logs -f"
echo ">> Stop:      docker compose down"
echo ">> Restart:   docker compose restart"
