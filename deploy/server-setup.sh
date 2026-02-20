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
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
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

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Clone/upload your project to /opt/bikehaus"
echo "2. cd /opt/bikehaus"
echo "3. cp .env.example .env"
echo "4. Edit .env with your settings"
echo "5. docker compose up -d --build"
echo ""
