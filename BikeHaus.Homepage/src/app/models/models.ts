export interface KleinanzeigenImage {
  id: number;
  kleinanzeigenListingId: number;
  imageUrl: string;
  localPath?: string;
  sortOrder: number;
}

export interface KleinanzeigenListing {
  id: number;
  externalId: string;
  title: string;
  description?: string;
  price?: number;
  priceText?: string;
  category?: string;
  location?: string;
  externalUrl: string;
  isActive: boolean;
  firstScrapedAt: string;
  lastScrapedAt: string;
  images: KleinanzeigenImage[];
}

export interface KleinanzeigenCategory {
  name: string;
  count: number;
}

export interface NeueFahrradImage {
  id: number;
  neueFahrradId: number;
  filePath: string;
  sortOrder: number;
}

export interface NeueFahrrad {
  id: number;
  titel: string;
  beschreibung?: string;
  preis: number;
  preisText?: string;
  kategorie?: string;
  marke?: string;
  modell?: string;
  farbe?: string;
  rahmengroesse?: string;
  reifengroesse?: string;
  gangschaltung?: string;
  zustand: string;
  angebot?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  images: NeueFahrradImage[];
}

export interface NeueFahrradCategory {
  name: string;
  count: number;
}

// ── E-Bikes ──
export interface EBikeImage {
  id: number;
  filePath: string;
  sortOrder: number;
}

export interface EBike {
  id: number;
  titel: string;
  beschreibung?: string;
  preis: number;
  preisText?: string;
  kategorie?: string;
  marke?: string;
  modell?: string;
  farbe?: string;
  rahmengroesse?: string;
  reifengroesse?: string;
  gangschaltung?: string;
  zustand: string;
  angebot?: number;
  // E-Bike specific
  motorMarke?: string;
  motorPosition?: string;
  akkuKapazitaetWh?: number;
  reichweiteKm?: number;
  motorLeistungNm?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  images: EBikeImage[];
}

export interface EBikeCategory {
  name: string;
  count: number;
}

export interface PublicShopInfo {
  shopName?: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  stadt?: string;
  telefon?: string;
  email?: string;
  website?: string;
  logoBase64?: string;
  logoFileName?: string;
  oeffnungszeiten?: string;
  oeffnungszeitenJson?: string;
  fullAddress?: string;
  totalActiveListings?: number;
  kleinanzeigenUrl?: string;
  steuernummer?: string;
  ustIdNr?: string;
  googleReviewUrl?: string;
}

// ── Published Used Bicycles ──
export interface PublicBicycleImage {
  id: number;
  bicycleId: number;
  filePath: string;
  sortOrder: number;
}

export interface PublicBicycle {
  id: number;
  marke: string;
  modell: string;
  farbe?: string;
  reifengroesse: string;
  fahrradtyp?: string;
  art?: string;
  beschreibung?: string;
  rahmengroesse?: string;
  zustand: string;
  preis?: number;
  createdAt: string;
  images: PublicBicycleImage[];
}

// ── Rental Bikes (Public) ──
export interface RentalBikeImage {
  id: number;
  bicycleId: number;
  filePath: string;
  sortOrder: number;
}

export interface RentalPrice {
  day1?: number;
  day2?: number;
  day3?: number;
  day4?: number;
  day5?: number;
  day6?: number;
  day7?: number;
  additionalDayAfter7?: number;
}

export interface PublicRentalBicycle {
  id: number;
  marke: string;
  modell: string;
  rahmennummer?: string;
  farbe?: string;
  reifengroesse?: string;
  fahrradtyp?: string;
  art?: string;
  beschreibung?: string;
  rahmengroesse?: string;
  kaution?: number;
  images: RentalBikeImage[];
  preise: RentalPrice;
  /** Empfohlene Körpergröße des Fahrers (nur Mietfahrräder). */
  koerpergroesseVonCm?: number;
  koerpergroesseBisCm?: number;
}

export interface RentalAccessoryPublic {
  id: number;
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  beschreibung?: string;
  bildPfad?: string;
  aktiv: boolean;
  /**
   * true = Verbrauchsmaterial (z. B. Schlauch): Preis gilt einmal statt pro Tag
   * und wird nur berechnet, wenn es im Laden verbraucht wurde. Solche Positionen
   * gehen deshalb nicht in den Buchungspreis ein.
   */
  einmalig?: boolean;
}

