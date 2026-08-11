// ── Enums ──
export enum BikeStatus {
  Available = 'Available',
  Sold = 'Sold',
  Reserved = 'Reserved',
  Rented = 'Rented',
}

export enum BikeCondition {
  Neu = 'Neu',
  Gebraucht = 'Gebraucht',
}

export enum PaymentMethod {
  Bar = 'Bar',
  PayPal = 'PayPal',
  Karte = 'Karte',
  Ueberweisung = 'Überweisung',
  // Nur im Verkauf angeboten; die Laufzeit steht an der Zahlung (ratenMonate).
  Raten = 'Raten',
  // Nur für die Kaution eines Mietvertrags: es wurde keine Kaution genommen.
  // Der Server setzt die Kaution dann zwingend auf 0.
  OhneKaution = 'OhneKaution',
}

export enum DocumentType {
  Screenshot = 'Screenshot',
  PDF = 'PDF',
  Image = 'Image',
  Kaufbeleg = 'Kaufbeleg',
  Verkaufsbeleg = 'Verkaufsbeleg',
  Rechnung = 'Rechnung',
}

export enum SignatureType {
  Seller = 'Seller',
  Buyer = 'Buyer',
  ShopOwner = 'ShopOwner',
}

export enum ReturnReason {
  Defekt = 'Defekt',
  NichtWieErwartet = 'NichtWieErwartet',
  Garantie = 'Garantie',
  Sonstiges = 'Sonstiges',
}

// ── Bicycle ──
export interface Bicycle {
  id: number;
  marke: string;
  modell: string;
  rahmennummer?: string;
  lagernummer?: number;
  rahmengroesse?: string;
  farbe?: string;
  reifengroesse: string;
  fahrradtyp?: string;
  art?: string;
  beschreibung?: string;
  status: BikeStatus;
  zustand: BikeCondition;
  isRentable: boolean;
  rentalPriceDay1?: number;
  rentalPriceDay2?: number;
  rentalPriceDay3?: number;
  rentalPriceDay4?: number;
  rentalPriceDay5?: number;
  rentalPriceDay6?: number;
  rentalPriceDay7?: number;
  rentalPriceAdditionalDayAfter7?: number;
  kaution?: number;
  rentalPriceDay14?: number;
  rentalPriceDay30?: number;
  rentalPricePerDayFrom10?: number;
  isPublishedOnWebsite: boolean;
  isPublishedOnKleinanzeigen: boolean;
  verkaufspreisVorschlag?: number;
  kleinanzeigenAnzeigeNr?: string;
  /** Nur Mietfahrräder, nur intern — nie Teil der öffentlichen DTOs. */
  fahrradnummer?: string;
  koerpergroesseVonCm?: number;
  koerpergroesseBisCm?: number;
  createdAt: string;
  images?: BicycleImage[];
}

export interface BicycleImage {
  id: number;
  bicycleId: number;
  filePath: string;
  sortOrder: number;
}

export interface BicycleCreate {
  marke: string;
  modell: string;
  rahmennummer?: string;
  lagernummer?: number;
  /** Beim Anlegen erlaubt — später läuft der Preis über BicycleUpdate. */
  verkaufspreisVorschlag?: number;
  fahrradnummer?: string;
  koerpergroesseVonCm?: number;
  koerpergroesseBisCm?: number;
  rahmengroesse?: string;
  farbe?: string;
  reifengroesse: string;
  fahrradtyp?: string;
  art?: string;
  beschreibung?: string;
  zustand: BikeCondition;
  isRentable: boolean;
  rentalPriceDay1?: number;
  rentalPriceDay2?: number;
  rentalPriceDay3?: number;
  rentalPriceDay4?: number;
  rentalPriceDay5?: number;
  rentalPriceDay6?: number;
  rentalPriceDay7?: number;
  rentalPriceAdditionalDayAfter7?: number;
  kaution?: number;
  rentalPriceDay14?: number;
  rentalPriceDay30?: number;
  rentalPricePerDayFrom10?: number;
}

