#!/bin/bash
set -euo pipefail

DOMAIN="bikehausfreiburg.com"
EMAIL="${1:-info@bikehausfreiburg.com}"

echo "=== SSL Setup: $DOMAIN ==="
cd /opt/bikehaus

# Verify .env exists with required secrets
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Run 'cat > .env << EOF' first with JWT_SECRET_KEY and other secrets."
  exit 1
fi

# Start containers and obtain certificates
docker compose up -d
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot --webroot-path=/var/lib/letsencrypt \
  --email "$EMAIL" --agree-tos --no-eff-email \
  --cert-name "$DOMAIN" --expand --force-renewal \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  -d "admin.$DOMAIN" -d "api.$DOMAIN"

docker compose restart nginx
echo "✓ SSL certificate installed and nginx restarted"
