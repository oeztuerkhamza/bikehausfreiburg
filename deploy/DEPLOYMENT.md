# BikeHaus Freiburg - Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NETCUP VPS                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    NGINX                             │   │
│  │                  (Port 80, 443)                      │   │
│  └──────────┬──────────────────┬──────────────────┬────┘   │
│             │                  │                  │         │
│             ▼                  ▼                  ▼         │
│   bikehausfreiburg.com   admin.xxx.com     api.xxx.com     │
│   (Static Homepage)      (Admin Panel)     (Public API)    │
│         │                      │                  │         │
│         ▼                      └──────┬──────────┘         │
│   /homepage-dist/                     │                     │
│                                       ▼                     │
│                              ┌─────────────────┐           │
│                              │  BikeHaus API   │           │
│                              │   (Port 5000)   │           │
│                              │   + Admin SPA   │           │
│                              └────────┬────────┘           │
│                                       │                     │
│                                       ▼                     │
│                              ┌─────────────────┐           │
│                              │     SQLite      │           │
│                              │  /app/data/db   │           │
│                              └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Repositories

| Repository                  | Content                            | CI/CD Trigger  |
| --------------------------- | ---------------------------------- | -------------- |
| `bikehausfreiburg`          | API + Admin Panel + Deploy configs | Push to `master` |
| `bikehausfreiburg-homepage` | Public Homepage (Angular)          | Push to `master` |

---

## First-Time Server Setup

### 1. Prepare Server (Netcup VPS)

```bash
# SSH into your server
ssh root@152.53.138.135

# Download and run setup script
curl -sSL https://raw.githubusercontent.com/oeztuerkhamza/bikehausfreiburg/master/deploy/server-setup.sh | bash
```

### 2. Clone Main Repository

```bash
git clone -b master https://github.com/oeztuerkhamza/bikehausfreiburg.git /opt/bikehaus
cd /opt/bikehaus
```

### 3. Configure DNS (at your domain registrar)

Add these A records pointing to your server IP:

- `bikehausfreiburg.com` → 152.53.138.135
- `www.bikehausfreiburg.com` → 152.53.138.135
- `admin.bikehausfreiburg.com` → 152.53.138.135
- `api.bikehausfreiburg.com` → 152.53.138.135
- `mail.bikehausfreiburg.com` → 152.53.138.135

> Jeder Hostname mit einem 443-Serverblock in `nginx/nginx.conf` muss auch in
> `DOMAINS` in [setup-ssl.sh](setup-ssl.sh) stehen. Fehlt er im Zertifikat,
> liefert nginx für ihn den falschen Namen aus — und weil auf der Apex-Domain
> HSTS mit `includeSubDomains` gesetzt ist, kann der Besucher den
> Zertifikatsfehler nicht wegklicken.

### 4. Initialize Secrets & Start Services

```bash
# Create .env file with required secrets (use strong values in production)
cat > .env <<EOF
JWT_SECRET_KEY=your-very-long-random-secret-key-min-32-chars
INDEXNOW_API_KEY=your-indexnow-api-key
GOOGLE_PLACES_API_KEY=your-google-places-key
GOOGLE_PLACES_PLACE_ID=your-place-id
SMTP_PASSWORD=your-smtp-password
SMTP_USE_SSL=false
SMTP_FROM_EMAIL=no-reply@bikehausfreiburg.com
SMTP_FROM_NAME=Bike Haus Freiburg
EOF
chmod 600 .env

# Start services with SSL setup script
deploy/setup-ssl.sh
```

---

## GitHub Secrets Configuration

Add these secrets to **BOTH** repositories:

| Secret           | Value                |
| ---------------- | -------------------- |
| `SERVER_HOST`    | `152.53.138.135`     |
| `SERVER_USER`    | `root`               |
| `SERVER_SSH_KEY` | Your SSH private key |

### Generate SSH Key Pair

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github-deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github-deploy.pub root@152.53.138.135

