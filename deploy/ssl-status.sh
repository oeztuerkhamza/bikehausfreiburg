#!/bin/bash
#
# TLS-Statusbericht für alle öffentlichen Hostnamen.
#
# Prüft für jede Domain, was der Server im TLS-Handshake TATSÄCHLICH
# ausliefert — nicht was auf der Platte liegt. Genau das war die bisherige
# Fehlerquelle: certbot erneuerte korrekt, nginx lieferte weiter das alte,
# abgelaufene Zertifikat aus dem Speicher aus.
#
# Exit-Code:
#   0 = alles in Ordnung
#   1 = mindestens eine Domain kaputt (abgelaufen, Namensfehler, nicht erreichbar)
#   2 = Erneuerung überfällig (Restlaufzeit < WARN_DAYS), aber noch gültig
#
# Verwendung:
#   deploy/ssl-status.sh                 # alle Standard-Domains
#   deploy/ssl-status.sh example.com     # gezielt
#   WARN_DAYS=21 deploy/ssl-status.sh
#
set -uo pipefail

WARN_DAYS="${WARN_DAYS:-21}"

if [ "$#" -gt 0 ]; then
  DOMAINS=("$@")
else
  DOMAINS=(
    bikehausfreiburg.com
    www.bikehausfreiburg.com
    admin.bikehausfreiburg.com
    api.bikehausfreiburg.com
    mail.bikehausfreiburg.com
  )
fi

# Zwei getrennte Flags statt eines Zählers: "kaputt" wiegt schwerer als
# "Erneuerung überfällig", die Exit-Codes (1 bzw. 2) sind aber umgekehrt
# sortiert — ein numerisches Maximum würde einen Ausfall verharmlosen.
broken=0
overdue=0
note() {
  case "$1" in
    1) broken=1 ;;
    2) overdue=1 ;;
  esac
  return 0
}

echo "=================================================================="
echo " TLS-Status  (Warnschwelle: ${WARN_DAYS} Tage Restlaufzeit)"
echo "=================================================================="

for host in "${DOMAINS[@]}"; do
  echo ""
  echo "── $host ────────────────────────────────────────────"

  cert="$(echo | timeout 15 openssl s_client -connect "${host}:443" -servername "$host" 2>/dev/null \
          | openssl x509 2>/dev/null)"

  if [ -z "$cert" ]; then
    echo "  ✗ KEIN TLS-Handshake möglich (Port 443 zu, nginx unten oder DNS falsch)"
    note 1
    continue
  fi

  subject="$(echo "$cert" | openssl x509 -noout -subject 2>/dev/null | sed 's/^subject= *//')"
  issuer="$(echo "$cert" | openssl x509 -noout -issuer 2>/dev/null | sed 's/^issuer= *//')"
  not_after="$(echo "$cert" | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
  sans="$(echo "$cert" | openssl x509 -noout -ext subjectAltName 2>/dev/null \
          | tr ',' '\n' | sed -n 's/.*DNS://p' | tr -d ' ' | paste -sd' ' -)"

  echo "  Subject : $subject"
  echo "  Issuer  : $issuer"
  echo "  SANs    : ${sans:-<keine>}"
  echo "  Läuft ab: $not_after"

  # Restlaufzeit
  end_epoch="$(date -d "$not_after" +%s 2>/dev/null || echo 0)"
  now_epoch="$(date +%s)"
  if [ "$end_epoch" -gt 0 ]; then
    days_left=$(((end_epoch - now_epoch) / 86400))
    echo "  Restzeit: ${days_left} Tage"
    if [ "$days_left" -lt 0 ]; then
      echo "  ✗ ABGELAUFEN"
      note 1
    elif [ "$days_left" -lt "$WARN_DAYS" ]; then
      echo "  ⚠ Erneuerung überfällig — certbot hätte längst verlängern müssen."
      note 2
    fi
  fi

  # Deckt das Zertifikat diesen Hostnamen ab?
  if echo " $sans " | grep -qi " $host "; then
    echo "  ✓ Hostname im Zertifikat enthalten"
  else
    echo "  ✗ Hostname NICHT im Zertifikat — Browser meldet ERR_CERT_COMMON_NAME_INVALID"
    note 1
  fi

  # Self-signed? (Bootstrap-Platzhalter nie durch ein echtes ersetzt.)
  # Zuverlässigstes Kriterium: Aussteller == Inhaber.
  if [ -n "$subject" ] && [ "$subject" = "$issuer" ]; then
    echo "  ✗ Selbstsigniert — echtes Zertifikat wurde nie ausgestellt (deploy/setup-ssl.sh)"
    note 1
  fi

  # Kette vollständig? (fehlendes Intermediate bricht Android/Java-Clients)
  if ! echo | timeout 15 openssl s_client -connect "${host}:443" -servername "$host" \
        -verify_return_error > /dev/null 2>&1; then
    echo "  ⚠ Zertifikatskette nicht verifizierbar (fehlendes Intermediate?)"
    note 2
  fi
