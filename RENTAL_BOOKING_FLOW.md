# Schritt-für-Schritt Fahrrad-Buchungssystem

## Überblick

Das neue Rental Booking Steps System wurde implementiert, um Kunden einen geführten Buchungsprozess für Mietfahrräder zu bieten. Das System führt den Kunden durch folgende 5 Schritte:

## Implementierte Schritte

### Schritt 1: Datumswahl (Date Selection)

- Kunde wählt Startdatum und Enddatum
- Validierung: Enddatum muss nach Startdatum liegen
- Mindestdatum: Morgen (nicht heute)

### Schritt 2: Fahrradwahl (Bike Selection)

- Nach Datumswahl: API prüft Verfügbarkeit für den gewählten Zeitraum
- Nur verfügbare Fahrräder werden angezeigt
- Grid-Ansicht mit Bildern, Typ und Preisinformation
- Responsive Design für Mobile und Desktop

### Schritt 3: Fahrraddetails (Bike Details)

- Große Bilder mit Thumbnails
- Spezifikationen (Typ, Rahmengröße, Reifengröße, Farbe)
- Preisberechnung für die gewählten Tage
- Kaution-Informationen
- Optional: Rahmennummer eingeben
- Optional: Farbe wählen

### Schritt 4: Kundeninformationen (Customer Info)

- Warenkorb-Übersicht der gewählten Fahrräder
- Möglichkeit, weitere Fahrräder hinzuzufügen
- Kundenformular mit Feldern:
  - Vorname (erforderlich)
  - Nachname (erforderlich)
  - E-Mail (erforderlich)
  - Telefon (optional)
  - Straße, Hausnummer, PLZ, Stadt (optional)
  - Notizen (optional)

### Schritt 5: Übersicht & Bestätigung (Review & Confirm)

- Fahrraddetails-Übersicht
- Kontaktinformationen
- Preisübersicht (Gesamtmiete + Gesamtkaution)
- Info-Hinweis zur Kaution
- Bestätigungsbutton

### Erfolgsseite (Success)

- Bestätigung der erfolgreichen Buchung
- Buchungsnummer anzeigen
- Bestätigungsmail-Versand-Bestätigung
- Button für neue Buchung

## Technische Implementierung

### Neue Dateien

1. **Frontend**: `BikeHaus.Homepage/src/app/pages/fahrradverleih/rental-booking-steps.component.ts`
   - Standalone Angular Component
   - State Management mit Signals
   - Responsive Styles

### Neue API Endpoints

#### GET `/api/public/rentals/bikes/available`

- **Parameter**:
  - `startDate` (DateTime, Query): Startdatum im ISO-Format (YYYY-MM-DD)
  - `endDate` (DateTime, Query): Enddatum im ISO-Format (YYYY-MM-DD)
- **Response**: Liste von `PublicRentalBicycleDto` Objekten
- **Logik**:
  - Ruft alle verfügbaren Fahrräder ab
  - Prüft Busy Periods für jeden Zeitraum
  - Gibt nur Fahrräder zurück, die für den gesamten Zeitraum frei sind

```csharp
[HttpGet("bikes/available")]
public async Task<ActionResult<IEnumerable<PublicRentalBicycleDto>>> GetAvailableBikes(
    [FromQuery] DateTime startDate,
    [FromQuery] DateTime endDate)
```

### Services Updates

#### ApiService Erweiterung

```typescript
// Neue Methoden in: BikeHaus.Homepage/src/app/services/api.service.ts

getAvailableBikes(startDate: Date, endDate: Date): Observable<PublicRentalBicycle[]>
// Ruft verfügbare Fahrräder für einen Zeitraum ab

private formatDateForAPI(date: Date): string
// Helper zum Formatieren von Dates als YYYY-MM-DD
```

## UI/UX Features

### Responsive Design

- Mobile: Single Column Layout
- Tablet/Desktop: Multi-Column Grid für Fahrräder
- Angepasste Button-Größen

### Benutzerfreundlichkeit

- Step Indicator am Oben zeigt aktuellen Fortschritt
- Zurück-Button auf jedem Schritt
- Scroll-to-top nach Schritt-Wechsel
- Error Messages mit klaren Fehlermeldungen
- Loading State während Datenabruf
- Disabled Buttons wenn erforderliche Felder leer

### Validierung

- Datums-Validierung (Enddatum > Startdatum)
- Formular-Validierung (Namen, E-Mail erforderlich)
- E-Mail Format-Prüfung

## Translations erforderlich

Die folgenden Translation Keys sollten zu den Language-Config Files hinzugefügt werden:

