#!/bin/bash
set -euo pipefail

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
echo "Next: git clone, configure .env with JWT_SECRET_KEY, then run deploy/setup-ssl.sh"
