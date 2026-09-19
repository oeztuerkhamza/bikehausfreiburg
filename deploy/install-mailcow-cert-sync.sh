#!/bin/bash
#
# Richtet mailcow-cert-sync als systemd-Timer auf dem VPS ein.
#
# Warum ein Timer und kein certbot-deploy-hook:
#   Der deploy-hook liefe IM certbot-Container. Der sieht Mailcows
#   ssl-Verzeichnis nicht und kann keine Container neu laden. Ein Hook
#   verschwindet außerdem, sobald der Container neu erzeugt wird.
#   Der Timer auf dem Host überlebt Container-Neubauten, mailcow-Updates
#   und manuelle Neuausstellungen — und weil das Skript idempotent ist,
#   kostet ein Lauf ohne Änderung praktisch nichts.
#
# Stündlich statt täglich: certbot erneuert 30 Tage vor Ablauf, ein
# verpasster Tag wäre also harmlos. Stündlich sorgt aber dafür, dass eine
# Neuausstellung von Hand (deploy/setup-ssl.sh, ssl-ops reissue) ohne
# Nachdenken innerhalb einer Stunde bei mailcow ankommt.
#
# Idempotent — beliebig oft ausführbar.
#
# Verwendung (auf dem Server, als root):
#   deploy/install-mailcow-cert-sync.sh
#
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mailcow-cert-sync.sh"
DEST="/usr/local/sbin/mailcow-cert-sync.sh"
UNIT_DIR="/etc/systemd/system"

if [ "$(id -u)" -ne 0 ]; then
  echo "Muss als root laufen." >&2
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "Skript nicht gefunden: $SRC" >&2
  exit 1
fi

echo "==> Skript nach ${DEST} kopieren"
install -m 0755 "$SRC" "$DEST"

echo "==> systemd-Unit schreiben"
cat > "${UNIT_DIR}/mailcow-cert-sync.service" <<'UNIT'
[Unit]
Description=Mailcow-Zertifikat mit Let's Encrypt abgleichen
Documentation=https://github.com/bikehausfreiburg
# Ohne Docker kein Volume und keine Container zum Neuladen.
After=docker.service network-online.target
Wants=network-online.target
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/mailcow-cert-sync.sh
# Der Lauf kann bis zu ~40 s dauern (Reload + Gegenprobe an zwei Ports).
TimeoutStartSec=300
# Kein Restart=: schlägt der Lauf fehl, soll der naechste Timer-Tick es
# erneut versuchen, statt in einer Schleife gegen ein kaputtes Zertifikat
# zu laufen. Der Fehler bleibt im Journal sichtbar.
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
UNIT

cat > "${UNIT_DIR}/mailcow-cert-sync.timer" <<'UNIT'
[Unit]
Description=Mailcow-Zertifikat stuendlich abgleichen

[Timer]
OnBootSec=5min
OnUnitActiveSec=1h
# Persistent: war der Server aus, wird der verpasste Lauf nachgeholt.
Persistent=true
# Streut die Last, damit nicht alle Timer zur vollen Stunde loslaufen.
RandomizedDelaySec=5min
Unit=mailcow-cert-sync.service

[Install]
WantedBy=timers.target
UNIT

echo "==> Logrotation einrichten"
cat > /etc/logrotate.d/mailcow-cert-sync <<'ROTATE'
/var/log/mailcow-cert-sync.log {
    monthly
    rotate 6
    compress
    missingok
    notifempty
    copytruncate
}
ROTATE

echo "==> Timer aktivieren"
systemctl daemon-reload
systemctl enable --now mailcow-cert-sync.timer

echo ""
echo "==> Erster Lauf"
systemctl start mailcow-cert-sync.service || true
systemctl status mailcow-cert-sync.service --no-pager -l | sed 's/^/  /' || true

echo ""
echo "==> Naechster Termin"
systemctl list-timers mailcow-cert-sync.timer --no-pager | sed 's/^/  /'

echo ""
echo "[OK] eingerichtet."
echo "    Log     : journalctl -u mailcow-cert-sync -n 50"
echo "              /var/log/mailcow-cert-sync.log"
echo "    Pruefen : ${DEST} --check"
