# Mail-Zustellung: T-Online blockiert unseren Server

## Das Symptom

Postfix hält Mails an `@t-online.de`-Empfänger zurück und schickt nach vier
Stunden eine Warnung; nach fünf Tagen verfällt die Mail endgültig:

```
<empfaenger@t-online.de>: host mx03.t-online.de[194.25.134.73] refused to
    talk to me: 554 IP=152.53.138.135 - None/bad reputation. Ask your
    postmaster for help or to contact tobr@rx.t-online.de for reset. (NOWL)
```

## Was das bedeutet — und was nicht

`NOWL` heißt **not on whitelist**. T-Online nimmt Mail nur von Servern an, die
es bereits kennt: eine neue IP — oder eine, die lange nicht gesendet hat — wird
schon beim Verbindungsaufbau abgewiesen, noch bevor Absender, Empfänger oder
Inhalt übertragen sind. `None` in der Meldung ist genau das: **keine**
Reputation, nicht schlechte.

Daraus folgt, was hier **nicht** hilft: am Mailtext feilen, DKIM neu erzeugen,
den Absender wechseln, oder wiederholt neu senden. Letzteres schadet sogar,
weil die Verbindungsversuche mitgezählt werden. Der Block löst sich nicht von
selbst; er muss bei T-Online zurückgesetzt werden.

## Stand der eigenen Voraussetzungen

Geprüft am 2026-07-29 gegen die öffentliche DNS-Ansicht der Domain:

| Prüfpunkt              | Ist-Zustand                                                     | Bewertung |
| ---------------------- | --------------------------------------------------------------- | --------- |
| PTR IPv4               | `152.53.138.135` → `mail.bikehausfreiburg.com`, A zeigt zurück  | erfüllt   |
| PTR IPv6               | `2a0a:4cc0:c0:f8ef:248b:5bff:fe46:21af` → derselbe Name, AAAA zurück | erfüllt |
| Hostname als Mailserver erkennbar | `mail.` in eigener Domain                            | erfüllt   |
| MX                     | `10 mail.bikehausfreiburg.com`                                  | erfüllt   |
| SPF                    | `v=spf1 mx a:mail.bikehausfreiburg.com ip4:152.53.138.135 ip6:… ~all` | erfüllt |
| DKIM                   | Selektor `dkim`, RSA 2048                                       | erfüllt   |
| DMARC                  | `p=quarantine; sp=quarantine; rua/ruf=postmaster@…; pct=100`     | erfüllt   |
| Blacklists             | Spamhaus ZEN, SpamCop, Barracuda, SORBS, PSBL, UCEPROTECT, Backscatterer, Mailspike — alle sauber | erfüllt |
| Website mit Impressum hinter der PTR-Domain | https://bikehausfreiburg.com/de/impressum        | erfüllt   |

Es ist also technisch nichts zu reparieren. Was fehlt, ist die Freischaltung
bei T-Online.

Optional und nicht gefordert, aber es schadet der Reputation bei anderen
Providern nicht: `~all` → `-all` im SPF, sobald sicher ist, dass keine dritte
Quelle mehr in unserem Namen sendet, sowie MTA-STS und TLS-RPT (beide aktuell
nicht vorhanden).

## Vorgehen

### 1. Zustand feststellen

Actions → **Mailcow T-Online Reputation** → `action: diagnose`
([Workflow](../.github/workflows/mailcow-tonline-reputation.yml)).

Der Lauf prüft alle Punkte der Tabelle oben auf dem Server selbst, verbindet
sich live mit `mx00`–`mx03.t-online.de` auf Port 25 (getrennt über IPv4 und
IPv6) und schreibt die Begrüßungszeile mit — daran ist zweifelsfrei zu sehen,
ob der Block noch steht. Am Ende druckt er den Antragstext mit den echten
Werten des Servers. Exit-Code 1 heißt: eine Voraussetzung fehlt, erst die
beheben.

### 2. Freischaltung beantragen

Den Antragstext aus dem Workflow-Log an **tobr@rx.t-online.de** senden.

Wichtig: **nicht vom eigenen Server aus.** `rx.t-online.de` liegt bei T-Online,
unsere IP ist dort blockiert — die Anfrage käme nicht an. Also aus einem
Postfach senden, das nicht betroffen ist (z. B. Gmail), und
`postmaster@bikehausfreiburg.com` als Antwortadresse angeben. Dieses Postfach
muss gelesen werden: T-Online antwortet dorthin und fragt gelegentlich nach.

Erfahrungswert aus Betreiberberichten: Antwort in ein bis drei Werktagen.

### 3. Nachfassen

Nach der Bestätigung erneut `action: diagnose` laufen lassen. Sobald die MX mit
`220` grüßen, `action: flush-queue` starten: das ruft `postqueue -f` und liefert
die zurückgehaltenen Mails sofort aus, statt auf das nächste Retry-Intervall zu
warten. Wichtig innerhalb der Fünf-Tage-Frist — danach sind die Mails weg und
müssen inhaltlich neu geschrieben werden.

## Überbrückung, solange der Block steht

Die API holt ihre SMTP-Zugangsdaten komplett aus der Umgebung
([docker-compose.yml](../docker-compose.yml), `Smtp__*`). Ein Relay mit
etablierter Reputation ist deshalb eine `.env`-Änderung, kein Code-Eingriff:

```
SMTP_HOST=<relay-host>
SMTP_PORT=587
SMTP_USERNAME=<relay-user>
SMTP_PASSWORD=<relay-pass>
SMTP_FROMEMAIL=no-reply@bikehausfreiburg.com
```

Zwei Bedingungen: die Absenderdomain bleibt `bikehausfreiburg.com`, also muss
der Relay in SPF aufgenommen und für DKIM-Signierung eingerichtet sein, sonst
scheitert es an DMARC. Und es betrifft nur die Mails der API — was Mitarbeiter
über SOGo/Webmail schreiben, geht weiter direkt über Mailcow hinaus und bleibt
blockiert.

## Damit es nicht wiederkommt

T-Online setzt die Reputation einer IP zurück, die sehr lange nichts gesendet
hat — die Freischaltung ist also nicht endgültig. Wenn Kundenmails an
`@t-online.de` (oder `@magenta.de`, `@telekom.de`) wieder hängen, ist der erste
Griff `action: diagnose`; steht dort wieder `None/bad reputation`, dann denselben
Antrag erneut stellen. Der Rest der Diagnose (`mailcow-deliverability-check.yml`)
bleibt für die allgemeinen Spam-Fragen zuständig, dieser Workflow ist
ausschließlich für T-Online.
