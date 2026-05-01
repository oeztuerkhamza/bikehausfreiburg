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
  day3?: number;
  day7?: number;
  day14?: number;
  day30?: number;
  perDayFrom10?: number;
}

export interface PublicRentalBicycle {
  id: number;
  marke: string;
  modell: string;
  farbe?: string;
  reifengroesse?: string;
  fahrradtyp?: string;
  art?: string;
  beschreibung?: string;
  rahmengroesse?: string;
  images: RentalBikeImage[];
  preise: RentalPrice;
}

export interface RentalAccessoryPublic {
  id: number;
  bezeichnung: string;
  tagespreis: number;
  aktiv: boolean;
}

export interface RentalBookingAccessoryCreate {
  rentalAccessoryId: number;
  menge: number;
}

export interface RentalBookingCreate {
  bicycleId: number;
  startDatum: string;
  endDatum: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  sprache: string;
  notizen?: string;
  accessories?: RentalBookingAccessoryCreate[];
}

export interface RentalBookingResponse {
  id: number;
  buchungsNummer: string;
  status: string;
  gesamtpreis?: number;
  startDatum: string;
  endDatum: string;
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