export interface BicycleUpdate {
  marke: string;
  modell: string;
  rahmennummer?: string;
  // null/undefined = keep current value, 0 = clear, value = set (backend contract)
  lagernummer?: number;
  rahmengroesse?: string;
  farbe?: string;
  reifengroesse: string;
  fahrradtyp?: string;
  art?: string;
  beschreibung?: string;
  status: BikeStatus;
  zustand: BikeCondition;
  verkaufspreisVorschlag?: number;
  isRentable: boolean;
  rentalPriceDay1?: number;
  rentalPriceDay2?: number;
  rentalPriceDay3?: number;
  rentalPriceDay4?: number;
  rentalPriceDay5?: number;
  rentalPriceDay6?: number;
  rentalPriceDay7?: number;
  rentalPriceAdditionalDayAfter7?: number;
  // kaution fehlt hier bewusst: die Kaution des Fahrrads wird ausschließlich
  // über bicycleService.setKaution() (Seite „Mietfahrräder") geändert. Sie war
  // Teil dieses DTOs und wurde deshalb beim Speichern eines Mietvertrags
  // mitgeschickt — und dabei geleert.
  // null/undefined = beibehalten; "" bzw. 0 löschen den Wert.
  fahrradnummer?: string;
  koerpergroesseVonCm?: number;
  koerpergroesseBisCm?: number;
  rentalPriceDay14?: number;
  rentalPriceDay30?: number;
  rentalPricePerDayFrom10?: number;
}

// ── Customer ──
export interface Customer {
  id: number;
  vorname: string;
  nachname: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  stadt?: string;
  telefon?: string;
  email?: string;
  steuernummer?: string;
  fullName: string;
  fullAddress?: string;
  createdAt: string;
}

export interface CustomerCreate {
  vorname: string;
  nachname: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  stadt?: string;
  telefon?: string;
  email?: string;
  steuernummer?: string;
}

export interface CustomerUpdate {
  vorname: string;
  nachname: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  stadt?: string;
  telefon?: string;
  email?: string;
  steuernummer?: string;
}

// ── Signature ──
export interface Signature {
  id: number;
  signatureData: string;
  signerName: string;
  signatureType: SignatureType;
  signedAt: string;
}

export interface SignatureCreate {
  signatureData: string;
  signerName: string;
  signatureType: SignatureType;
}

// ── Purchase ──
export interface Purchase {
  id: number;
  bicycle: Bicycle;
  seller?: Customer;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  notizen?: string;
  belegNummer?: string;
  anzeigeNr?: string;
  signature?: Signature;
  createdAt: string;
}

export interface PurchaseList {
  id: number;
  belegNummer?: string;
  bikeInfo: string;
  rahmennummer?: string;
  lagernummer?: number;
  sellerName?: string;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  hasSale: boolean;
  marke: string;
  reifengroesse: string;
  coverImagePath?: string;
  imageCount: number;
}

export interface PurchaseCreate {
  bicycle: BicycleCreate;
  seller: CustomerCreate;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  notizen?: string;
  signature?: SignatureCreate;
  belegNummer?: string;
  anzeigeNr?: string;
}

export interface PurchaseUpdate {
  bicycle: BicycleUpdate;
  seller: CustomerUpdate;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  notizen?: string;
  belegNummer?: string;
  anzeigeNr?: string;
}

// Inline (single-cell) edit from the purchase list.
export interface PurchaseInlineUpdate {
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  belegNummer?: string;
}

export interface BulkPurchaseCreate {
  bicycle: BicycleCreate;
  seller: CustomerCreate;
  anzahl: number;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  notizen?: string;
  belegNummer?: string;
  anzeigeNr?: string;
}

export interface BulkPurchaseResult {
  totalCreated: number;
  purchases: Purchase[];
}

// ── Sale Accessory ──
export interface SaleAccessory {
  id: number;
  bezeichnung: string;
  preis: number;
  menge: number;
  gesamtpreis: number;
}

export interface SaleAccessoryCreate {
  bezeichnung: string;
  preis: number;
  menge: number;
}

