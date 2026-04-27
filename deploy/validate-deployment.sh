#!/bin/bash
# Deployment Validation Script
# Runs comprehensive checks to ensure deployment succeeded

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Deployment Validation Started: $TIMESTAMP"
echo "=========================================="
echo ""

VALIDATION_FAILURES=0
VALIDATION_WARNINGS=0

# Helper functions
log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
  VALIDATION_FAILURES=$((VALIDATION_FAILURES + 1))
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
  VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
}

# Check if containers are running
check_containers() {
  echo "Checking Docker containers..."
  
  if ! docker compose ps 2>/dev/null | grep -q "bikehaus-app"; then
    log_error "API container (bikehaus-app) is not running"
    return 1
  fi
  log_success "API container is running"
  
  if ! docker compose ps 2>/dev/null | grep -q "bikehaus-homepage"; then
    log_warning "Homepage container (bikehaus-homepage) is not running"
    return 1
  fi
  log_success "Homepage container is running"
  
  if ! docker compose ps 2>/dev/null | grep -q "bikehaus-nginx"; then
    log_error "Nginx container is not running"
    return 1
  fi
  log_success "Nginx container is running"
  
  return 0
}

# Check API health endpoint
check_api_health() {
  echo ""
  echo "Checking API health endpoints..."
  
  local max_attempts=5
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    response=$(curl -s -w "\n%{http_code}" http://localhost:5000/api/settings 2>/dev/null || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    
    if [[ "$http_code" == "200" ]]; then
      log_success "API health check passed (HTTP $http_code)"
      return 0
    fi
    
    if [ $attempt -lt $max_attempts ]; then
      echo "  Attempt $attempt/$max_attempts returned $http_code, retrying..."
      sleep 2
    fi
    attempt=$((attempt + 1))
  done
  
  log_error "API health check failed (HTTP $http_code after $max_attempts attempts)"
  return 1
}

# Check SMTP email service
check_email_service() {
  echo ""
  echo "Checking SMTP email service configuration..."
  
  # Check if SMTP credentials are set in .env
  if [ ! -f .env ]; then
    log_error ".env file not found"
    return 1
  fi
  
  if ! grep -q "^SMTP_HOST=" .env; then
    log_error "SMTP_HOST not configured in .env"
    return 1
  fi
  log_success "SMTP_HOST is configured"
  
  if ! grep -q "^SMTP_PASSWORD=" .env || grep -q "^SMTP_PASSWORD=$" .env; then
    log_error "SMTP_PASSWORD is missing or empty in .env"
    return 1
  fi
  log_success "SMTP_PASSWORD is configured"
  
  if ! grep -q "^SMTP_USERNAME=" .env || grep -q "^SMTP_USERNAME=$" .env; then
    log_warning "SMTP_USERNAME is missing or empty in .env (may use default)"
  else
    log_success "SMTP_USERNAME is configured"
  fi
  
  return 0
}

# Check database connectivity
check_database() {
  echo ""
  echo "Checking database connectivity..."
  
  if [ ! -f /app/data/BikeHausFreiburg.db ]; then
    log_error "SQLite database file not found at /app/data/BikeHausFreiburg.db"
    return 1
  fi
  log_success "SQLite database file exists"
  
  # Try to query database through API
  response=$(curl -s -w "\n%{http_code}" http://localhost:5000/api/public/neue-fahrraeder 2>/dev/null || echo -e "\n000")
  http_code=$(echo "$response" | tail -n1)
  
  if [[ "$http_code" == "200" ]]; then
    log_success "Database query successful (HTTP $http_code)"
    return 0
  else
    log_warning "Database query returned HTTP $http_code"
  fi
}

# Check disk space
check_disk_space() {
  echo ""
  echo "Checking disk space..."
  
  available=$(df /app/data | tail -1 | awk '{print $4}')
  available_gb=$((available / 1024 / 1024))
  
  if [ $available_gb -lt 100 ]; then
    log_warning "Low disk space: only ${available_gb}GB available"
  else
    log_success "Disk space: ${available_gb}GB available"
  fi
}

# Check logs for errors
check_recent_logs() {
  echo ""
  echo "Checking recent container logs for errors..."
  
  local errors=$(docker compose logs --tail=100 bikehaus 2>/dev/null | grep -i "error\|failed\|exception" | wc -l)
  
  if [ $errors -gt 5 ]; then
    log_warning "Found $errors error-like messages in recent logs"
  else
    log_success "No critical errors found in recent logs"
  fi
}

# Verify deployment files
check_deployment_files() {
  echo ""
  echo "Checking deployment files..."
  
  if [ ! -f docker-compose.yml ]; then
    log_error "docker-compose.yml not found"
    return 1
  fi
  log_success "docker-compose.yml exists"
  
  if [ ! -f Dockerfile ]; then
    log_error "Dockerfile not found"
    return 1
  fi
  log_success "Dockerfile exists"
  
  if [ ! -f .env ]; then
    log_error ".env file not found"
    return 1
  fi
  log_success ".env file exists (permissions: $(stat -c %a .env 2>/dev/null || echo "unknown"))"
}

# Main validation flow
cd /opt/bikehaus

echo ""
check_deployment_files || true
echo ""
check_containers || true
echo ""
check_api_health || true
echo ""
check_email_service || true
echo ""
check_database || true
echo ""
check_disk_space || true
echo ""
check_recent_logs || true

# Summary
echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
if [ $VALIDATION_FAILURES -eq 0 ]; then
  echo -e "${GREEN}✓ Deployment validation PASSED${NC}"
  if [ $VALIDATION_WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $VALIDATION_WARNINGS warning(s)${NC}"
  fi
  exit 0
else
  echo -e "${RED}✗ Deployment validation FAILED${NC}"
  echo "  Failures: $VALIDATION_FAILURES"
  echo "  Warnings: $VALIDATION_WARNINGS"
  exit 1
fi
