#!/bin/bash
# ============================================
# SSL Setup with Let's Encrypt
# Run AFTER the app is running on port 80
# Sets up SSL for all 3 domains
# ============================================

set -e

DOMAIN="bikehausfreiburg.com"
EMAIL="${1:-info@bikehausfreiburg.com}"

echo "=== Setting up SSL for BikeHaus Freiburg ==="
echo "Domains: $DOMAIN, admin.$DOMAIN, api.$DOMAIN"

cd /opt/bikehaus

# Make sure containers are running
docker compose up -d

# Use webroot method with certbot container
echo ">> Obtaining SSL certificate..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/lib/letsencrypt \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    -d "admin.$DOMAIN" \
    -d "api.$DOMAIN"

# Update nginx config with SSL
echo ">> Updating nginx configuration..."

# Backup original config
cp nginx/nginx.conf nginx/nginx.conf.backup

# Restart nginx to load new certificates
docker compose restart nginx

echo ""
echo "=== SSL Certificate Obtained! ==="
echo ""
echo "Certificates are stored in Docker volume 'certbot-etc'"
echo "Auto-renewal is handled by certbot container"
echo ""
echo "Verify SSL:"
echo "  curl -I https://bikehausfreiburg.com"
echo "  curl -I https://admin.bikehausfreiburg.com"
echo "  curl -I https://api.bikehausfreiburg.com"
echo ""