// ── Sale Payment ──
export interface SalePayment {
  id: number;
  zahlungsart: PaymentMethod;
  betrag: number;
  // Nur bei Zahlungsart Raten gesetzt.
  ratenMonate?: number | null;
  monatsRate?: number | null;
}

export interface SalePaymentCreate {
  zahlungsart: PaymentMethod;
  betrag: number;
  ratenMonate?: number | null;
}

// ── Sale ──
export interface Sale {
  id: number;
  bicycle: Bicycle;
  buyer: Customer;
  purchaseId?: number;
  preis: number;
  zahlungsart: PaymentMethod;
  verkaufsdatum: string;
  garantie: boolean;
  garantieBedingungen?: string;
  notizen?: string;
  belegNummer: string;
  buyerSignature?: Signature;
  sellerSignature?: Signature;
  accessories: SaleAccessory[];
  zahlungen: SalePayment[];
  rabatt: number;
  gesamtbetrag: number;
  ankaufPreis?: number;
  ankaufDatum?: string;
  createdAt: string;
}

export interface SaleList {
  id: number;
  belegNummer: string;
  bicycleId: number;
  purchaseId?: number;
  bikeInfo: string;
  rahmennummer?: string;
  lagernummer?: number;
  reifengroesse?: string;
  buyerName: string;
  preis: number;
  gesamtbetrag: number;
  rabatt: number;
  zahlungsart: PaymentMethod;
  zahlungen: SalePayment[];
  verkaufsdatum: string;
  garantie: boolean;
  zustand: BikeCondition;
  hasMatchingPurchase?: boolean;
}

export interface SaleCreate {
  bicycleId: number;
  isAccessoryOnly?: boolean;
  purchaseId?: number;
  buyer: CustomerCreate;
  preis: number;
  zahlungsart: PaymentMethod;
  verkaufsdatum: string;
  garantie: boolean;
  garantieBedingungen?: string;
  notizen?: string;
  buyerSignature?: SignatureCreate;
  sellerSignature?: SignatureCreate;
  accessories?: SaleAccessoryCreate[];
  zahlungen?: SalePaymentCreate[];
  rabatt?: number;
  belegNummer?: string;
}

export interface SaleUpdate {
  buyer: CustomerUpdate;
  preis: number;
  zahlungsart: PaymentMethod;
  verkaufsdatum: string;
  garantie: boolean;
  garantieBedingungen?: string;
  notizen?: string;
  accessories?: SaleAccessoryCreate[];
  zahlungen?: SalePaymentCreate[];
  rabatt?: number;
  belegNummer?: string;
  ankaufPreis?: number;
  ankaufDatum?: string;
}

// ── Document ──
export interface Document {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  documentType: DocumentType;
  bicycleId?: number;
  purchaseId?: number;
  saleId?: number;
  createdAt: string;
}

export interface DocumentUpload {
  documentType: DocumentType;
  bicycleId?: number;
  purchaseId?: number;
  saleId?: number;
}

// ── Return (Rückgabe) ──
export interface Return {
  id: number;
  belegNummer: string;
  sale: Sale;
  bicycle: Bicycle;
  customer: Customer;
  rueckgabedatum: string;
  grund: ReturnReason;
  grundDetails?: string;
  erstattungsbetrag: number;
  zahlungsart: PaymentMethod;
  notizen?: string;
  customerSignature?: Signature;
  shopSignature?: Signature;
  createdAt: string;
}

export interface ReturnList {
  id: number;
  belegNummer: string;
  bikeInfo: string;
  customerName: string;
  originalSaleBelegNummer: string;
  rueckgabedatum: string;
  grund: ReturnReason;
  erstattungsbetrag: number;
}

export interface ReturnCreate {
  saleId: number;
  rueckgabedatum?: string;
  grund: ReturnReason;
  grundDetails?: string;
  erstattungsbetrag: number;
  zahlungsart: PaymentMethod;
  notizen?: string;
  customerSignature?: SignatureCreate;
  shopSignature?: SignatureCreate;
  belegNummer?: string;
}

export interface ReturnUpdate {
  belegNummer?: string;
  rueckgabedatum?: string;
  grund: ReturnReason;
  grundDetails?: string;
  erstattungsbetrag: number;
  zahlungsart: PaymentMethod;
  notizen?: string;
}

