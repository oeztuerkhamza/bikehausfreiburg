#!/bin/bash
# ============================================
# BikeHaus Freiburg - Deploy Script
# Run this on your Netcup server
# Deploys: API + Admin Panel
# Homepage is deployed separately via its own repo
# ============================================

set -e

APP_DIR="/opt/bikehaus"

echo "=== Deploying BikeHaus Freiburg (API + Admin) ==="

# ─── 1. Deploy main app (API + Admin Panel) ───
cd "$APP_DIR"

if [ -d ".git" ]; then
    echo ">> Pulling latest changes..."
    git pull origin main
fi

# ─── 2. Build and start containers ───
echo ">> Building and starting containers..."
docker compose up -d --build

# Wait for app to be ready
echo ">> Waiting for application to start..."
sleep 15

# ─── 3. Health checks ───
echo ">> Running health checks..."

# API health check
if curl -sf http://localhost:5000/api/settings > /dev/null 2>&1; then
    echo "   ✓ API is running!"
else
    echo "   ✗ API health check failed. Check logs: docker compose logs bikehaus"
fi

# Public API check
if curl -sf http://localhost:5000/api/public/shop-info > /dev/null 2>&1; then
    echo "   ✓ Public API is working!"
else
    echo "   ✗ Public API check failed."
fi

# Cleanup old images
echo ">> Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Endpoints:"
echo "  Homepage:  https://bikehausfreiburg.com"
echo "  Admin:     https://admin.bikehausfreiburg.com"
echo "  API:       https://api.bikehausfreiburg.com"
echo ""
echo "Commands:"
echo "  View logs:    docker compose logs -f"
echo "  Stop:         docker compose down"
echo "  Restart:      docker compose restart"
