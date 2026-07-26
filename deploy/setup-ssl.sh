#!/bin/bash
#
# Idempotentes SSL-Bootstrap/Reparatur-Skript.
#
# Kann jederzeit gefahrlos erneut ausgeführt werden:
#   - fehlt ein Zertifikat komplett, wird zunächst ein Self-signed-Platzhalter
#     angelegt, damit nginx überhaupt starten kann (sonst Henne-Ei-Problem:
#     ohne nginx kein Port 80, ohne Port 80 keine ACME-Validierung, ohne
#     Validierung kein Zertifikat),
#   - existiert bereits ein gültiges Zertifikat mit denselben Domains,
#     passiert nichts (certbot: "not yet due for renewal"),
#   - fehlt eine Domain im Zertifikat (z. B. mail.), wird per --expand
#     sofort neu ausgestellt.
#
# Bewusst OHNE --force-renewal: Let's Encrypt erlaubt nur 5 identische
# Zertifikate pro Woche. Wer dieses Skript bei einer HTTPS-Störung mehrfach
# laufen ließ, sperrte sich vorher selbst aus.
#
# Verwendung:
#   deploy/setup-ssl.sh                      # normal
#   EMAIL=x@y.de deploy/setup-ssl.sh         # andere Kontaktadresse
#   STAGING=1 deploy/setup-ssl.sh            # gegen LE-Staging testen
#
set -euo pipefail

DOMAIN="bikehausfreiburg.com"
EMAIL="${EMAIL:-${1:-info@bikehausfreiburg.com}}"

# Jede Domain, für die nginx einen 443-Serverblock hat, MUSS hier stehen —
# sonst liefert nginx für sie ein Zertifikat mit falschem Namen aus und der
# Browser blockt (bei aktivem HSTS sogar ohne Klick-Weg).
DOMAINS=(
  "$DOMAIN"
  "www.$DOMAIN"
  "admin.$DOMAIN"
  "api.$DOMAIN"
  "mail.$DOMAIN"
)

LIVE_DIR="/etc/letsencrypt/live/$DOMAIN"
PLACEHOLDER_MARKER="$LIVE_DIR/.selfsigned-placeholder"

if [ -d /opt/bikehaus ]; then
  cd /opt/bikehaus
elif [ ! -f docker-compose.yml ]; then
  echo "ERROR: /opt/bikehaus nicht gefunden und kein docker-compose.yml im aktuellen Verzeichnis."
  exit 1
fi

echo "=== SSL Setup: $DOMAIN ==="
echo "Domains: ${DOMAINS[*]}"

if [ ! -f .env ]; then
  echo "ERROR: .env fehlt. Zuerst Secrets konfigurieren (siehe deploy/DEPLOYMENT.md)."
  exit 1
fi

# Volumename hängt vom Compose-Projektnamen ab (= Verzeichnisname). Nicht
# hartkodieren, sonst bricht das Skript in jedem abweichenden Checkout.
CERT_VOL="$(docker volume ls -q --filter "name=certbot-etc" | head -n1)"
if [ -z "$CERT_VOL" ]; then
  CERT_VOL="$(basename "$PWD")_certbot-etc"
  echo "[INFO] certbot-etc Volume noch nicht angelegt — erwarte '$CERT_VOL' nach dem Start."
fi

# Führt ein Kommando mit Schreibzugriff auf das Zertifikats-Volume aus.
in_cert_vol() {
  docker run --rm -v "${CERT_VOL}:/etc/letsencrypt" alpine:3.20 sh -c "$1"
}

# ───────────────────────────────────────────────────────────────────
# 1) Platzhalter-Zertifikat, falls noch gar keins existiert.
#    Ohne Zertifikatsdatei verweigert nginx den Start ("cannot load
#    certificate"), landet im Crash-Loop und Port 80 bleibt tot.
# ───────────────────────────────────────────────────────────────────
echo "[1/6] Prüfe, ob ein Zertifikat vorhanden ist..."
if in_cert_vol "test -f '$LIVE_DIR/fullchain.pem'" 2>/dev/null; then
  echo "      Zertifikat vorhanden."
