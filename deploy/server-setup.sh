#!/bin/bash
# ============================================
# BikeHaus Freiburg - Server Setup Script
# Netcup VPS (Ubuntu/Debian)
# ============================================

set -e

echo "=== BikeHaus Freiburg Server Setup ==="

# Update system
echo ">> Updating system..."
apt-get update && apt-get upgrade -y

# Install Docker
echo ">> Installing Docker..."
apt-get install -y ca-certificates curl gnupg git
install -m 0755 -d /etc/apt/keyrings

# Detect OS (Ubuntu or Debian)
. /etc/os-release
if [ "$ID" = "debian" ]; then
    DOCKER_REPO="https://download.docker.com/linux/debian"
else
    DOCKER_REPO="https://download.docker.com/linux/ubuntu"
fi

curl -fsSL "$DOCKER_REPO/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] $DOCKER_REPO \
  $VERSION_CODENAME stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable Docker
systemctl enable docker
systemctl start docker

echo ">> Docker installed successfully!"
docker --version
docker compose version

# Setup firewall
echo ">> Configuring firewall..."
apt-get install -y ufw
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# Create app directories
echo ">> Creating directories..."
mkdir -p /opt/bikehaus/homepage-dist
mkdir -p /var/lib/letsencrypt

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo ""
echo "1. Clone main repo:"
echo "   git clone -b bikehaus-desktop https://github.com/oeztuerkhamza/bikehausfreiburg.git /opt/bikehaus"
echo ""
echo "2. Start services (first time, without SSL):"
echo "   cd /opt/bikehaus"
echo "   docker compose up -d --build"
echo ""
echo "3. Setup SSL:"
echo "   cd /opt/bikehaus/deploy"
echo "   ./setup-ssl.sh"
echo ""
echo "4. Configure DNS (A records):"
echo "   bikehausfreiburg.com     → 152.53.138.135"
echo "   www.bikehausfreiburg.com → 152.53.138.135"
echo "   admin.bikehausfreiburg.com → 152.53.138.135"
echo "   api.bikehausfreiburg.com   → 152.53.138.135"
echo ""
echo "5. Configure GitHub Secrets in both repos:"
echo "   SERVER_HOST:    152.53.138.135"
echo "   SERVER_USER:    root"
echo "   SERVER_SSH_KEY: (your SSH private key)"
echo ""
