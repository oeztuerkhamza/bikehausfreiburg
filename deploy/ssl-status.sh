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
# Mailports: liefert Mailcow dasselbe Zertifikat aus wie der Webserver?
#
# Eigener Abschnitt, weil Mailcow eine KOPIE des Zertifikats hält und
# nicht die Dateien von certbot liest. Port 443 kann längst erneuert
# sein, während Postfix und Dovecot noch das alte ausliefern — Besucher
# merken davon nichts, Mailclients brechen die Verbindung ab.
# deploy/mailcow-cert-sync.sh hält die Kopie nach; hier prüfen wir, ob
# das auch wirklich angekommen ist.
# ───────────────────────────────────────────────────────────────────
MAIL_HOST="${MAIL_HOST:-mail.bikehausfreiburg.com}"

# Nur prüfen, wenn der Mailhost überhaupt zum Prüfauftrag gehört —
# sonst würde ein gezieltes „ssl-status.sh example.com" unnötig an
# fremden Mailports klopfen.
check_mail=0
for d in "${DOMAINS[@]}"; do
  [ "$d" = "$MAIL_HOST" ] && check_mail=1
done

probe_mail_port() {
  local port="$1" label="$2"; shift 2
  local cert subject issuer sans not_after end_epoch days_left fp

  echo ""
  echo "── ${label} (Port ${port}) ────────────────────────────"

  cert="$(echo | timeout 15 openssl s_client -connect "${MAIL_HOST}:${port}" \
          -servername "$MAIL_HOST" "$@" 2>/dev/null | openssl x509 2>/dev/null)"

  if [ -z "$cert" ]; then
    # Bewusst nur Warnung: von außen ist „Dienst unten" nicht von
    # „ausgehender Port gesperrt" zu unterscheiden, und CI-Runner sperren
    # Mailports gern. Das harte Urteil fällt der serverseitige
    # mailcow-cert-sync.sh --check weiter unten.
    echo "  ⚠ Kein TLS-Handshake — Dienst unten oder Port von hier aus gesperrt"
    note 2
    return
  fi

  subject="$(echo "$cert" | openssl x509 -noout -subject 2>/dev/null | sed 's/^subject= *//')"
  issuer="$(echo "$cert" | openssl x509 -noout -issuer 2>/dev/null | sed 's/^issuer= *//')"
  not_after="$(echo "$cert" | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
  fp="$(echo "$cert" | openssl x509 -noout -fingerprint -sha256 2>/dev/null | cut -d= -f2)"
  sans="$(echo "$cert" | openssl x509 -noout -ext subjectAltName 2>/dev/null \
          | tr ',' '\n' | sed -n 's/.*DNS://p' | tr -d ' ' | paste -sd' ' -)"

  echo "  Issuer  : $issuer"
  echo "  Läuft ab: $not_after"

  # Der häufigste Ausfall: Mailcows eigenes ACME hat wieder ein
  # Platzhalterzertifikat gelegt (SKIP_LETS_ENCRYPT steht nicht auf y).
  if [ -n "$subject" ] && [ "$subject" = "$issuer" ]; then
    echo "  ✗ Selbstsigniert — Mailcow liefert sein Platzhalterzertifikat aus."
    echo "    Fix: deploy/mailcow-cert-sync.sh (setzt auch SKIP_LETS_ENCRYPT=y)"
    note 1
    return
  fi

  if echo " $sans " | grep -qi " ${MAIL_HOST} "; then
    echo "  ✓ ${MAIL_HOST} im Zertifikat enthalten"
  else
    echo "  ✗ ${MAIL_HOST} NICHT im Zertifikat — jeder Mailclient meldet Namensfehler"
    note 1
  fi

  end_epoch="$(date -d "$not_after" +%s 2>/dev/null || echo 0)"
  if [ "$end_epoch" -gt 0 ]; then
    days_left=$(((end_epoch - $(date +%s)) / 86400))
    echo "  Restzeit: ${days_left} Tage"
    if [ "$days_left" -lt 0 ]; then
      echo "  ✗ ABGELAUFEN"
      note 1
    elif [ "$days_left" -lt "$WARN_DAYS" ]; then
      echo "  ⚠ Erneuerung überfällig"
      note 2
    fi
  fi

  # Kernprüfung: dasselbe Zertifikat wie auf 443? Weicht es ab, hat der
  # Abgleich nicht gegriffen — die Mailkopie ist eingefroren.
  if [ -n "$WEB_FP" ] && [ -n "$fp" ] && [ "$fp" != "$WEB_FP" ]; then
    echo "  ⚠ Anderes Zertifikat als auf Port 443 — Mailcow-Kopie hinkt hinterher."
    echo "    Fix: deploy/mailcow-cert-sync.sh"
    note 2
  fi
}

if [ "$check_mail" -eq 1 ]; then
  echo ""
  echo "=================================================================="
  echo " Mailports  (${MAIL_HOST})"
  echo "=================================================================="

  # Referenz: was liefert derselbe Host auf 443 aus? Daran messen wir,
  # ob Mailcows Kopie aktuell ist.
  WEB_FP="$(echo | timeout 15 openssl s_client -connect "${MAIL_HOST}:443" \
            -servername "$MAIL_HOST" 2>/dev/null \
            | openssl x509 -noout -fingerprint -sha256 2>/dev/null | cut -d= -f2)"

  probe_mail_port 465 "SMTPS"
  probe_mail_port 993 "IMAPS"
  probe_mail_port 587 "Submission" -starttls smtp
fi

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

  # ── Mailcow-Abgleich ──
  # Läuft der Timer überhaupt? Ein stillschweigend deaktivierter Timer
  # fällt sonst erst auf, wenn das Zertifikat drei Monate später abläuft.
  echo ""
  echo "── mailcow-cert-sync: läuft der Timer? ──"
  if ! command -v systemctl > /dev/null 2>&1; then
    echo "  (kein systemd — Timer-Prüfung übersprungen)"
  elif systemctl list-unit-files mailcow-cert-sync.timer > /dev/null 2>&1; then
    if systemctl is-active --quiet mailcow-cert-sync.timer; then
      systemctl list-timers mailcow-cert-sync.timer --no-pager 2>&1 | sed 's/^/  /'
    else
      echo "  ✗ Timer ist nicht aktiv — Mailcow bekommt keine Erneuerung mehr mit!"
      echo "    Fix: systemctl enable --now mailcow-cert-sync.timer"
      note 1
    fi
    echo ""
    echo "── mailcow-cert-sync: Zertifikat auf dem Stand von certbot? ──"
    if [ -x /usr/local/sbin/mailcow-cert-sync.sh ]; then
      LOG_FILE="" /usr/local/sbin/mailcow-cert-sync.sh --check 2>&1 | sed 's/^/  /'
      case "${PIPESTATUS[0]}" in
        0) : ;;
        2) note 2 ;;
        *) note 1 ;;
      esac
    else
      echo "  ⚠ /usr/local/sbin/mailcow-cert-sync.sh fehlt"
      note 2
    fi
  else
    echo "  ✗ Timer nicht installiert — deploy/install-mailcow-cert-sync.sh ausführen"
    note 1
  fi
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