export interface RentalBookingAccessoryCreate {
  rentalAccessoryId: number;
  menge: number;
}

export interface RentalBookingBikeCreate {
  bicycleId: number;
  startDatum: string;
  endDatum: string;
  rahmennummer?: string;
  farbe?: string;
  kaution?: number;
}

export interface RentalBookingCreate {
  bikes: RentalBookingBikeCreate[];
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  strasse?: string;
  hausNr?: string;
  plz?: string;
  ort?: string;
  sprache: string;
  notizen?: string;
  accessories?: RentalBookingAccessoryCreate[];
  abholzeit?: string;
}

export interface RentalBookingResponse {
  id: number;
  buchungsNummer: string;
  status: string;
  gesamtpreis?: number;
  startDatum: string;
  endDatum: string;
}

// ── Buchung verwalten (Ansehen + Storno-Selfservice) ──

/** `RentalBookingStatus` aus BikeHaus.Domain/Enums, als JSON-String (camelCase-Enum-Converter). */
export type RentalBookingStatusCode = 'Pending' | 'Approved' | 'Cancelled';

/**
 * Antwort von `POST /api/public/rentals/bookings/lookup` — Spiegel von
 * `PublicRentalBookingLookupDto` (BikeHaus.Application/DTOs/RentalBookingDtos.cs).
 * Nebenwirkungsfrei: fragt eine Buchung ab, ohne sie zu verändern. Bewusst
 * schlank und ohne Kontaktdaten des Gasts — der Endpunkt liefert davon
 * ohnehin nichts zurück, anders als die PII-haltige `RentalBookingCancelResult`.
 */
export interface RentalBookingLookupBike {
  marke: string;
  modell: string;
}

export interface RentalBookingLookup {
  buchungsNummer: string;
  startDatum: string;
  endDatum: string;
  abholzeit?: string;
  bikes: RentalBookingLookupBike[];
  gesamtpreis?: number;
  kaution?: number;
  status: RentalBookingStatusCode;
}

/**
 * Antwort von `POST /api/public/rentals/bookings/cancel` — das Backend liefert
 * hier tatsächlich das vollständige, PII-haltige `RentalBookingDto` (Vorname,
 * E-Mail, Adresse, interne Notizen, Belegdaten). Die Seite braucht davon nach
 * dem Storno nur die Bestätigung, dass es geklappt hat; angezeigt werden die
 * bereits über `RentalBookingLookup` bekannten Daten. Deshalb wird hier
 * absichtlich nur der tatsächlich genutzte Ausschnitt modelliert statt der
 * vollen Backend-Form.
 */
export interface RentalBookingCancelResult {
  buchungsNummer: string;
  status: RentalBookingStatusCode;
}

// ── Repair Showcases ──
export interface RepairShowcaseImage {
  id: number;
  filePath: string;
  sortOrder: number;
}

export interface RepairShowcase {
  id: number;
  titel: string;
  beschreibung?: string;
  isActive: boolean;
  createdAt: string;
  images: RepairShowcaseImage[];
}


// ── Homepage Accessories ──
export interface HomepageAccessoryImage {
  id: number;
  filePath: string;
  sortOrder: number;
}

export interface HomepageAccessory {
  id: number;
  titel: string;
  beschreibung?: string;
  preis: number;
  preisText?: string;
  kategorie?: string;
  marke?: string;
  isActive: boolean;
  createdAt: string;
  images: HomepageAccessoryImage[];
}

export interface HomepageAccessoryCategory {
  name: string;
  count: number;
}

export interface GoogleReview {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

export interface GoogleReviewsResponse {
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  placeUrl: string;
}

// ── Checkout / Payment ──
export interface CheckoutRequest {
  bikeId: number;
  listingDisplayId: number;
  lang: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

// ── Rental Reviews ──
export interface RentalReviewPublic {
  id: number;
  ad: string;
  sterne: number;
  yorum: string;
  createdAt: string;
}

export interface RentalReviewCreate {
  ad: string;
  email?: string;
  sterne: number;
  yorum: string;
}

export interface KleinanzeigenCard {
  id: number;
  title: string;
  price?: number;
  priceText?: string;
  externalUrl: string;
  category?: string;
  imageUrl?: string;
  source?: 'showroom' | 'kleinanzeigen';
}

