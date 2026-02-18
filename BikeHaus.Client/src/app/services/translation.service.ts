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

  // Dashboard
  welcomeToBikeHaus: string;
  buyBicycle: string;
  sellBicycle: string;
  viewInventory: string;
  customerManagement: string;
  allPurchases: string;
  allSales: string;
  manageReturns: string;
  accessoryParts: string;
  configureApp: string;
  recentPurchases: string;
  recentSales: string;
  viewAll: string;
  noPurchasesFound: string;
  noSalesFound: string;

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
  saving: string;
  saveError: string;
  saveChanges: string;
  excelExport: string;
  remove: string;
  total: string;
  addManually: string;
  searching: string;

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
  selectBicycle: string;
  deleteConfirmBicycle: string;
  totalBicycles: string;
  bicycleReadonly: string;
  brandModel: string;

  // Customer
  firstName: string;
  lastName: string;
  address: string;
  searchAddress: string;
  addressHint: string;
  customer: string;
  customerName: string;
  editCustomer: string;
  newCustomer: string;
  deleteConfirmCustomer: string;

  // Transactions
  date: string;
  price: string;
  priceRequired: string;
  seller: string;
  buyer: string;
  totalAmount: string;
  profit: string;
  quantity: string;
  bicyclePrice: string;
  grandTotal: string;

  // Filters
  searchPlaceholder: string;
  allPaymentMethods: string;
  allDates: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  thisYear: string;
  thisQuarter: string;
  receiptNo: string;
  bicycle: string;
  paymentMethod: string;
  paymentMethodRequired: string;
  cash: string;
  bankTransfer: string;
  paypal: string;
  warranty: string;
  warrantyNew: string;
  warrantyUsed: string;
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
  stockNo: string;

  // Purchase
  newPurchaseTitle: string;
  editPurchase: string;
  savePurchase: string;
  purchaseDate: string;
  sellingPrice: string;
  usedCondition: string;
  newCondition: string;
  invoiceRequired: string;
  selectPhotos: string;
  photosSelected: string;
  purchaseReceipt: string;
  totalPurchases: string;

  // Sale
  newSaleTitle: string;
  editSale: string;
  saveSale: string;
  saleData: string;
  saleDateRequired: string;
  saleDate: string;
  newBicycle: string;
  usedBicycle: string;
  saleReceipt: string;
  totalSales: string;

  // Signatures
  signatures: string;
  buyerSignature: string;
  sellerSignature: string;
  customerSignature: string;
  shopSignature: string;
  noSignatureWarning: string;
  savedSignatureUsed: string;
  noSignatureFound: string;
  addNow: string;

  // Accessories
  accessories: string;
  accessoriesHint: string;
  addAccessoryFromCatalog: string;
  searchAccessory: string;
  accessoriesTotal: string;
  editAccessory: string;
  newAccessory: string;

  // Returns
  newReturn: string;
  newReturnTitle: string;
  saveReturn: string;
  noReturnsFound: string;
  deleteConfirmReturn: string;
  selectSale: string;
  saleRequired: string;
  selectSalePlaceholder: string;
  soldOn: string;
  returnData: string;
  returnDateRequired: string;
  returnReasonRequired: string;
  originalSale: string;
  allReasons: string;
  defect: string;
  other: string;
  returnReceipt: string;
  notAsExpected: string;
  reason: string;
  refund: string;
  selectReasonPlaceholder: string;
  reasonDetails: string;
  reasonDetailsPlaceholder: string;
  refundAmountRequired: string;
  shopEmployeeName: string;
  returnSaveError: string;

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

  // Statistics
  loadingStatistics: string;
  averagePerSale: string;
  dailyOverview: string;
  purchaseValue: string;
  saleValue: string;
  topBrands: string;
  soldCount: string;
  dailyProfit: string;
  custom: string;

  // Login
  welcomeBack: string;

  // Document
  deleteConfirmDocument: string;

  // Misc
  searchNumber: string;
  firstNameRequired: string;
  lastNameRequired: string;

  // Purchase Form/Edit
  condition: string;
  bicycleType: string;
  descriptionEquipment: string;
  purchaseData: string;
  screenshotsRequired: string;
  screenshotsHint: string;
  invoiceHint: string;
  selectInvoice: string;
  signerName: string;
  sellerFirstNameRequired: string;
  sellerLastNameRequired: string;
  brandIsRequired: string;
  modelIsRequired: string;
  frameNumberIsRequired: string;
  wheelSizeIsRequired: string;
  priceMustBeGreaterThanZero: string;
  purchaseDateIsRequired: string;
  invoiceIsRequired: string;
  screenshotIsRequired: string;
  invalidPurchaseId: string;
  purchaseNotFound: string;

  // Sale Form/Edit
  streetRequired: string;
  houseNumberRequired: string;
  postalCodeRequired: string;
  cityRequired: string;
  phoneRequired: string;
  accessoriesOptional: string;
  accessorySaleHint: string;
  designation: string;
  buyerName: string;
  sellerName: string;
  sellerSignatureShop: string;
  saleError: string;
  saveChangesError: string;
  invalidSaleId: string;
  saleNotFound: string;
  addressPlaceholder: string;

  // Bicycle List
  allStatus: string;
  searchBicyclePlaceholder: string;
  numberShort: string;
  details: string;
  sell: string;
  reserve: string;
  noBicyclesFound: string;

  // Bicycle Detail
  bicycleData: string;
  wheelSizeInch: string;
  selectOption: string;
  documents: string;
  uploadDocument: string;
  noDocuments: string;

  // Customer List
  customerSearchPlaceholder: string;
  name: string;
  noCustomersFound: string;
  update: string;
  createNew: string;
  deleteCustomerError: string;

  // Parts / Accessory Catalog
  accessoryCatalog: string;
  all: string;
  onlyActive: string;
  onlyInactive: string;
  category: string;
  defaultPrice: string;
  inactive: string;
  noAccessoriesAvailable: string;
  noMatches: string;
  activeInSales: string;
  exampleBikeLock: string;
  exampleSecurity: string;

  // Reservation Convert
  bicycleLabel: string;
  customerLabel: string;
  reservationLabel: string;
  depositColon: string;
  remainingAmount: string;
  salesNotes: string;
  totalAmountLabel: string;
  reservationNotFound: string;
  convertError: string;
  settingsLink: string;

  // Login
  username: string;
  password: string;
  usernameEnter: string;
  passwordEnter: string;
  login: string;
  loginLoading: string;
  loginFailed: string;
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

    // Dashboard
    welcomeToBikeHaus: 'Willkommen bei BikeHaus Freiburg',
    buyBicycle: 'Fahrrad ankaufen',
    sellBicycle: 'Fahrrad verkaufen',
    viewInventory: 'Bestand ansehen',
    customerManagement: 'Kundenverwaltung',
    allPurchases: 'Alle Ankäufe',
    allSales: 'Alle Verkäufe',
    manageReturns: 'Rückgaben verwalten',
    accessoryParts: 'Zubehörteile',
    configureApp: 'App konfigurieren',
    recentPurchases: 'Letzte Ankäufe',
    recentSales: 'Letzte Verkäufe',
    viewAll: 'Alle ansehen',
    noPurchasesFound: 'Keine Ankäufe vorhanden',
    noSalesFound: 'Keine Verkäufe vorhanden',

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
    saving: 'Wird gespeichert...',
    saveError: 'Fehler beim Speichern',
    saveChanges: 'Änderungen speichern',
    excelExport: 'Excel Export',
    remove: 'Entfernen',
    total: 'Gesamt',
    addManually: 'Manuell hinzufügen',
    searching: 'Suche...',

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
    selectBicycle: 'Fahrrad auswählen',
    deleteConfirmBicycle: 'Fahrrad wirklich löschen?',
    totalBicycles: 'Fahrräder gesamt',
    bicycleReadonly: 'Das Fahrrad kann nicht geändert werden.',
    brandModel: 'Marke/Modell',

    // Customer
    firstName: 'Vorname',
    lastName: 'Nachname',
    address: 'Adresse',
    searchAddress: 'Adresse suchen',
    addressHint: 'Tippen Sie eine Adresse ein für Vorschläge',
    customer: 'Kunde',
    customerName: 'Name Kunde',
    editCustomer: 'Kunde bearbeiten',
    newCustomer: 'Neuer Kunde',
    deleteConfirmCustomer: 'Kunde wirklich löschen?',

    // Transactions
    date: 'Datum',
    price: 'Preis',
    priceRequired: 'Preis (€) *',
    seller: 'Verkäufer',
    buyer: 'Käufer',
    totalAmount: 'Gesamtbetrag',
    profit: 'Gewinn',
    quantity: 'Menge',
    bicyclePrice: 'Fahrradpreis',
    grandTotal: 'Gesamtbetrag',

    // Filters
    searchPlaceholder: 'Suche nach Beleg-Nr., Fahrrad, Name...',
    allPaymentMethods: 'Alle Zahlungsarten',
    allDates: 'Alle Zeiträume',
    today: 'Heute',
    thisWeek: 'Diese Woche',
    thisMonth: 'Dieser Monat',
    thisYear: 'Dieses Jahr',
    thisQuarter: 'Dieses Quartal',
    receiptNo: 'Beleg-Nr.',
    bicycle: 'Fahrrad',
    paymentMethod: 'Zahlungsart',
    paymentMethodRequired: 'Zahlungsart *',
    cash: 'Bar',
    bankTransfer: 'Überweisung',
    paypal: 'PayPal',
    warranty: 'Garantie',
    warrantyNew: '2 Jahre Gewährleistung',
    warrantyUsed: '3 Monate Garantie',
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
    stockNo: 'Stok Nr.',

    // Purchase
    newPurchaseTitle: 'Neuer Ankauf (Kaufbeleg)',
    editPurchase: 'Ankauf bearbeiten',
    savePurchase: 'Ankauf speichern',
    purchaseDate: 'Kaufdatum',
    sellingPrice: 'VK-Preis',
    usedCondition: 'Gebraucht (3 Monate Garantie)',
    newCondition: 'Neu (2 Jahre Gewährleistung)',
    invoiceRequired: 'Rechnung (Kaufbeleg) *',
    selectPhotos: 'Fotos auswählen',
    photosSelected: 'Foto(s) ausgewählt',
    purchaseReceipt: 'Kaufbeleg',
    totalPurchases: 'Einkauf gesamt',

    // Sale
    newSaleTitle: 'Neuer Verkauf (Verkaufsbeleg)',
    editSale: 'Verkauf bearbeiten',
    saveSale: 'Verkauf speichern',
    saleData: 'Verkaufsdaten',
    saleDateRequired: 'Verkaufsdatum *',
    saleDate: 'Verkaufsdatum',
    newBicycle: 'Neues Fahrrad',
    usedBicycle: 'Gebrauchtes Fahrrad',
    saleReceipt: 'Verkaufsbeleg',
    totalSales: 'Verkauf gesamt',

    // Signatures
    signatures: 'Unterschriften',
    buyerSignature: 'Unterschrift Käufer',
    sellerSignature: 'Unterschrift Verkäufer',
    customerSignature: 'Unterschrift Kunde',
    shopSignature: 'Unterschrift Shop',
    noSignatureWarning: 'Keine Unterschrift in den Einstellungen hinterlegt.',
    savedSignatureUsed: 'Gespeicherte Unterschrift wird verwendet',
    noSignatureFound: 'Keine gespeicherte Unterschrift gefunden.',
    addNow: 'Jetzt hinzufügen',

    // Accessories
    accessories: 'Zubehör',
    accessoriesHint: 'Fügen Sie verkaufte Zubehörteile hinzu.',
    addAccessoryFromCatalog: 'Zubehör aus Katalog hinzufügen',
    searchAccessory: 'Zubehör suchen...',
    accessoriesTotal: 'Zubehör Summe',
    editAccessory: 'Zubehör bearbeiten',
    newAccessory: 'Neues Zubehör',

    // Returns
    newReturn: 'Neue Rückgabe',
    newReturnTitle: 'Neue Rückgabe (Rückgabebeleg)',
    saveReturn: 'Rückgabe speichern',
    noReturnsFound: 'Keine Rückgaben gefunden',
    deleteConfirmReturn: 'Rückgabe wirklich löschen?',
    selectSale: 'Verkauf auswählen',
    saleRequired: 'Verkauf (Beleg) *',
    selectSalePlaceholder: '-- Verkauf wählen --',
    soldOn: 'Verkauft am',
    returnData: 'Rückgabedaten',
    returnDateRequired: 'Rückgabedatum *',
    returnReasonRequired: 'Rückgabegrund *',
    originalSale: 'Org. Verkauf',
    allReasons: 'Alle Gründe',
    defect: 'Defekt',
    other: 'Sonstiges',
    returnReceipt: 'Rückgabebeleg',
    notAsExpected: 'Nicht wie erwartet',
    reason: 'Grund',
    refund: 'Erstattung',
    selectReasonPlaceholder: '-- Grund wählen --',
    reasonDetails: 'Details zum Grund',
    reasonDetailsPlaceholder: 'Bitte beschreiben Sie den Grund genauer...',
    refundAmountRequired: 'Erstattungsbetrag (€) *',
    shopEmployeeName: 'Name Shop-Mitarbeiter',
    returnSaveError: 'Fehler beim Speichern',

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

    // Statistics
    loadingStatistics: 'Lade Statistiken...',
    averagePerSale: 'Ø pro Verkauf',
    dailyOverview: 'Tägliche Übersicht',
    purchaseValue: 'Einkaufswert',
    saleValue: 'Verkaufswert',
    topBrands: 'Top Marken (nach Umsatz)',
    soldCount: 'verkauft',
    dailyProfit: 'Tagesgewinn',
    custom: 'Benutzerdefiniert',

    // Login
    welcomeBack: 'Willkommen zurück — bitte melden Sie sich an',

    // Document
    deleteConfirmDocument: 'Dokument wirklich löschen?',

    // Misc
    searchNumber: 'Nr suchen',
    firstNameRequired: 'Vorname *',
    lastNameRequired: 'Nachname *',

    // Purchase Form/Edit
    condition: 'Zustand',
    bicycleType: 'Fahrradtyp',
    descriptionEquipment: 'Beschreibung (Ausstattung)',
    purchaseData: 'Kaufdaten',
    screenshotsRequired: 'Kleinanzeigen Screenshots *',
    screenshotsHint: 'Bitte laden Sie Screenshots von Kleinanzeigen hoch.',
    invoiceHint: 'Bitte laden Sie die Kaufrechnung des neuen Fahrrads hoch.',
    selectInvoice: 'Rechnung auswählen',
    signerName: 'Name des Unterschreibenden',
    sellerFirstNameRequired: 'Vorname des Verkäufers ist erforderlich',
    sellerLastNameRequired: 'Nachname des Verkäufers ist erforderlich',
    brandIsRequired: 'Marke ist erforderlich',
    modelIsRequired: 'Modell ist erforderlich',
    frameNumberIsRequired: 'Rahmennummer ist erforderlich',
    wheelSizeIsRequired: 'Reifengröße ist erforderlich',
    priceMustBeGreaterThanZero: 'Preis muss größer als 0 sein',
    purchaseDateIsRequired: 'Kaufdatum ist erforderlich',
    invoiceIsRequired: 'Rechnung ist erforderlich',
    screenshotIsRequired: 'Kleinanzeigen Screenshot ist erforderlich',
    invalidPurchaseId: 'Ungültige Ankauf-ID',
    purchaseNotFound: 'Ankauf nicht gefunden',

    // Sale Form/Edit
    streetRequired: 'Straße *',
    houseNumberRequired: 'Hausnummer *',
    postalCodeRequired: 'PLZ *',
    cityRequired: 'Stadt *',
    phoneRequired: 'Telefon *',
    accessoriesOptional: 'Zubehör (Optional)',
    accessorySaleHint: 'Fügen Sie verkaufte Zubehörteile hinzu, diese erscheinen auf dem Verkaufsbeleg.',
    designation: 'Bezeichnung',
    buyerName: 'Name Käufer',
    sellerName: 'Name Verkäufer',
    sellerSignatureShop: 'Unterschrift Verkäufer (Shop)',
    saleError: 'Fehler beim Speichern des Verkaufs',
    saveChangesError: 'Fehler beim Speichern der Änderungen',
    invalidSaleId: 'Ungültige Verkauf-ID',
    saleNotFound: 'Verkauf nicht gefunden',
    addressPlaceholder: 'z.B. Bissierstraße 16, Freiburg',

    // Bicycle List
    allStatus: 'Alle Status',
    searchBicyclePlaceholder: 'Suche nach Marke, Modell, Rahmennummer...',
    numberShort: 'Nr.',
    details: 'Details',
    sell: 'Verkaufen',
    reserve: 'Reservieren',
    noBicyclesFound: 'Keine Fahrräder gefunden',

    // Bicycle Detail
    bicycleData: 'Fahrrad-Daten',
    wheelSizeInch: 'Reifengröße (Zoll)',
    selectOption: '– wählen –',
    documents: 'Dokumente',
    uploadDocument: 'Dokument hochladen',
    noDocuments: 'Keine Dokumente',

    // Customer List
    customerSearchPlaceholder: 'Suche nach Name, E-Mail, Telefon...',
    name: 'Name',
    noCustomersFound: 'Keine Kunden gefunden',
    update: 'Aktualisieren',
    createNew: 'Anlegen',
    deleteCustomerError: 'Fehler beim Löschen des Kunden',

    // Parts / Accessory Catalog
    accessoryCatalog: 'Zubehör-Katalog',
    all: 'Alle',
    onlyActive: 'Nur Aktive',
    onlyInactive: 'Nur Inaktive',
    category: 'Kategorie',
    defaultPrice: 'Standardpreis',
    inactive: 'Inaktiv',
    noAccessoriesAvailable: 'Keine Zubehörteile vorhanden',
    noMatches: 'Keine Treffer',
    activeInSales: 'Aktiv (wird in Verkäufen angezeigt)',
    exampleBikeLock: 'z.B. Fahrradschloss',
    exampleSecurity: 'z.B. Sicherheit',

    // Reservation Convert
    bicycleLabel: 'Fahrrad',
    customerLabel: 'Kunde',
    reservationLabel: 'Reservierung',
    depositColon: 'Anzahlung:',
    remainingAmount: 'Restbetrag:',
    salesNotes: 'Verkaufsnotizen...',
    totalAmountLabel: 'Gesamtbetrag:',
    reservationNotFound: 'Reservierung nicht gefunden.',
    convertError: 'Fehler beim Umwandeln in Verkauf',
    settingsLink: 'In den Einstellungen hinterlegen',

    // Login
    username: 'Benutzername',
    password: 'Passwort',
    usernameEnter: 'Benutzername eingeben',
    passwordEnter: 'Passwort eingeben',
    login: 'Anmelden',
    loginLoading: 'Wird geladen...',
    loginFailed: 'Anmeldung fehlgeschlagen.',
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

    // Dashboard
    welcomeToBikeHaus: 'BikeHaus Freiburg\'a hoş geldiniz',
    buyBicycle: 'Bisiklet al',
    sellBicycle: 'Bisiklet sat',
    viewInventory: 'Envanteri görüntüle',
    customerManagement: 'Müşteri yönetimi',
    allPurchases: 'Tüm alımlar',
    allSales: 'Tüm satışlar',
    manageReturns: 'İadeleri yönet',
    accessoryParts: 'Aksesuar parçaları',
    configureApp: 'Uygulamayı yapılandır',
    recentPurchases: 'Son alımlar',
    recentSales: 'Son satışlar',
    viewAll: 'Tümünü göster',
    noPurchasesFound: 'Alım bulunamadı',
    noSalesFound: 'Satış bulunamadı',

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
    saving: 'Kaydediliyor...',
    saveError: 'Kaydetme hatası',
    saveChanges: 'Değişiklikleri kaydet',
    excelExport: 'Excel Dışa Aktar',
    remove: 'Kaldır',
    total: 'Toplam',
    addManually: 'Manuel ekle',
    searching: 'Aranıyor...',

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
    selectBicycle: 'Bisiklet seç',
    deleteConfirmBicycle: 'Bisikleti silmek istediğinize emin misiniz?',
    totalBicycles: 'Toplam bisiklet',
    bicycleReadonly: 'Bisiklet değiştirilemez.',
    brandModel: 'Marka/Model',

    // Customer
    firstName: 'Ad',
    lastName: 'Soyad',
    address: 'Adres',
    searchAddress: 'Adres ara',
    addressHint: 'Öneri için adres yazın',
    customer: 'Müşteri',
    customerName: 'Müşteri adı',
    editCustomer: 'Müşteri düzenle',
    newCustomer: 'Yeni müşteri',
    deleteConfirmCustomer: 'Müşteriyi silmek istediğinize emin misiniz?',

    // Transactions
    date: 'Tarih',
    price: 'Fiyat',
    priceRequired: 'Fiyat (€) *',
    seller: 'Satıcı',
    buyer: 'Alıcı',
    totalAmount: 'Toplam Tutar',
    profit: 'Kar',
    quantity: 'Adet',
    bicyclePrice: 'Bisiklet fiyatı',
    grandTotal: 'Genel toplam',

    // Filters
    searchPlaceholder: 'Belge no, bisiklet, isim ara...',
    allPaymentMethods: 'Tüm Ödeme Yöntemleri',
    allDates: 'Tüm Tarihler',
    today: 'Bugün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    thisYear: 'Bu Yıl',
    thisQuarter: 'Bu Çeyrek',
    receiptNo: 'Belge No',
    bicycle: 'Bisiklet',
    paymentMethod: 'Ödeme Yöntemi',
    paymentMethodRequired: 'Ödeme Yöntemi *',
    cash: 'Nakit',
    bankTransfer: 'Banka Havalesi',
    paypal: 'PayPal',
    warranty: 'Garanti',
    warrantyNew: '2 Yıl Garanti',
    warrantyUsed: '3 Ay Garanti',
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
    stockNo: 'Stok No',

    // Purchase
    newPurchaseTitle: 'Yeni Alım (Alış Belgesi)',
    editPurchase: 'Alım düzenle',
    savePurchase: 'Alım kaydet',
    purchaseDate: 'Alım tarihi',
    sellingPrice: 'Satış fiyatı',
    usedCondition: 'Kullanılmış (3 Ay Garanti)',
    newCondition: 'Yeni (2 Yıl Garanti)',
    invoiceRequired: 'Fatura (Alış Belgesi) *',
    selectPhotos: 'Fotoğraf seç',
    photosSelected: 'fotoğraf seçildi',
    purchaseReceipt: 'Alış belgesi',
    totalPurchases: 'Toplam alımlar',

    // Sale
    newSaleTitle: 'Yeni Satış (Satış Belgesi)',
    editSale: 'Satış düzenle',
    saveSale: 'Satış kaydet',
    saleData: 'Satış bilgileri',
    saleDateRequired: 'Satış tarihi *',
    saleDate: 'Satış tarihi',
    newBicycle: 'Yeni bisiklet',
    usedBicycle: 'Kullanılmış bisiklet',
    saleReceipt: 'Satış belgesi',
    totalSales: 'Toplam satışlar',

    // Signatures
    signatures: 'İmzalar',
    buyerSignature: 'Alıcı imzası',
    sellerSignature: 'Satıcı imzası',
    customerSignature: 'Müşteri imzası',
    shopSignature: 'Dükkan imzası',
    noSignatureWarning: 'Ayarlarda imza bulunamadı.',
    savedSignatureUsed: 'Kayıtlı imza kullanılıyor',
    noSignatureFound: 'Kayıtlı imza bulunamadı.',
    addNow: 'Şimdi ekle',

    // Accessories
    accessories: 'Aksesuarlar',
    accessoriesHint: 'Satılan aksesuarları ekleyin.',
    addAccessoryFromCatalog: 'Katalogdan aksesuar ekle',
    searchAccessory: 'Aksesuar ara...',
    accessoriesTotal: 'Aksesuar toplamı',
    editAccessory: 'Aksesuar düzenle',
    newAccessory: 'Yeni aksesuar',

    // Returns
    newReturn: 'Yeni İade',
    newReturnTitle: 'Yeni İade (İade Belgesi)',
    saveReturn: 'İade kaydet',
    noReturnsFound: 'İade bulunamadı',
    deleteConfirmReturn: 'İadeyi silmek istediğinize emin misiniz?',
    selectSale: 'Satış seç',
    saleRequired: 'Satış (Belge) *',
    selectSalePlaceholder: '-- Satış seçin --',
    soldOn: 'Satış tarihi',
    returnData: 'İade bilgileri',
    returnDateRequired: 'İade tarihi *',
    returnReasonRequired: 'İade nedeni *',
    originalSale: 'Orijinal Satış',
    allReasons: 'Tüm Nedenler',
    defect: 'Arıza',
    other: 'Diğer',
    returnReceipt: 'İade belgesi',
    notAsExpected: 'Beklendiği gibi değil',
    reason: 'Neden',
    refund: 'İade',
    selectReasonPlaceholder: '-- Neden seçin --',
    reasonDetails: 'Neden detayları',
    reasonDetailsPlaceholder: 'Lütfen nedeni daha ayrıntılı açıklayın...',
    refundAmountRequired: 'İade tutarı (€) *',
    shopEmployeeName: 'Dükkan çalışanı adı',
    returnSaveError: 'Kaydetme hatası',

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
    deleteConfirmReservation:
      'Bu rezervasyonu silmek istediğinize emin misiniz?',
    activeReservations: 'Aktif Rezervasyonlar',
    expiredReservations: 'Süresi Dolan Rezervasyonlar',
    cancelledReservations: 'İptal Edilen Rezervasyonlar',
    convertedReservations: 'Satışa Dönüştürülen Rezervasyonlar',
    reserved: 'Rezerve',
    active: 'Aktif',
    expired: 'Süresi Doldu',
    cancelled: 'İptal Edildi',
    converted: 'Dönüştürüldü',

    // Statistics
    loadingStatistics: 'İstatistikler yükleniyor...',
    averagePerSale: 'Satış başına ort.',
    dailyOverview: 'Günlük Özet',
    purchaseValue: 'Alım değeri',
    saleValue: 'Satış değeri',
    topBrands: 'En İyi Markalar (Ciro)',
    soldCount: 'satıldı',
    dailyProfit: 'Günlük kar',
    custom: 'Özel',

    // Login
    welcomeBack: 'Hoş geldiniz — lütfen giriş yapın',

    // Document
    deleteConfirmDocument: 'Belgeyi silmek istediğinize emin misiniz?',

    // Misc
    searchNumber: 'No ara',
    firstNameRequired: 'Ad *',
    lastNameRequired: 'Soyad *',

    // Purchase Form/Edit
    condition: 'Durum',
    bicycleType: 'Bisiklet Tipi',
    descriptionEquipment: 'Açıklama (Donanım)',
    purchaseData: 'Alım Bilgileri',
    screenshotsRequired: 'Sahibinden Ekran Görüntüleri *',
    screenshotsHint: 'Lütfen sahibinden ekran görüntülerini yükleyin.',
    invoiceHint: 'Lütfen yeni bisikletin satın alma faturasını yükleyin.',
    selectInvoice: 'Fatura seç',
    signerName: 'İmza sahibinin adı',
    sellerFirstNameRequired: 'Satıcı adı gerekli',
    sellerLastNameRequired: 'Satıcı soyadı gerekli',
    brandIsRequired: 'Marka gerekli',
    modelIsRequired: 'Model gerekli',
    frameNumberIsRequired: 'Şase numarası gerekli',
    wheelSizeIsRequired: 'Tekerlek boyutu gerekli',
    priceMustBeGreaterThanZero: 'Fiyat 0\'dan büyük olmalı',
    purchaseDateIsRequired: 'Alım tarihi gerekli',
    invoiceIsRequired: 'Fatura gerekli',
    screenshotIsRequired: 'Sahibinden ekran görüntüsü gerekli',
    invalidPurchaseId: 'Geçersiz alım kimliği',
    purchaseNotFound: 'Alım bulunamadı',

    // Sale Form/Edit
    streetRequired: 'Sokak *',
    houseNumberRequired: 'Kapı No *',
    postalCodeRequired: 'Posta Kodu *',
    cityRequired: 'Şehir *',
    phoneRequired: 'Telefon *',
    accessoriesOptional: 'Aksesuarlar (İsteğe Bağlı)',
    accessorySaleHint: 'Satılan aksesuarları ekleyin, satış belgesinde görünecektir.',
    designation: 'Tanım',
    buyerName: 'Alıcı Adı',
    sellerName: 'Satıcı Adı',
    sellerSignatureShop: 'Satıcı İmzası (Dükkan)',
    saleError: 'Satış kaydedilemedi',
    saveChangesError: 'Değişiklikler kaydedilemedi',
    invalidSaleId: 'Geçersiz satış kimliği',
    saleNotFound: 'Satış bulunamadı',
    addressPlaceholder: 'örn. Bissierstraße 16, Freiburg',

    // Bicycle List
    allStatus: 'Tüm Durumlar',
    searchBicyclePlaceholder: 'Marka, model, şase numarası ara...',
    numberShort: 'No.',
    details: 'Detaylar',
    sell: 'Sat',
    reserve: 'Rezerve Et',
    noBicyclesFound: 'Bisiklet bulunamadı',

    // Bicycle Detail
    bicycleData: 'Bisiklet Bilgileri',
    wheelSizeInch: 'Tekerlek Boyutu (İnç)',
    selectOption: '– seçin –',
    documents: 'Belgeler',
    uploadDocument: 'Belge yükle',
    noDocuments: 'Belge yok',

    // Customer List
    customerSearchPlaceholder: 'Ad, e-posta, telefon ara...',
    name: 'Ad',
    noCustomersFound: 'Müşteri bulunamadı',
    update: 'Güncelle',
    createNew: 'Oluştur',
    deleteCustomerError: 'Müşteri silinirken hata oluştu',

    // Parts / Accessory Catalog
    accessoryCatalog: 'Aksesuar Kataloğu',
    all: 'Tümü',
    onlyActive: 'Sadece Aktif',
    onlyInactive: 'Sadece Pasif',
    category: 'Kategori',
    defaultPrice: 'Standart Fiyat',
    inactive: 'Pasif',
    noAccessoriesAvailable: 'Aksesuar bulunmuyor',
    noMatches: 'Eşleşme yok',
    activeInSales: 'Aktif (satışlarda gösterilir)',
    exampleBikeLock: 'örn. Bisiklet kilidi',
    exampleSecurity: 'örn. Güvenlik',

    // Reservation Convert
    bicycleLabel: 'Bisiklet',
    customerLabel: 'Müşteri',
    reservationLabel: 'Rezervasyon',
    depositColon: 'Kapora:',
    remainingAmount: 'Kalan Tutar:',
    salesNotes: 'Satış notları...',
    totalAmountLabel: 'Toplam Tutar:',
    reservationNotFound: 'Rezervasyon bulunamadı.',
    convertError: 'Satışa dönüştürme hatası',
    settingsLink: 'Ayarlarda belirtin',

    // Login
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    usernameEnter: 'Kullanıcı adı girin',
    passwordEnter: 'Şifre girin',
    login: 'Giriş Yap',
    loginLoading: 'Yükleniyor...',
    loginFailed: 'Giriş başarısız.',
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