done

# ───────────────────────────────────────────────────────────────────
# Serverseitige Zusatzinfos, wenn wir auf dem VPS laufen
# ───────────────────────────────────────────────────────────────────
if command -v docker > /dev/null 2>&1 && [ -f /opt/bikehaus/docker-compose.yml ]; then
  cd /opt/bikehaus
  echo ""
  echo "=================================================================="
  echo " Serverseitig"
  echo "=================================================================="

  echo ""
  echo "── certbot: Zertifikate auf der Platte ──"
  docker compose run --rm --entrypoint certbot certbot certificates 2>&1 | sed 's/^/  /'

  echo ""
  echo "── certbot: läuft der Renew-Loop? ──"
  docker compose ps certbot 2>&1 | sed 's/^/  /'
  docker compose logs --tail=20 --no-color certbot 2>&1 | sed 's/^/  /'

  echo ""
  echo "── nginx: läuft der Reload-Loop? ──"
  docker compose ps nginx 2>&1 | sed 's/^/  /'
  # Der Reload-Loop ist der /bin/sh-Prozess neben den nginx-Workern.
  docker compose exec -T nginx ps -o pid,args 2>&1 | sed 's/^/  /'

  echo ""
  echo "── ACME-Challenge-Pfad erreichbar? ──"
  docker compose exec -T nginx sh -c \
    'mkdir -p /var/lib/letsencrypt/.well-known/acme-challenge && echo ok > /var/lib/letsencrypt/.well-known/acme-challenge/_selftest' \
    > /dev/null 2>&1
  probe="$(curl -sS --max-time 10 "http://bikehausfreiburg.com/.well-known/acme-challenge/_selftest" 2>&1)"
  if [ "$probe" = "ok" ]; then
    echo "  ✓ http://bikehausfreiburg.com/.well-known/acme-challenge/ wird ausgeliefert"
  else
    echo "  ✗ ACME-Challenge nicht erreichbar — jede Erneuerung wird fehlschlagen!"
    echo "    Antwort: $(echo "$probe" | head -c 200)"
    note 1
  fi
  docker compose exec -T nginx rm -f /var/lib/letsencrypt/.well-known/acme-challenge/_selftest > /dev/null 2>&1
fi

echo ""
echo "=================================================================="
if [ "$broken" -eq 1 ]; then
  echo " ✗ Mindestens eine Domain ist kaputt — siehe Meldungen oben."
  echo "=================================================================="
  exit 1
elif [ "$overdue" -eq 1 ]; then
  echo " ⚠ Gültig, aber Erneuerung überfällig — siehe Warnungen oben."
  echo "=================================================================="
  exit 2
else
  echo " ✓ Alle geprüften Domains liefern ein gültiges Zertifikat aus."
  echo "=================================================================="
  exit 0
fi
