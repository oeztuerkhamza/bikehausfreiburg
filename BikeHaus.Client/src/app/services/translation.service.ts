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
  ownerInfo: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerSignature: string;
  saveSignature: string;
  deleteSignature: string;
  plannedSellingPrice: string;

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

  // Filters
  searchPlaceholder: string;
  allPaymentMethods: string;
  allDates: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  thisYear: string;
  receiptNo: string;
  bicycle: string;
  paymentMethod: string;
  cash: string;
  bankTransfer: string;
  paypal: string;
  warranty: string;
  newPurchase: string;
  newSale: string;
  noPurchases: string;
  noSales: string;
  noResults: string;
  deleteConfirmPurchase: string;
  deleteConfirmSale: string;
  deleteError: string;
  from: string;
  to: string;

  // Reservations
  reservations: string;
  newReservation: string;
  reservationNumber: string;
  reservationDate: string;
  expirationDate: string;
  reservationDays: string;
  deposit: string;
  notes: string;
  convertToSale: string;
  cancelReservation: string;
  noReservations: string;
  deleteConfirmReservation: string;
  activeReservations: string;
  expiredReservations: string;
  cancelledReservations: string;
  convertedReservations: string;
  reserved: string;
  active: string;
  expired: string;
  cancelled: string;
  converted: string;
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
    ownerInfo: 'Inhaber',
    ownerFirstName: 'Vorname',
    ownerLastName: 'Nachname',
    ownerSignature: 'Unterschrift des Inhabers',
    saveSignature: 'Unterschrift speichern',
    deleteSignature: 'Unterschrift löschen',
    plannedSellingPrice: 'Geplanter Verkaufspreis',

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

    // Filters
    searchPlaceholder: 'Suche nach Beleg-Nr., Fahrrad, Name...',
    allPaymentMethods: 'Alle Zahlungsarten',
    allDates: 'Alle Zeiträume',
    today: 'Heute',
    thisWeek: 'Diese Woche',
    thisMonth: 'Dieser Monat',
    thisYear: 'Dieses Jahr',
    receiptNo: 'Beleg-Nr.',
    bicycle: 'Fahrrad',
    paymentMethod: 'Zahlungsart',
    cash: 'Bar',
    bankTransfer: 'Überweisung',
    paypal: 'PayPal',
    warranty: 'Garantie',
    newPurchase: 'Neuer Ankauf',
    newSale: 'Neuer Verkauf',
    noPurchases: 'Keine Ankäufe vorhanden',
    noSales: 'Keine Verkäufe vorhanden',
    noResults: 'Keine Ergebnisse gefunden',
    deleteConfirmPurchase: 'Ankauf wirklich löschen?',
    deleteConfirmSale: 'Verkauf wirklich löschen?',
    deleteError: 'Fehler beim Löschen',
    from: 'Von',
    to: 'Bis',

    // Reservations
    reservations: 'Reservierungen',
    newReservation: 'Neue Reservierung',
    reservationNumber: 'Reservierungsnummer',
    reservationDate: 'Reservierungsdatum',
    expirationDate: 'Ablaufdatum',
    reservationDays: 'Reservierungstage',
    deposit: 'Anzahlung',
    notes: 'Notizen',
    convertToSale: 'In Verkauf umwandeln',
    cancelReservation: 'Reservierung stornieren',
    noReservations: 'Keine Reservierungen vorhanden',
    deleteConfirmReservation: 'Reservierung wirklich löschen?',
    activeReservations: 'Aktive Reservierungen',
    expiredReservations: 'Abgelaufene Reservierungen',
    cancelledReservations: 'Stornierte Reservierungen',
    convertedReservations: 'Umgewandelte Reservierungen',
    reserved: 'Reserviert',
    active: 'Aktiv',
    expired: 'Abgelaufen',
    cancelled: 'Storniert',
    converted: 'Umgewandelt',
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
    ownerInfo: 'İşletme Sahibi',
    ownerFirstName: 'Ad',
    ownerLastName: 'Soyad',
    ownerSignature: 'İşletme Sahibi İmzası',
    saveSignature: 'İmzayı Kaydet',
    deleteSignature: 'İmzayı Sil',
    plannedSellingPrice: 'Planlanan Satış Fiyatı',

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

    // Filters
    searchPlaceholder: 'Belge no, bisiklet, isim ara...',
    allPaymentMethods: 'Tüm Ödeme Yöntemleri',
    allDates: 'Tüm Tarihler',
    today: 'Bugün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    thisYear: 'Bu Yıl',
    receiptNo: 'Belge No',
    bicycle: 'Bisiklet',
    paymentMethod: 'Ödeme Yöntemi',
    cash: 'Nakit',
    bankTransfer: 'Banka Havalesi',
    paypal: 'PayPal',
    warranty: 'Garanti',
    newPurchase: 'Yeni Alım',
    newSale: 'Yeni Satış',
    noPurchases: 'Alım bulunamadı',
    noSales: 'Satış bulunamadı',
    noResults: 'Sonuç bulunamadı',
    deleteConfirmPurchase: 'Bu alımı silmek istediğinize emin misiniz?',
    deleteConfirmSale: 'Bu satışı silmek istediğinize emin misiniz?',
    deleteError: 'Silme hatası',
    from: 'Başlangıç',
    to: 'Bitiş',

    // Reservations
    reservations: 'Rezervasyonlar',
    newReservation: 'Yeni Rezervasyon',
    reservationNumber: 'Rezervasyon Numarası',
    reservationDate: 'Rezervasyon Tarihi',
    expirationDate: 'Bitiş Tarihi',
    reservationDays: 'Rezervasyon Günleri',
    deposit: 'Kapora',
    notes: 'Notlar',
    convertToSale: 'Satışa Dönüştür',
    cancelReservation: 'Rezervasyonu İptal Et',
    noReservations: 'Rezervasyon bulunamadı',
    deleteConfirmReservation: 'Bu rezervasyonu silmek istediğinize emin misiniz?',
    activeReservations: 'Aktif Rezervasyonlar',
    expiredReservations: 'Süresi Dolan Rezervasyonlar',
    cancelledReservations: 'İptal Edilen Rezervasyonlar',
    convertedReservations: 'Satışa Dönüştürülen Rezervasyonlar',
    reserved: 'Rezerve',
    active: 'Aktif',
    expired: 'Süresi Doldu',
    cancelled: 'İptal Edildi',
    converted: 'Dönüştürüldü',
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