```typescript
rentalSteps: {
  dateSelection: string;
  bikeSelection: string;
  customerInfo: string;
  review: string;
  selectDates: string;
  startDate: string;
  endDate: string;
  continue: string;
  loading: string;
  noBikesAvailable: string;
  from: string;
  day: string;
  back: string;
  bikeDetails: string;
  addToCart: string;
  selectDifferent: string;
  type: string;
  frameSize: string;
  tireSize: string;
  color: string;
  description: string;
  pricing: string;
  rentalPrice: string;
  deposit: string;
  optional: string;
  selectColor: string;
  frameNumber: string;
  yourInfo: string;
  cartItems: string;
  addAnotherBike: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  notes: string;
  confirmBooking: string;
  bikeDetails: string;
  contactInfo: string;
  priceSummary: string;
  totalRental: string;
  totalDeposit: string;
  depositNote: string;
  bookingSuccess: string;
  confirmationSent: string;
  sent: string;
  bookingNumber: string;
  newBooking: string;
  selectBothDates: string;
  invalidDateRange: string;
  loadError: string;
  bookingError: string;
  firstNameRequired: string;
  lastNameRequired: string;
  emailRequired: string;
  submitting: string;
  confirm: string;
  days: string;
  itemPrice: string;
}
```

## Integrationsschritte

1. ✅ API Endpoint erstellt (`GetAvailableBikes`)
2. ✅ ApiService erweitert (`getAvailableBikes`, `formatDateForAPI`)
3. ✅ Rental Booking Steps Component erstellt
4. ✅ Component zu FahrradverleihComponent hinzugefügt
5. 🔄 **TODO**: Translation Keys zu Language Config hinzufügen
6. 🔄 **TODO**: Testen Sie das System im Browser
7. 🔄 **TODO**: Überprüfen Sie die API-Responses für Verfügbarkeitsprüfung
8. 🔄 **TODO**: CSS Styling überprüfen und anpassen falls nötig

## Testing Checkliste

### Date Selection (Schritt 1)

- [ ] Startdatum auswählen
- [ ] Enddatum auswählen
- [ ] Validierung: Enddatum muss nach Startdatum liegen
- [ ] "Weiter" Button sollte aktiviert sein

### Bike Selection (Schritt 2)

- [ ] API wird aufgerufen mit korrekten Daten
- [ ] Nur verfügbare Fahrräder werden angezeigt
- [ ] Klick auf Fahrrad öffnet Details

### Bike Details (Schritt 3)

- [ ] Bilder werden angezeigt
- [ ] Spezifikationen sind sichtbar
- [ ] Preis wird korrekt berechnet
- [ ] "Zum Warenkorb hinzufügen" funktioniert

### Customer Info (Schritt 4)

- [ ] Warenkorb zeigt ausgewählte Fahrräder
- [ ] "Weiteres Fahrrad hinzufügen" funktioniert
- [ ] Formular validiert erforderliche Felder
- [ ] "Weiter" führt zu Review

### Review (Schritt 5)

- [ ] Alle Details sind korrekt
- [ ] Preisberechnung ist korrekt
- [ ] Bestätigung sendet Buchung ab

### Success Page

- [ ] Buchungsnummer wird angezeigt
- [ ] "Neue Buchung" startet den Prozess erneut

## API Testing

Test mit curl:

```bash
# Verfügbare Fahrräder für 2026-05-20 bis 2026-05-27 abrufen
curl "http://localhost:5196/api/public/rentals/bikes/available?startDate=2026-05-20&endDate=2026-05-27"
```

## Performance Überlegungen

- **Lazy Loading**: Bilder werden on-demand geladen
- **Client-Side State**: Alle UI-States bleiben im Component (keine Server Requests nötig außer für Verfügbarkeit und Booking)
- **Caching**: Verfügbare Fahrräder werden bei Schritt 2 gecacht

## Zukünftige Verbesserungen

1. Zubehör-Optionen hinzufügen (Helme, Schlösser, etc.)
2. Promo-Codes unterstützen
3. Versicherungsoptionen
4. Mehrsprachige E-Mail-Vorlagen
5. SMS-Benachrichtigungen
6. Zahlungsintegration (Stripe, PayPal)
7. Calendar-Ansicht für Verfügbarkeit
8. Bewertungen und Reviews anzeigen
9. Größenempfehlungen basierend auf Körpergröße
10. Live-Verfügbarkeits-Anzeige

## Fragen & Support

Wenn Sie Fragen oder Probleme haben:

1. Überprüfen Sie die Browserkonsole auf JavaScript Fehler
2. Überprüfen Sie die API Responses im Network Tab
3. Überprüfen Sie die Server-Logs auf Fehler