// ── Dashboard ──
export interface Dashboard {
  totalBicycles: number;
  availableBicycles: number;
  soldBicycles: number;
  totalPurchases: number;
  totalSales: number;
  totalPurchaseAmount: number;
  totalSaleAmount: number;
  profit: number;
  activeRentals: number;
  overdueRentals: number;
  pendingBookings: number;
  recentPurchases: PurchaseList[];
  recentSales: SaleList[];
  recentRentals: RentalList[];
  recentPendingBookings: RentalBookingList[];
  bookingsStartingToday: RentalBookingList[];
  overdueRentalItems: RentalList[];
}

// ── AccessoryCatalog ──
export interface AccessoryCatalog {
  id: number;
  bezeichnung: string;
  standardpreis?: number;
  kategorie?: string;
  aktiv: boolean;
  createdAt: string;
}

export interface AccessoryCatalogList {
  id: number;
  bezeichnung: string;
  standardpreis?: number;
  kategorie?: string;
  aktiv: boolean;
}

export interface AccessoryCatalogCreate {
  bezeichnung: string;
  standardpreis?: number;
  kategorie?: string;
}

export interface AccessoryCatalogUpdate {
  bezeichnung: string;
  standardpreis?: number;
  kategorie?: string;
  aktiv: boolean;
}

// ── Reservation ──
export enum ReservationStatus {
  Active = 'Active',
  Converted = 'Converted',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
}

export interface Reservation {
  id: number;
  reservierungsNummer: string;
  bicycle: Bicycle;
  customer: Customer;
  reservierungsDatum: string;
  ablaufDatum: string;
  anzahlung?: number;
  notizen?: string;
  status: ReservationStatus;
  saleId?: number;
  createdAt: string;
  isExpired: boolean;
  anzahlungZahlungsart?: PaymentMethod;
  /** Vereinbarter Verkaufspreis zum Zeitpunkt der Reservierung. */
  verkaufspreis?: number;
  /** Verkaufspreis − Anzahlung, serverseitig gerechnet. */
  restbetrag?: number;
  kundenUnterschrift?: string;
}

export interface ReservationList {
  id: number;
  reservierungsNummer: string;
  bikeInfo: string;
  customerName: string;
  reservierungsDatum: string;
  ablaufDatum: string;
  anzahlung?: number;
  status: ReservationStatus;
  isExpired: boolean;
}

export interface ReservationCreate {
  bicycleId: number;
  customer: CustomerCreate;
  reservierungsDatum?: string;
  /** Aus dem Kalender gewählt; reservierungsTage ist nur die Rückfallebene. */
  ablaufDatum?: string;
  reservierungsTage: number;
  anzahlung?: number;
  notizen?: string;
  anzahlungZahlungsart?: PaymentMethod;
  verkaufspreis?: number;
  kundenUnterschrift?: string;
}

export interface ReservationUpdate {
  ablaufDatum?: string;
  anzahlung?: number;
  notizen?: string;
  anzahlungZahlungsart?: PaymentMethod;
  verkaufspreis?: number;
  kundenUnterschrift?: string;
}

export interface ReservationConvertToSale {
  preis: number;
  zahlungsart: PaymentMethod;
  garantie: boolean;
  garantieBedingungen?: string;
  notizen?: string;
  buyerSignature?: SignatureCreate;
  sellerSignature?: SignatureCreate;
  accessories?: SaleAccessoryCreate[];
}

// ── Pagination ──
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ── Archive ──
export interface ArchiveSearchResult {
  bicycleId: number;
  bikeInfo: string;
  purchaseBelegNummer?: string;
  saleBelegNummer?: string;
  purchaseDate?: string;
  saleDate?: string;
  matchType: string;
}

export interface ArchiveTimelineEvent {
  eventType: string;
  eventDate: string;
  belegNummer?: string;
  title: string;
  description?: string;
  amount?: number;
  customerName?: string;
  paymentMethod?: string;
  documentId?: number;
  documentType?: string;
}

