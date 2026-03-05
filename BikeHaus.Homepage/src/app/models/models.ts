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
