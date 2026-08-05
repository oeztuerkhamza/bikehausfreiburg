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
  rentals: string;
  rentalBookings: string;
  rentalAccessories: string;
  mietfahrraeder: string;
  rentalAvailability: string;
  bicycleCalendar: string;
  statistics: string;
  settings: string;
  skipToMain: string;

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
  printDocument: string;
  editDocument: string;
  preview: string;
  download: string;

  // Common
  save: string;
  cancel: string;
  delete: string;
  confirmDelete: string;
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
  drawSignature: string;
  uploadSignature: string;
  or: string;
  plannedSellingPrice: string;

  // Purchase fields
  adNumber: string;
  adNumberHint: string;

  // Photo Gallery
  photoGallery: string;
  noPhotos: string;
  addPhotos: string;
  uploading: string;

  // Quick Add Bike
  quickAddBike: string;

  // Backup & Restore
  backupRestore: string;
  backupDescription: string;
  createBackup: string;
  creatingBackup: string;
  backupSuccess: string;
  backupError: string;
  restoreSystem: string;
  restoreDescription: string;
  restoreWarning: string;
  selectBackupFile: string;
  restoring: string;
  restoreSuccess: string;
  restoreError: string;
  restoreConfirm: string;
  restoreConfirmMessage: string;
  downloadBackup: string;
  uploadBackup: string;

  // Export
  exportDocuments: string;
  exportDescription: string;
  exportStartDate: string;
  exportEndDate: string;
  exportDownloadZip: string;
  exportDownloading: string;
  exportSuccess: string;
  exportError: string;
  exportNoData: string;

  // User Account
  userAccount: string;
  currentUsername: string;
  changeUsername: string;
  newUsername: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  usernameChanged: string;
  usernameChangeError: string;
  passwordChanged: string;
  passwordChangeError: string;
  passwordMismatch: string;

  // Bicycle
  brand: string;
  model: string;
  frameNumber: string;
  duplicateFrameNumber: string;
  stockNumber: string;
  frameSize: string;
  color: string;
  wheelSize: string;
  description: string;
  status: string;
  available: string;
  sold: string;
  returned: string;
  selectBicycle: string;
  bicycleDetails: string;
  expand: string;
  collapse: string;
  deleteConfirmBicycle: string;
  totalBicycles: string;
  bicycleReadonly: string;
  brandModel: string;
  rentalSettings: string;
  isRentable: string;
  rentalPriceDay1: string;
  rentalPriceDay2: string;
  rentalPriceDay3: string;
  rentalPriceDay4: string;
  rentalPriceDay5: string;
  rentalPriceDay6: string;
  rentalPriceDay7: string;
  rentalPriceAdditionalDayAfter7: string;

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
  wireTransfer: string;
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
  deleteSuccess: string;
  saveSuccess: string;
  cancelSuccess: string;
  from: string;
  // Missing Purchases
  missingPurchases: string;
  missingPurchasesTitle: string;
  missingPurchasesDesc: string;
  noMissingPurchases: string;
  createPurchase: string;
  soldTo: string;
  salePrice: string;
  to: string;

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
  takePhoto: string;
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
  rentalAccessoryDayPrice: string;
  rentalAccessoryDescription: string;
  rentalAccessoryActive: string;
  rentalAccessoryPhoto: string;
  rentalAccessoryUploadPhoto: string;
  rentalAccessoryRemovePhoto: string;
  rentalAccessoryPhotoHint: string;
  rentalAccessoryNew: string;
  rentalAccessoryEdit: string;
  rentalAccessoryNoItems: string;

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
  reservedUntil: string;
  reservedUntilWarning: string;
  salePriceHint: string;
  depositPaymentMethod: string;
  companySignatureHint: string;
  change: string;
  day: string;
  days: string;
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

  // Rental Booking (Homepage)
  rentalBookingNumber: string;
  rentalBookingPending: string;
  rentalBookingApproved: string;
  rentalBookingCancelled: string;
  rentalBookingShowCompleted: string;
  rentalBookingNoItems: string;
  rentalBookingViewList: string;
  rentalBookingViewCalendar: string;
  rentalBookingCalToday: string;
  rentalBookingCalLegendBike: string;
  rentalBookingCalLegendEBike: string;
  rentalBookingCalLegendPending: string;
  rentalBookingCalEmpty: string;
  rentalBookingDetails: string;
  rentalBookingApprove: string;
  rentalBookingReactivate: string;
  rentalBookingReactivated: string;
  rentalBookingCancel: string;
  rentalBookingAdminNotes: string;
  rentalBookingNotes: string;
  rentalBookingDates: string;
  abholzeit: string;
  rentalBookingCreatedAt: string;
  rentalBookingApprovedAt: string;
  rentalBookingCancelledAt: string;
  rentalBookingAccessories: string;
  rentalBookingSearchPlaceholder: string;
  rentalBookingApproveConfirm: string;
  rentalBookingCancelConfirm: string;

  // Statistics
  loadingStatistics: string;
  averagePerSale: string;
  dailyOverview: string;
  rentalStatistics: string;
  totalRentalDays: string;
  rentedBikesCount: string;
  rentalRevenue: string;
  newRentals: string;
  topRentedBikes: string;
  rentalDaysUnit: string;
  purchaseValue: string;
  saleValue: string;
  topBrands: string;
  soldCount: string;
  dailyProfit: string;
  custom: string;
  expenses: string;
  expenseValue: string;
  netProfit: string;
  expensesByCategory: string;
  newExpense: string;
  editExpense: string;
  noExpenses: string;
  expenseCount: string;
  searchExpensePlaceholder: string;
  expenseNamePlaceholder: string;
  supplier: string;
  supplierPlaceholder: string;
  deleteConfirmExpense: string;
  dueDate: string;
  paid: string;
  unpaid: string;
  document: string;
  chooseFile: string;

  // Invoices
  invoices: string;
  newInvoice: string;
  editInvoice: string;
  noInvoices: string;
  invoiceNumber: string;
  customerAddress: string;
  searchInvoicePlaceholder: string;
  deleteConfirmInvoice: string;
  deleteConfirmRentalBooking: string;
  invoiceCount: string;
  invoiceTotal: string;

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
  conditionIsRequired: string;
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
  discount: string;
  discountOptional: string;
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
  publishOnWebsite: string;
  unpublishFromWebsite: string;
  publishOnKleinanzeigen: string;
  unpublishFromKleinanzeigen: string;
  publishedOnWebsite: string;
  unpublishedFromWebsite: string;
  publishedOnKleinanzeigen: string;
  unpublishedFromKleinanzeigen: string;
  galleryPhotos: string;
  galleryPhotosHint: string;
  salesPhotos: string;
  salesPhotosHint: string;
  purchasePhotos: string;
  purchasePhotosHint: string;
  artLabel: string;
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

  // Bulk Purchase & Filters
  singlePurchase: string;
  bulkPurchase: string;
  bulkPurchaseDesc: string;
  supplierStore: string;
  storeName: string;
  storeNamePlaceholder: string;
  storeNameRequired: string;
  bulkQuantityHint: string;
  pricePerBike: string;
  totalPrice: string;
  saveBulkPurchase: string;
  invoiceOptional: string;
  sameInvoiceForAllBikes: string;
  screenshotsOptional: string;
  documentsOptionalHint: string;
  filters: string;
  clearFilters: string;
  filterByBrand: string;
  filterByColor: string;
  allBicycleTypes: string;

  // Archive
  archive: string;
  archiveSearch: string;
  archiveSearchPlaceholder: string;
  archiveSearchHint: string;
  archiveNoResults: string;
  archiveSelectBicycle: string;
  archiveTimeline: string;
  archiveBicycleInfo: string;
  archivePurchase: string;
  archiveSale: string;
  archiveReturn: string;
  archiveReservation: string;
  archiveReservationCancelled: string;
  archivePurchaseReceipt: string;
  archiveSaleReceipt: string;
  archiveViewDocument: string;
  archivePrintDocument: string;
  archiveBackToSearch: string;

  // Bike Selector
  bikeSelectorPlaceholder: string;
  noAvailableBikes: string;
  selectedColon: string;
  frameColon: string;
  colorColon: string;
  wheelsColon: string;
  typeColon: string;
  invalidNumberError: string;
  bikeAlreadySoldError: string;
  bikeNotFoundError: string;

  // Pagination
  paginationEntries: string;
  paginationPage: string;
  paginationOf: string;
  paginationPerPage: string;
  paginationFirstPage: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationLastPage: string;

  // Signature Pad
  clearButton: string;

  // Address Autocomplete
  addressInputPlaceholder: string;

  // Bicycle Labels
  createLabels: string;
  labelsSearchPlaceholder: string;
  selectedText: string;
  selectAllButton: string;
  deselectAllButton: string;
  printButton: string;
  wheelsSpec: string;
  backToSelection: string;
  printNowButton: string;
  labelsWord: string;
  bicyclesPlural: string;

  // Settings - Kleinanzeigen
  kleinanzeigenIntegration: string;
  kleinanzeigenProfileUrl: string;
  kleinanzeigenUrlHint: string;
  syncNow: string;
  syncingText: string;
  lastSync: string;
  syncNew: string;
  syncUpdated: string;
  syncDeactivated: string;
  bicycleNumbering: string;
  startNumber: string;
  autoNumberHint: string;
  syncFailed: string;
  unknownError: string;

  // Reservation Form
  reservationDataTitle: string;
  expirationDateColon: string;
  selectBicycleWarning: string;
  firstNameRequiredMsg: string;
  lastNameRequiredMsg: string;
  streetRequiredMsg: string;
  houseNumberRequiredMsg: string;
  postalCodeRequiredMsg: string;
  cityRequiredMsg: string;
  phoneRequiredMsg: string;
  reservationDaysWarning: string;
  reservationCreateError: string;
  addressSuggestHint: string;

  // Archive
  noEventsFound: string;

  // Sale Form
  requiredFieldsMissing: string;
  requiredField: string;

  // Neue Fahrräder
  neueFahrraeder: string;
  neueFahrradNew: string;
  neueFahrradEdit: string;
  neueFahrradTitle: string;
  neueFahrradDescription: string;
  neueFahrradPrice: string;
  neueFahrradCategory: string;
  neueFahrradBrand: string;
  neueFahrradModel: string;
  neueFahrradColor: string;
  colorBlack: string;
  colorWhite: string;
  colorRed: string;
  colorBlue: string;
  colorGreen: string;
  colorYellow: string;
  colorOrange: string;
  colorBraun: string;
  colorGray: string;
  colorSilver: string;
  colorPink: string;
  colorTurkis: string;
  colorLila: string;
  colorDunkelblau: string;
  neueFahrradFrameSize: string;
  neueFahrradWheelSize: string;
  neueFahrradGears: string;
  neueFahrradCondition: string;
  neueFahrradActive: string;
  neueFahrradPhotos: string;
  neueFahrradNoItems: string;
  neueFahrradDeleteConfirm: string;
  neueFahrradSaved: string;
  neueFahrradDeleted: string;
  neueFahrradUploadPhotos: string;
  neueFahrradSelectCategory: string;

  // E-Bikes
  eBikes: string;
  eBikeNew: string;
  eBikeEdit: string;
  eBikeTitle: string;
  eBikeDescription: string;
  eBikePrice: string;
  eBikeCategory: string;
  eBikeBrand: string;
  eBikeModel: string;
  eBikeColor: string;
  eBikeFrameSize: string;
  eBikeWheelSize: string;
  eBikeGears: string;
  eBikeCondition: string;
  eBikeActive: string;
  eBikePhotos: string;
  eBikeNoItems: string;
  eBikeDeleteConfirm: string;
  eBikeSaved: string;
  eBikeDeleted: string;
  eBikeUploadPhotos: string;
  eBikeSelectCategory: string;
  eBikeMotorSection: string;
  eBikeMotorBrand: string;
  eBikeMotorPosition: string;
  eBikeSelectMotorPosition: string;
  eBikeAkkuKapazitaet: string;
  eBikeReichweite: string;
  eBikeMotorLeistung: string;

  // Homepage Accessories
  homepageAccessories: string;
  homepageAccessoryNew: string;
  homepageAccessoryEdit: string;
  homepageAccessoryTitle: string;
  homepageAccessoryDescription: string;
  homepageAccessoryPrice: string;
  homepageAccessoryCategory: string;
  homepageAccessoryBrand: string;
  homepageAccessoryActive: string;
  homepageAccessoryPhotos: string;
  homepageAccessoryNoItems: string;
  homepageAccessoryDeleteConfirm: string;
  homepageAccessoryUploadPhotos: string;
  homepageAccessorySelectCategory: string;

  // Mietfahrräder
  mietfahrradList: string;
  mietfahrradNew: string;
  mietfahrradEdit: string;
  mietfahrradBrand: string;
  mietfahrradModel: string;
  mietfahrradType: string;
  mietfahrradSize: string;
  mietfahrradColor: string;
  mietfahrradActive: string;
  mietfahrradNoItems: string;
  mietfahrradDeleteConfirm: string;
  mietfahrradPhotos: string;
  mietfahrradUploadPhotos: string;
  mietfahrradRentalPrices: string;
  mietfahrradPriceDay1: string;
  mietfahrradPriceDay2: string;
  mietfahrradPriceDay3: string;
  mietfahrradPriceDay4: string;
  mietfahrradPriceDay5: string;
  mietfahrradPriceDay6: string;
  mietfahrradPriceDay7: string;
  mietfahrradPriceAdditionalDayAfter7: string;
  mietfahrradDescription: string;
  mietfahrradFrameSize: string;
  mietfahrradFrameHeight: string;
  mietfahrradFrameHeightHint: string;
  mietfahrradApplySuggestion: string;
  mietfahrradSuggestion: string;
  mietfahrradIsRentable: string;
  mietfahrradToggleRentable: string;
  mietfahrradBasicInfo: string;
  mietfahrradSaveSuccess: string;
  mietfahrradTitelbild: string;
  mietfahrradSetAsTitelbild: string;
  mietfahrradMoveLeft: string;
  mietfahrradMoveRight: string;
  mietfahrradPhotoOrderHint: string;
  mietfahrradOrderSaveError: string;
  mietfahrradPrev: string;
  mietfahrradNext: string;
  mietfahrradNavInactive: string;
  mietfahrradUnsavedTitle: string;
  mietfahrradUnsavedMessage: string;
  mietfahrradUnsavedDiscard: string;

  // Rental Reviews
  rentalReviews: string;
  rentalReviewTitle: string;
  rentalReviewAll: string;
  rentalReviewPending: string;
  rentalReviewApproved: string;
  rentalReviewName: string;
  rentalReviewStars: string;
  rentalReviewComment: string;
  rentalReviewDate: string;
  rentalReviewStatus: string;
  rentalReviewApprove: string;
  rentalReviewReject: string;
  rentalReviewDelete: string;
  rentalReviewDeleteConfirm: string;
  rentalReviewNoItems: string;
  rentalReviewAdminNote: string;
  rentalReviewSaved: string;
  rentalReviewDeleted: string;

  // Kundenfelder in Miet-, Verkaufs- und Ankaufsformular.
  //
  // Diese Formulare werden am Ladentisch zusammen mit dem Kunden ausgefüllt und
  // unterschrieben — oft von Touristen, die weder Deutsch noch Türkisch lesen.
  // Deshalb tragen genau diese Labels die englische Bezeichnung in Klammern.
  // Die allgemeinen Schlüssel (street, city, …) bleiben einsprachig: sie
  // stehen auch in den Shop-Einstellungen und in Tabellenköpfen.
  firstNameIntl: string;
  lastNameIntl: string;
  streetIntl: string;
  houseNumberIntl: string;
  postalCodeIntl: string;
  cityIntl: string;
  phoneIntl: string;
  emailIntl: string;
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
    rentals: 'Mietverträge',
    rentalBookings: 'Mietanfragen',
    rentalAccessories: 'Mietzubehör',
    mietfahrraeder: 'Mietfahrräder',
    rentalAvailability: 'Verfügbarkeit',
    bicycleCalendar: 'Belegungsplan',
    statistics: 'Statistiken',
    settings: 'Einstellungen',
    skipToMain: 'Zum Hauptinhalt springen',

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
    printDocument: 'Beleg drucken',
    editDocument: 'Beleg bearbeiten',
    preview: 'Vorschau',
    download: 'Herunterladen',

    // Common
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    confirmDelete: 'Wirklich löschen?',
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
    drawSignature: 'Unterschrift zeichnen',
    uploadSignature: 'Unterschrift hochladen',
    or: 'oder',
    plannedSellingPrice: 'Geplanter Verkaufspreis',

    // Purchase fields
    adNumber: 'Anzeige Nr.',
    adNumberHint: 'Kleinanzeigen o.ä.',

    // Photo Gallery
    photoGallery: 'Fotos',
    noPhotos: 'Keine Fotos vorhanden',
    addPhotos: 'Fotos hinzufügen',
    uploading: 'Hochladen...',

    // Quick Add Bike
    quickAddBike: 'Fahrrad nicht in Liste? Schnell hinzufügen',

    // Backup & Restore
    backupRestore: 'Sicherung & Wiederherstellung',
    backupDescription:
      'Erstellen Sie eine vollständige Sicherung aller Daten und Dokumente als ZIP-Datei.',
    createBackup: 'Sicherung erstellen',
    creatingBackup: 'Sicherung wird erstellt...',
    backupSuccess: 'Sicherung erfolgreich heruntergeladen!',
    backupError: 'Fehler beim Erstellen der Sicherung',
    restoreSystem: 'System wiederherstellen',
    restoreDescription:
      'Laden Sie eine zuvor erstellte Sicherungsdatei hoch, um das System wiederherzustellen.',
    restoreWarning:
      'ACHTUNG: Alle aktuellen Daten werden durch die Sicherung ersetzt!',
    selectBackupFile: 'Sicherungsdatei auswählen (.zip)',
    restoring: 'Wiederherstellung läuft...',
    restoreSuccess:
      'System erfolgreich wiederhergestellt! Die Seite wird neu geladen.',
    restoreError: 'Fehler bei der Wiederherstellung',
    restoreConfirm: 'Wiederherstellung bestätigen',
    restoreConfirmMessage:
      'Sind Sie sicher? Alle aktuellen Daten werden durch die Sicherung ersetzt. Dieser Vorgang kann nicht rückgängig gemacht werden.',
    downloadBackup: 'Sicherung herunterladen',
    uploadBackup: 'Sicherung hochladen',

    // Export
    exportDocuments: 'Belege exportieren',
    exportDescription:
      'Kaufbelege, Verkaufsbelege, Rückgabebelege, Ausgaben-Dokumente und Rechnungen als ZIP herunterladen.',
    exportStartDate: 'Von',
    exportEndDate: 'Bis',
    exportDownloadZip: 'ZIP herunterladen',
    exportDownloading: 'Wird erstellt...',
    exportSuccess: 'Export erfolgreich heruntergeladen!',
    exportError: 'Fehler beim Erstellen des Exports',
    exportNoData: 'Bitte wählen Sie einen Zeitraum aus.',

    // User Account
    userAccount: 'Benutzerkonto',
    currentUsername: 'Aktueller Benutzername',
    changeUsername: 'Benutzername ändern',
    newUsername: 'Neuer Benutzername',
    changePassword: 'Passwort ändern',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestätigen',
    usernameChanged: 'Benutzername erfolgreich geändert',
    usernameChangeError: 'Passwort falsch oder Benutzername bereits vergeben',
    passwordChanged: 'Passwort erfolgreich geändert',
    passwordChangeError: 'Aktuelles Passwort ist falsch',
    passwordMismatch: 'Passwörter stimmen nicht überein',

    // Bicycle
    brand: 'Marke',
    model: 'Modell',
    frameNumber: 'Rahmennummer',
    duplicateFrameNumber: 'Gleiche Rahmennummer bei mehreren Fahrrädern',
    stockNumber: 'Stock-Nr.',
    frameSize: 'Rahmengröße',
    color: 'Farbe',
    wheelSize: 'Zoll',
    description: 'Beschreibung',
    status: 'Status',
    available: 'Verfügbar',
    sold: 'Verkauft',
    returned: 'Zurückgegeben',
    selectBicycle: 'Fahrrad auswählen',
    bicycleDetails: 'Fahrrad-Details',
    expand: 'Erweitern',
    collapse: 'Einklappen',
    deleteConfirmBicycle: 'Fahrrad wirklich löschen?',
    totalBicycles: 'Fahrräder gesamt',
    bicycleReadonly: 'Das Fahrrad kann nicht geändert werden.',
    brandModel: 'Marke/Modell',
    rentalSettings: 'Mieteinstellungen',
    isRentable: 'Für Vermietung aktiv',
    rentalPriceDay1: 'Preis 1 Tag (€)',
    rentalPriceDay2: 'Preis 2 Tage (€)',
    rentalPriceDay3: 'Preis 3 Tage (€)',
    rentalPriceDay4: 'Preis 4 Tage (€)',
    rentalPriceDay5: 'Preis 5 Tage (€)',
    rentalPriceDay6: 'Preis 6 Tage (€)',
    rentalPriceDay7: 'Preis 7 Tage (€)',
    rentalPriceAdditionalDayAfter7: 'Zusatz pro weiterem Tag ab Tag 8 (€)',

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
    receiptNo: 'Nr.',
    bicycle: 'Fahrrad',
    paymentMethod: 'Zahlungsart',
    paymentMethodRequired: 'Zahlungsart *',
    cash: 'Bar',
    bankTransfer: 'Karte',
    wireTransfer: 'Überweisung',
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
    deleteSuccess: 'Erfolgreich gelöscht',
    saveSuccess: 'Erfolgreich gespeichert',
    cancelSuccess: 'Erfolgreich storniert',
    from: 'Von',
    missingPurchases: 'Fehlende Ankäufe',
    missingPurchasesTitle: 'Fehlende Ankäufe',
    missingPurchasesDesc: 'Verkaufte Fahrräder ohne Ankauf-Beleg',
    noMissingPurchases: 'Alle Verkäufe haben einen zugehörigen Ankauf',
    createPurchase: 'Ankauf erstellen',
    soldTo: 'Verkauft an',
    salePrice: 'Verkaufspreis',
    to: 'Bis',

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
    takePhoto: 'Kamera',
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
    rentalAccessoryDayPrice: 'Tagespreis (€)',
    rentalAccessoryDescription: 'Beschreibung',
    rentalAccessoryActive: 'Aktiv',
    rentalAccessoryPhoto: 'Foto',
    rentalAccessoryUploadPhoto: 'Foto hochladen',
    rentalAccessoryRemovePhoto: 'Foto entfernen',
    rentalAccessoryPhotoHint: 'Bitte zuerst speichern, danach kann ein Foto hochgeladen werden.',
    rentalAccessoryNew: 'Neues Mietzubehör',
    rentalAccessoryEdit: 'Mietzubehör bearbeiten',
    rentalAccessoryNoItems: 'Kein Mietzubehör vorhanden.',
    discount: 'Rabatt',
    discountOptional: 'Rabatt (optional)',

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
    reservedUntil: 'Reserviert bis',
    reservedUntilWarning: 'Bitte auswählen, bis wann das Fahrrad reserviert wird',
    salePriceHint: 'Aus dem Fahrrad übernommen — kann angepasst werden',
    depositPaymentMethod: 'Zahlungsart der Anzahlung',
    companySignatureHint:
      'Die in den Einstellungen hinterlegte Firmenunterschrift wird automatisch auf den Beleg gedruckt.',
    change: 'Ändern',
    day: 'Tag',
    days: 'Tage',
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

    // Rental Booking (Homepage)
    rentalBookingNumber: 'Buchungs-Nr.',
    rentalBookingPending: 'Ausstehend',
    rentalBookingApproved: 'Bestätigt',
    rentalBookingCancelled: 'Storniert',
    rentalBookingShowCompleted: 'Abgeschlossene anzeigen',
    rentalBookingNoItems: 'Keine Mietanfragen vorhanden.',
    rentalBookingViewList: 'Liste',
    rentalBookingViewCalendar: 'Kalender',
    rentalBookingCalToday: 'Heute',
    rentalBookingCalLegendBike: 'Fahrrad',
    rentalBookingCalLegendEBike: 'E-Bike',
    rentalBookingCalLegendPending: 'gestrichelt = ausstehend',
    rentalBookingCalEmpty: 'Keine Mietanfragen in dieser Woche.',
    rentalBookingDetails: 'Mietanfrage',
    rentalBookingApprove: 'Bestätigen',
    rentalBookingReactivate: 'Wieder aktivieren',
    rentalBookingReactivated: 'Buchung wurde wieder aktiviert.',
    rentalBookingCancel: 'Stornieren',
    rentalBookingAdminNotes: 'Admin-Notizen',
    rentalBookingNotes: 'Notizen',
    rentalBookingDates: 'Zeitraum',
    abholzeit: 'Abholzeit',
    rentalBookingCreatedAt: 'Angelegt',
    rentalBookingApprovedAt: 'Bestätigt am',
    rentalBookingCancelledAt: 'Storniert am',
    rentalBookingAccessories: 'Zubehör',
    rentalBookingSearchPlaceholder:
      'Suche nach Buchungs-Nr., Kunde, Fahrrad...',
    rentalBookingApproveConfirm: 'Mietanfrage bestätigen?',
    rentalBookingCancelConfirm: 'Mietanfrage stornieren?',

    // Statistics
    loadingStatistics: 'Lade Statistiken...',
    averagePerSale: 'Ø pro Verkauf',
    dailyOverview: 'Tägliche Übersicht',
    rentalStatistics: 'Vermietungs-Statistik',
    totalRentalDays: 'Gesamt-Miettage',
    rentedBikesCount: 'Vermietete Räder',
    rentalRevenue: 'Mieteinnahmen',
    newRentals: 'Neue Mieten',
    topRentedBikes: 'Meistvermietete Räder',
    rentalDaysUnit: 'Tage',
    purchaseValue: 'Einkaufswert',
    saleValue: 'Verkaufswert',
    topBrands: 'Top Marken (nach Umsatz)',
    soldCount: 'verkauft',
    dailyProfit: 'Tagesgewinn',
    custom: 'Benutzerdefiniert',
    expenses: 'Ausgaben',
    expenseValue: 'Ausgabenwert',
    netProfit: 'Nettogewinn',
    expensesByCategory: 'Ausgaben nach Kategorie',
    newExpense: 'Neue Ausgabe',
    editExpense: 'Ausgabe bearbeiten',
    noExpenses: 'Keine Ausgaben vorhanden',
    expenseCount: 'Anzahl',
    searchExpensePlaceholder: 'Suche nach Bezeichnung, Kategorie, Lieferant...',
    expenseNamePlaceholder: 'z.B. Fahrradschlösser Einkauf',
    supplier: 'Lieferant',
    supplierPlaceholder: 'z.B. Amazon, Baumarkt',
    deleteConfirmExpense: 'Ausgabe wirklich löschen?',
    dueDate: 'Fälligkeitsdatum',
    paid: 'Bezahlt',
    unpaid: 'Unbezahlt',
    document: 'Dokument',
    chooseFile: 'Datei auswählen',

    // Invoices
    invoices: 'Rechnungen',
    newInvoice: 'Neue Rechnung',
    editInvoice: 'Rechnung bearbeiten',
    noInvoices: 'Keine Rechnungen vorhanden',
    invoiceNumber: 'Rechnungsnr.',
    customerAddress: 'Kundenadresse',
    searchInvoicePlaceholder: 'Suche nach Rechnungsnr., Bezeichnung, Kunde...',
    deleteConfirmInvoice: 'Rechnung wirklich löschen?',
    deleteConfirmRentalBooking: 'Mietanfrage wirklich löschen?',
    invoiceCount: 'Anzahl',
    invoiceTotal: 'Gesamtbetrag',

    // Login
    welcomeBack: 'Willkommen zurück — bitte melden Sie sich an',

    // Document
    deleteConfirmDocument: 'Dokument wirklich löschen?',

    // Misc
    searchNumber: 'Nr suchen',
    firstNameRequired: 'Vorname',
    lastNameRequired: 'Nachname',

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
    conditionIsRequired: 'Bitte Zustand wählen (Neu oder Gebraucht)',
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
    accessorySaleHint:
      'Fügen Sie verkaufte Zubehörteile hinzu, diese erscheinen auf dem Verkaufsbeleg.',
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
    publishOnWebsite: 'Auf Website veröffentlichen',
    unpublishFromWebsite: 'Von Website entfernen',
    publishOnKleinanzeigen: 'Auf Kleinanzeigen veröffentlichen',
    unpublishFromKleinanzeigen: 'Von Kleinanzeigen entfernen',
    publishedOnWebsite: 'Auf Website veröffentlicht!',
    unpublishedFromWebsite: 'Von Website entfernt!',
    publishedOnKleinanzeigen: 'Für Kleinanzeigen markiert!',
    unpublishedFromKleinanzeigen: 'Kleinanzeigen-Markierung entfernt!',
    galleryPhotos: 'Galerie-Fotos (Website & Kleinanzeigen)',
    galleryPhotosHint:
      'Diese Fotos werden für die Veröffentlichung auf der Website und für Kleinanzeigen-Inserate verwendet.',
    salesPhotos: 'Verkaufsfotos (Website & Kleinanzeigen)',
    salesPhotosHint:
      'Diese Fotos werden öffentlich angezeigt – für die Website und Kleinanzeigen-Inserate.',
    purchasePhotos: 'Einkaufsfotos (Intern)',
    purchasePhotosHint:
      'Nur zur internen Dokumentation – diese Fotos werden nicht öffentlich angezeigt.',
    artLabel: 'Art (Herren/Damen/Kinder)',
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

    // Bulk Purchase & Filters
    singlePurchase: 'Einzelankauf',
    bulkPurchase: 'Sammelankauf',
    bulkPurchaseDesc: 'Mehrere Fahrräder kaufen',
    supplierStore: 'Lieferant / Geschäft',
    storeName: 'Geschäftsname',
    storeNamePlaceholder: 'z.B. Pyro Bikes, Bergamont...',
    storeNameRequired: 'Geschäftsname ist erforderlich',
    bulkQuantityHint: 'Wie viele identische Fahrräder kaufen Sie?',
    pricePerBike: 'Preis pro Fahrrad',
    totalPrice: 'Gesamtpreis',
    saveBulkPurchase: 'Sammelankauf speichern',
    invoiceOptional: 'Rechnung (optional)',
    sameInvoiceForAllBikes: 'Diese Rechnungsnummer gilt für alle Fahrräder',
    screenshotsOptional: 'Screenshots (optional)',
    documentsOptionalHint: 'Dokumente können auch später hinzugefügt werden.',
    filters: 'Filter',
    clearFilters: 'Filter zurücksetzen',
    filterByBrand: 'Nach Marke filtern',
    filterByColor: 'Nach Farbe filtern',
    allBicycleTypes: 'Alle Fahrradtypen',

    // Archive
    archive: 'Archiv',
    archiveSearch: 'Fahrrad-Archiv durchsuchen',
    archiveSearchPlaceholder: 'Beleg-Nr., Marke, Modell oder Rahmennummer...',
    archiveSearchHint:
      'Geben Sie eine Beleg-Nr., Marke, Modell oder Rahmennummer ein, um die komplette Fahrradhistorie einzusehen.',
    archiveNoResults: 'Keine Ergebnisse gefunden',
    archiveSelectBicycle: 'Wählen Sie ein Fahrrad aus der Liste',
    archiveTimeline: 'Chronik',
    archiveBicycleInfo: 'Fahrrad-Informationen',
    archivePurchase: 'Ankauf',
    archiveSale: 'Verkauf',
    archiveReturn: 'Rückgabe',
    archiveReservation: 'Reservierung',
    archiveReservationCancelled: 'Reservierung storniert',
    archivePurchaseReceipt: 'Kaufbeleg',
    archiveSaleReceipt: 'Verkaufsbeleg',
    archiveViewDocument: 'Beleg anzeigen',
    archivePrintDocument: 'Beleg drucken',
    archiveBackToSearch: 'Zurück zur Suche',

    // Bike Selector
    bikeSelectorPlaceholder: 'Suche nach Marke, Modell, Rahmennummer...',
    noAvailableBikes: 'Keine verfügbaren Fahrräder gefunden',
    selectedColon: 'Ausgewählt:',
    frameColon: 'Rahmen:',
    colorColon: 'Farbe:',
    wheelsColon: 'Reifen:',
    typeColon: 'Typ:',
    invalidNumberError: 'Bitte eine gültige Nr eingeben.',
    bikeAlreadySoldError: 'Fahrrad #{nr} ist bereits verkauft.',
    bikeNotFoundError: 'Fahrrad mit Nr {nr} nicht gefunden.',

    // Pagination
    paginationEntries: 'Einträge',
    paginationPage: 'Seite',
    paginationOf: 'von',
    paginationPerPage: '/ Seite',
    paginationFirstPage: 'Erste Seite',
    paginationPrevious: 'Vorherige',
    paginationNext: 'Nächste',
    paginationLastPage: 'Letzte Seite',

    // Signature Pad
    clearButton: 'Löschen',

    // Address Autocomplete
    addressInputPlaceholder: 'Adresse eingeben...',

    // Bicycle Labels
    createLabels: 'Etiketten erstellen',
    labelsSearchPlaceholder: 'Suche nach Marke, Modell...',
    selectedText: 'ausgewählt',
    selectAllButton: 'Alle auswählen',
    deselectAllButton: 'Auswahl aufheben',
    printButton: 'Drucken',
    wheelsSpec: 'Räder',
    backToSelection: 'Zurück zur Auswahl',
    printNowButton: 'Jetzt drucken',
    labelsWord: 'Etiketten',
    bicyclesPlural: 'Fahrräder',

    // Settings - Kleinanzeigen
    kleinanzeigenIntegration: 'Kleinanzeigen Integration',
    kleinanzeigenProfileUrl: 'Kleinanzeigen Profil-URL',
    kleinanzeigenUrlHint:
      'Die URL Ihrer Bestandsliste auf Kleinanzeigen. Anzeigen werden automatisch alle 4 Stunden synchronisiert.',
    syncNow: 'Jetzt synchronisieren',
    syncingText: 'Synchronisiere...',
    lastSync: 'Letzte Sync:',
    syncNew: 'neue',
    syncUpdated: 'aktualisiert',
    syncDeactivated: 'deaktiviert',
    bicycleNumbering: 'Fahrrad-Nummerierung',
    startNumber: 'Startnummer',
    autoNumberHint: 'Neue Fahrräder bekommen automatisch die nächste Nummer',
    syncFailed: 'Sync fehlgeschlagen:',
    unknownError: 'Unbekannter Fehler',

    // Reservation Form
    reservationDataTitle: 'Reservierungsdaten',
    expirationDateColon: 'Ablaufdatum:',
    selectBicycleWarning: 'Bitte wählen Sie ein Fahrrad aus',
    firstNameRequiredMsg: 'Vorname ist erforderlich',
    lastNameRequiredMsg: 'Nachname ist erforderlich',
    streetRequiredMsg: 'Straße ist erforderlich',
    houseNumberRequiredMsg: 'Hausnummer ist erforderlich',
    postalCodeRequiredMsg: 'PLZ ist erforderlich',
    cityRequiredMsg: 'Stadt ist erforderlich',
    phoneRequiredMsg: 'Telefon ist erforderlich',
    reservationDaysWarning: 'Reservierungstage muss größer als 0 sein',
    reservationCreateError: 'Fehler beim Erstellen der Reservierung',
    addressSuggestHint: 'Tippen Sie eine Adresse ein für Vorschläge',

    // Archive
    noEventsFound: 'Keine Ereignisse vorhanden.',

    // Sale Form
    requiredFieldsMissing: 'Pflichtfelder fehlen',
    requiredField: 'Pflichtfeld',

    // Neue Fahrräder
    neueFahrraeder: 'Neue Anzeige',
    neueFahrradNew: 'Neues Fahrrad hinzufügen',
    neueFahrradEdit: 'Fahrrad bearbeiten',
    neueFahrradTitle: 'Titel',
    neueFahrradDescription: 'Beschreibung',
    neueFahrradPrice: 'Preis (€)',
    neueFahrradCategory: 'Kategorie',
    neueFahrradBrand: 'Marke',
    neueFahrradModel: 'Modell',
    neueFahrradColor: 'Farbe',
    colorBlack: 'Schwarz',
    colorWhite: 'Weiß',
    colorRed: 'Rot',
    colorBlue: 'Blau',
    colorGreen: 'Grün',
    colorYellow: 'Gelb',
    colorOrange: 'Orange',
    colorBraun: 'Braun',
    colorGray: 'Grau',
    colorSilver: 'Silber',
    colorPink: 'Pink',
    colorTurkis: 'Türkis',
    colorLila: 'Lila',
    colorDunkelblau: 'Dunkelblau',
    neueFahrradFrameSize: 'Rahmengröße',
    neueFahrradWheelSize: 'Reifengröße',
    neueFahrradGears: 'Gangschaltung',
    neueFahrradCondition: 'Zustand',
    neueFahrradActive: 'Aktiv',
    neueFahrradPhotos: 'Fotos',
    neueFahrradNoItems: 'Keine neuen Fahrräder vorhanden.',
    neueFahrradDeleteConfirm: 'Möchten Sie dieses Fahrrad wirklich löschen?',
    neueFahrradSaved: 'Fahrrad gespeichert!',
    neueFahrradDeleted: 'Fahrrad gelöscht!',
    neueFahrradUploadPhotos: 'Fotos hochladen',
    neueFahrradSelectCategory: 'Kategorie wählen',

    // E-Bikes
    eBikes: 'E-Bikes',
    eBikeNew: 'Neues E-Bike hinzufügen',
    eBikeEdit: 'E-Bike bearbeiten',
    eBikeTitle: 'Titel',
    eBikeDescription: 'Beschreibung',
    eBikePrice: 'Preis (€)',
    eBikeCategory: 'Kategorie',
    eBikeBrand: 'Marke',
    eBikeModel: 'Modell',
    eBikeColor: 'Farbe',
    eBikeFrameSize: 'Rahmengröße',
    eBikeWheelSize: 'Reifengröße',
    eBikeGears: 'Gangschaltung',
    eBikeCondition: 'Zustand',
    eBikeActive: 'Aktiv',
    eBikePhotos: 'Fotos',
    eBikeNoItems: 'Keine E-Bikes vorhanden.',
    eBikeDeleteConfirm: 'Möchten Sie dieses E-Bike wirklich löschen?',
    eBikeSaved: 'E-Bike gespeichert!',
    eBikeDeleted: 'E-Bike gelöscht!',
    eBikeUploadPhotos: 'Fotos hochladen',
    eBikeSelectCategory: 'Kategorie wählen',
    eBikeMotorSection: 'Antrieb / Motor & Akku',
    eBikeMotorBrand: 'Motor-Marke',
    eBikeMotorPosition: 'Motor-Position',
    eBikeSelectMotorPosition: 'Position wählen',
    eBikeAkkuKapazitaet: 'Akku-Kapazität (Wh)',
    eBikeReichweite: 'Reichweite (km)',
    eBikeMotorLeistung: 'Drehmoment (Nm)',

    // Homepage Accessories
    homepageAccessories: 'Zubehör (Homepage)',
    homepageAccessoryNew: 'Neues Zubehör hinzufügen',
    homepageAccessoryEdit: 'Zubehör bearbeiten',
    homepageAccessoryTitle: 'Titel',
    homepageAccessoryDescription: 'Beschreibung',
    homepageAccessoryPrice: 'Preis (€)',
    homepageAccessoryCategory: 'Kategorie',
    homepageAccessoryBrand: 'Marke',
    homepageAccessoryActive: 'Aktiv',
    homepageAccessoryPhotos: 'Fotos',
    homepageAccessoryNoItems: 'Keine Zubehörartikel vorhanden.',
    homepageAccessoryDeleteConfirm: 'Zubehör wirklich löschen?',
    homepageAccessoryUploadPhotos: 'Fotos hochladen',
    homepageAccessorySelectCategory: 'Kategorie wählen',

    // Mietfahrräder
    mietfahrradList: 'Mietfahrräder',
    mietfahrradNew: 'Neues Mietfahrrad',
    mietfahrradEdit: 'Mietfahrrad bearbeiten',
    mietfahrradBrand: 'Marke',
    mietfahrradModel: 'Modell',
    mietfahrradType: 'Fahrradtyp',
    mietfahrradSize: 'Reifengröße',
    mietfahrradColor: 'Farbe',
    mietfahrradActive: 'Aktiv für Verleih',
    mietfahrradNoItems: 'Keine Mietfahrräder vorhanden.',
    mietfahrradDeleteConfirm: 'Fahrrad aus dem Verleih entfernen?',
    mietfahrradPhotos: 'Fotos',
    mietfahrradUploadPhotos: 'Fotos hochladen',
    mietfahrradRentalPrices: 'Mietpreise',
    mietfahrradPriceDay1: '1 Tag',
    mietfahrradPriceDay2: '2 Tage',
    mietfahrradPriceDay3: '3 Tage',
    mietfahrradPriceDay4: '4 Tage',
    mietfahrradPriceDay5: '5 Tage',
    mietfahrradPriceDay6: '6 Tage',
    mietfahrradPriceDay7: '7 Tage',
    mietfahrradPriceAdditionalDayAfter7: 'Zusatz pro weiterem Tag ab Tag 8',
    mietfahrradDescription: 'Beschreibung',
    mietfahrradFrameSize: 'Rahmengröße',
    mietfahrradFrameHeight: 'Rahmenhöhe (cm)',
    mietfahrradFrameHeightHint: 'Passend für Körpergröße',
    mietfahrradApplySuggestion: 'übernehmen',
    mietfahrradSuggestion: 'Vorschlag aus der Rahmenhöhe',
    mietfahrradIsRentable: 'Für Verleih aktiv',
    mietfahrradToggleRentable: 'Verleih aktivieren/deaktivieren',
    mietfahrradBasicInfo: 'Grundinformationen',
    mietfahrradSaveSuccess: 'Mietfahrrad gespeichert',
    mietfahrradTitelbild: 'Titelbild',
    mietfahrradSetAsTitelbild: 'Als Titelbild',
    mietfahrradMoveLeft: 'Nach vorne',
    mietfahrradMoveRight: 'Nach hinten',
    mietfahrradPhotoOrderHint:
      'Ziehen zum Sortieren. Das erste Foto ist das Titelbild.',
    mietfahrradOrderSaveError:
      'Reihenfolge konnte nicht gespeichert werden.',
    mietfahrradPrev: 'Vorheriges Rad',
    mietfahrradNext: 'Nächstes Rad',
    mietfahrradNavInactive:
      'Dieses Rad ist nicht für den Verleih aktiv — die Pfeile springen zum alphabetisch nächsten aktiven Rad.',
    mietfahrradUnsavedTitle: 'Nicht gespeicherte Änderungen',
    mietfahrradUnsavedMessage:
      'Die Änderungen an diesem Rad sind noch nicht gespeichert. Beim Wechseln gehen sie verloren.',
    mietfahrradUnsavedDiscard: 'Verwerfen und wechseln',

    // Rental Reviews
    rentalReviews: 'Kundenbewertungen',
    rentalReviewTitle: 'Bewertungen verwalten',
    rentalReviewAll: 'Alle',
    rentalReviewPending: 'Ausstehend',
    rentalReviewApproved: 'Genehmigt',
    rentalReviewName: 'Name',
    rentalReviewStars: 'Sterne',
    rentalReviewComment: 'Kommentar',
    rentalReviewDate: 'Datum',
    rentalReviewStatus: 'Status',
    rentalReviewApprove: 'Genehmigen',
    rentalReviewReject: 'Ablehnen',
    rentalReviewDelete: 'Löschen',
    rentalReviewDeleteConfirm: 'Bewertung wirklich löschen?',
    rentalReviewNoItems: 'Keine Bewertungen vorhanden.',
    rentalReviewAdminNote: 'Admin-Notiz',
    rentalReviewSaved: 'Bewertung gespeichert',
    rentalReviewDeleted: 'Bewertung gelöscht',

    // Kundenfelder mit englischer Bezeichnung (siehe Interface)
    firstNameIntl: 'Vorname (First name)',
    lastNameIntl: 'Nachname (Last name)',
    streetIntl: 'Straße (Street)',
    houseNumberIntl: 'Hausnummer (House number)',
    postalCodeIntl: 'PLZ (Postal code)',
    cityIntl: 'Stadt (City)',
    phoneIntl: 'Telefon (Phone)',
    emailIntl: 'E-Mail (Email)',
  },
  tr: {
    // Navigation
    dashboard: 'Gösterge Paneli',
    bicycles: 'Bisikletler',
    customers: 'Müşteriler',
    purchases: 'Alımlar',
    sales: 'Satışlar',
    returns: 'İadeler',
    rentals: 'Kira Sözleşmeleri',
    rentalBookings: 'Kiralama Talepleri',
    rentalAccessories: 'Kiralama Aksesuarları',
    mietfahrraeder: 'Kiralık Bisikletler',
    rentalAvailability: 'Müsaitlik',
    bicycleCalendar: 'Doluluk Takvimi',
    statistics: 'İstatistikler',
    settings: 'Ayarlar',
    skipToMain: 'Ana içeriğe atla',

    // Dashboard
    welcomeToBikeHaus: "BikeHaus Freiburg'a hoş geldiniz",
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
    printDocument: 'Belgeyi yazdır',
    editDocument: 'Belgeyi düzenle',
    preview: 'Önizleme',
    download: 'İndir',

    // Common
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    confirmDelete: 'Gerçekten silinsin mi?',
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
    drawSignature: 'İmza Çiz',
    uploadSignature: 'İmza Yükle',
    or: 'veya',
    plannedSellingPrice: 'Planlanan Satış Fiyatı',

    // Purchase fields
    adNumber: 'İlan No.',
    adNumberHint: 'Kleinanzeigen vb.',

    // Photo Gallery
    photoGallery: 'Fotoğraflar',
    noPhotos: 'Henüz fotoğraf yok',
    addPhotos: 'Fotoğraf Ekle',
    uploading: 'Yükleniyor...',

    // Quick Add Bike
    quickAddBike: 'Bisiklet listede yok mu? Hızlı ekle',

    // Backup & Restore
    backupRestore: 'Yedekleme & Geri Yükleme',
    backupDescription:
      'Tüm veri ve belgelerin tam yedeğini ZIP dosyası olarak oluşturun.',
    createBackup: 'Yedek Oluştur',
    creatingBackup: 'Yedek oluşturuluyor...',
    backupSuccess: 'Yedek başarıyla indirildi!',
    backupError: 'Yedek oluşturulurken hata oluştu',
    restoreSystem: 'Sistemi Geri Yükle',
    restoreDescription:
      'Daha önce oluşturulan bir yedek dosyasını yükleyerek sistemi geri yükleyin.',
    restoreWarning: 'DİKKAT: Mevcut tüm veriler yedek ile değiştirilecektir!',
    selectBackupFile: 'Yedek dosyası seçin (.zip)',
    restoring: 'Geri yükleniyor...',
    restoreSuccess: 'Sistem başarıyla geri yüklendi! Sayfa yeniden yüklenecek.',
    restoreError: 'Geri yükleme sırasında hata oluştu',
    restoreConfirm: 'Geri Yüklemeyi Onayla',
    restoreConfirmMessage:
      'Emin misiniz? Mevcut tüm veriler yedek ile değiştirilecektir. Bu işlem geri alınamaz.',
    downloadBackup: 'Yedeği İndir',
    uploadBackup: 'Yedeği Yükle',

    // Export
    exportDocuments: 'Belge Dışa Aktar',
    exportDescription:
      'Alış belgeleri, satış belgeleri, iade belgeleri, harcama belgeleri ve faturaları ZIP olarak indir.',
    exportStartDate: 'Başlangıç',
    exportEndDate: 'Bitiş',
    exportDownloadZip: 'ZIP İndir',
    exportDownloading: 'Oluşturuluyor...',
    exportSuccess: 'Dışa aktarma başarıyla indirildi!',
    exportError: 'Dışa aktarma oluşturulurken hata oluştu',
    exportNoData: 'Lütfen bir tarih aralığı seçin.',

    // User Account
    userAccount: 'Kullanıcı Hesabı',
    currentUsername: 'Mevcut Kullanıcı Adı',
    changeUsername: 'Kullanıcı Adını Değiştir',
    newUsername: 'Yeni Kullanıcı Adı',
    changePassword: 'Şifre Değiştir',
    currentPassword: 'Mevcut Şifre',
    newPassword: 'Yeni Şifre',
    confirmPassword: 'Şifreyi Onayla',
    usernameChanged: 'Kullanıcı adı başarıyla değiştirildi',
    usernameChangeError: 'Şifre yanlış veya kullanıcı adı zaten alınmış',
    passwordChanged: 'Şifre başarıyla değiştirildi',
    passwordChangeError: 'Mevcut şifre yanlış',
    passwordMismatch: 'Şifreler eşleşmiyor',

    // Bicycle
    brand: 'Marka',
    model: 'Model',
    frameNumber: 'Şase Numarası',
    duplicateFrameNumber: 'Aynı şase numarası birden fazla bisiklette',
    stockNumber: 'Stok No',
    frameSize: 'Çerçeve Boyutu',
    color: 'Renk',
    wheelSize: 'Tekerlek Boyutu',
    description: 'Açıklama',
    status: 'Durum',
    available: 'Mevcut',
    sold: 'Satıldı',
    returned: 'İade Edildi',
    selectBicycle: 'Bisiklet seç',
    bicycleDetails: 'Bisiklet Detayları',
    expand: 'Genişlet',
    collapse: 'Daralt',
    deleteConfirmBicycle: 'Bisikleti silmek istediğinize emin misiniz?',
    totalBicycles: 'Toplam bisiklet',
    bicycleReadonly: 'Bisiklet değiştirilemez.',
    brandModel: 'Marka/Model',
    rentalSettings: 'Kiralama Ayarları',
    isRentable: 'Kiralama için aktif',
    rentalPriceDay1: '1 Gün Ücret (€)',
    rentalPriceDay2: '2 Gün Ücret (€)',
    rentalPriceDay3: '3 Gün Ücret (€)',
    rentalPriceDay4: '4 Gün Ücret (€)',
    rentalPriceDay5: '5 Gün Ücret (€)',
    rentalPriceDay6: '6 Gün Ücret (€)',
    rentalPriceDay7: '7 Gün Ücret (€)',
    rentalPriceAdditionalDayAfter7: '8. Günden Sonra Ek Gün Ücreti (€)',

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
    bankTransfer: 'Kart',
    wireTransfer: 'Havale',
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
    deleteSuccess: 'Başarıyla silindi',
    saveSuccess: 'Başarıyla kaydedildi',
    cancelSuccess: 'Başarıyla iptal edildi',
    from: 'Başlangıç',
    missingPurchases: 'Eksik Alımlar',
    missingPurchasesTitle: 'Eksik Alımlar',
    missingPurchasesDesc: 'Alım belgesi olmayan satılmış bisikletler',
    noMissingPurchases: 'Tüm satışların ilgili alım kaydı mevcut',
    createPurchase: 'Alım Oluştur',
    soldTo: 'Alıcı',
    salePrice: 'Satış Fiyatı',
    to: 'Bitiş',

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
    takePhoto: 'Kamera',
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
    rentalAccessoryDayPrice: 'Günlük Ücret (€)',
    rentalAccessoryDescription: 'Açıklama',
    rentalAccessoryActive: 'Aktif',
    rentalAccessoryPhoto: 'Fotoğraf',
    rentalAccessoryUploadPhoto: 'Fotoğraf yükle',
    rentalAccessoryRemovePhoto: 'Fotoğrafı kaldır',
    rentalAccessoryPhotoHint: 'Lütfen önce kaydedin, ardından fotoğraf yükleyebilirsiniz.',
    rentalAccessoryNew: 'Yeni Kiralama Aksesuarı',
    rentalAccessoryEdit: 'Kiralama Aksesuarı Düzenle',
    rentalAccessoryNoItems: 'Kiralama aksesuarı yok.',
    discount: 'İndirim',
    discountOptional: 'İndirim (opsiyonel)',

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
    reservedUntil: 'Rezervasyon bitiş tarihi',
    reservedUntilWarning: 'Bisikletin ne zamana kadar rezerve edileceğini seçin',
    salePriceHint: 'Bisikletten alındı — değiştirilebilir',
    depositPaymentMethod: 'Kapora ödeme şekli',
    companySignatureHint:
      'Ayarlarda kayıtlı firma imzası belgeye otomatik olarak basılır.',
    change: 'Değiştir',
    day: 'gün',
    days: 'gün',
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

    // Rental Booking (Homepage)
    rentalBookingNumber: 'Kiralama No.',
    rentalBookingPending: 'Beklemede',
    rentalBookingApproved: 'Onaylandı',
    rentalBookingCancelled: 'İptal',
    rentalBookingShowCompleted: 'Tamamlananları göster',
    rentalBookingNoItems: 'Kiralama talebi yok.',
    rentalBookingViewList: 'Liste',
    rentalBookingViewCalendar: 'Takvim',
    rentalBookingCalToday: 'Bugün',
    rentalBookingCalLegendBike: 'Bisiklet',
    rentalBookingCalLegendEBike: 'E-Bike',
    rentalBookingCalLegendPending: 'kesik çizgili = onay bekliyor',
    rentalBookingCalEmpty: 'Bu hafta kiralama talebi yok.',
    rentalBookingDetails: 'Kiralama Talebi',
    rentalBookingApprove: 'Onayla',
    rentalBookingReactivate: 'Tekrar aktifleştir',
    rentalBookingReactivated: 'Rezervasyon tekrar aktif edildi.',
    rentalBookingCancel: 'İptal Et',
    rentalBookingAdminNotes: 'Yönetici Notları',
    rentalBookingNotes: 'Notlar',
    rentalBookingDates: 'Tarih Aralığı',
    abholzeit: 'Alış Saati',
    rentalBookingCreatedAt: 'Oluşturma',
    rentalBookingApprovedAt: 'Onaylandı',
    rentalBookingCancelledAt: 'İptal edildi',
    rentalBookingAccessories: 'Aksesuarlar',
    rentalBookingSearchPlaceholder: 'No, müşteri, bisiklet ara...',
    rentalBookingApproveConfirm: 'Kiralama talebi onaylansın mı?',
    rentalBookingCancelConfirm: 'Kiralama talebi iptal edilsin mi?',

    // Statistics
    loadingStatistics: 'İstatistikler yükleniyor...',
    averagePerSale: 'Satış başına ort.',
    dailyOverview: 'Günlük Özet',
    rentalStatistics: 'Kiralama İstatistikleri',
    totalRentalDays: 'Toplam Kiralama Günü',
    rentedBikesCount: 'Kiralanan Bisiklet',
    rentalRevenue: 'Kiralama Geliri',
    newRentals: 'Yeni Kiralama',
    topRentedBikes: 'En Çok Kiralanan Bisikletler',
    rentalDaysUnit: 'Gün',
    purchaseValue: 'Alım değeri',
    saleValue: 'Satış değeri',
    topBrands: 'En İyi Markalar (Ciro)',
    soldCount: 'satıldı',
    dailyProfit: 'Günlük kar',
    custom: 'Özel',
    expenses: 'Giderler',
    expenseValue: 'Gider değeri',
    netProfit: 'Net Kar',
    expensesByCategory: 'Kategoriye göre giderler',
    newExpense: 'Yeni Gider',
    editExpense: 'Gider düzenle',
    noExpenses: 'Gider bulunamadı',
    expenseCount: 'Adet',
    searchExpensePlaceholder: 'Açıklama, kategori, tedarikçi ara...',
    expenseNamePlaceholder: 'örn. Bisiklet kilidi alımı',
    supplier: 'Tedarikçi',
    supplierPlaceholder: 'örn. Amazon, Baumarkt',
    deleteConfirmExpense: 'Bu gideri silmek istediğinize emin misiniz?',
    dueDate: 'Son Ödeme Tarihi',
    paid: 'Ödendi',
    unpaid: 'Ödenmedi',
    document: 'Dosya',
    chooseFile: 'Dosya seç',

    // Invoices
    invoices: 'Faturalar',
    newInvoice: 'Yeni Fatura',
    editInvoice: 'Fatura düzenle',
    noInvoices: 'Fatura bulunamadı',
    invoiceNumber: 'Fatura No',
    customerAddress: 'Müşteri adresi',
    searchInvoicePlaceholder: 'Fatura no, açıklama, müşteri ara...',
    deleteConfirmInvoice: 'Bu faturayı silmek istediğinize emin misiniz?',
    deleteConfirmRentalBooking:
      "Bu mietanfrage'yi silmek istediğinize emin misiniz?",
    invoiceCount: 'Adet',
    invoiceTotal: 'Toplam tutar',

    // Login
    welcomeBack: 'Hoş geldiniz — lütfen giriş yapın',

    // Document
    deleteConfirmDocument: 'Belgeyi silmek istediğinize emin misiniz?',

    // Misc
    searchNumber: 'No ara',
    firstNameRequired: 'Ad',
    lastNameRequired: 'Soyad',

    // Purchase Form/Edit
    condition: 'Durum',
    bicycleType: 'Bisiklet Tipi',
    descriptionEquipment: 'Açıklama (Donanım)',
    purchaseData: 'Alım Bilgileri',
    screenshotsRequired: 'Belge Ekran Görüntüleri *',
    screenshotsHint: 'Lütfen belge ekran görüntülerini yükleyin.',
    invoiceHint: 'Lütfen yeni bisikletin satın alma faturasını yükleyin.',
    selectInvoice: 'Fatura seç',
    signerName: 'İmza sahibinin adı',
    sellerFirstNameRequired: 'Satıcı adı gerekli',
    sellerLastNameRequired: 'Satıcı soyadı gerekli',
    brandIsRequired: 'Marka gerekli',
    conditionIsRequired: 'Lütfen durumu seçin (Sıfır veya İkinci el)',
    modelIsRequired: 'Model gerekli',
    frameNumberIsRequired: 'Şase numarası gerekli',
    wheelSizeIsRequired: 'Tekerlek boyutu gerekli',
    priceMustBeGreaterThanZero: "Fiyat 0'dan büyük olmalı",
    purchaseDateIsRequired: 'Alım tarihi gerekli',
    invoiceIsRequired: 'Fatura gerekli',
    screenshotIsRequired: 'Belge ekran görüntüsü gerekli',
    invalidPurchaseId: 'Geçersiz alım kimliği',
    purchaseNotFound: 'Alım bulunamadı',

    // Sale Form/Edit
    streetRequired: 'Sokak *',
    houseNumberRequired: 'Kapı No *',
    postalCodeRequired: 'Posta Kodu *',
    cityRequired: 'Şehir *',
    phoneRequired: 'Telefon *',
    accessoriesOptional: 'Aksesuarlar (İsteğe Bağlı)',
    accessorySaleHint:
      'Satılan aksesuarları ekleyin, satış belgesinde görünecektir.',
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
    publishOnWebsite: 'Web Sitesinde Yayınla',
    unpublishFromWebsite: 'Web Sitesinden Kaldır',
    publishOnKleinanzeigen: "Kleinanzeigen'de Yayınla",
    unpublishFromKleinanzeigen: "Kleinanzeigen'den Kaldır",
    publishedOnWebsite: 'Web sitesinde yayınlandı!',
    unpublishedFromWebsite: 'Web sitesinden kaldırıldı!',
    publishedOnKleinanzeigen: 'Kleinanzeigen için işaretlendi!',
    unpublishedFromKleinanzeigen: 'Kleinanzeigen işareti kaldırıldı!',
    galleryPhotos: 'Galeri Fotoğrafları (Web Sitesi & Kleinanzeigen)',
    galleryPhotosHint:
      'Bu fotoğraflar web sitesinde yayınlama ve Kleinanzeigen ilanı oluşturma amacıyla kullanılacaktır.',
    salesPhotos: 'Satış Fotoğrafları (Web Sitesi & Kleinanzeigen)',
    salesPhotosHint:
      'Bu fotoğraflar herkese açık gösterilir – web sitesi ve Kleinanzeigen ilanları için.',
    purchasePhotos: 'Alış Fotoğrafları (Dahili)',
    purchasePhotosHint:
      'Sadece dahili belgeleme için – bu fotoğraflar dışarıya gösterilmez.',
    artLabel: 'Tür (Herren/Damen/Kinder)',
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

    // Bulk Purchase & Filters
    singlePurchase: 'Tekli Alım',
    bulkPurchase: 'Toplu Alım',
    bulkPurchaseDesc: 'Birden fazla bisiklet al',
    supplierStore: 'Tedarikçi / Mağaza',
    storeName: 'Mağaza Adı',
    storeNamePlaceholder: 'örn. Pyro Bikes, Bergamont...',
    storeNameRequired: 'Mağaza adı gereklidir',
    bulkQuantityHint: 'Kaç adet aynı bisiklet alıyorsunuz?',
    pricePerBike: 'Bisiklet Başına Fiyat',
    totalPrice: 'Toplam Fiyat',
    saveBulkPurchase: 'Toplu Alımı Kaydet',
    invoiceOptional: 'Fatura (isteğe bağlı)',
    sameInvoiceForAllBikes: 'Bu fatura numarası tüm bisikletler için geçerli',
    screenshotsOptional: 'Ekran görüntüleri (isteğe bağlı)',
    documentsOptionalHint: 'Belgeler daha sonra da eklenebilir.',
    filters: 'Filtreler',
    clearFilters: 'Filtreleri Temizle',
    filterByBrand: 'Markaya göre filtrele',
    filterByColor: 'Renge göre filtrele',
    allBicycleTypes: 'Tüm Bisiklet Tipleri',

    // Archive
    archive: 'Arşiv',
    archiveSearch: 'Bisiklet arşivini ara',
    archiveSearchPlaceholder: 'Belge No., Marka, Model veya Şase No...',
    archiveSearchHint:
      'Belge numarası, marka, model veya şase numarası girerek bisikletin tüm geçmişini görüntüleyin.',
    archiveNoResults: 'Sonuç bulunamadı',
    archiveSelectBicycle: 'Listeden bir bisiklet seçin',
    archiveTimeline: 'Zaman Çizelgesi',
    archiveBicycleInfo: 'Bisiklet Bilgileri',
    archivePurchase: 'Alım',
    archiveSale: 'Satış',
    archiveReturn: 'İade',
    archiveReservation: 'Rezervasyon',
    archiveReservationCancelled: 'Rezervasyon iptal edildi',
    archivePurchaseReceipt: 'Alım Belgesi',
    archiveSaleReceipt: 'Satış Belgesi',
    archiveViewDocument: 'Belgeyi görüntüle',
    archivePrintDocument: 'Belgeyi yazdır',
    archiveBackToSearch: 'Aramaya dön',

    // Bike Selector
    bikeSelectorPlaceholder: 'Marka, model, şase numarası ara...',
    noAvailableBikes: 'Mevcut bisiklet bulunamadı',
    selectedColon: 'Seçildi:',
    frameColon: 'Şase:',
    colorColon: 'Renk:',
    wheelsColon: 'Tekerlek:',
    typeColon: 'Tip:',
    invalidNumberError: 'Lütfen geçerli bir numara girin.',
    bikeAlreadySoldError: '#{nr} numaralı bisiklet zaten satıldı.',
    bikeNotFoundError: '{nr} numaralı bisiklet bulunamadı.',

    // Pagination
    paginationEntries: 'Kayıt',
    paginationPage: 'Sayfa',
    paginationOf: '/',
    paginationPerPage: '/ Sayfa',
    paginationFirstPage: 'İlk Sayfa',
    paginationPrevious: 'Önceki',
    paginationNext: 'Sonraki',
    paginationLastPage: 'Son Sayfa',

    // Signature Pad
    clearButton: 'Temizle',

    // Address Autocomplete
    addressInputPlaceholder: 'Adres girin...',

    // Bicycle Labels
    createLabels: 'Etiket Oluştur',
    labelsSearchPlaceholder: 'Marka, model ara...',
    selectedText: 'seçildi',
    selectAllButton: 'Tümünü Seç',
    deselectAllButton: 'Seçimi Kaldır',
    printButton: 'Yazdır',
    wheelsSpec: 'Tekerlekler',
    backToSelection: 'Seçime Geri Dön',
    printNowButton: 'Şimdi Yazdır',
    labelsWord: 'Etiket',
    bicyclesPlural: 'Bisiklet',

    // Settings - Kleinanzeigen
    kleinanzeigenIntegration: 'Kleinanzeigen Entegrasyonu',
    kleinanzeigenProfileUrl: 'Kleinanzeigen Profil URL',
    kleinanzeigenUrlHint:
      "Kleinanzeigen'deki ilan listenizin URL'si. İlanlar otomatik olarak her 4 saatte senkronize edilir.",
    syncNow: 'Şimdi Senkronize Et',
    syncingText: 'Senkronize ediliyor...',
    lastSync: 'Son Senkronizasyon:',
    syncNew: 'yeni',
    syncUpdated: 'güncellendi',
    syncDeactivated: 'devre dışı',
    bicycleNumbering: 'Bisiklet Numaralandırma',
    startNumber: 'Başlangıç Numarası',
    autoNumberHint: 'Yeni bisikletler otomatik olarak sıradaki numarayı alır',
    syncFailed: 'Senkronizasyon başarısız:',
    unknownError: 'Bilinmeyen hata',

    // Reservation Form
    reservationDataTitle: 'Rezervasyon Bilgileri',
    expirationDateColon: 'Son Tarih:',
    selectBicycleWarning: 'Lütfen bir bisiklet seçin',
    firstNameRequiredMsg: 'Ad gerekli',
    lastNameRequiredMsg: 'Soyad gerekli',
    streetRequiredMsg: 'Sokak gerekli',
    houseNumberRequiredMsg: 'Kapı numarası gerekli',
    postalCodeRequiredMsg: 'Posta kodu gerekli',
    cityRequiredMsg: 'Şehir gerekli',
    phoneRequiredMsg: 'Telefon gerekli',
    reservationDaysWarning: "Rezervasyon günü 0'dan büyük olmalı",
    reservationCreateError: 'Rezervasyon oluşturulurken hata oluştu',
    addressSuggestHint: 'Öneri almak için adres yazın',

    // Archive
    noEventsFound: 'Herhangi bir işlem bulunamadı.',

    // Sale Form
    requiredFieldsMissing: 'Zorunlu alanlar eksik',
    requiredField: 'Zorunlu alan',

    // Neue Fahrräder
    neueFahrraeder: 'Yeni İlan',
    neueFahrradNew: 'Yeni Bisiklet Ekle',
    neueFahrradEdit: 'Bisikleti Düzenle',
    neueFahrradTitle: 'Başlık',
    neueFahrradDescription: 'Açıklama',
    neueFahrradPrice: 'Fiyat (€)',
    neueFahrradCategory: 'Kategori',
    neueFahrradBrand: 'Marka',
    neueFahrradModel: 'Model',
    neueFahrradColor: 'Renk',
    colorBlack: 'Siyah',
    colorWhite: 'Beyaz',
    colorRed: 'Kırmızı',
    colorBlue: 'Mavi',
    colorGreen: 'Yeşil',
    colorYellow: 'Sarı',
    colorOrange: 'Turuncu',
    colorBraun: 'Kahverengi',
    colorGray: 'Gri',
    colorSilver: 'Gümüş',
    colorPink: 'Pembe',
    colorTurkis: 'Turkuaz',
    colorLila: 'Mor',
    colorDunkelblau: 'Koyu Mavi',
    neueFahrradFrameSize: 'Kadro Boyutu',
    neueFahrradWheelSize: 'Tekerlek Boyutu',
    neueFahrradGears: 'Vites',
    neueFahrradCondition: 'Durum',
    neueFahrradActive: 'Aktif',
    neueFahrradPhotos: 'Fotoğraflar',
    neueFahrradNoItems: 'Henüz yeni bisiklet eklenmedi.',
    neueFahrradDeleteConfirm: 'Bu bisikleti silmek istediğinize emin misiniz?',
    neueFahrradSaved: 'Bisiklet kaydedildi!',
    neueFahrradDeleted: 'Bisiklet silindi!',
    neueFahrradUploadPhotos: 'Fotoğraf yükle',
    neueFahrradSelectCategory: 'Kategori seçin',

    // E-Bikes
    eBikes: 'E-Bisikletler',
    eBikeNew: 'Yeni E-Bisiklet Ekle',
    eBikeEdit: 'E-Bisikleti Düzenle',
    eBikeTitle: 'Başlık',
    eBikeDescription: 'Açıklama',
    eBikePrice: 'Fiyat (€)',
    eBikeCategory: 'Kategori',
    eBikeBrand: 'Marka',
    eBikeModel: 'Model',
    eBikeColor: 'Renk',
    eBikeFrameSize: 'Kadro Boyutu',
    eBikeWheelSize: 'Tekerlek Boyutu',
    eBikeGears: 'Vites',
    eBikeCondition: 'Durum',
    eBikeActive: 'Aktif',
    eBikePhotos: 'Fotoğraflar',
    eBikeNoItems: 'Henüz e-bisiklet eklenmedi.',
    eBikeDeleteConfirm: 'Bu e-bisikleti silmek istediğinize emin misiniz?',
    eBikeSaved: 'E-Bisiklet kaydedildi!',
    eBikeDeleted: 'E-Bisiklet silindi!',
    eBikeUploadPhotos: 'Fotoğraf yükle',
    eBikeSelectCategory: 'Kategori seçin',
    eBikeMotorSection: 'Motor & Batarya',
    eBikeMotorBrand: 'Motor Markası',
    eBikeMotorPosition: 'Motor Konumu',
    eBikeSelectMotorPosition: 'Konum seçin',
    eBikeAkkuKapazitaet: 'Batarya Kapasitesi (Wh)',
    eBikeReichweite: 'Menzil (km)',
    eBikeMotorLeistung: 'Tork (Nm)',

    // Homepage Accessories
    homepageAccessories: 'Aksesuarlar (Homepage)',
    homepageAccessoryNew: 'Yeni aksesuar ekle',
    homepageAccessoryEdit: 'Aksesuar düzenle',
    homepageAccessoryTitle: 'Başlık',
    homepageAccessoryDescription: 'Açıklama',
    homepageAccessoryPrice: 'Fiyat (€)',
    homepageAccessoryCategory: 'Kategori',
    homepageAccessoryBrand: 'Marka',
    homepageAccessoryActive: 'Aktif',
    homepageAccessoryPhotos: 'Fotoğraflar',
    homepageAccessoryNoItems: 'Henüz aksesuar eklenmedi.',
    homepageAccessoryDeleteConfirm:
      'Bu aksesuarı silmek istediğinize emin misiniz?',
    homepageAccessoryUploadPhotos: 'Fotoğraf yükle',
    homepageAccessorySelectCategory: 'Kategori seçin',

    // Mietfahrräder
    mietfahrradList: 'Kiralık Bisikletler',
    mietfahrradNew: 'Yeni Kiralık Bisiklet',
    mietfahrradEdit: 'Kiralık Bisikleti Düzenle',
    mietfahrradBrand: 'Marka',
    mietfahrradModel: 'Model',
    mietfahrradType: 'Bisiklet Tipi',
    mietfahrradSize: 'Lastik Boyutu',
    mietfahrradColor: 'Renk',
    mietfahrradActive: 'Kiralama için aktif',
    mietfahrradNoItems: 'Kiralık bisiklet bulunamadı.',
    mietfahrradDeleteConfirm: 'Bisiklet kiralama listesinden çıkarılsın mı?',
    mietfahrradPhotos: 'Fotoğraflar',
    mietfahrradUploadPhotos: 'Fotoğraf yükle',
    mietfahrradRentalPrices: 'Kiralama Fiyatları',
    mietfahrradPriceDay1: '1 Gün',
    mietfahrradPriceDay2: '2 Gün',
    mietfahrradPriceDay3: '3 Gün',
    mietfahrradPriceDay4: '4 Gün',
    mietfahrradPriceDay5: '5 Gün',
    mietfahrradPriceDay6: '6 Gün',
    mietfahrradPriceDay7: '7 Gün',
    mietfahrradPriceAdditionalDayAfter7: '8. günden sonra her ek gün için',
    mietfahrradDescription: 'Açıklama',
    mietfahrradFrameSize: 'Çerçeve Boyutu',
    mietfahrradFrameHeight: 'Kadro yüksekliği (cm)',
    mietfahrradFrameHeightHint: 'Uygun boy aralığı',
    mietfahrradApplySuggestion: 'uygula',
    mietfahrradSuggestion: 'Kadro yüksekliğine göre öneri',
    mietfahrradIsRentable: 'Kiralama aktif',
    mietfahrradToggleRentable: 'Kiralamayı aç/kapat',
    mietfahrradBasicInfo: 'Temel Bilgiler',
    mietfahrradSaveSuccess: 'Kiralık bisiklet kaydedildi',
    mietfahrradTitelbild: 'Kapak fotoğrafı',
    mietfahrradSetAsTitelbild: 'Kapak yap',
    mietfahrradMoveLeft: 'Öne al',
    mietfahrradMoveRight: 'Geri al',
    mietfahrradPhotoOrderHint:
      'Sıralamak için sürükle. İlk fotoğraf kapak fotoğrafıdır.',
    mietfahrradOrderSaveError: 'Sıralama kaydedilemedi.',
    mietfahrradPrev: 'Önceki bisiklet',
    mietfahrradNext: 'Sonraki bisiklet',
    mietfahrradNavInactive:
      'Bu bisiklet kiralamada aktif değil — oklar alfabetik olarak sıradaki aktif bisiklete gider.',
    mietfahrradUnsavedTitle: 'Kaydedilmemiş değişiklikler',
    mietfahrradUnsavedMessage:
      'Bu bisiklette kaydedilmemiş değişiklikler var. Geçiş yapınca kaybolurlar.',
    mietfahrradUnsavedDiscard: 'Vazgeç ve geç',

    // Rental Reviews
    rentalReviews: 'Müşteri Yorumları',
    rentalReviewTitle: 'Yorumları Yönet',
    rentalReviewAll: 'Tümü',
    rentalReviewPending: 'Beklemede',
    rentalReviewApproved: 'Onaylı',
    rentalReviewName: 'İsim',
    rentalReviewStars: 'Yıldız',
    rentalReviewComment: 'Yorum',
    rentalReviewDate: 'Tarih',
    rentalReviewStatus: 'Durum',
    rentalReviewApprove: 'Onayla',
    rentalReviewReject: 'Reddet',
    rentalReviewDelete: 'Sil',
    rentalReviewDeleteConfirm: 'Bu yorum silinsin mi?',
    rentalReviewNoItems: 'Henüz yorum bulunmuyor.',
    rentalReviewAdminNote: 'Admin Notu',
    rentalReviewSaved: 'Yorum kaydedildi',
    rentalReviewDeleted: 'Yorum silindi',

    // Müşteri alanları, İngilizce karşılığıyla (bkz. interface)
    firstNameIntl: 'Ad (First name)',
    lastNameIntl: 'Soyad (Last name)',
    streetIntl: 'Sokak (Street)',
    houseNumberIntl: 'Kapı No (House number)',
    postalCodeIntl: 'Posta Kodu (Postal code)',
    cityIntl: 'Şehir (City)',
    phoneIntl: 'Telefon (Phone)',
    emailIntl: 'E-posta (Email)',
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
