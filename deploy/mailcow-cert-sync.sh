#!/bin/bash
#
# Hält Mailcows Zertifikat mit dem Let's-Encrypt-Zertifikat aus dem
# certbot-Volume in Deckung.
#
# WARUM ES DAS GIBT
#   Mailcow bringt sein eigenes ACME mit. Das kann hier nicht funktionieren:
#   Port 80/443 gehören dem nginx des Shops, Mailcows acme-Container
#   scheitert deshalb an der HTTP-Validierung und legt ein SELBSTSIGNIERTES
#   Zertifikat ab — jeder Mailclient zeigt dann eine Warnung.
#   Also: SKIP_LETS_ENCRYPT=y, und certbot stellt EIN Zertifikat für alle
#   Hosts aus (mail.* steckt im SAN). Dieses Skript kopiert es in Mailcows
#   ssl-Verzeichnis und lädt die Mailserver neu.
#
#   Ohne dieses Skript ist die Kopie eine Momentaufnahme: certbot erneuert
#   alle 60 Tage im eigenen Volume, Mailcow liefert weiter das alte aus,
#   und spätestens am Tag 90 bricht Outlook/Thunderbird/iOS die Verbindung
#   ab. Genau deshalb läuft hier ein Timer und kein Mensch.
#
# EIGENSCHAFTEN
#   * idempotent — vergleicht Fingerabdrücke, tut ohne Änderung nichts
#   * prüft VOR dem Einspielen (Paar passt, gültig, SAN, Kette, nicht
#     selbstsigniert) — ein kaputtes Zertifikat wird nie installiert
#   * reload statt restart — kein Mailausfall
#   * verifiziert danach am echten Port, was wirklich ausgeliefert wird
#   * erzwingt SKIP_LETS_ENCRYPT=y, falls ein mailcow-Update es zurücksetzt
#
# Exit-Code:
#   0 = alles gut (auch: nichts zu tun)
#   1 = Fehler — Zertifikat konnte nicht sicher aktualisiert werden
#   2 = --check: Mailcow hängt hinterher (nichts geändert)
#
# Verwendung:
#   deploy/mailcow-cert-sync.sh              # normaler Lauf (Timer)
#   deploy/mailcow-cert-sync.sh --check      # nur prüfen, nichts ändern
#   deploy/mailcow-cert-sync.sh --dry-run    # zeigen, was passieren würde
#   deploy/mailcow-cert-sync.sh --force      # kopieren, auch wenn gleich
#
set -uo pipefail

MAIL_HOST="${MAIL_HOST:-mail.bikehausfreiburg.com}"
CERT_NAME="${CERT_NAME:-bikehausfreiburg.com}"
MIN_DAYS="${MIN_DAYS:-1}"
LOG_FILE="${LOG_FILE:-/var/log/mailcow-cert-sync.log}"
BACKUP_DIR="${BACKUP_DIR:-/root/mailcow-ssl-backup}"
KEEP_BACKUPS="${KEEP_BACKUPS:-10}"

FORCE=0
DRY_RUN=0
CHECK_ONLY=0
COMPOSE_PROJECT="mailcowdockerized"

usage() { sed -n '2,37p' "$0" | sed 's/^#//;s/^ //'; }

while [ "$#" -gt 0 ]; do
  case "$1" in
    --force)   FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --check)   CHECK_ONLY=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unbekannte Option: $1" >&2; exit 64 ;;
  esac
  shift
done

