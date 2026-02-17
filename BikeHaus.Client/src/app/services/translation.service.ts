import { Injectable, signal } from '@angular/core';

export type Language = 'de' | 'tr';

export interface Translations {
  // Navigation
  dashboard: string;
  bicycles: string;
  customers: string;
  purchases: string;
  sales: string;
  returns: string;
  statistics: string;
  settings: string;

  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  loading: string;
  noData: string;
  confirm: string;
  yes: string;
  no: string;
  back: string;
  close: string;
  actions: string;

  // Settings Page
  shopInformation: string;
  shopName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  vatId: string;
  bankName: string;
  openingHours: string;
  additionalInfo: string;
  logo: string;
  uploadLogo: string;
  deleteLogo: string;
  appearance: string;
  darkMode: string;
  language: string;
  german: string;
  turkish: string;
  settingsSaved: string;

  // Bicycle
  brand: string;
  model: string;
  frameNumber: string;
  color: string;
  wheelSize: string;
  description: string;
  status: string;
  available: string;
  sold: string;
  returned: string;

  // Customer
  firstName: string;
  lastName: string;
  address: string;

  // Transactions
  date: string;
  price: string;
  seller: string;
  buyer: string;
  totalAmount: string;
  profit: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  de: {
    // Navigation
    dashboard: 'Dashboard',
    bicycles: 'Fahrräder',
    customers: 'Kunden',
    purchases: 'Ankäufe',
    sales: 'Verkäufe',
    returns: 'Rückgaben',
    statistics: 'Statistiken',
    settings: 'Einstellungen',

    // Common
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    search: 'Suchen',
    loading: 'Laden...',
    noData: 'Keine Daten verfügbar',
    confirm: 'Bestätigen',
    yes: 'Ja',
    no: 'Nein',
    back: 'Zurück',
    close: 'Schließen',
    actions: 'Aktionen',

    // Settings Page
    shopInformation: 'Geschäftsinformationen',
    shopName: 'Geschäftsname',
    street: 'Straße',
    houseNumber: 'Hausnummer',
    postalCode: 'PLZ',
    city: 'Stadt',
    phone: 'Telefon',
    email: 'E-Mail',
    website: 'Website',
    taxNumber: 'Steuernummer',
    vatId: 'USt-IdNr.',
    bankName: 'Bank',
    openingHours: 'Öffnungszeiten',
    additionalInfo: 'Zusätzliche Informationen',
    logo: 'Logo',
    uploadLogo: 'Logo hochladen',
    deleteLogo: 'Logo löschen',
    appearance: 'Erscheinungsbild',
    darkMode: 'Dunkelmodus',
    language: 'Sprache',
    german: 'Deutsch',
    turkish: 'Türkisch',
    settingsSaved: 'Einstellungen gespeichert',

    // Bicycle
    brand: 'Marke',
    model: 'Modell',
    frameNumber: 'Rahmennummer',
    color: 'Farbe',
    wheelSize: 'Reifengröße',
    description: 'Beschreibung',
    status: 'Status',
    available: 'Verfügbar',
    sold: 'Verkauft',
    returned: 'Zurückgegeben',

    // Customer
    firstName: 'Vorname',
    lastName: 'Nachname',
    address: 'Adresse',

    // Transactions
    date: 'Datum',
    price: 'Preis',
    seller: 'Verkäufer',
    buyer: 'Käufer',
    totalAmount: 'Gesamtbetrag',
    profit: 'Gewinn',
  },
  tr: {
    // Navigation
    dashboard: 'Gösterge Paneli',
    bicycles: 'Bisikletler',
    customers: 'Müşteriler',
    purchases: 'Alımlar',
    sales: 'Satışlar',
    returns: 'İadeler',
    statistics: 'İstatistikler',
    settings: 'Ayarlar',

    // Common
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    search: 'Ara',
    loading: 'Yükleniyor...',
    noData: 'Veri bulunamadı',
    confirm: 'Onayla',
    yes: 'Evet',
    no: 'Hayır',
    back: 'Geri',
    close: 'Kapat',
    actions: 'İşlemler',

    // Settings Page
    shopInformation: 'Dükkan Bilgileri',
    shopName: 'Dükkan Adı',
    street: 'Sokak',
    houseNumber: 'Kapı No',
    postalCode: 'Posta Kodu',
    city: 'Şehir',
    phone: 'Telefon',
    email: 'E-posta',
    website: 'Web Sitesi',
    taxNumber: 'Vergi Numarası',
    vatId: 'KDV No',
    bankName: 'Banka',
    openingHours: 'Çalışma Saatleri',
    additionalInfo: 'Ek Bilgiler',
    logo: 'Logo',
    uploadLogo: 'Logo Yükle',
    deleteLogo: 'Logo Sil',
    appearance: 'Görünüm',
    darkMode: 'Karanlık Mod',
    language: 'Dil',
    german: 'Almanca',
    turkish: 'Türkçe',
    settingsSaved: 'Ayarlar kaydedildi',

    // Bicycle
    brand: 'Marka',
    model: 'Model',
    frameNumber: 'Şase Numarası',
    color: 'Renk',
    wheelSize: 'Tekerlek Boyutu',
    description: 'Açıklama',
    status: 'Durum',
    available: 'Mevcut',
    sold: 'Satıldı',
    returned: 'İade Edildi',

    // Customer
    firstName: 'Ad',
    lastName: 'Soyad',
    address: 'Adres',

    // Transactions
    date: 'Tarih',
    price: 'Fiyat',
    seller: 'Satıcı',
    buyer: 'Alıcı',
    totalAmount: 'Toplam Tutar',
    profit: 'Kar',
  },
};

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly STORAGE_KEY = 'bikehaus-language';

  currentLanguage = signal<Language>(this.getStoredLanguage());
  translations = signal<Translations>(TRANSLATIONS[this.currentLanguage()]);

  private getStoredLanguage(): Language {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'de' || stored === 'tr') {
      return stored;
    }
    return 'de'; // Default to German
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    this.translations.set(TRANSLATIONS[language]);
    localStorage.setItem(this.STORAGE_KEY, language);
  }

  t(key: keyof Translations): string {
    return this.translations()[key];
  }

  get(key: keyof Translations): string {
    return this.translations()[key];
  }
}