else
  echo "      Kein Zertifikat — lege Self-signed-Platzhalter an, damit nginx startet."
  in_cert_vol "
    apk add --no-cache openssl > /dev/null 2>&1
    mkdir -p '$LIVE_DIR'
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout '$LIVE_DIR/privkey.pem' \
      -out '$LIVE_DIR/fullchain.pem' \
      -subj '/CN=$DOMAIN' > /dev/null 2>&1
    cp '$LIVE_DIR/fullchain.pem' '$LIVE_DIR/chain.pem'
    touch '$PLACEHOLDER_MARKER'
  "
  # Volume wurde ggf. jetzt erst erzeugt — Namen neu auflösen.
  CERT_VOL="$(docker volume ls -q --filter "name=certbot-etc" | head -n1)"
fi

# ───────────────────────────────────────────────────────────────────
# 2) Stack hochfahren (nginx startet jetzt garantiert)
# ───────────────────────────────────────────────────────────────────
echo "[2/6] Starte Container..."
docker compose up -d

echo "[3/6] Warte, bis nginx Port 80 bedient..."
nginx_up=0
for i in $(seq 1 30); do
  code="$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' "http://localhost/" 2>/dev/null || echo 000)"
  case "$code" in
    200 | 301 | 302 | 404) echo "      nginx antwortet (HTTP $code)."; nginx_up=1; break ;;
  esac
  sleep 2
done
if [ "$nginx_up" -ne 1 ]; then
  echo "ERROR: nginx antwortet nicht auf Port 80."
  docker compose logs --tail=50 nginx
  exit 1
fi

# ───────────────────────────────────────────────────────────────────
# 3) Platzhalter entfernen, sonst hält certbot ihn für ein gültiges
#    Zertifikat der Lineage und überspringt die Ausstellung.
# ───────────────────────────────────────────────────────────────────
if in_cert_vol "test -f '$PLACEHOLDER_MARKER'" 2>/dev/null; then
  echo "[4/6] Entferne Platzhalter-Zertifikat vor der echten Ausstellung..."
  in_cert_vol "
    rm -rf '/etc/letsencrypt/live/$DOMAIN' \
           '/etc/letsencrypt/archive/$DOMAIN' \
           '/etc/letsencrypt/renewal/$DOMAIN.conf'
  "
else
  echo "[4/6] Kein Platzhalter vorhanden — überspringe."
fi

# ───────────────────────────────────────────────────────────────────
# 4) Echtes Zertifikat holen bzw. um fehlende Domains erweitern
# ───────────────────────────────────────────────────────────────────
echo "[5/6] Fordere Zertifikat an (webroot, ohne --force-renewal)..."
CERTBOT_ARGS=(
  certonly
  --webroot --webroot-path=/var/lib/letsencrypt
  --email "$EMAIL" --agree-tos --no-eff-email
  --cert-name "$DOMAIN" --expand
  --non-interactive
)
[ -n "${STAGING:-}" ] && CERTBOT_ARGS+=(--staging)
for d in "${DOMAINS[@]}"; do CERTBOT_ARGS+=(-d "$d"); done

docker compose run --rm --entrypoint certbot certbot "${CERTBOT_ARGS[@]}"

# ───────────────────────────────────────────────────────────────────
# 5) nginx das neue Zertifikat einlesen lassen
# ───────────────────────────────────────────────────────────────────
echo "[6/6] Lade nginx neu..."
if docker compose exec -T nginx nginx -t; then
  docker compose exec -T nginx nginx -s reload
else
  echo "[WARN] nginx -t fehlgeschlagen — erzwinge Neuerstellung."
  docker compose up -d --force-recreate nginx
fi

echo ""
echo "✓ Fertig. Status:"
"$(dirname "$0")/ssl-status.sh" || true
