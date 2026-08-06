# Fahrrad-Buchungsablauf (Miete)

Stand: August 2026. Dieses Dokument beschreibt, was **tatsächlich** läuft — eine
frühere Version beschrieb einen 5-Schritte-Entwurf mit Freigabe durch den Laden,
den es so nicht mehr gibt.

Code: [rental-booking-steps.component.ts](BikeHaus.Homepage/src/app/pages/fahrradverleih/rental-booking-steps.component.ts)
(Template, Styles und Logik in einer Datei), eingebettet über
[rental-booking-page.component.ts](BikeHaus.Homepage/src/app/pages/fahrradverleih/rental-booking-page.component.ts).
Route: `/:lang/fahrradverleih/buchen` (EN `bike-rental`, FR `location-velo`).

---

## Schritte

Der Ablauf hat acht Zustände. Sie stehen als `?step=` in der URL, damit der
Zurück-Button einen Schritt zurückgeht statt die Seite zu verlassen:

| `?step=` | Inhalt |
| --- | --- |
| _(keiner)_ `date-selection` | Kalender: Start- und Endtag antippen |
| `bike-selection` | Verfügbare Räder, Filter nach Typ und Körpergröße |
| `bike-details` | Bilder (Lightbox mit Pinch-Zoom), Maße, Preis, Kaution |
| `choose-next` | Rad ist drin — weiter oder noch ein Rad dazu |
| `accessory-selection` | Optionales Zubehör mit Mengen |
| `customer-info` | Kontaktdaten, Adresse, **Abholzeit** |
| `review` | Übersicht, Bedingungen bestätigen, absenden |
| `success` | Buchungsnummer, Bestätigungsmail ist unterwegs |

`resolveStep()` stuft einen Schritt zurück, dessen Voraussetzungen fehlen (Link
auf `review` ohne Räder → Kalender). Nach erfolgreicher Buchung führt kein
History-Eintrag zurück in die Formulare — sonst entstünden Doppelbuchungen.

## Kalender

- Frühester Tag ist **heute**; Sonntage, Feiertage in Baden-Württemberg
  (inkl. beweglicher, aus dem Osterdatum gerechnet) und Betriebsferien aus
  [rental-closures.ts](BikeHaus.Homepage/src/app/utils/rental-closures.ts) sind
  nicht wählbar. Ein Zeitraum darf eine Schließzeit auch nicht überspannen.
- Über einen Sonntag hinweg zu mieten ist erlaubt — nur Abholung und Rückgabe
  brauchen einen offenen Tag.
- **Heute fällt aus der Auswahl, sobald keine Abholzeit mehr übrig ist**
  (`isSelectableCalendarDay()` fragt `slotsForDateKey()`), damit niemand erst im
  Formular in einer Sackgasse landet.

## Abholzeiten

30-Minuten-Raster aus den Übergabezeiten des Laden: Mo–Do 10:00–17:30,
Fr 10:00–12:30 und 15:00–17:30 (Mittagspause), Sa 11:00–17:30, So zu. Für **heute**
fallen Zeiten weg, die weniger als 30 Minuten entfernt sind
(`SAME_DAY_LEAD_MINUTES`). Die Abholzeit ist ein Pflichtfeld.

## Räder, Preise, Kaution

- Verfügbarkeit kommt aus `GET /api/public/rentals/bikes/available?startDate=&endDate=`
  und wird bei jedem Zeitraumwechsel neu geholt.
- **Kinderräder** (`Art`/`Fahrradtyp` enthält "Kinder") sind gepoolte Anzeigen:
  sie bleiben mehrfach buchbar und werden von der Überschneidungsprüfung
  ausgenommen — das konkrete Rad wird im Laden zugeordnet.
- Preise rechnet der Client mit [rental-pricing.ts](BikeHaus.Homepage/src/app/utils/rental-pricing.ts),
  der Server mit [RentalPricingCalculator.cs](BikeHaus.Application/Services/RentalPricingCalculator.cs)
  — dieselbe Staffel-Logik (exakter Tagespreis, sonst nächster konfigurierter,
  sonst letzter darunter, über 7 Tage `day7 + Zusatztage`). **Beide Seiten müssen
  gleich bleiben**, sonst zeigt die Seite etwas anderes als im Vertrag steht.
- Alle Beträge laufen über `formatPrice()` (`Intl.NumberFormat`, Sprache des
  Besuchers). Kein `€{{ … }}` im Template.
- Die **Kaution** kommt aus dem Bestand und wird nicht mitgesendet: der Server
  setzt `bicycle.Kaution` selbst ein. Ist keine gepflegt, wird auch keine
  genannt (früher stand hier ein erfundener Ersatzwert von 300 €).
- Einmaliges Zubehör (Verbrauchsmaterial) geht **nicht** in den Buchungspreis
  ein — ob es verbraucht wurde, steht erst bei der Rückgabe fest. Server und
  Client rechnen hier gleich.

## Zwischenstand

Der Inhalt der Buchung liegt als Entwurf im `sessionStorage`
(`bikehaus-rental-booking-draft`, 12 Stunden haltbar). Gespeichert wird bei jedem
Schrittwechsel, bei Änderungen am Warenkorb/Zubehör und wenn die Seite in den
Hintergrund geht (`visibilitychange`, `pagehide`). Beim Wiederherstellen wird die
Verfügbarkeit **neu geholt**; inzwischen vergriffene Räder fallen mit Hinweis aus
dem Warenkorb. Vom Warenkorb wird nur die Fahrrad-ID gemerkt, nie die Stammdaten.

