#!/bin/bash
set -euo pipefail

TARGET_DIR="/opt/bikehaus"

if [ -d "$TARGET_DIR" ]; then
  cd "$TARGET_DIR"
elif [ -f "docker-compose.yml" ]; then
  echo "[WARN] /opt/bikehaus not found, using current directory: $(pwd)"
else
  echo "[ERROR] Repository not found. Expected $TARGET_DIR or a directory containing docker-compose.yml"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker command not found. Run deploy on the Linux server where Docker is installed."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[ERROR] docker compose plugin is not available. Install Docker Compose v2 first."
  exit 1
fi

echo "=== Deploying BikeHaus (GitHub Actions triggered) ==="

retry_check() {
  local name="$1"
  local url="$2"
  local attempts="$3"
  local delay="$4"

  local i
  for i in $(seq 1 "$attempts"); do
    if curl -fsS "$url" > /dev/null; then
      echo "[OK] ${name} is healthy"
      return 0
    fi
    echo "[WAIT] ${name} not ready yet (${i}/${attempts})"
    sleep "$delay"
  done

  echo "[ERROR] ${name} health check failed: ${url}"
  return 1
}

# GitHub Actions handles git pull and .env setup
# This script is a fallback for manual deployments
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Configure secrets first."
  exit 1
fi

echo "[0/5] Verifying homepage dist..."
if [ ! -f "BikeHaus.Homepage/dist/bike-haus.homepage/server/server.mjs" ]; then
  echo "[INFO] Homepage dist not found. Building homepage SSR bundle now..."
  (
    cd BikeHaus.Homepage
    npm ci
    npm run build
  )
fi

if [ ! -f "BikeHaus.Homepage/dist/bike-haus.homepage/server/server.mjs" ]; then
  echo "[ERROR] Homepage dist is still missing after build."
  exit 1
fi

echo "[1/5] Building API and homepage images..."
docker compose --env-file .env build --pull bikehaus homepage

echo "[2/5] Recreating API and homepage containers..."
docker compose --env-file .env up -d --force-recreate bikehaus homepage

echo "[3/5] Syncing homepage static files for nginx..."
mkdir -p homepage-dist
find homepage-dist -mindepth 1 -delete
mkdir -p homepage-dist/browser
docker compose cp homepage:/app/dist/bike-haus.homepage/browser/. ./homepage-dist/browser

echo "[4/5] Recreating nginx with updated static files..."
docker compose --env-file .env up -d --force-recreate nginx

echo "[5/5] Running health checks..."
retry_check "API" "http://localhost:5000/api/settings" 20 3
retry_check "Homepage SSR" "http://localhost:4000" 20 3

docker image prune -f
echo "[OK] Deployment complete"