# The contents of ~/.ssh/github-deploy is your SERVER_SSH_KEY secret
cat ~/.ssh/github-deploy
```

---

## Continuous Deployment

### Main App (API + Admin)

1. Make changes to `bikehausfreiburg` repo
2. Commit and push to `main` branch
3. GitHub Actions will:
   - SSH to server
   - `git pull origin main`
   - `docker compose up -d --build`

### Homepage

1. Make changes to `bikehausfreiburg-homepage` repo
2. Commit and push to `main` branch
3. GitHub Actions will:
   - Build Angular app
   - SCP files to `/opt/bikehaus/homepage-dist/`
   - Reload nginx

---

## Useful Commands

```bash
# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f bikehaus
docker compose logs -f nginx

# Restart all services
docker compose restart

# Rebuild and restart
docker compose up -d --build

# Stop everything
docker compose down

# Check disk usage
docker system df

# Clean unused images
docker image prune -f

# Access SQLite database
docker exec -it bikehaus-app sqlite3 /app/data/BikeHausFreiburg.db

# Backup database
docker cp bikehaus-app:/app/data/BikeHausFreiburg.db ./backup.db
```

---

## Troubleshooting

### SSL / HTTPS Issues

**Erste Anlaufstelle — der Statusbericht.** Er prüft, welches Zertifikat der
Server im TLS-Handshake tatsächlich ausliefert (nicht nur, was auf der Platte
liegt) und meldet Ablauf, Namensfehler und eine nicht erreichbare
ACME-Challenge:

```bash
deploy/ssl-status.sh
```

Von GitHub aus, ohne SSH: **Actions → SSL Ops → Run workflow → `diagnose`**.

**Wie HTTPS hier kaputtgeht — und warum es jetzt nicht mehr passiert:**

| Ursache                                                                                   | Dauerhafte Absicherung                                                                          |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| nginx hält das Zertifikat im Speicher; certbot erneuert im eigenen Container → nie geladen | nginx-Container fährt eine Reload-Schleife (alle 6h), siehe `command:` in `docker-compose.yml`   |
| certbot-Container startet nach Host-Reboot nicht wieder → keine Erneuerung mehr            | `restart: unless-stopped` am certbot-Service                                                     |
| `setup-ssl.sh` listete `mail.` nicht, obwohl das Zertifikat es (manuell ergänzt) enthält — ein Lauf des Skripts hätte die Domain wieder **entfernt** | Alle Hostnamen stehen in `DOMAINS`; die CI erzwingt das (`nginx-config-check.yml`)               |
| Erneuerung schlägt still fehl, niemand merkt es bis zum Ablauf                             | Täglicher Wächter `.github/workflows/ssl-ops.yml` — repariert automatisch, mailt bei Misserfolg  |
| Zertifikat fehlt → nginx startet nicht → Port 80 tot → ACME unmöglich (Henne-Ei)           | `deploy/setup-ssl.sh` legt zuerst ein Self-signed-Platzhalter an, damit nginx immer hochkommt    |

**Manuelle Eingriffe:**

```bash
# Zertifikate auf der Platte anzeigen
docker compose run --rm --entrypoint certbot certbot certificates

# Häufigster Fix: nginx das vorhandene Zertifikat neu einlesen lassen
docker compose exec -T nginx nginx -t && docker compose exec -T nginx nginx -s reload

# Erneuerung anstoßen (nur wenn fällig) + Reload
docker compose run --rm --entrypoint certbot certbot renew \
  --webroot --webroot-path=/var/lib/letsencrypt --non-interactive
docker compose exec -T nginx nginx -s reload

# Erstausstellung / fehlende Domain ergänzen (idempotent)
deploy/setup-ssl.sh
```

> **Kein `--force-renewal` aus Gewohnheit.** Let's Encrypt stellt pro Woche nur
> 5 identische Zertifikate aus. Wer bei einer Störung mehrfach neu ausstellt,
> sperrt sich für den Rest der Woche selbst aus — und dann hilft gar nichts
> mehr. Erst `deploy/ssl-status.sh` lesen, dann handeln; in fast allen Fällen
> ist ein `nginx -s reload` die Lösung.

### Homepage Not Updating

```bash
# Check if files exist
ls -la /opt/bikehaus/homepage-dist/

# Check nginx error logs
docker compose logs nginx | grep error
```

### API Not Responding

```bash
# Check container status
docker compose ps

# Check API logs
docker compose logs bikehaus

# Restart API
docker compose restart bikehaus
```