export interface ArchiveBicycleHistory {
  bicycleId: number;
  marke: string;
  modell?: string;
  rahmennummer?: string;
  farbe?: string;
  reifengroesse: string;
  fahrradtyp?: string;
  status: string;
  zustand: string;
  createdAt: string;
  timeline: ArchiveTimelineEvent[];
}

// ── Neue Fahrräder (New Bicycles for Homepage) ──
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
  images: NeueFahrradImage[];
}

export interface NeueFahrradImage {
  id: number;
  filePath: string;
  sortOrder: number;
}

export interface NeueFahrradCreate {
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
}

export interface NeueFahrradUpdate {
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
}

export interface NeueFahrradCategory {
  name: string;
  count: number;
}

// ── E-Bikes (Electric Bicycles for Homepage) ──
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
  motorMarke?: string;
  motorPosition?: string;
  akkuKapazitaetWh?: number;
  reichweiteKm?: number;
  motorLeistungNm?: number;
  isActive: boolean;
  createdAt: string;
  images: EBikeImage[];
}

export interface EBikeImage {
  id: number;
  filePath: string;
  sortOrder: number;
}

export interface EBikeCreate {
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
  motorMarke?: string;
  motorPosition?: string;
  akkuKapazitaetWh?: number;
  reichweiteKm?: number;
  motorLeistungNm?: number;
}

export interface EBikeUpdate {
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
  motorMarke?: string;
  motorPosition?: string;
  akkuKapazitaetWh?: number;
  reichweiteKm?: number;
  motorLeistungNm?: number;
  isActive: boolean;
}

export interface EBikeCategory {
  name: string;
  count: number;
}

// ── Homepage Accessories ──
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

export interface HomepageAccessoryImage {
  id: number;
  filePath: string;
  sortOrder: number;
}

export interface HomepageAccessoryCreate {
  titel: string;
  beschreibung?: string;
  preis: number;
  preisText?: string;
  kategorie?: string;
  marke?: string;
}

export interface HomepageAccessoryUpdate extends HomepageAccessoryCreate {
  isActive: boolean;
}

export interface HomepageAccessoryCategory {
  name: string;
  count: number;
}

// ── Missing Purchase ──
export interface MissingSale {
  saleId: number;
  saleBelegNummer: string;
  bicycleId: number;
  bikeInfo: string;
  buyerName: string;
  salePreis: number;
  verkaufsdatum: string;
  marke: string;
  modell: string;
  rahmennummer?: string;
  lagernummer?: number;
  rahmengroesse?: string;
  farbe?: string;
  reifengroesse: string;
  fahrradtyp?: string;
  art?: string;
  beschreibung?: string;
  zustand: BikeCondition;
}

export interface PurchaseCreateForExistingBike {
  bicycleId: number;
  seller?: CustomerCreate;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  notizen?: string;
  signature?: SignatureCreate;
  belegNummer?: string;
  anzeigeNr?: string;
  // Bicycle field updates
  marke?: string;
  modell?: string;
  rahmennummer?: string;
  rahmengroesse?: string;
  farbe?: string;
  reifengroesse?: string;
  fahrradtyp?: string;
  art?: string;
  zustand?: BikeCondition;
}

// ── Rental (Miete) ──
export enum RentalStatus {
  Active = 'Active',
  Returned = 'Returned',
  Cancelled = 'Cancelled',
}

export enum BikeConditionAtHandover {
  SehrGut = 'SehrGut',
  Gut = 'Gut',
  Gebrauchsspuren = 'Gebrauchsspuren',
}

export interface RentalBike {
  id: number;
  bicycleId: number;
  bicycle: Bicycle;
  rahmennummer?: string;
  farbe?: string;
  startDatum: string;
  endDatum: string;
  mietpreis: number;
  kaution: number;
  kautionZurueckgegeben: boolean;
  kautionRueckgabeUnterschrift?: string;
  zustandBeiUebergabe: BikeConditionAtHandover;
  zustandBeiRueckgabe?: BikeConditionAtHandover;
  schadenAbzug: number;
  verspaetungsAbzug: number;
  tatsaechlichesRueckgabeDatum?: string;
  abzugNotizen?: string;
}