log()  { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
ok()   { log "[OK] $*"; }
warn() { log "[WARN] $*"; }
err()  { log "[FEHLER] $*"; }

# ───────────────────────────────────────────────────────────────────
# Hilfsfunktionen
# ───────────────────────────────────────────────────────────────────

fingerprint() {
  openssl x509 -in "$1" -noout -fingerprint -sha256 2>/dev/null | cut -d= -f2
}

# Prüft ein Zertifikat/Schlüssel-Paar auf der Platte, BEVOR es Mailcows
# Zertifikat überschreibt. Jede einzelne Prüfung steht für einen Ausfall,
# den wir sonst erst vom Kunden erfahren würden.
validate_pair() {
  local cert="$1" key="$2" bad=0

  [ -s "$cert" ] || { err "Zertifikat fehlt oder ist leer: $cert"; return 1; }
  [ -s "$key" ]  || { err "Schluessel fehlt oder ist leer: $key"; return 1; }

  if ! openssl x509 -in "$cert" -noout > /dev/null 2>&1; then
    err "Zertifikat ist kein gueltiges X.509-PEM: $cert"; return 1
  fi
  if ! openssl pkey -in "$key" -noout > /dev/null 2>&1; then
    err "Schluessel ist kein gueltiges PEM: $key"; return 1
  fi

  # Passen Zertifikat und Schlüssel zusammen? Sonst startet Postfix zwar,
  # lehnt aber jede TLS-Verbindung ab.
  local ch kh
  ch="$(openssl x509 -in "$cert" -noout -pubkey 2>/dev/null | openssl sha256)"
  kh="$(openssl pkey -in "$key" -pubout 2>/dev/null | openssl sha256)"
  if [ -z "$ch" ] || [ "$ch" != "$kh" ]; then
    err "Zertifikat und Schluessel gehoeren nicht zusammen"; bad=1
  fi

  # Noch lange genug gültig?
  if ! openssl x509 -in "$cert" -noout -checkend "$((MIN_DAYS * 86400))" > /dev/null 2>&1; then
    err "Zertifikat laeuft in weniger als ${MIN_DAYS} Tag(en) ab — wird nicht eingespielt"; bad=1
  fi

  # Deckt es den Mailhostnamen ab? Ohne das meldet jeder Client einen
  # Namensfehler, obwohl das Zertifikat formal gültig ist.
  local sans
  sans="$(openssl x509 -in "$cert" -noout -ext subjectAltName 2>/dev/null \
          | tr ',' '\n' | sed -n 's/.*DNS://p' | tr -d ' ' | paste -sd' ' -)"
  if ! echo " $sans " | grep -qi " ${MAIL_HOST} "; then
    err "${MAIL_HOST} steckt nicht im SAN (gefunden: ${sans:-<keine>})"; bad=1
  fi

  # Selbstsigniert? Dann kopieren wir gerade Mailcows eigenes Platzhalter-
  # zertifikat über ein womöglich gutes drüber.
  local subj iss
  subj="$(openssl x509 -in "$cert" -noout -subject 2>/dev/null | sed 's/^subject= *//')"
  iss="$(openssl x509 -in "$cert" -noout -issuer 2>/dev/null | sed 's/^issuer= *//')"
  if [ -n "$subj" ] && [ "$subj" = "$iss" ]; then
    err "Zertifikat ist selbstsigniert — das ist kein Let's-Encrypt-Zertifikat"; bad=1
  fi

  # Kette vollständig? Ein fehlendes Intermediate bricht Android- und
  # Java-Clients, während Desktop-Clients noch funktionieren.
  local n
  n="$(grep -c 'BEGIN CERTIFICATE' "$cert" 2>/dev/null || true)"
  n="${n:-0}"
  if [ "$n" -lt 2 ]; then
    err "Kette unvollstaendig (nur ${n} Zertifikat) — fullchain.pem erwartet"; bad=1
  fi

  return "$bad"
}

# Container einer mailcow-Compose-Rolle finden. Über die Labels, nicht über
# den Namen: der Projektpräfix hängt am Verzeichnisnamen und ändert sich,
# wenn jemand mailcow umzieht.
container_of() {
  local svc="$1" cid
  cid="$(docker ps -q \
          --filter "label=com.docker.compose.project=${COMPOSE_PROJECT}" \
          --filter "label=com.docker.compose.service=${svc}" 2>/dev/null | head -n1)"
  if [ -z "$cid" ]; then
    cid="$(docker ps -q --filter "name=${svc}" 2>/dev/null | head -n1)"
  fi
  echo "$cid"
}

# Neu laden statt neu starten: Postfix und Dovecot lesen die Zertifikate
# beim Reload neu ein, bestehende Verbindungen bleiben stehen. Ein restart
# würde jede laufende IMAP-Sitzung abreißen.
reload_service() {
  local svc="$1"; shift
  local cid; cid="$(container_of "$svc")"
  if [ -z "$cid" ]; then
    warn "${svc}: kein laufender Container — uebersprungen"
    return 0
  fi
  if docker exec "$cid" "$@" > /dev/null 2>&1; then
    ok "${svc} neu geladen"
    return 0
  fi
  warn "${svc}: Reload fehlgeschlagen"
  return 1
}

restart_service() {
  local svc="$1"
  local cid; cid="$(container_of "$svc")"
  [ -z "$cid" ] && return 0
  docker restart "$cid" > /dev/null 2>&1 && ok "${svc} neu gestartet"
  return 0
}

# Was liefert der Port WIRKLICH aus? Die Datei auf der Platte sagt nichts
# darüber, was der laufende Prozess im Speicher hält — genau diese Lücke
# hat den nginx schon einmal ein abgelaufenes Zertifikat ausliefern lassen.
live_fingerprint() {
  local port="$1"
  echo | timeout 15 openssl s_client -connect "${MAIL_HOST}:${port}" \
       -servername "${MAIL_HOST}" 2>/dev/null \
    | openssl x509 -noout -fingerprint -sha256 2>/dev/null | cut -d= -f2
}

# Mailcows eigenes ACME muss aus bleiben, sonst überschreibt es unsere
# Kopie beim nächsten Versuch wieder mit einem selbstsignierten Zertifikat.
# Ein mailcow-Update kann die Einstellung zurücksetzen — deshalb wird sie
# bei jedem Lauf nachgezogen statt einmalig gesetzt.
#
# Zweiter Stolperstein: docker compose restart liest die Umgebung NICHT neu
# ein. Steht in der Datei y, im laufenden Container aber n, muss der
# Container neu erzeugt werden.
enforce_skip_lets_encrypt() {
  local dir="$1" conf="$1/mailcow.conf"

  if ! grep -qE '^SKIP_LETS_ENCRYPT=y' "$conf" 2>/dev/null; then
    warn "SKIP_LETS_ENCRYPT steht nicht auf y — wird korrigiert"
    cp -a "$conf" "${conf}.bak-$(date +%Y%m%d-%H%M%S)"
    if grep -qE '^SKIP_LETS_ENCRYPT=' "$conf"; then
      sed -i 's/^SKIP_LETS_ENCRYPT=.*/SKIP_LETS_ENCRYPT=y/' "$conf"
    else
      echo 'SKIP_LETS_ENCRYPT=y' >> "$conf"
    fi
    ok "SKIP_LETS_ENCRYPT=y in mailcow.conf gesetzt"
  fi

  local cid; cid="$(container_of acme-mailcow)"
  [ -z "$cid" ] && return 0
  local running
  running="$(docker exec "$cid" sh -c 'echo "$SKIP_LETS_ENCRYPT"' 2>/dev/null)"
  if [ "$running" != "y" ]; then
    warn "acme-Container laeuft noch mit SKIP_LETS_ENCRYPT=${running:-?} — wird neu erzeugt"
    if ( cd "$dir" && docker compose up -d acme-mailcow ) > /dev/null 2>&1; then
      ok "acme-mailcow neu erzeugt"
    else
      warn "acme-mailcow konnte nicht neu erzeugt werden"
    fi
  fi
  return 0
}

# ───────────────────────────────────────────────────────────────────
# Hauptlauf
# ───────────────────────────────────────────────────────────────────
main() {
  log "=== mailcow-cert-sync ==="

  command -v docker  > /dev/null 2>&1 || { err "docker nicht gefunden"; return 1; }
  command -v openssl > /dev/null 2>&1 || { err "openssl nicht gefunden"; return 1; }

  # --- mailcow finden ---------------------------------------------
  if [ -z "${MAILCOW_DIR:-}" ]; then
    for d in /opt/mailcow-dockerized /opt/mailcow /root/mailcow-dockerized; do
      if [ -f "$d/mailcow.conf" ]; then MAILCOW_DIR="$d"; break; fi
    done
  fi
  if [ -z "${MAILCOW_DIR:-}" ] || [ ! -f "${MAILCOW_DIR}/mailcow.conf" ]; then
    err "mailcow.conf nicht gefunden — MAILCOW_DIR setzen"; return 1
  fi
  local SSL_DIR="${MAILCOW_DIR}/data/assets/ssl"
  [ -d "$SSL_DIR" ] || { err "ssl-Verzeichnis fehlt: $SSL_DIR"; return 1; }

  local proj
  proj="$(grep -E '^COMPOSE_PROJECT_NAME=' "${MAILCOW_DIR}/mailcow.conf" 2>/dev/null \
          | cut -d= -f2- | tr -d '"' | tr -d "'")"
  COMPOSE_PROJECT="${proj:-mailcowdockerized}"
  log "mailcow: ${MAILCOW_DIR} (Projekt ${COMPOSE_PROJECT})"

  # --- certbot-Volume finden --------------------------------------
  local cert_vol le_root le_dir
  cert_vol="$(docker volume ls -q --filter name=certbot-etc 2>/dev/null | head -n1)"
  if [ -z "$cert_vol" ]; then
    err "Kein certbot-etc-Volume gefunden — laeuft der Shop-Stack?"; return 1
  fi
  le_root="$(docker volume inspect -f '{{.Mountpoint}}' "$cert_vol" 2>/dev/null)"
  if [ -z "$le_root" ] || [ ! -d "$le_root" ]; then
    err "Volume ${cert_vol} nicht lesbar"; return 1
  fi

  le_dir="${le_root}/live/${CERT_NAME}"
  # certbot hängt bei Neuausstellungen -0001 an den Namen. Dann ist der
  # erwartete Pfad weg und wir suchen die Linie, die mail.* abdeckt —
  # sonst synchronisieren wir stillschweigend ein totes Zertifikat.
  if [ ! -f "${le_dir}/fullchain.pem" ]; then
    warn "live/${CERT_NAME} fehlt — suche passende Zertifikatslinie"
    local cand
    for cand in "${le_root}"/live/*/; do
      [ -f "${cand}fullchain.pem" ] || continue
      if openssl x509 -in "${cand}fullchain.pem" -noout -ext subjectAltName 2>/dev/null \
           | grep -qi "DNS:${MAIL_HOST}"; then
        le_dir="${cand%/}"
        log "gefunden: ${le_dir}"
        break
      fi
    done
  fi
  if [ ! -f "${le_dir}/fullchain.pem" ]; then
    err "Kein Let's-Encrypt-Zertifikat fuer ${MAIL_HOST} im Volume ${cert_vol}"; return 1
  fi

  local src_cert="${le_dir}/fullchain.pem"
  local src_key="${le_dir}/privkey.pem"

  # --- Quelle prüfen, bevor irgendetwas angefasst wird -------------
  if ! validate_pair "$src_cert" "$src_key"; then
    err "Quellzertifikat hat die Pruefung nicht bestanden — nichts geaendert"
    return 1
  fi
  ok "Quellzertifikat geprueft (gueltig bis $(openssl x509 -in "$src_cert" -noout -enddate | cut -d= -f2))"

  # --- Abgleich ----------------------------------------------------
  local src_fp dst_fp
  src_fp="$(fingerprint "$src_cert")"
  dst_fp="$(fingerprint "${SSL_DIR}/cert.pem")"

  if [ "$CHECK_ONLY" -eq 1 ]; then
    if [ "$src_fp" = "$dst_fp" ]; then
      ok "Mailcow ist aktuell"
      return 0
    fi
    warn "Mailcow hinkt hinterher (Platte ${dst_fp:-<keins>} statt ${src_fp})"
    return 2
  fi

  if [ "$src_fp" = "$dst_fp" ] && [ "$FORCE" -eq 0 ]; then
    ok "Zertifikat unveraendert — nichts zu tun"
    enforce_skip_lets_encrypt "$MAILCOW_DIR"
    return 0
  fi

  log "Neues Zertifikat: ${dst_fp:-<keins>} -> ${src_fp}"

  if [ "$DRY_RUN" -eq 1 ]; then
    warn "--dry-run: hier wuerde kopiert und neu geladen"
    return 0
  fi

  # --- Sicherung ---------------------------------------------------
  local ts; ts="$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  if [ -f "${SSL_DIR}/cert.pem" ]; then
    cp -a "${SSL_DIR}/cert.pem" "${BACKUP_DIR}/cert.pem.bak-${ts}" 2>/dev/null
    cp -a "${SSL_DIR}/key.pem"  "${BACKUP_DIR}/key.pem.bak-${ts}"  2>/dev/null
    log "Sicherung: ${BACKUP_DIR}/*.bak-${ts}"
  fi
  # Alte Sicherungen abräumen, sonst läuft die Platte in Jahren voll.
  ls -1t "${BACKUP_DIR}"/cert.pem.bak-* 2>/dev/null | tail -n "+$((KEEP_BACKUPS + 1))" | xargs -r rm -f
  ls -1t "${BACKUP_DIR}"/key.pem.bak-*  2>/dev/null | tail -n "+$((KEEP_BACKUPS + 1))" | xargs -r rm -f

  # --- Einspielen (atomar) -----------------------------------------
  # Erst danebenlegen, dann umbenennen: mv innerhalb desselben Dateisystems
  # ist atomar. Ein Absturz mitten im cp wuerde sonst ein halbes Zertifikat
  # hinterlassen, mit dem Postfix nicht mehr startet.
  # cp -L, weil live/ nur Symlinks nach archive/ enthaelt.
  if ! cp -L "$src_cert" "${SSL_DIR}/.cert.pem.new" \
     || ! cp -L "$src_key" "${SSL_DIR}/.key.pem.new"; then
    err "Kopieren fehlgeschlagen"
    rm -f "${SSL_DIR}/.cert.pem.new" "${SSL_DIR}/.key.pem.new"
    return 1
  fi

  # Sicherheitsnetz: das, was wir gerade geschrieben haben, noch einmal
  # prüfen — nicht die Quelle.
  if ! validate_pair "${SSL_DIR}/.cert.pem.new" "${SSL_DIR}/.key.pem.new"; then
    err "Kopie hat die Pruefung nicht bestanden — nichts geaendert"
    rm -f "${SSL_DIR}/.cert.pem.new" "${SSL_DIR}/.key.pem.new"
    return 1
  fi

  chmod 644 "${SSL_DIR}/.cert.pem.new"
  chmod 600 "${SSL_DIR}/.key.pem.new"
  mv -f "${SSL_DIR}/.cert.pem.new" "${SSL_DIR}/cert.pem"
  mv -f "${SSL_DIR}/.key.pem.new"  "${SSL_DIR}/key.pem"
  ok "Zertifikat eingespielt"

  # --- Neu laden ---------------------------------------------------
  reload_service postfix-mailcow postfix reload
  reload_service dovecot-mailcow doveadm reload
  local ncid; ncid="$(container_of nginx-mailcow)"
  if [ -n "$ncid" ]; then
    if docker exec "$ncid" nginx -t > /dev/null 2>&1; then
      reload_service nginx-mailcow nginx -s reload
    else
      warn "nginx-mailcow: Konfiguration fehlerhaft — Reload uebersprungen"
    fi
  fi

  # --- Gegenprobe am echten Port -----------------------------------
  local attempt live465 live993
  live465=""; live993=""
  for attempt in 1 2 3; do
    sleep 3
    live465="$(live_fingerprint 465)"
    live993="$(live_fingerprint 993)"
    if [ "$live465" = "$src_fp" ] && [ "$live993" = "$src_fp" ]; then break; fi
  done

  if [ "$live465" = "$src_fp" ] && [ "$live993" = "$src_fp" ]; then
    ok "SMTPS (465) und IMAPS (993) liefern das neue Zertifikat aus"
  else
    warn "Reload hat nicht gegriffen — eskaliere auf Neustart"
    restart_service postfix-mailcow
    restart_service dovecot-mailcow
    for attempt in 1 2 3 4 5; do
      sleep 4
      live465="$(live_fingerprint 465)"
      live993="$(live_fingerprint 993)"
      if [ "$live465" = "$src_fp" ] && [ "$live993" = "$src_fp" ]; then break; fi
    done
    if [ "$live465" = "$src_fp" ] && [ "$live993" = "$src_fp" ]; then
      ok "Nach Neustart: neues Zertifikat wird ausgeliefert"
    else
      # Bewusst KEIN Rollback: das eingespielte Zertifikat ist geprüft
      # gültig, das alte wäre abgelaufen oder selbstsigniert. Zurückrollen
      # würde die Lage verschlechtern. Stattdessen laut scheitern, damit
      # Timer und Workflow Alarm schlagen.
      err "Ports liefern weiter ein anderes Zertifikat aus (465=${live465:-?} 993=${live993:-?})"
      err "Datei ist korrekt eingespielt — mailcow bitte von Hand pruefen."
      return 1
    fi
  fi

  enforce_skip_lets_encrypt "$MAILCOW_DIR"
  ok "fertig"
  return 0
}

# ───────────────────────────────────────────────────────────────────
# Nur ein Lauf gleichzeitig. Der Timer könnte sonst einen langen Lauf
# überholen und mitten im Einspielen ein zweites Mal kopieren.
# ───────────────────────────────────────────────────────────────────
if command -v flock > /dev/null 2>&1; then
  if ! exec 9> /run/mailcow-cert-sync.lock; then
    :
  fi
  flock -n 9 2>/dev/null || { echo "laeuft bereits — abgebrochen"; exit 0; }
fi

# Ausgabe in die Logdatei spiegeln, ohne dass das Skript vor dem Schreiben
# endet (deshalb Pipe statt Prozess-Substitution).
if [ -n "$LOG_FILE" ] && { : >> "$LOG_FILE"; } 2>/dev/null; then
  main 2>&1 | tee -a "$LOG_FILE"
  exit "${PIPESTATUS[0]}"
else
  main
fi