## Absenden

`POST /api/public/rentals/bookings` →
[RentalBookingService.CreateAsync](BikeHaus.Application/Services/RentalBookingService.cs).

- Der Server prüft Mietbarkeit und Überschneidungen (bestätigte **und** offene
  Buchungen) und legt die Buchung **direkt als `Approved`** an. Es gibt keine
  Freigabe durch den Laden mehr; die Prüfung verhindert die Doppelbelegung.
- Fehler `409` (Zeitraum inzwischen belegt) und `404` (Rad/Zubehör weg) sind kein
  Formularfehler: der Client lädt die Verfügbarkeit neu, nimmt die vergriffenen
  Räder aus dem Warenkorb und schickt den Gast mit Begründung
  (`rentalSteps.bookingConflict`) zurück in die Auswahl.
- Bestätigungsmail geht an die angegebene Adresse; Storno durch den Kunden läuft
  über den Link darin (`PublicRentalsController`, `bookings/cancel` zeigt nur eine
  Bestätigungsseite, storniert wird per POST — E-Mail-Scanner rufen Links sonst
  von allein auf).

## i18n

Keine Sprachdateien: alle Texte stehen in
[translation.service.ts](BikeHaus.Homepage/src/app/services/translation.service.ts).
Die Schlüssel des Ablaufs liegen in `RENTAL_STEPS_TRANSLATIONS` und sind in
**allen** dort geführten Sprachen zu ergänzen (de, en, fr, tr, es, it, ar, ru, nl,
da, no, pl). Im Template steht immer `t().rentalSteps?.key ?? 'deutscher Fallback'`.

## Nach der Buchung

- **Erfolgsseite**: Kalendereintrag (.ics, im Browser erzeugt), Adresse mit
  Kartenlink und `tel:`-Nummer aus dem `ShopInfoService` (nicht hartcodiert),
  Hinweis, dass die Buchung sofort bestätigt ist, und ein Link auf die
  Verwaltungsseite.
- **Seite "Buchung verwalten"** (`/:lang/buchung`, EN `manage-booking`, Slugs für
  alle 12 Sprachen in `language-config.ts`): Buchungsnummer + E-Mail →
  `POST /api/public/rentals/bookings/lookup` (**nebenwirkungsfrei**) → Ansicht →
  Storno erst nach bewusster Rückfrage. `noindex`, nicht im Prerender und nicht
  in der Sitemap.
  - Buchungsnummer und E-Mail wandern von der Erfolgsseite über
    [booking-handoff.ts](BikeHaus.Homepage/src/app/utils/booking-handoff.ts)
    (sessionStorage, wird beim Lesen geleert) — **nicht** über Query-Parameter:
    in der URL stünde die Adresse des Gasts im Browserverlauf und in jedem
    geteilten Link.
  - Kein Auskunfts-Orakel: unbekannte Buchungsnummer und nicht passende E-Mail
    liefern serverseitig dieselbe Antwort (404, gleicher Text) und im Frontend
    dieselbe Meldung. Gilt auch für den Storno-Endpunkt.
  - Storniert oder Zeitraum vorbei → kein Storno-Knopf, nur ein erklärender
    Hinweis.
- **Erinnerung vor der Abholung**: `RentalBookingReminderBackgroundService`
  (stündlich) schickt am Tag vor `StartDatum` eine Erinnerung, einmalig
  abgesichert über `RentalBooking.ErinnerungGesendetAm`.
- **Bewertungsanfrage**: `ReviewAutomationBackgroundService`. Bei Mieten am Tag
  **nach** dem Mietende ab 8 Uhr Ortszeit (Anker: `RueckgabeAt`, sonst
  `EndDatum`), bei Verkäufen unverändert `DelayHours` nach `CreatedAt`. Beide
  laufen über das gemeinsame Gate in `CampaignService` (Abmeldung,
  Mindestabstand, Obergrenze pro Adresse).
- Alle automatischen Mails senden nur innerhalb von
  [ShopSendWindow](BikeHaus.Domain/ShopSendWindow.cs) (8–20 Uhr Ortszeit, über
  `ShopClock` gerechnet — der Container läuft in UTC). **Die Untergrenze des
  Fensters muss zur Fälligkeit der Bewertungsanfrage passen**: liegt sie später,
  verschiebt das Fenster die Regel still nach hinten.

## Offene Punkte

- Pflichtfelder im Formular sind reichlich (Telefon, Straße, Hausnummer, PLZ, Ort)
  — bewusste Entscheidung des Inhabers, aber der wahrscheinlichste Hebel für mehr
  abgeschlossene Buchungen.
- Keine Vorauszahlung: ein No-Show blockiert ein Rad umsonst (Mollie ist im
  Verkauf schon angebunden).
- `RentalBookingService.NormalizeLanguage` reduziert die Sprache einer Buchung auf
  `de`/`en`. Die Oberfläche führt 12 Sprachen, die Mails also nicht: ein
  französischer oder türkischer Gast bekommt Deutsch.