export interface RentalBikeCreate {
  bicycleId: number;
  rahmennummer?: string;
  farbe?: string;
  startDatum: string;
  endDatum: string;
  mietpreis: number;
  kaution: number;
  zustandBeiUebergabe: BikeConditionAtHandover;
}

export interface Rental {
  id: number;
  mietvertragNummer: string;
  bikes: RentalBike[];
  customer: Customer;
  startDatum: string;
  endDatum: string;
  gesamtmiete: number;
  rabatt: number;
  kaution: number;
  kautionZurueckgegeben: boolean;       // true when every bike's deposit is returned
  zahlungsart: PaymentMethod;
  kautionZahlungsart: PaymentMethod;
  status: RentalStatus;
  notizen?: string;
  createdAt: string;
  accessories: RentalAccessoryItem[];
  mieterUnterschrift?: string;
  agbAkzeptiert: boolean;
  unterschriftOrt?: string;
  ausweisPhotoPath?: string;
  ausweisPhotoRueckseitePath?: string;
}

export interface RentalList {
  id: number;
  mietvertragNummer: string;
  bikeInfo: string;
  bikeCount: number;
  customerName: string;
  startDatum: string;
  endDatum: string;
  gesamtmiete: number;
  rabatt: number;
  kaution: number;
  status: RentalStatus;
  isOverdue: boolean;
}

export interface BusyPeriod {
  start: string; // ISO date string
  end: string;
  type: 'rental' | 'booking';
}

export interface RentalAccessoryItemCreate {
  rentalAccessoryId?: number;
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  menge: number;
  einmalig: boolean;
}

export interface RentalAccessoryItem {
  id: number;
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  menge: number;
  /** Bei einmaligem Zubehör 0, solange es zurückgegeben wurde. */
  gesamtpreis: number;
  zurueckgegeben: boolean;
  einmalig: boolean;
}

export interface RentalBikeReturn {
  rentalBikeId: number;
  zustandBeiRueckgabe: BikeConditionAtHandover;
  schadenAbzug: number;
  verspaetungsAbzug: number;
  tatsaechlichesRueckgabeDatum: string;
  abzugNotizen?: string;
}

export interface RentalAccessoryReturn {
  rentalAccessoryItemId: number;
  zurueckgegeben: boolean;
}

export interface RentalReturn {
  bikes: RentalBikeReturn[];
  accessories?: RentalAccessoryReturn[];
}

export interface RentalCreate {
  bikes: RentalBikeCreate[];
  customer: CustomerCreate;
  rabatt: number;
  zahlungsart: PaymentMethod;
  kautionZahlungsart?: PaymentMethod;
  notizen?: string;
  accessories?: RentalAccessoryItemCreate[];
  mieterUnterschrift?: string;
  agbAkzeptiert?: boolean;
  unterschriftOrt?: string;
  ausweisPhotoPath?: string;
  ausweisPhotoRueckseitePath?: string;
}

export interface RentalBikeUpdate {
  id: number;
  bicycleId?: number;
  rahmennummer?: string;
  farbe?: string;
  mietpreis?: number;
  kaution?: number;
}

export interface RentalUpdate {
  customer?: CustomerCreate;
  startDatum?: string;
  endDatum?: string;
  rabatt?: number;
  kautionZurueckgegeben?: boolean;
  kautionRueckgabeUnterschrift?: string;
  zahlungsart?: PaymentMethod;
  kautionZahlungsart?: PaymentMethod;
  notizen?: string;
  mieterUnterschrift?: string;
  agbAkzeptiert?: boolean;
  unterschriftOrt?: string;
  bikes?: RentalBikeUpdate[];
  newBikes?: RentalBikeCreate[];
  removeBikeIds?: number[];
  accessories?: RentalAccessoryItemCreate[];
  mietvertragNummer?: string;
}

// ── Rental Booking (Homepage) ──
export enum RentalBookingStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Cancelled = 'Cancelled',
}

