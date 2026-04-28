#!/bin/bash
set -euo pipefail

cd /opt/bikehaus

echo "=== Deploying BikeHaus (GitHub Actions triggered) ==="

# GitHub Actions handles git pull and .env setup
# This script is a fallback for manual deployments
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Configure secrets first."
  exit 1
fi

docker compose build --pull bikehaus
docker compose up -d --force-recreate bikehaus nginx

# Wait and health check
sleep 10
curl -sf http://localhost:5000/api/settings > /dev/null && echo "✓ API online" || echo "✗ API failed"
docker image prune -f
echo "✓ Deployment complete"
