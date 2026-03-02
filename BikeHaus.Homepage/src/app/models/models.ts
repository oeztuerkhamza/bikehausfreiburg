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
}