// ── Rental Reviews ──
export interface RentalReview {
  id: number;
  ad: string;
  email?: string;
  sterne: number;
  yorum: string;
  onaylandi: boolean;
  adminNotiz?: string;
  createdAt: string;
}

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

export interface RentalReviewApprove {
  onaylandi: boolean;
  adminNotiz?: string;
}


export interface RentalAccessory {
  id: number;
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  aktiv: boolean;
  beschreibung?: string;
  bildPfad?: string;
  /**
   * true = Verbrauchsmaterial (z. B. Schlauch): kostet einmal statt pro Tag und
   * nur dann, wenn es bei der Rückgabe nicht zurückkommt.
   */
  einmalig: boolean;
  createdAt: string;
}

export interface RentalAccessoryList {
  id: number;
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  aktiv: boolean;
  beschreibung?: string;
  bildPfad?: string;
  einmalig: boolean;
  createdAt: string;
}

export interface RentalAccessoryCreate {
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  beschreibung?: string;
  einmalig: boolean;
}

export interface RentalAccessoryUpdate {
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  beschreibung?: string;
  aktiv: boolean;
  einmalig: boolean;
}

export interface RentalBookingAccessory {
  id: number;
  bezeichnung: string;
  tagespreis: number;
  menge: number;
  gesamtpreis: number;
  einmalig?: boolean;
  rentalAccessoryId?: number;
}

export interface RentalBookingBike {
  id: number;
  bicycleId: number;
  marke: string;
  modell: string;
  farbe?: string;
  rahmennummer?: string;
  rahmengroesse?: string;
  art?: string;
  kaution?: number;
  startDatum: string;
  endDatum: string;
  gesamtpreis?: number;
}

export interface RentalBooking {
  id: number;
  buchungsNummer: string;
  bicycle?: Bicycle;
  bikes: RentalBookingBike[];
  startDatum: string;
  endDatum: string;
  abholzeit?: string;
  vorname: string;
  nachname: string;
  email?: string;
  telefon?: string;
  strasse?: string;
  hausNr?: string;
  plz?: string;
  ort?: string;
  sprache?: string;
  notizen?: string;
  adminNotizen?: string;
  gesamtpreis?: number;
  status: RentalBookingStatus;
  createdAt: string;
  approvedAt?: string;
  cancelledAt?: string;
  accessories: RentalBookingAccessory[];
  ausweisPhotoPath?: string;
  ausweisPhotoRueckseitePath?: string;
}

export interface RentalBookingList {
  id: number;
  buchungsNummer: string;
  bikeInfo: string;
  customerName: string;
  startDatum: string;
  endDatum: string;
  gesamtpreis?: number;
  status: RentalBookingStatus;
  createdAt: string;
  hasEBike: boolean;
}

export interface RentalBookingApprove {
  adminNotizen?: string;
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
  email?: string;
  telefon?: string;
  strasse?: string;
  hausNr?: string;
  plz?: string;
  ort?: string;
  sprache: string;
  notizen?: string;
  accessories?: { rentalAccessoryId: number; menge: number }[];
  abholzeit?: string;
}

export interface RentalBookingCancel {
  adminNotizen?: string;
}

// ── Belege (gemeinsame Übersicht Miete + Verkauf) ──
export type BelegArt = 'Miete' | 'Verkauf' | 'Ankauf';

export interface BelegZahlung {
  zahlungsart: string;
  betrag: number;
}

export interface BelegListItem {
  art: BelegArt;
  id: number;
  belegNummer: string;
  datum: string;
  kundeName: string;
  fahrradInfo: string;
  betrag: number;
  /** Zahlungsanteile — bei geteilter Zahlung mehrere Einträge. */
  zahlungen: BelegZahlung[];
  /** Nummer und Preis des zugehörigen Ankaufbelegs, falls auffindbar. */
  ankaufBelegNummer?: string | null;
  ankaufPreis?: number | null;
  /** Häkchen "in Flatpay verbucht". */
  flatpay: boolean;
  /** 'Neu' | 'Gebraucht'; leer bei Miete und reinem Zubehörverkauf. */
  zustand?: string | null;
}
