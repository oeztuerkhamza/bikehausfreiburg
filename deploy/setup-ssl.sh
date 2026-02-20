#!/bin/bash
# ============================================
# SSL Setup with Let's Encrypt
# Run AFTER the app is running on port 80
# ============================================

set -e

if [ -z "$1" ]; then
    echo "Usage: ./setup-ssl.sh your-domain.com your-email@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo "=== Setting up SSL for $DOMAIN ==="

# Install certbot
apt-get install -y certbot

# Stop nginx temporarily
docker compose stop nginx

# Get certificate
certbot certonly --standalone \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

# Copy certificates to nginx ssl directory
mkdir -p /opt/bikehaus/nginx/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/bikehaus/nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/bikehaus/nginx/ssl/

echo ""
echo "=== SSL Certificate Obtained! ==="
echo ""
echo "Now update nginx/nginx.conf:"
echo "1. Uncomment the HTTPS server block"
echo "2. Replace YOUR_DOMAIN.com with $DOMAIN"
echo "3. Uncomment the HTTP->HTTPS redirect block"
echo "4. Comment out the main HTTP server block"
echo "5. Run: docker compose up -d --build"
echo ""
echo "Auto-renewal cron job:"
echo "  echo '0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem /opt/bikehaus/nginx/ssl/ && docker compose -f /opt/bikehaus/docker-compose.yml restart nginx' | crontab -"
echo ""
