// ── Enums ──
export enum BikeStatus {
  Available = 'Available',
  Sold = 'Sold',
  Reserved = 'Reserved',
}

export enum BikeCondition {
  Neu = 'Neu',
  Gebraucht = 'Gebraucht',
}

export enum PaymentMethod {
  Bar = 'Bar',
  PayPal = 'PayPal',
  Karte = 'Karte',
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
  farbe?: string;
  reifengroesse: string;
  stokNo?: string;
  fahrradtyp?: string;
  beschreibung?: string;
  status: BikeStatus;
  zustand: BikeCondition;
  createdAt: string;
}

export interface BicycleCreate {
  marke: string;
  modell: string;
  rahmennummer?: string;
  farbe?: string;
  reifengroesse: string;
  stokNo?: string;
  fahrradtyp?: string;
  beschreibung?: string;
  zustand: BikeCondition;
}

export interface BicycleUpdate {
  marke: string;
  modell: string;
  rahmennummer?: string;
  farbe?: string;
  reifengroesse: string;
  stokNo?: string;
  fahrradtyp?: string;
  beschreibung?: string;
  status: BikeStatus;
  zustand: BikeCondition;
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
  seller: Customer;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  notizen?: string;
  belegNummer?: string;
  signature?: Signature;
  createdAt: string;
}

export interface PurchaseList {
  id: number;
  belegNummer?: string;
  stokNo?: string;
  bikeInfo: string;
  sellerName: string;
  preis: number;
  verkaufspreisVorschlag?: number;
  zahlungsart: PaymentMethod;
  kaufdatum: string;
  hasSale: boolean;
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
  rabatt: number;
  gesamtbetrag: number;
  createdAt: string;
}

export interface SaleList {
  id: number;
  belegNummer: string;
  stokNo?: string;
  bikeInfo: string;
  buyerName: string;
  preis: number;
  rabatt: number;
  zahlungsart: PaymentMethod;
  verkaufsdatum: string;
  garantie: boolean;
}

export interface SaleCreate {
  bicycleId: number;
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
  rabatt?: number;
  belegNummer?: string;
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
  stokNo?: string;
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
  recentPurchases: PurchaseList[];
  recentSales: SaleList[];
}

// ── AccessoryCatalog ──
export interface AccessoryCatalog {
  id: number;
  bezeichnung: string;
  standardpreis: number;
  kategorie?: string;
  aktiv: boolean;
  createdAt: string;
}

export interface AccessoryCatalogList {
  id: number;
  bezeichnung: string;
  standardpreis: number;
  kategorie?: string;
  aktiv: boolean;
}

export interface AccessoryCatalogCreate {
  bezeichnung: string;
  standardpreis: number;
  kategorie?: string;
}

export interface AccessoryCatalogUpdate {
  bezeichnung: string;
  standardpreis: number;
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
}

export interface ReservationList {
  id: number;
  reservierungsNummer: string;
  stokNo?: string;
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
  reservierungsTage: number;
  anzahlung?: number;
  notizen?: string;
}

export interface ReservationUpdate {
  ablaufDatum?: string;
  anzahlung?: number;
  notizen?: string;
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
  stokNo: string;
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
  stokNo: string;
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
