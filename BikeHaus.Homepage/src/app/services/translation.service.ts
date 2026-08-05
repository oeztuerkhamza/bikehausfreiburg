import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  DEFAULT_LANGUAGE,
  getLanguageDirection,
  isSupportedLanguage,
  type SupportedLanguageCode,
} from './language-config';
import { EXTENDED_TRANSLATION_OVERRIDES } from './translation-overrides';

export type Language = SupportedLanguageCode;
type BaseLanguage = 'de' | 'en' | 'fr' | 'tr';

interface RentalStepsTranslations {
  dateSelection: string;
  bikeSelection: string;
  customerInfo: string;
  review: string;
  accessoryStep?: string;
  accessoryTitle?: string;
  accessorySubtitle?: string;
  accessoryNone?: string;
  accessoryTotal?: string;
  selectDates: string;
  startDate: string;
  endDate: string;
  continue: string;
  selectBike: string;
  days: string;
  loading: string;
  noBikesAvailable: string;
  from: string;
  day: string;
  free: string;
  /** Preisangabe für Verbrauchsmaterial: einmaliger Preis statt Tagespreis. */
  accessoryOneTime?: string;
  /** Zusatz dazu: wird nur berechnet, wenn das Teil verbraucht wurde. */
  accessoryOnlyIfUsed?: string;
  pickupTime?: string;
  pickupTimeSelect?: string;
  pickupTimeHint?: string;
  pickupTimeClosed?: string;
  pickupTimeRequired?: string;
  oClock?: string;
  to: string;
  calendarHint: string;
  previousMonth: string;
  nextMonth: string;
  back: string;
  type: string;
  frameSize: string;
  tireSize: string;
  color: string;
  description: string;
  pricing: string;
  rentalPrice: string;
  deposit: string;
  selectColor: string;
  frameNumber: string;
  optional: string;
  addToCart: string;
  book: string;
  selectDifferent: string;
  bikeAdded: string;
  bikeInCart: string;
  bikesInCart: string;
  continueToBooking: string;
  yourInfo: string;
  cartItems: string;
  addAnotherBike: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  notes: string;
  submitting: string;
  confirmBooking: string;
  bikeDetails: string;
  contactInfo: string;
  priceSummary: string;
  totalRental: string;
  totalDeposit: string;
  depositNote: string;
  depositCashNote: string;
  confirm: string;
  bookingSuccess: string;
  confirmationSent: string;
  sent: string;
  bookingNumber: string;
  newBooking: string;
  colorLabel: string;
  frameNumberLabel: string;
  priceLabel: string;
  selectBothDates: string;
  invalidDateRange: string;
  loadError: string;
  bookingError: string;
  firstNameRequired: string;
  lastNameRequired: string;
  emailRequired: string;
  phoneRequired: string;
  streetRequired: string;
  houseNumberRequired: string;
  postalCodeRequired: string;
  cityRequired: string;
  termsPrefix: string;
  termsLinkText: string;
  chooseStartDate: string;
  chooseEndDate: string;
  selectThisBike: string;
  /** Label for the recommended rider height on the bike cards. */
  riderHeight: string;
  /** Chip label for the unfiltered bike list in the selection step. */
  filterAll: string;
  /** Row label above the bike-type chips in the selection step. */
  filterType: string;
  /** Reads as "<price> for 4 days" on the bike cards. */
  forDays: string;
  bookingPageTitle: string;
  backToInfo: string;
  bookingCtaTitle: string;
  bookingCtaText: string;
  zoomImage: string;
  closeLabel: string;
  prevImage: string;
  nextImage: string;
  /** Holiday-closure banner above the date picker. */
  closureNotice: string;
  /** Error when a selected range overlaps a holiday closure. */
  closurePeriodError: string;
}

export interface Translations {
  // Meta / SEO
  metaTitle: string;
  metaDescription: string;

  // Nav
  home: string;
  showroom: string;
  accessories: string;
  about: string;
  contact: string;

  // Hero
  heroH1: string;
  heroSub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaRental: string;
  heroBannerAria: string;
  heroBadgeText: string;
  heroTitleLine1: string;
  heroTitleGradient: string;
  heroTitleLine3: string;
  heroStatBikes: string;
  heroStatYears: string;
  heroStatRating: string;
  heroScrollLabel: string;

  // Value Proposition
  valueLabel: string;
  valueTitle: string;
  value1Title: string;
  value1Desc: string;
  value2Title: string;
  value2Desc: string;
  value3Title: string;
  value3Desc: string;
  value4Title: string;
  value4Desc: string;

  // Showroom Preview
  showroomLabel: string;
  showroomTitle: string;
  showroomSub: string;
  viewAll: string;
  viewDetails: string;
  newBikes: string;
  usedBikes: string;
  allBikes: string;

  // Home Bike Sections
  newBikesLabel: string;
  newBikesTitle: string;
  newBikesSub: string;
  browseNewBikes: string;
  ebikeAngeboteTitle: string;
  ebikeAngeboteSub: string;
  usedBikesLabel: string;
  usedBikesTitle: string;
  usedBikesSub: string;
  browseUsedBikes: string;

  // Showroom Page
  allCategories: string;
  noBikesFound: string;
  searchPlaceholder: string;
  priceOnRequest: string;
  viewOnKleinanzeigen: string;
  lastUpdated: string;
  bikesAvailable: string;

  // Service Carousel
  svcRepairBadge: string;
  svcRepairTitle: string;
  svcRepairSub: string;
  svcRepairItem1: string;
  svcRepairItem2: string;
  svcRepairItem3: string;
  svcRepairItem4: string;
  svcRepairCta: string;
  svcRepairWaCta: string;
  svcRentalBadge: string;
  svcRentalTitle: string;
  svcRentalSub: string;
  svcRentalItem1: string;
  svcRentalItem2: string;
  svcRentalItem3: string;
  svcRentalItem4: string;
  svcRentalCta: string;
  homeRentalCardTitle: string;
  homeRentalInlinePrice: string;
  homeRentalBestBadge: string;
  homeRentalPopularBadge: string;
  homeRentalPkgDays: string;
  homeRentalPkgPrice: string;
  homeRentalPkgSub: string;
  homeRentalPkgFromDay8: string;
  homeRentalPkgPlusPrice: string;
  homeRentalPkgPlusSub: string;
  homeRentalLock: string;
  homeRentalHelmet: string;
  homeRentalAvail: string;
  homeRentalBookCta: string;
  svcAngeboteBadge: string;
  svcAngeboteTitle: string;
  svcAngeboteSub: string;
  svcAngeboteCta: string;

  filterByCategory: string;
  sortBy: string;
  sortNewest: string;
  sortPriceLow: string;
  sortPriceHigh: string;
  sortAZ: string;
  priceRange: string;
  allPrices: string;
  under500: string;
  range500to1000: string;
  over1000: string;
  filters: string;
  clearFilters: string;
  showFilters: string;
  hideFilters: string;

  // Detail
  description: string;
  price: string;
  category: string;
  location: string;
  photos: string;
  backToShowroom: string;

  // Trust
  trustLabel: string;
  trustTitle: string;
  trustSub: string;
  trust1: string;
  trust2: string;
  trust3: string;
  trust4: string;

  // Brand Story
  storyLabel: string;
  storyTitle: string;
  storyText: string;
  storyValue1Title: string;
  storyValue1Desc: string;
  storyValue2Title: string;
  storyValue2Desc: string;
  storyValue3Title: string;
  storyValue3Desc: string;

  // Shop Gallery
  galleryLabel: string;
  galleryTitle: string;
  gallerySub: string;

  // Bike Check Service
  bikeCheckLabel: string;
  bikeCheckTitle: string;
  bikeCheckSub: string;
  bikeCheckFreeTitle: string;
  bikeCheckBrakeCheck: string;
  bikeCheckGearTest: string;
  bikeCheckTireChain: string;
  bikeCheckLightCheck: string;
  bikeCheckReflectorCheck: string;
  bikeCheckBellCheck: string;
  bikeCheckSafetyCheck: string;
  bikeCheckRepairTitle: string;
  bikeCheckBrakeAdjust: string;
  bikeCheckChainCassette: string;
  bikeCheckGearAdjust: string;
  bikeCheckTireService: string;
  bikeCheckCableReplace: string;
  bikeCheckBottomBracket: string;
  bikeCheckSpokeRepair: string;
  bikeCheckLightInstall: string;
  bikeCheckPedalReplace: string;
  bikeCheckNote: string;
  bikeCheckExclusion: string;
  bikeCheckNoLiability: string;
  bikeCheckFairPrices: string;

  // CTA
  ctaSectionTitle: string;
  ctaSectionSub: string;
  ctaSectionButton: string;

  // About
  aboutLabel: string;
  aboutTitle: string;
  aboutText: string;
  aboutMission: string;
  openingHours: string;
  findUs: string;

  // Contact
  contactLabel: string;
  contactTitle: string;
  contactSub: string;
  phone: string;
  email: string;
  address: string;
  visitUs: string;

  // Footer
  footerTagline: string;
  quickLinks: string;
  footerNavAria: string;
  footerLogoAlt: string;
  footerLogoText: string;
  footerLocationEmmendingen: string;
  footerLocationBadKrozingen: string;
  footerLocationBreisach: string;
  footerLocationGundelfingen: string;
  footerLocationMarch: string;
  legalNotice: string;
  privacy: string;
  warrantyTerms: string;
  terms: string;
  allRights: string;

  // Warranty Page
  warrantyPageLabel: string;
  warrantyPageTitle: string;
  warrantyNewTitle: string;
  warrantyNewText: string;
  warrantyUsedTitle: string;
  warrantyUsedText: string;
  warrantyRepairNote: string;
  warrantyExcludedTitle: string;
  warrantyExcludedItems: string;
  warrantyReturnTitle: string;
  warrantyReturnText: string;

  // Bike Service Page (nav label)
  bikeService: string;

  // Bike Rental Page
  bikeRental: string;
  bikeRentalPageLabel: string;
  bikeRentalPageTitle: string;
  bikeRentalIntro: string;
  bikeRentalPricesTitle: string;
  bikeRentalHeroPrice: string;
  bikeRentalTierShort: string;
  bikeRentalTierPopular: string;
  bikeRentalTierTop: string;
  bikeRentalTierLong: string;
  bikeRentalTierBest: string;
  bikeRentalTierAddon: string;
  bikeRentalDurationDay1: string;
  bikeRentalDurationDay3: string;
  bikeRentalDurationDay7: string;
  bikeRentalDurationDay14: string;
  bikeRentalDurationDay30: string;
  bikeRentalDurationFromDay10: string;
  bikeRentalPriceDay1: string;
  bikeRentalPriceDay3: string;
  bikeRentalPriceDay7: string;
  bikeRentalPriceDay14: string;
  bikeRentalPriceDay30: string;
  bikeRentalPriceAddon: string;
  bikeRentalDay1: string;
  bikeRentalDay7: string;
  bikeRentalDay8Plus: string;
  bikeRentalMonth: string;
  bikeRentalDepositTitle: string;
  bikeRentalDepositText: string;
  bikeRentalNoteTitle: string;
  bikeRentalNoteText: string;
  bikeRentalIncludedTitle: string;
  bikeRentalIncluded1: string;
  bikeRentalIncluded2: string;
  bikeRentalIncludedNote: string;
  bikeRentalAvailableLabel: string;
  bikeRentalAvailableTitle: string;
  bikeRentalNoBikes: string;
  bikeRentalBookBtn: string;
  bikeRentalDay: string;
  bikeRentalDays: string;
  rentalLinksTitle: string;
  rentalLinkCatalog: string;
  rentalLinkGuide: string;
  rentalLinkFaq: string;

  // Rental page booking form
  rentalHeroTitle: string;
  rentalHeroSub: string;
  rentalHeroWaCta: string;
  rentalHeroScrollCta: string;
  rentalPricingTitle: string;
  rentalPricingSub: string;
  rentalBikesSub: string;
  rentalFormPeriod: string;
  rentalFormYourData: string;
  rentalFormFirstName: string;
  rentalFormLastName: string;
  rentalFormPhone: string;
  rentalFormAddress: string;
  rentalFormStrasse: string;
  rentalFormHausNr: string;
  rentalFormPlz: string;
  rentalFormOrt: string;
  rentalFormLang: string;
  rentalFormNotes: string;
  rentalFormSubmit: string;
  rentalFormSending: string;
  rentalFormConfirmNote: string;
  rentalSuccessTitle: string;
  rentalSuccessText: string;
  rentalSuccessBookingNr: string;
  rentalSuccessNewRequest: string;
  rentalBikeDetails: string;
  rentalChangeBike: string;
  rentalLoadingAvail: string;
  rentalSelectEndDate: string;
  rentalEstPrice: string;
  rentalStatusBooked: string;
  rentalStatusPending: string;
  rentalStatusClosed: string;
  rentalStatusSelected: string;
  rentalSundayLabel: string;
  rentalSteps?: Partial<RentalStepsTranslations>;

  // Rental Reviews
  rentalReviewsTitle: string;
  rentalReviewsSubtitle: string;
  rentalReviewsNoReviews: string;
  rentalReviewsFormTitle: string;
  rentalReviewsFormName: string;
  rentalReviewsFormEmail: string;
  rentalReviewsFormStars: string;
  rentalReviewsFormComment: string;
  rentalReviewsFormSubmit: string;
  rentalReviewsFormSending: string;
  rentalReviewsFormSuccess: string;
  rentalReviewsFormError: string;
  rentalReviewsFormValidation: string;

  // Erinnerungen (Anı Köşesi / Memory Corner)
  navMemories: string;
  memoriesTitle: string;
  memoriesSubtitle: string;
  memoriesIntro: string;
  memoriesEmpty: string;
  memoriesLoadMore: string;
  memoriesSeeAll: string;
  memoryPhotoCountLabel: string;
  memoryFormTitle: string;
  memoryFormName: string;
  memoryFormLocation: string;
  memoryFormStory: string;
  memoryFormPhotos: string;
  memoryFormPhotosHint: string;
  memoryFormConsent: string;
  memoryFormSubmit: string;
  memoryFormSending: string;
  memoryFormSuccess: string;
  memoryFormError: string;
  memoryFormValidation: string;
  memoryFormPhotoTooLarge: string;
  memoryFormTooManyPhotos: string;
  memoryFormConsentRequired: string;
  memoryFormAge: string;
  memoryFormCountry: string;
  memoryFormEmail: string;
  memoryStepEmailTitle: string;
  memoryStepEmailHint: string;
  memoryRequestCode: string;
  memoryCodeSent: string;
  memoryFormCode: string;
  memoryVerifyContinue: string;
  memoryCodeInvalid: string;
  memoryEmailInvalid: string;
  memoryResendCode: string;
  memoryChangeEmail: string;
  memoryViewsLabel: string;
  memoryEmailVerified: string;
  memoryFormPrivacyPre: string;
  memoryFormPrivacyLink: string;
  memoryFormPrivacyPost: string;
  memoryFormPrivacyRequired: string;

  // General
  loading: string;
  error: string;
  homeServicesAria: string;
  homeGalleryImageAltPrefix: string;
  homeLightboxCloseAria: string;
  homeLightboxPrevAria: string;
  homeLightboxNextAria: string;
  navbarMainNavAria: string;
  navbarHomeAria: string;
  navbarLogoAlt: string;
  navbarMenuAria: string;
  noResults: string;
  categories: string;
  ourShowroom: string;
  conditionNew: string;
  conditionUsed: string;
  contactEmailHint: string;
  contactKaHint: string;

  // Testimonials
  testimonialsLabel: string;
  testimonialsTitle: string;
  testimonialsSub: string;

  // Repair Showcases
  repairLabel: string;
  repairTitle: string;
  repairSub: string;

  // FAQ
  faqLabel: string;
  faqTitle: string;
  faqSub: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  faq5Q: string;
  faq5A: string;

  // WhatsApp Contact
  whatsappTitle: string;
  whatsappPlaceholder: string;
  whatsappSend: string;
  whatsappInterested: string;
  whatsappQuestion: string;

  // Ankauf
  ankaufTitle: string;
  ankaufDesc: string;
  ankaufCta: string;
  ankaufHint: string;
  reviewTitle: string;
  reviewDesc: string;
  reviewCta: string;
  reviewCountLabel: string;
  ankaufMessage: string;

  // About page extended
  aboutBadge: string;
  aboutHeadline: string;
  aboutHeadlineAccent: string;
  aboutIntroText: string;
  aboutFeatureInvoice: string;
  aboutFeatureTrust: string;
  aboutQuote: string;
  aboutQuoteAuthor: string;
  aboutMetaTitle: string;
  aboutMetaDescription: string;

  // Brands
  brandsLabel: string;
  brandsTitle: string;
  brandsIntro: string;
  brandsNewTitle: string;
  brandVictoriaDesc: string;
  brandConwayDesc: string;
  brandBikestarDesc: string;
  brandPyroDesc: string;
  brandXtractDesc: string;
  brandsUsedTitle: string;
  brandsUsedDesc: string;
  brandsAndMore: string;
  brandsDisclaimerLabel: string;
  brandsDisclaimer: string;

  // Days (full)
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  closed: string;
  restDay: string;
  rentalByAppointment: string;
  rentalReturnUntil: string;
  openGoogleMaps: string;

  // Days (short) for contact
  monShort: string;
  tueShort: string;
  wedShort: string;
  thuShort: string;
  friShort: string;
  satShort: string;
  sunShort: string;

  // Contact extended
  contactWhatsappHint: string;
  contactMetaTitle: string;
  contactMetaDescription: string;

  // Home trust badges
  trustBadgeSince: string;
  trustBadgeCustomers: string;
  ariaStarsRating: string;

  // Showroom filters
  filterCondition: string;
  filterCategory: string;
  filterAll: string;
  filterTireSize: string;
  filterGears: string;
  gearsUnit: string;
  filterFrameSize: string;
  showroomMetaTitle: string;
  showroomMetaDescription: string;

  // Showroom detail
  detailMetaDescSuffix: string;
  bikeFallbackCategory: string;

  // Footer
  legalLabel: string;
  languageLabel: string;

  // Bike card
  bikeAltSuffix: string;

  // Category translations
  catDamen: string;
  catHerren: string;
  catKinder: string;
  catZubehoer: string;
  catEBike: string;
  catTrekking: string;
  catMountain: string;
  catCity: string;
  catRennrad: string;
  catSonstige: string;

  // Accessories page
  accessoriesMetaTitle: string;
  accessoriesMetaDescription: string;
  accessoriesTitle: string;
  accessoriesSub: string;
  accessoriesNoItems: string;
  accessoriesAllCategories: string;
  accessoriesViewDetails: string;
  accessoriesBrand: string;
  accessoriesPriceOnRequest: string;

  // Neue Fahrräder page
  neueFahrraeder: string;
  neueFahrraederMetaTitle: string;
  neueFahrraederMetaDescription: string;
  neueFahrraederTitle: string;
  neueFahrraederSub: string;
  neueFahrraederBrand: string;
  neueFahrraederModel: string;
  neueFahrraederColor: string;
  neueFahrraederFrameSize: string;
  neueFahrraederWheelSize: string;
  neueFahrraederGears: string;
  neueFahrraederCondition: string;
  neueFahrraederWarranty: string;
  neueFahrraederBackToList: string;
  neueFahrraederNoItems: string;
  neueFahrraederContactUs: string;
  neueFahrraederInterested: string;

  // E-Bikes
  eBikesNav: string;
  eBikes: string;
  eBikesMetaTitle: string;
  eBikesMetaDescription: string;
  eBikesTitle: string;
  eBikesSub: string;
  eBikesNoItems: string;
  eBikesBackToList: string;
  eBikesInterested: string;
  eBikeMotorBrand: string;
  eBikeMotorPosition: string;
  eBikeBatteryCapacity: string;
  eBikeRange: string;
  eBikeTorque: string;
  filterMotorBrand: string;
  filterMotorPosition: string;
  filterBatteryRange: string;
  filterRange: string;

  // Bike Tours
  bikeToursNav: string;
  ausflugszieleNav: string;

  // Ratgeber / Blog
  ratgeberNav: string;
  ratgeberLabel: string;
  ratgeberTitle: string;
  ratgeberSub: string;
  ratgeberMetaTitle: string;
  ratgeberMetaDescription: string;
  ratgeberReadMore: string;
  ratgeberReadTime: string;
  ratgeberTip: string;
  ratgeberTldr: string;
  ratgeberRelated: string;
  ratgeberBackToList: string;
  faqMetaTitle: string;
  faqMetaDescription: string;
  bikeRentalMetaTitle: string;
  bikeRentalMetaDescription: string;
  garantieMetaTitle: string;
  garantieMetaDescription: string;
  impressumMetaTitle: string;
  impressumMetaDescription: string;
  datenschutzMetaTitle: string;
  datenschutzMetaDescription: string;
  faqCtaText: string;
  faqCtaButton: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  faqQ4: string;
  faqA4: string;
  faqQ5: string;
  faqA5: string;
  faqQ6: string;
  faqA6: string;
  faqQ7: string;
  faqA7: string;
  faqQ8: string;
  faqA8: string;
  faqQ9: string;
  faqA9: string;
  faqQ10: string;
  faqA10: string;

  // City landing pages
  cityWarrantyIncl: string;
  cityMin: string;
  cityDirectionsFrom: string;
  cityOpenMap: string;
  cityViewShowroom: string;
  footerLocations: string;

  // Showroom detail — internal linking
  relatedBikes: string;
  blogCta1: string;
  blogCta2: string;
  blogCta3: string;

  // Rental bike catalog (Mietfahrräder)
  rentalCatalogMetaTitle: string;
  rentalCatalogMetaDescription: string;
  rentalCatalogLabel: string;
  rentalCatalogTitle: string;
  rentalCatalogSub: string;
  rentalCatalogIntro: string;
  rentalCatalogPerDay: string;
  rentalCatalogFrom: string;
  rentalCatalogReserveCta: string;
  rentalCatalogViewDetail: string;
  rentalCatalogFilterBrand: string;
  rentalCatalogFilterType: string;
  rentalCatalogPriceMaxDaily: string;
  rentalCatalogNoBikes: string;

  // Rental bike detail
  rentalDetailBackToCatalog: string;
  rentalDetailReserveCta: string;
  rentalDetailPriceHeading: string;
  rentalDetailPriceNote: string;
  rentalDetailDay: string;
  rentalDetailDays: string;
  rentalDetailExtraDay: string;
  rentalDetailDeposit: string;
  rentalDetailDepositInfo: string;
  rentalDetailSpecsHeading: string;
  rentalDetailDescHeading: string;
  rentalDetailMetaTitleSuffix: string;
  rentalDetailMetaDescPrefix: string;

  // KI-Fahrradberater
  kiBeraterNav: string;
  kiBeraterMetaTitle: string;
  kiBeraterMetaDescription: string;
  kiBeraterTitle: string;
  kiBeraterSubtitle: string;
  kiBeraterWelcome: string;
  kiBeraterWelcomeSub: string;
  kiBeraterQuick1: string;
  kiBeraterQuick2: string;
  kiBeraterQuick3: string;
  kiBeraterQuick4: string;
  kiBeraterInputPlaceholder: string;
  kiBeraterSend: string;
  kiBeraterTyping: string;
  kiBeraterViewBike: string;
  kiBeraterShopCtaTitle: string;
  kiBeraterShopCtaText: string;
  kiBeraterShopCtaBtn: string;
  kiBeraterContactCtaBtn: string;
  kiBeraterError: string;
  kiBeraterClearChat: string;
  kiBeraterPriceOnRequest: string;
}

const TRANSLATIONS: Record<BaseLanguage, Translations> = {
  de: {
    metaTitle: 'Fahrradladen Freiburg | kaufen, mieten & service ',
    metaDescription:
      'Ihr Fahrradladen in Freiburg Haid ✓ Neue & gebrauchte Räder kaufen ✓ E-Bike, City, Trekking, Kinderfahrrad ✓ Fahrradverleih mit tagesgenauen Preisen pro Fahrrad ✓ 3 Monate Garantie. Kein Termin — Heckerstraße 27!',

    home: 'Start',
    showroom: 'Showroom',
    accessories: 'Zubehör',
    about: 'Über uns',
    contact: 'Kontakt',

    heroH1: 'Fahrräder in Freiburg — neu & gebraucht.',
    heroSub:
      'Über 100 geprüfte Fahrräder ✓ E-Bike, City & Trekking ✓ Fahrradverleih mit individuellen Tagespreisen je Fahrrad ✓ 3 Monate Garantie ✓ Sofort fahrbereit — Heckerstraße 27, Freiburg.',
    ctaPrimary: 'Neue Fahrräder entdecken',
    ctaSecondary: 'Showroom ansehen',
    ctaRental: 'Fahrrad mieten',
    heroBannerAria: 'Hero-Bereich',
    heroBadgeText: 'Bike Haus Freiburg',
    heroTitleLine1: 'Die beste',
    heroTitleGradient: 'Fahrrad-Erfahrung',
    heroTitleLine3: 'in Freiburg',
    heroStatBikes: 'Fahrraeder',
    heroStatYears: 'Jahre',
    heroStatRating: 'Bewertung',
    heroScrollLabel: 'Scrollen',

    valueLabel: 'WARUM WIR',
    valueTitle: 'Mehr als nur ein Fahrradladen.',
    value1Title: 'Geprüfte Qualität',
    value1Desc:
      'Jedes Gebrauchtrad durchläuft einen mehrstufigen Inspektions- und Aufbereitungsprozess.',
    value2Title: 'Faire Preise',
    value2Desc:
      'Transparent kalkuliert. Kein Verhandeln, kein Kleingedrucktes.',
    value3Title: 'Persönliche Beratung',
    value3Desc: 'Wir finden gemeinsam das Rad, das wirklich zu Ihnen passt.',
    value4Title: 'Nachhaltig handeln',
    value4Desc:
      'Gebrauchträder verlängern Lebenszyklen und schonen Ressourcen.',

    showroomLabel: 'SHOWROOM',
    showroomTitle: 'Gebrauchte Fahrräder kaufen in Freiburg.',
    showroomSub: 'Entdecken Sie unser Sortiment — regelmäßig aktualisiert.',
    viewAll: 'Alle ansehen',
    viewDetails: 'Details',
    newBikes: 'Neue Räder',
    usedBikes: 'Gebrauchträder',
    allBikes: 'Alle Räder',

    newBikesLabel: 'NEU IM SORTIMENT',
    newBikesTitle: 'Neue Fahrräder entdecken.',
    newBikesSub: 'Fabrikneue Räder mit 2 Jahren Geschäftsgarantie.',
    browseNewBikes: 'Neue Räder ansehen',
    ebikeAngeboteTitle: 'E-Bike Angebote',
    ebikeAngeboteSub:
      'Aktuelle Sonderangebote auf ausgewählte E-Bikes — solange der Vorrat reicht.',
    usedBikesLabel: 'GEPRÜFT & BEREIT',
    usedBikesTitle: 'Gebrauchträder entdecken.',
    usedBikesSub: 'Sorgfältig geprüft, aufbereitet und sofort fahrbereit.',
    browseUsedBikes: 'Gebrauchträder ansehen',

    allCategories: 'Alle',
    noBikesFound: 'Aktuell keine Fahrräder in dieser Kategorie.',
    searchPlaceholder: 'Suche nach Marke, Typ oder Größe...',
    priceOnRequest: 'Preis auf Anfrage',
    viewOnKleinanzeigen: 'Auf Kleinanzeigen ansehen',
    lastUpdated: 'Letzte Aktualisierung',
    bikesAvailable: 'Fahrräder verfügbar',
    filterByCategory: 'Kategorie',
    sortBy: 'Sortieren',
    sortNewest: 'Neueste zuerst',
    sortPriceLow: 'Preis aufsteigend',
    sortPriceHigh: 'Preis absteigend',
    sortAZ: 'A — Z',
    priceRange: 'Preisbereich',
    allPrices: 'Alle Preise',
    under500: 'Unter 500 €',
    range500to1000: '500 € — 1.000 €',
    over1000: 'Über 1.000 €',
    filters: 'Filter',
    clearFilters: 'Filter zurücksetzen',
    showFilters: 'Filter anzeigen',
    hideFilters: 'Filter ausblenden',

    description: 'Beschreibung',
    price: 'Preis',
    category: 'Kategorie',
    location: 'Standort',
    photos: 'Fotos',
    backToShowroom: 'Zurück zum Showroom',

    trustLabel: 'QUALITÄT',
    trustTitle: 'Qualität, der Sie vertrauen können.',
    trustSub:
      'Jedes Fahrrad bei Bike Haus Freiburg wird sorgfältig geprüft, bevor es in unseren Showroom kommt.',
    trust1: 'Technische Inspektion aller sicherheitsrelevanten Komponenten',
    trust2: 'Professionelle Aufbereitung und gründliche Reinigung',
    trust3: 'Faire Bewertung und transparente Preisgestaltung',
    trust4: 'Garantie: 24 Monate (Neurad) / 3 Monate (Gebrauchtrad)',

    storyLabel: 'UNSERE GESCHICHTE',
    storyTitle: 'Aus Leidenschaft für das Radfahren.',
    storyText:
      'Bike Haus Freiburg wurde aus der Überzeugung gegründet, dass gute Fahrräder nicht teuer sein müssen — und dass jedes Rad eine zweite Chance verdient.',
    storyValue1Title: 'Nachhaltigkeit',
    storyValue1Desc:
      'Jedes Gebrauchtrad, das wir aufbereiten, bedeutet weniger Abfall und mehr Mobilität.',
    storyValue2Title: 'Gemeinschaft',
    storyValue2Desc: 'Wir bringen Menschen aufs Rad — unabhängig vom Budget.',
    storyValue3Title: 'Handwerk',
    storyValue3Desc:
      'Mechanik trifft Leidenschaft. Jedes Rad wird mit Sorgfalt behandelt.',

    galleryLabel: 'UNSER LADEN',
    galleryTitle: 'Einblicke in unser Bike Haus.',
    gallerySub:
      'Schauen Sie sich unseren Laden in Freiburg an — hier warten Ihre nächsten Räder auf Sie.',

    bikeCheckLabel: 'SERVICE',
    bikeCheckTitle: 'Kostenloser Fahrrad-Check!',
    bikeCheckSub:
      'Service nur nach Wunsch — faire Preise, transparente Beratung.',
    bikeCheckFreeTitle: 'Kostenloser Check',
    bikeCheckBrakeCheck: 'Bremsenprüfung',
    bikeCheckGearTest: 'Schaltungstest',
    bikeCheckTireChain: 'Reifen & Kette prüfen',
    bikeCheckLightCheck: 'Lichtanlage prüfen',
    bikeCheckReflectorCheck: 'Reflektoren & Sichtbarkeit',
    bikeCheckBellCheck: 'Klingel & Hupe prüfen',
    bikeCheckSafetyCheck: 'Allgemeine Sicherheitsprüfung',
    bikeCheckRepairTitle: 'Service auf Wunsch',
    bikeCheckBrakeAdjust: 'Bremsen einstellen',
    bikeCheckChainCassette: 'Kette & Kassette tauschen',
    bikeCheckGearAdjust: 'Schaltung justieren',
    bikeCheckTireService: 'Reifenservice',
    bikeCheckCableReplace: 'Bowdenzug wechseln',
    bikeCheckBottomBracket: 'Tretlager warten',
    bikeCheckSpokeRepair: 'Speichen zentrieren & nachziehen',
    bikeCheckLightInstall: 'Licht nachrüsten',
    bikeCheckPedalReplace: 'Pedale tauschen',
    bikeCheckNote: 'Nur für normale Fahrräder',
    bikeCheckExclusion: 'Keine E-Bikes, keine Rennräder',
    bikeCheckNoLiability: 'Keine Haftung für Reparaturen',
    bikeCheckFairPrices: 'Faire Preise — Transparente Beratung.',

    ctaSectionTitle: 'Bereit für Ihr nächstes Abenteuer?',
    ctaSectionSub:
      'Besuchen Sie unseren Showroom oder stöbern Sie online durch unser aktuelles Angebot.',
    ctaSectionButton: 'Jetzt Fahrrad finden',

    aboutLabel: 'ÜBER UNS',
    aboutTitle: 'Wer wir sind.',
    aboutText:
      'Wir sind ein unabhängiger Fahrradhändler in Freiburg im Breisgau. Unser Sortiment umfasst geprüfte Gebrauchträder und ausgewählte Neuräder — für jeden Einsatzzweck und jedes Budget.',
    aboutMission:
      'Unsere Mission: Hochwertige Mobilität zugänglich machen — nachhaltig, fair und persönlich.',
    openingHours: 'Öffnungszeiten',
    findUs: 'So finden Sie uns',

    contactLabel: 'KONTAKT',
    contactTitle: 'Sprechen Sie mit uns.',
    contactSub: 'Wir beraten Sie gerne — persönlich vor Ort oder per Telefon.',
    phone: 'Telefon',
    email: 'E-Mail',
    address: 'Adresse',
    visitUs: 'Besuchen Sie uns',

    footerTagline: 'Neue & gebrauchte Fahrräder in Freiburg.',
    quickLinks: 'Navigation',
    footerNavAria: 'Footer-Navigation',
    footerLogoAlt: 'Bike Haus Freiburg Logo',
    footerLogoText: 'Bike Haus Freiburg',
    footerLocationEmmendingen: 'Fahrrad Emmendingen',
    footerLocationBadKrozingen: 'Fahrrad Bad Krozingen',
    footerLocationBreisach: 'Fahrrad Breisach',
    footerLocationGundelfingen: 'Fahrrad Gundelfingen',
    footerLocationMarch: 'Fahrrad March',
    legalNotice: 'Impressum',
    privacy: 'Datenschutz',
    warrantyTerms: 'Garantiebedingungen',
    terms: 'AGB',
    allRights: 'Alle Rechte vorbehalten.',

    // Warranty Page
    warrantyPageLabel: 'RECHTLICHES',
    warrantyPageTitle: 'Garantiebedingungen',
    warrantyNewTitle: 'Neue Fahrräder',
    warrantyNewText:
      'Dieses Fahrrad ist Neuwaren und unterliegt der gesetzlichen 2-jährigen Gewährleistung. Die Rechnung wird mitgeliefert. Der Verkäufer garantiert, dass das Fahrrad bei Übergabe mängelfrei ist. Der Käufer hat das Recht, das Fahrrad innerhalb von 3 Tagen ohne Angabe von Gründen zurückzugeben, vorausgesetzt, das Fahrrad wird vollständig und unversehrt zurückgegeben.',
    warrantyUsedTitle: 'Gebrauchte Fahrräder',
    warrantyUsedText:
      '3 Monate Garantie auf: Kette, Schaltung, Schaltwerk, Dynamo, Pedale und hydraulische Bremsen.',
    warrantyRepairNote:
      'Reparaturen im Garantiefall dürfen ausschließlich durch Bike Haus Freiburg durchgeführt werden.',
    warrantyExcludedTitle: 'Von der Garantie ausgeschlossen',
    warrantyExcludedItems:
      'Reifen, Schläuche, Bremsbeläge, Lampen. Ebenfalls ausgeschlossen: Schäden durch Unfälle oder unsachgemäße Nutzung.',
    warrantyReturnTitle: 'Rückgaberecht',
    warrantyReturnText: 'Innerhalb von 3 Arbeitstagen.',

    // Bike Rental Page
    bikeService: 'Service',
    bikeRental: 'Fahrradverleih',
    bikeRentalPageLabel: 'SERVICE',
    bikeRentalPageTitle: 'Fahrradverleih – Einfach und flexibel',
    bikeRentalIntro:
      'Entdecken Sie Freiburg bequem mit dem Fahrrad. Mieten Sie bei uns Fahrräder zu günstigen Preisen und ohne Aufwand.',
    bikeRentalPricesTitle: 'Fahrradmiete Preise',
    bikeRentalHeroPrice: '1-7 Tage individuell',
    bikeRentalTierShort: 'Kurzzeit',
    bikeRentalTierPopular: 'Beliebt',
    bikeRentalTierTop: 'Am beliebtesten',
    bikeRentalTierLong: 'Langzeit',
    bikeRentalTierBest: 'Bestes Angebot',
    bikeRentalTierAddon: 'Zusatz',
    bikeRentalDurationDay1: '1 Tag',
    bikeRentalDurationDay3: '3 Tage',
    bikeRentalDurationDay7: '7 Tage',
    bikeRentalDurationDay14: 'Ab Tag 8',
    bikeRentalDurationDay30: 'Langzeit',
    bikeRentalDurationFromDay10: 'Zusatztag',
    bikeRentalPriceDay1: 'manuell',
    bikeRentalPriceDay3: 'je Fahrrad',
    bikeRentalPriceDay7: '1-7 Tage',
    bikeRentalPriceDay14: '7-Tage-Basis',
    bikeRentalPriceDay30: '+ Zusatz',
    bikeRentalPriceAddon: 'pro weiterem Tag',
    bikeRentalDay1: '1-7 Tage: individuell',
    bikeRentalDay7: '7 Tage: Basispreis',
    bikeRentalDay8Plus: 'Ab Tag 8: fixer Zusatz pro Tag',
    bikeRentalMonth: 'Langzeit: automatisch berechnet',
    bikeRentalDepositTitle: 'Kaution',
    bikeRentalDepositText:
      'Die Mietgebühr wird im Voraus bezahlt. Zusätzlich ist pro Fahrrad eine Kaution in bar zu hinterlegen – je nach Fahrradtyp 100 € bis 200 € (z. B. City-Rad 100 €, Rennrad/Gravel 150 €, E-Bike 200 €). Den genauen Betrag siehst du bei der Buchung. Bei ordnungsgemäßer Rückgabe ohne Schäden oder Verluste wird die Kaution vollständig erstattet.',
    bikeRentalNoteTitle: 'Hinweis',
    bikeRentalNoteText:
      'Die Übergabe ist Mo-Fr ab 10:00 Uhr und Sa ab 11:00 Uhr möglich, die Rückgabe spätestens bis 18:00 Uhr. Ist das Fahrrad am Folgetag verfügbar, kann die Miete nach Absprache verlängert werden; pro zusätzlichem Tag wird der reguläre Tagespreis berechnet.',
    bikeRentalIncludedTitle: 'Inklusive',
    bikeRentalIncluded1: 'Faltschloss',
    bikeRentalIncluded2: 'Fahrradkorb',
    bikeRentalIncludedNote:
      'Verlorenes oder beschädigtes Zubehör (Schloss, Helm oder Korb) wird mit jeweils 30 € berechnet.',
    bikeRentalAvailableLabel: 'VERFÜGBARE FAHRRÄDER',
    bikeRentalAvailableTitle: 'Unsere Mietfahrräder',
    bikeRentalNoBikes:
      'Derzeit keine Fahrräder verfügbar. Bitte kontaktieren Sie uns.',
    bikeRentalBookBtn: 'Fahrrad reservieren',
    bikeRentalDay: 'Tag',
    bikeRentalDays: 'Tage',
    rentalLinksTitle: 'Mehr entdecken',
    rentalLinkCatalog: 'Alle Mietfahrräder ansehen',
    rentalLinkGuide: 'Ratgeber: Fahrradverleih Freiburg',
    rentalLinkFaq: 'Häufige Fragen',

    rentalHeroTitle: 'Fahrrad mieten in Freiburg',
    rentalHeroSub:
      'Sofort verfügbar – fair, flexibel, ohne versteckte Kosten. Direkt bei uns in Freiburg abholen.',
    rentalHeroWaCta: 'Fragen? WhatsApp',
    rentalHeroScrollCta: 'Fahrrad auswählen & jetzt reservieren',
    rentalPricingTitle: 'Fair. Transparent. Ohne Extras.',
    rentalPricingSub:
      'Je länger, desto günstiger – Schloss und Helm immer inklusive.',
    rentalBikesSub: 'Fahrrad auswählen und direkt Ihren Wunschzeitraum buchen.',
    rentalFormPeriod: 'Zeitraum wählen',
    rentalFormYourData: 'Ihre Daten',
    rentalFormFirstName: 'Vorname',
    rentalFormLastName: 'Nachname',
    rentalFormPhone: 'Telefon',
    rentalFormAddress: 'Adresse',
    rentalFormStrasse: 'Straße',
    rentalFormHausNr: 'Haus-Nr.',
    rentalFormPlz: 'PLZ',
    rentalFormOrt: 'Ort',
    rentalFormLang: 'Kommunikationssprache',
    rentalFormNotes: 'Anmerkungen (optional)',
    rentalFormSubmit: 'Anfrage senden',
    rentalFormSending: 'Wird gesendet...',
    rentalFormConfirmNote:
      'Nach Eingang Ihrer Anfrage erhalten Sie eine Bestätigungs-E-Mail. Die endgültige Buchung erfolgt nach Bestätigung durch unser Team.',
    rentalSuccessTitle: 'Buchungsanfrage gesendet!',
    rentalSuccessText:
      'Wir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich.',
    rentalSuccessBookingNr: 'Buchungsnummer',
    rentalSuccessNewRequest: 'Neue Anfrage stellen',
    rentalBikeDetails: 'Fahrrad Details',
    rentalChangeBike: 'Ändern',
    rentalLoadingAvail: 'Verfügbarkeit wird geladen...',
    rentalSelectEndDate: 'Enddatum wählen',
    rentalEstPrice: 'geschätzter Preis',
    rentalStatusBooked: 'Belegt',
    rentalStatusPending: 'In Prüfung',
    rentalStatusClosed: 'Geschlossen',
    rentalStatusSelected: 'Ausgewählt',
    rentalSundayLabel: 'Sonntag',

    rentalReviewsTitle: 'Kundenbewertungen',
    rentalReviewsSubtitle: 'Was unsere Kunden sagen',
    rentalReviewsNoReviews: 'Noch keine Bewertungen vorhanden.',
    rentalReviewsFormTitle: 'Bewertung hinterlassen',
    rentalReviewsFormName: 'Ihr Name',
    rentalReviewsFormEmail: 'E-Mail (optional)',
    rentalReviewsFormStars: 'Bewertung',
    rentalReviewsFormComment: 'Ihr Kommentar',
    rentalReviewsFormSubmit: 'Bewertung absenden',
    rentalReviewsFormSending: 'Wird gesendet...',
    rentalReviewsFormSuccess:
      'Danke! Ihre Bewertung wird nach Prüfung veröffentlicht.',
    rentalReviewsFormError:
      'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    rentalReviewsFormValidation: 'Bitte füllen Sie Name und Kommentar aus.',

    // Erinnerungen (Anı Köşesi)
    navMemories: 'Erinnerungen',
    memoriesTitle: 'Erinnerungsecke',
    memoriesSubtitle: 'Momente unserer Kunden auf zwei Rädern',
    memoriesIntro: 'Teile deine schönsten Radtour-Momente mit uns!',
    memoriesEmpty: 'Noch keine Erinnerungen — sei die/der Erste!',
    memoriesLoadMore: 'Mehr laden',
    memoriesSeeAll: 'Alle Erinnerungen ansehen',
    memoryPhotoCountLabel: 'Fotos',
    memoryFormTitle: 'Deine Erinnerung teilen',
    memoryFormName: 'Dein Name',
    memoryFormLocation: 'Ausflugsziel / Ort',
    memoryFormStory: 'Deine Geschichte (2–3 Sätze)',
    memoryFormPhotos: 'Fotos',
    memoryFormPhotosHint: 'max. 5 Fotos, je max. 8 MB (JPG, PNG, WebP)',
    memoryFormConsent:
      'Ich stimme der Veröffentlichung meines Namens und meiner Fotos zu.',
    memoryFormSubmit: 'Erinnerung senden',
    memoryFormSending: 'Wird gesendet...',
    memoryFormSuccess:
      'Danke! Deine Erinnerung wird nach Prüfung veröffentlicht.',
    memoryFormError: 'Senden fehlgeschlagen. Bitte versuche es erneut.',
    memoryFormValidation: 'Bitte fülle Name, Ort und Geschichte aus.',
    memoryFormPhotoTooLarge: 'Jedes Foto darf höchstens 8 MB groß sein.',
    memoryFormTooManyPhotos: 'Es sind höchstens 5 Fotos erlaubt.',
    memoryFormConsentRequired:
      'Bitte stimme der Veröffentlichung zu, um fortzufahren.',
    memoryFormAge: 'Alter',
    memoryFormCountry: 'Land',
    memoryFormEmail: 'E-Mail-Adresse',
    memoryStepEmailTitle: 'Bestätige deine E-Mail',
    memoryStepEmailHint:
      'Wir senden dir einen 4-stelligen Code. So stellen wir sicher, dass deine Erinnerung echt ist.',
    memoryRequestCode: 'Code anfordern',
    memoryCodeSent:
      'Wir haben dir einen Code geschickt. Bitte prüfe dein Postfach (auch den Spam-Ordner).',
    memoryFormCode: '4-stelliger Code',
    memoryVerifyContinue: 'Weiter',
    memoryCodeInvalid: 'Der Code ist ungültig oder abgelaufen.',
    memoryEmailInvalid: 'Bitte gib eine gültige E-Mail-Adresse an.',
    memoryResendCode: 'Code erneut senden',
    memoryChangeEmail: 'E-Mail ändern',
    memoryViewsLabel: 'Aufrufe',
    memoryEmailVerified: 'E-Mail bestätigt',
    memoryFormPrivacyPre: 'Ich habe die ',
    memoryFormPrivacyLink: 'Datenschutzerklärung',
    memoryFormPrivacyPost: ' gelesen und stimme der Verarbeitung meiner Daten zu.',
    memoryFormPrivacyRequired:
      'Bitte bestätige die Datenschutzerklärung, um fortzufahren.',

    loading: 'Wird geladen...',
    error: 'Ein Fehler ist aufgetreten.',
    homeServicesAria: 'Dienstleistungen',
    homeGalleryImageAltPrefix: 'Bike Haus Freiburg - Foto',
    homeLightboxCloseAria: 'Schliessen',
    homeLightboxPrevAria: 'Vorheriges',
    homeLightboxNextAria: 'Naechstes',
    navbarMainNavAria: 'Hauptnavigation',
    navbarHomeAria: 'Bike Haus Freiburg Startseite',
    navbarLogoAlt: 'Bike Haus Freiburg',
    navbarMenuAria: 'Menue',
    noResults: 'Keine Ergebnisse.',
    categories: 'Kategorien',
    ourShowroom: 'Showroom',
    conditionNew: 'Neu',
    conditionUsed: 'Gebraucht',
    contactEmailHint: 'Wir antworten innerhalb von 24 Stunden',
    contactKaHint: 'Alle unsere Angebote auf Kleinanzeigen ansehen',

    testimonialsLabel: 'KUNDENSTIMMEN',
    testimonialsTitle: 'Was unsere Kunden sagen',
    testimonialsSub: 'Über 500 zufriedene Kunden in Freiburg vertrauen uns',

    repairLabel: 'SERVICE',
    repairTitle: 'Unsere Serviceleistungen',
    repairSub: 'Einblicke in unseren Fahrrad-Service',

    faqLabel: 'HÄUFIGE FRAGEN',
    faqTitle: 'Fragen & Antworten',
    faqSub: 'Alles, was Sie über unseren Service wissen müssen.',
    faq1Q: 'Kann ich ein Fahrrad vor dem Kauf testen?',
    faq1A:
      'Ja! Kommen Sie einfach während unserer Öffnungszeiten vorbei — kein Termin erforderlich.',
    faq2Q: 'Bieten Sie eine Garantie auf Gebrauchträder?',
    faq2A:
      'Jedes Gebrauchtrad wird technisch geprüft. 3 Tage Rückgaberecht, 3 Monate Garantie auf Gebrauchträder, 24 Monate auf Neuraeder.',
    faq3Q: 'Wie kann ich bezahlen?',
    faq3A: 'Barzahlung, EC-Karte, Überweisung und PayPal.',
    faq4Q: 'Reparieren Sie auch Fahrräder?',
    faq4A:
      'Wir sind auf Verkauf spezialisiert. Für Reparaturen kontaktieren Sie uns bitte vorab per Telefon oder E-Mail.',
    faq5Q: 'Wo finde ich Sie?',
    faq5A:
      'Heckerstraße 27, 79114 Freiburg. Kommen Sie einfach während der Öffnungszeiten vorbei — kein Termin nötig.',

    // WhatsApp Contact
    whatsappTitle: 'Verkäufer kontaktieren',
    whatsappPlaceholder: 'Ihre Frage oder Nachricht...',
    whatsappSend: 'Per WhatsApp senden',
    whatsappInterested: 'Ich interessiere mich für dieses Fahrrad:',
    whatsappQuestion: 'Meine Frage:',

    // Ankauf
    ankaufTitle: 'Fahrrad verkaufen?',
    ankaufDesc:
      'Wir kaufen Ihr gebrauchtes Fahrrad! Schicken Sie uns einfach Fotos und Ihren Wunschpreis per WhatsApp.',
    ankaufCta: 'Angebot senden',
    ankaufHint: 'Fotos + Wunschpreis per WhatsApp',
    reviewTitle: 'Zufrieden mit uns? Bewerten Sie uns!',
    reviewDesc:
      'Ihre Bewertung auf Google hilft uns und anderen Kunden. Vielen Dank!',
    reviewCta: 'Google Bewertung schreiben',
    reviewCountLabel: 'Bewertungen',
    ankaufMessage:
      'Hallo, ich möchte mein Fahrrad verkaufen.\n\nMarke/Modell:\nZustand:\nWunschpreis:\n\n(Bitte Fotos anhängen)',

    // About page extended
    aboutBadge: 'Familienbetrieb seit 2021',
    aboutHeadline: 'Mehr als nur Fahrräder.',
    aboutHeadlineAccent: 'Eine Leidenschaft.',
    aboutIntroText:
      'Was als bescheidene Idee begann, ist heute ein Ort geworden, an dem Menschen aller Altersgruppen ihr perfektes Fahrrad finden. Als kleines Familienunternehmen in Freiburg glauben wir daran, dass jedes Rad eine Geschichte erzählt — und jeder Mensch die Freiheit verdient, seine eigene Geschichte auf zwei Rädern zu schreiben.',
    aboutFeatureInvoice: 'Rechnung & Kaufvertrag',
    aboutFeatureTrust: 'Vertrauen & Qualität',
    aboutQuote:
      'Jedes Fahrrad, das wir verkaufen, bringt Freude — und das ist der schönste Lohn.',
    aboutQuoteAuthor: '— Die Familie hinter Bike Haus',
    aboutMetaTitle:
      'Über uns — Bike Haus Freiburg | Fahrradladen in Freiburg Haid',
    aboutMetaDescription:
      'Bike Haus Freiburg in Haid — Ihr persönlicher Fahrradladen seit 2020. Über 500 zufriedene Kunden ✓ 3 Monate Garantie ✓ Neue & gebrauchte Räder. Lernen Sie uns kennen!',

    // Brands
    brandsLabel: 'MARKEN',
    brandsTitle: 'Unsere Marken — Neu & Gebraucht',
    brandsIntro:
      'In unserem Geschäft bieten wir eine sorgfältig ausgewählte Auswahl an Fahrrädern an. Bitte beachten Sie: Wir sind kein offizieller Händler aller Marken, verkaufen jedoch Fahrräder, die wir über legale Quellen beziehen.',
    brandsNewTitle: 'Neue Fahrräder',
    brandVictoriaDesc: 'Robuste und elegante Cityräder',
    brandConwayDesc: 'Zuverlässige Leistung bei Mountain- und Stadträdern',
    brandBikestarDesc: 'Kinder- und Jugendräder',
    brandPyroDesc: 'Leichte und schnelle Sportfahrräder',
    brandXtractDesc: 'Funktionale und preiswerte Modelle',
    brandsUsedTitle: 'Gebrauchte Fahrräder',
    brandsUsedDesc:
      'Wir führen gebrauchte Fahrräder bekannter Marken. Diese Fahrräder stammen direkt von Privatpersonen oder aus anderen legalen Quellen.',
    brandsAndMore: 'und viele weitere',
    brandsDisclaimerLabel: 'Hinweis:',
    brandsDisclaimer:
      'Wir verwenden die Markennamen zur Beschreibung der Produkte. Offizielle Garantie oder Serviceleistungen der Markenhersteller können wir ohne autorisierte Partnerschaft nicht anbieten.',

    // Days (full)
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag',
    closed: 'Geschlossen',
    restDay: 'Ruhetag',
    rentalByAppointment: 'Fahrradverleih 10:00–13:00 nur mit Termin',
    rentalReturnUntil: 'Fahrradrückgabe bis 18:00 Uhr',
    openGoogleMaps: 'Google Maps öffnen',

    // Days (short)
    monShort: 'Mo',
    tueShort: 'Di',
    wedShort: 'Mi',
    thuShort: 'Do',
    friShort: 'Fr',
    satShort: 'Sa',
    sunShort: 'So',

    // Contact extended
    contactWhatsappHint: 'Direkt schreiben',
    contactMetaTitle:
      'Fahrradladen Freiburg — Kontakt, Adresse & Öffnungszeiten | Bike Haus',
    contactMetaDescription:
      'Bike Haus Freiburg Haid — Heckerstraße 27, 79114 Freiburg ✓ Öffnungszeiten: Mo/Di/Mi/Do 13–17, Fr 11–13 & 15–18, Sa 11:30–17, So geschlossen ✓ WhatsApp: +49 155 6630 0011.',

    // Home trust badges
    trustBadgeSince: 'Seit 2020 in Freiburg',
    trustBadgeCustomers: '500+ zufriedene Kunden',
    ariaStarsRating: '5 von 5 Sternen',

    // Showroom filters
    filterCondition: 'Zustand',
    filterCategory: 'Kategorie',
    filterAll: 'Alle',
    filterTireSize: 'Reifengröße (Zoll)',
    filterGears: 'Gänge',
    gearsUnit: 'Gänge',
    filterFrameSize: 'Rahmengröße (Size)',
    showroomMetaTitle: 'Gebrauchte Fahrräder kaufen Freiburg | Bike Haus',
    showroomMetaDescription:
      'Gebrauchte & neue Fahrräder kaufen in Freiburg ✓ Über 100 geprüfte Räder ✓ City, Trekking, Mountain, E-Bike ✓ 3 Monate Garantie ✓ Sofort abholbereit. Bike Haus Freiburg.',

    // Showroom detail
    detailMetaDescSuffix:
      'Jetzt bei Bike Haus Freiburg in 79114 Freiburg im Breisgau ansehen.',
    bikeFallbackCategory: 'Fahrrad',

    // Footer
    legalLabel: 'Rechtliches',
    languageLabel: 'Sprache',

    // Bike card
    bikeAltSuffix: ' — Fahrrad bei Bike Haus Freiburg',

    // Category translations
    catDamen: 'Damen-Fahrräder',
    catHerren: 'Herren-Fahrräder',
    catKinder: 'Kinder-Fahrräder',
    catZubehoer: 'Zubehör',
    catEBike: 'E-Bikes',
    catTrekking: 'Trekkingräder',
    catMountain: 'Mountainbikes',
    catCity: 'Cityräder',
    catRennrad: 'Rennräder',
    catSonstige: 'Sonstige Fahrräder',

    // Accessories page
    accessoriesMetaTitle: 'Fahrradzubehör Freiburg | Helme, Taschen, Schlösser',
    accessoriesMetaDescription:
      'Fahrradzubehör in Freiburg kaufen ✓ Helme, Taschen, Schlösser, Beleuchtung & mehr ✓ Direkt im Bike Haus Freiburg — Heckerstraße 27, 79114 Freiburg.',
    accessoriesTitle: 'Zubehör',
    accessoriesSub: 'Taschen, Helme, Schlösser und mehr für Ihr Fahrrad.',
    accessoriesNoItems: 'Derzeit keine Zubehörartikel verfügbar.',
    accessoriesAllCategories: 'Alle Kategorien',
    accessoriesViewDetails: 'Details ansehen',
    accessoriesBrand: 'Marke',
    accessoriesPriceOnRequest: 'Preis auf Anfrage',

    // Neue Fahrräder
    neueFahrraeder: 'Neue Fahrräder',
    neueFahrraederMetaTitle:
      'Neue Fahrräder kaufen Freiburg | City, E-Bike, Trekking',
    neueFahrraederMetaDescription:
      'Neue Fahrräder in Freiburg kaufen ✓ City, Trekking, Mountain & E-Bikes ✓ 2 Jahre Garantie ✓ Sofort verfügbar ✓ Faire Preise. Jetzt im Showroom ansehen — Bike Haus Freiburg.',
    neueFahrraederTitle: 'Neue Fahrräder Freiburg',
    neueFahrraederSub: 'Fabrikneue Räder mit 2 Jahren Geschäftsgarantie.',
    neueFahrraederBrand: 'Marke',
    neueFahrraederModel: 'Modell',
    neueFahrraederColor: 'Farbe',
    neueFahrraederFrameSize: 'Rahmengröße',
    neueFahrraederWheelSize: 'Reifengröße',
    neueFahrraederGears: 'Gangschaltung',
    neueFahrraederCondition: 'Zustand',
    neueFahrraederWarranty: '2 Jahre Garantie',
    neueFahrraederBackToList: 'Zurück zur Übersicht',
    neueFahrraederNoItems: 'Aktuell keine neuen Fahrräder verfügbar.',
    neueFahrraederContactUs: 'Kontaktieren Sie uns',
    neueFahrraederInterested: 'Interesse an diesem Fahrrad?',

    eBikesNav: 'E-Bikes',
    eBikes: 'E-Bikes',
    eBikesMetaTitle:
      'E-Bikes kaufen Freiburg | City, Trekking & Mountain E-Bikes',
    eBikesMetaDescription:
      'E-Bikes in Freiburg kaufen ✓ City, Trekking & Mountain E-Bikes ✓ Bosch, Shimano & mehr ✓ 2 Jahre Garantie ✓ Faire Preise. Jetzt im Showroom ansehen — Bike Haus Freiburg.',
    eBikesTitle: 'E-Bikes kaufen in Freiburg',
    eBikesSub: 'Neue E-Bikes mit 2 Jahren Geschäftsgarantie.',
    eBikesNoItems: 'Aktuell keine E-Bikes verfügbar.',
    eBikesBackToList: 'Zurück zur Übersicht',
    eBikesInterested: 'Interesse an diesem E-Bike?',
    eBikeMotorBrand: 'Motor',
    eBikeMotorPosition: 'Motorposition',
    eBikeBatteryCapacity: 'Akkukapazität',
    eBikeRange: 'Reichweite',
    eBikeTorque: 'Drehmoment',
    filterMotorBrand: 'Motor',
    filterMotorPosition: 'Motorposition',
    filterBatteryRange: 'Akku (Wh)',
    filterRange: 'Reichweite (km)',

    // Ratgeber / Blog
    bikeToursNav: 'Fahrradtouren',
    ausflugszieleNav: 'Ausflugsziele',
    ratgeberNav: 'Ratgeber',
    ratgeberLabel: 'Wissen & Tipps',
    ratgeberTitle: 'Fahrrad Ratgeber',
    ratgeberSub:
      'Tipps, Checklisten und Wissenswertes rund ums Fahrrad — von Ihrem Fahrradhändler in Freiburg.',
    ratgeberMetaTitle: 'Fahrrad Ratgeber — Tipps & Wissen | Bike Haus Freiburg',
    ratgeberMetaDescription:
      'Fahrrad Ratgeber: Gebrauchtes Fahrrad kaufen, Rahmengröße berechnen, E-Bike Tipps und mehr. Expertenwissen von Bike Haus Freiburg.',
    ratgeberReadMore: 'Weiterlesen',
    ratgeberReadTime: 'Lesezeit',
    ratgeberTip: 'Tipp von Bike Haus',
    ratgeberTldr: 'Zusammenfassung',
    ratgeberRelated: 'Weitere Ratgeber',
    ratgeberBackToList: 'Alle Ratgeber anzeigen',
    faqMetaTitle: 'FAQ Fahrrad Freiburg — Häufige Fragen | Bike Haus Freiburg',
    faqMetaDescription:
      'Häufige Fragen zu Fahrrad kaufen & mieten in Freiburg: Garantie, E-Bikes, Probefahrt, Öffnungszeiten, Preise. Alle Antworten von Bike Haus Freiburg.',
    bikeRentalMetaTitle: 'Fahrrad mieten Freiburg | Helm & Schloss inklusive',
    bikeRentalMetaDescription:
      'Fahrradverleih Freiburg ✓ Cityräder, E-Bikes & Trekkingräder mieten. Helm & Schloss inklusive. Ab 8 €/Tag. Sofort abholen — Bike Haus Freiburg.',
    garantieMetaTitle: 'Garantiebedingungen — Bike Haus Freiburg',
    garantieMetaDescription:
      'Garantiebedingungen für neue und gebrauchte Fahrräder bei Bike Haus Freiburg. 2 Jahre für Neuräder, 3 Monate für Gebrauchträder.',
    impressumMetaTitle: 'Impressum — Bike Haus Freiburg',
    impressumMetaDescription:
      'Impressum und rechtliche Angaben von Bike Haus Freiburg gemäß § 5 TMG.',
    datenschutzMetaTitle: 'Datenschutz — Bike Haus Freiburg',
    datenschutzMetaDescription:
      'Datenschutzerklärung von Bike Haus Freiburg. Informationen zur Verarbeitung Ihrer personenbezogenen Daten.',
    faqCtaText: 'Noch Fragen? Kontaktieren Sie uns!',
    faqCtaButton: 'Kontakt aufnehmen',
    faqQ1: 'Wo kann ich ein Fahrrad in Freiburg kaufen?',
    faqA1:
      'Bei Bike Haus Freiburg in der Heckerstraße 27, 79114 Freiburg im Breisgau. Wir haben über 100 neue und gebrauchte Fahrräder vorrätig — einfach vorbeikommen, kein Termin nötig.',
    faqQ2: 'Kann ich ein Fahrrad vor dem Kauf probefahren?',
    faqA2:
      'Ja! Alle Fahrräder können während unserer Öffnungszeiten vor Ort probegefahren werden — ohne Termin, einfach vorbeikommen.',
    faqQ3: 'Bieten Sie Garantie auf Gebrauchträder?',
    faqA3:
      'Jedes Gebrauchtrad wird technisch geprüft. Sie erhalten 3 Tage Rückgaberecht und 3 Monate Garantie auf alle Gebrauchträder. Neue Fahrräder haben 24 Monate Garantie.',
    faqQ4: 'Was kostet ein gebrauchtes Fahrrad?',
    faqA4:
      'Gebrauchte Fahrräder beginnen ab ca. 180 €. Gebrauchte E-Bikes ab ca. 999 €. Alle Preise sind fair kalkuliert.',
    faqQ5: 'Gibt es gebrauchte E-Bikes?',
    faqA5:
      'Ja, wir bieten hochwertige gebrauchte E-Bikes mit dokumentiertem Akku-Zustand und Garantie an. Alle E-Bikes werden vor dem Verkauf geprüft.',
    faqQ6: 'Welche Zahlungsmethoden akzeptieren Sie?',
    faqA6:
      'Wir akzeptieren Barzahlung, EC-Karte, Kreditkarte, PayPal und Überweisung.',
    faqQ7: 'Kaufen Sie auch Fahrräder an?',
    faqA7:
      'Ja, wir kaufen gebrauchte Fahrräder in gutem Zustand zu fairen Preisen an. Bringen Sie Ihr Fahrrad einfach vorbei.',
    faqQ8: 'Welche Fahrradtypen führen Sie?',
    faqA8:
      'Citybikes, Trekkingräder, Mountainbikes, E-Bikes, Kinderfahrräder, Hollandräder und Rennräder — sowohl neu als auch gebraucht.',
    faqQ9: 'Was sind Ihre Öffnungszeiten?',
    faqA9:
      'Mo, Di, Mi, Do: 13:00–17:00 Uhr. Freitag: 11:00–13:00 & 15:00–18:00 Uhr. Samstag: 11:30–17:00 Uhr. Sonn- und feiertags geschlossen.',
    faqQ10: 'Kann ich mein altes Fahrrad in Zahlung geben?',
    faqA10:
      'Ja, in Einzelfällen ist eine Inzahlungnahme möglich. Sprechen Sie uns einfach an — wir finden eine Lösung.',

    svcRepairBadge: 'Service',
    svcRepairTitle: 'Fahrrad Service',
    svcRepairSub:
      'Professionelle Wartung & Service – schnell, zuverlässig, fair.',
    svcRepairItem1: 'Bremsen, Schaltung, Reifen',
    svcRepairItem2: 'Komplette Inspektion',
    svcRepairItem3: 'Fahrrad Diagnose & Wartung',
    svcRepairItem4: 'Ersatzteile auf Lager',
    svcRepairCta: 'Zum Service',
    svcRepairWaCta: 'Termin via WhatsApp',
    svcRentalBadge: 'Verleih',
    svcRentalTitle: 'Fahrradverleih',
    svcRentalSub:
      'Stadtrad, Trekking oder Mountainbike – flexibel mieten ab einem Tag.',
    svcRentalItem1: 'City- & Trekkingräder',
    svcRentalItem2: 'Mountainbikes verfügbar',
    svcRentalItem3: 'Tages- & Wochenmiete',
    svcRentalItem4: 'Schloss & Helm inklusive',
    svcRentalCta: 'Fahrrad mieten',
    homeRentalCardTitle: 'Fahrrad mieten',
    homeRentalInlinePrice: '1-7 Tage individuell',
    homeRentalBestBadge: 'Bestes Angebot · Spare 30%',
    homeRentalPopularBadge: 'Beliebt',
    homeRentalPkgDays: '1-7 Tage',
    homeRentalPkgPrice: 'pro Fahrrad',
    homeRentalPkgSub: 'tagesgenau konfiguriert',
    homeRentalPkgFromDay8: 'ab Tag 8',
    homeRentalPkgPlusPrice: '7-Tage-Preis + Aufschlag',
    homeRentalPkgPlusSub: 'je weiterer Tag fest hinterlegt',
    homeRentalLock: 'Schloss inklusive',
    homeRentalHelmet: 'Helm kostenlos',
    homeRentalAvail: 'Sofort verfügbar',
    homeRentalBookCta: 'Fahrrad auswählen & jetzt reservieren',
    svcAngeboteBadge: 'Neue Fahrräder',
    svcAngeboteTitle: 'Neue Fahrräder',
    svcAngeboteSub:
      'Fabrikneue Räder mit 2 Jahren Händlergarantie – direkt aus Freiburg.',
    svcAngeboteCta: 'Alle neuen Fahrräder',

    cityWarrantyIncl: 'Garantie inkl.',
    cityMin: 'Min.',
    cityDirectionsFrom: 'Anfahrt von',
    cityOpenMap: 'Route in Google Maps öffnen →',
    cityViewShowroom: 'Showroom ansehen',
    footerLocations: 'Standorte',

    relatedBikes: 'Ähnliche Fahrräder',
    blogCta1: 'Gebrauchtes Fahrrad kaufen — Tipps & Checkliste',
    blogCta2: 'Welches Fahrrad passt zu mir?',
    blogCta3: 'Fahrrad Inspektion — Was kostet es?',

    rentalCatalogMetaTitle:
      'Mietfahrräder Freiburg | City, E-Bike & Trekking | Bike Haus',
    rentalCatalogMetaDescription:
      'Alle Mietfahrräder in Freiburg auf einen Blick ✓ City-Räder, Trekking, E-Bikes & Kinderräder ✓ Tagesgenaue Preise ✓ Filterbar nach Marke, Größe & Typ ✓ Online reservieren — Heckerstraße 27.',
    rentalCatalogLabel: 'Mietflotte',
    rentalCatalogTitle: 'Fahrräder zum Mieten in Freiburg.',
    rentalCatalogSub: 'Mietfahrräder verfügbar',
    rentalCatalogIntro:
      'Stöbere durch unsere komplette Mietflotte in Freiburg-Haid: City-Räder, Trekking, E-Bikes, Kinderräder und mehr. Filtere nach Marke, Reifengröße, Rahmengröße und Typ. Jedes Fahrrad hat tagesgenaue Preise und kann direkt online reserviert werden.',
    rentalCatalogPerDay: '/Tag',
    rentalCatalogFrom: 'ab',
    rentalCatalogReserveCta: 'Jetzt reservieren',
    rentalCatalogViewDetail: 'Details ansehen',
    rentalCatalogFilterBrand: 'Marke',
    rentalCatalogFilterType: 'Fahrradtyp',
    rentalCatalogPriceMaxDaily: 'Max. Preis/Tag (€)',
    rentalCatalogNoBikes: 'Keine Mietfahrräder gefunden.',

    rentalDetailBackToCatalog: 'Zur Mietflotte',
    rentalDetailReserveCta: 'Dieses Fahrrad reservieren',
    rentalDetailPriceHeading: 'Mietpreise',
    rentalDetailPriceNote:
      'Preise pro Fahrrad, gestaffelt nach Anzahl der Tage. Ab dem 8. Tag gilt der angegebene Zusatztagespreis.',
    rentalDetailDay: 'Tag',
    rentalDetailDays: 'Tage',
    rentalDetailExtraDay: 'Jeder weitere Tag (ab Tag 8)',
    rentalDetailDeposit: 'Kaution',
    rentalDetailDepositInfo:
      'Die Kaution wird bei Übergabe hinterlegt und nach unbeschädigter Rückgabe vollständig erstattet.',
    rentalDetailSpecsHeading: 'Ausstattung',
    rentalDetailDescHeading: 'Beschreibung',
    rentalDetailMetaTitleSuffix: 'mieten in Freiburg | Bike Haus Freiburg',
    rentalDetailMetaDescPrefix: 'Miete dieses Fahrrad in Freiburg:',

    kiBeraterNav: 'KI-Fahrradberater',
    kiBeraterMetaTitle:
      'KI-Fahrradberater Freiburg – Das richtige Fahrrad finden',
    kiBeraterMetaDescription:
      'Welches Fahrrad passt zu dir? Kostenloser KI-Assistent empfiehlt Bikes aus unserem Freiburger Bestand. Jetzt fragen – sofort Antwort, ohne Anmeldung!',
    kiBeraterTitle: 'KI-Fahrradberater Freiburg',
    kiBeraterSubtitle:
      'Beschreib dein Budget, deine Körpergröße oder für wen das Fahrrad ist – unser KI-Assistent findet das richtige Bike aus unserem Freiburger Bestand.',
    kiBeraterWelcome: 'Hallo! Ich bin dein persönlicher Fahrradberater.',
    kiBeraterWelcomeSub:
      'Sag mir, was du suchst – Budget, Körpergröße oder Fahrradtyp – und ich empfehle passende Bikes aus unserem Freiburger Lager.',
    kiBeraterQuick1: 'Kinderfahrrad für 8-Jährigen – welche Größe?',
    kiBeraterQuick2: 'E-Bike unter 800 € gebraucht',
    kiBeraterQuick3: 'Stadtrad für den Alltag unter 300 €',
    kiBeraterQuick4: 'Trekkingrad Herren, ca. 180 cm',
    kiBeraterInputPlaceholder: 'Frag mich nach dem perfekten Fahrrad…',
    kiBeraterSend: 'Senden',
    kiBeraterTyping: 'Schreibt…',
    kiBeraterViewBike: 'Details ansehen',
    kiBeraterShopCtaTitle: 'Persönliche Beratung gewünscht?',
    kiBeraterShopCtaText: 'Unser Team freut sich auf deinen Besuch im Laden.',
    kiBeraterShopCtaBtn: 'Zum Showroom',
    kiBeraterContactCtaBtn: 'Kontakt aufnehmen',
    kiBeraterError: 'Verbindungsfehler. Bitte versuche es erneut.',
    kiBeraterClearChat: 'Chat leeren',
    kiBeraterPriceOnRequest: 'Preis auf Anfrage',
  },

  en: {
    metaTitle: 'Bike Shop Freiburg | Buy, Rent & Repair Bikes | Bike Haus',
    metaDescription:
      'Bike shop in Freiburg — 100+ inspected used & new bikes ✓ City, E-Bike, Trekking, Kids ✓ Daily bike rental ✓ 3-month warranty. No appointment — Heckerstraße 27!',

    home: 'Home',
    showroom: 'Showroom',
    accessories: 'Accessories',
    about: 'About',
    contact: 'Contact',

    heroH1: 'Bike Shop in Freiburg — New & Used Bikes.',
    heroSub:
      'Buy or rent a bike in Freiburg ✓ Inspected used bikes from €180 ✓ Bike rental with per-bike daily pricing ✓ City, Trekking & E-Bikes ✓ Pick up same day.',
    ctaPrimary: 'Discover New Bikes',
    ctaSecondary: 'View Showroom',
    ctaRental: 'Rent a Bike',
    heroBannerAria: 'Hero section',
    heroBadgeText: 'Bike Haus Freiburg',
    heroTitleLine1: 'The best',
    heroTitleGradient: 'bike experience',
    heroTitleLine3: 'in Freiburg',
    heroStatBikes: 'Bikes',
    heroStatYears: 'Years',
    heroStatRating: 'Rating',
    heroScrollLabel: 'Scroll',

    valueLabel: 'WHY US',
    valueTitle: 'More than just a bike shop.',
    value1Title: 'Certified Quality',
    value1Desc:
      'Every used bike goes through a multi-step inspection and refurbishment process.',
    value2Title: 'Fair Prices',
    value2Desc: 'Transparently calculated. No haggling, no fine print.',
    value3Title: 'Personal Advice',
    value3Desc: 'We help you find the bike that truly fits you.',
    value4Title: 'Sustainable Action',
    value4Desc: 'Used bikes extend lifecycles and conserve resources.',

    showroomLabel: 'SHOWROOM',
    showroomTitle: 'Buy Used Bikes in Freiburg.',
    showroomSub: 'Discover our selection — regularly updated.',
    viewAll: 'View All',
    viewDetails: 'Details',
    newBikes: 'New Bikes',
    usedBikes: 'Used Bikes',
    allBikes: 'All Bikes',

    newBikesLabel: 'NEW IN STOCK',
    newBikesTitle: 'Discover New Bikes.',
    newBikesSub: 'Brand new bikes with 2 years shop warranty.',
    browseNewBikes: 'Browse New Bikes',
    ebikeAngeboteTitle: 'E-Bike Offers',
    ebikeAngeboteSub:
      'Current special offers on selected e-bikes — while stocks last.',
    usedBikesLabel: 'CERTIFIED & READY',
    usedBikesTitle: 'Discover Used Bikes.',
    usedBikesSub: 'Carefully inspected, refurbished, and ready to ride.',
    browseUsedBikes: 'Browse Used Bikes',

    allCategories: 'All',
    noBikesFound: 'No bikes available in this category.',
    searchPlaceholder: 'Search by brand, type, or size...',
    priceOnRequest: 'Price on request',
    viewOnKleinanzeigen: 'View on Kleinanzeigen',
    lastUpdated: 'Last updated',
    bikesAvailable: 'Bikes available',
    filterByCategory: 'Category',
    sortBy: 'Sort by',
    sortNewest: 'Newest first',
    sortPriceLow: 'Price low to high',
    sortPriceHigh: 'Price high to low',
    sortAZ: 'A — Z',
    priceRange: 'Price range',
    allPrices: 'All prices',
    under500: 'Under €500',
    range500to1000: '€500 — €1,000',
    over1000: 'Over €1,000',
    filters: 'Filters',
    clearFilters: 'Clear filters',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',

    description: 'Description',
    price: 'Price',
    category: 'Category',
    location: 'Location',
    photos: 'Photos',
    backToShowroom: 'Back to Showroom',

    trustLabel: 'QUALITY',
    trustTitle: 'Quality you can trust.',
    trustSub:
      'Every bike at Bike Haus Freiburg is carefully inspected before entering our showroom.',
    trust1: 'Technical inspection of all safety-relevant components',
    trust2: 'Professional refurbishment and thorough cleaning',
    trust3: 'Fair evaluation and transparent pricing',
    trust4: 'Warranty: 24 months (new) / 3 months (used)',

    storyLabel: 'OUR STORY',
    storyTitle: 'Driven by passion for cycling.',
    storyText:
      "Bike Haus Freiburg was founded on the belief that good bikes don't have to be expensive — and that every bike deserves a second chance.",
    storyValue1Title: 'Sustainability',
    storyValue1Desc:
      'Every used bike we refurbish means less waste and more mobility.',
    storyValue2Title: 'Community',
    storyValue2Desc: 'We get people on bikes — regardless of budget.',
    storyValue3Title: 'Craftsmanship',
    storyValue3Desc:
      'Mechanics meets passion. Every bike is treated with care.',

    galleryLabel: 'OUR SHOP',
    galleryTitle: 'Inside our Bike Haus.',
    gallerySub: 'Take a look at our shop in Freiburg — your next bike awaits.',

    bikeCheckLabel: 'SERVICE',
    bikeCheckTitle: 'Free Bike Check!',
    bikeCheckSub: 'Repairs only on request — fair prices, transparent advice.',
    bikeCheckFreeTitle: 'Free Check',
    bikeCheckBrakeCheck: 'Brake inspection',
    bikeCheckGearTest: 'Gear test',
    bikeCheckTireChain: 'Tire & chain check',
    bikeCheckLightCheck: 'Light system check',
    bikeCheckReflectorCheck: 'Reflectors & visibility',
    bikeCheckBellCheck: 'Bell & horn check',
    bikeCheckSafetyCheck: 'General safety inspection',
    bikeCheckRepairTitle: 'Service on Request',
    bikeCheckBrakeAdjust: 'Brake adjustment',
    bikeCheckChainCassette: 'Chain & cassette replacement',
    bikeCheckGearAdjust: 'Gear adjustment',
    bikeCheckTireService: 'Tire service',
    bikeCheckCableReplace: 'Cable replacement',
    bikeCheckBottomBracket: 'Bottom bracket service',
    bikeCheckSpokeRepair: 'Spoke check & truing',
    bikeCheckLightInstall: 'Light installation',
    bikeCheckPedalReplace: 'Pedal replacement',
    bikeCheckNote: 'Regular bikes only',
    bikeCheckExclusion: 'No e-bikes, no racing bikes',
    bikeCheckNoLiability: 'No liability for repairs',
    bikeCheckFairPrices: 'Fair prices — Transparent advice.',

    ctaSectionTitle: 'Ready for your next adventure?',
    ctaSectionSub: 'Visit our showroom or browse our current selection online.',
    ctaSectionButton: 'Find a Bike Now',

    aboutLabel: 'ABOUT US',
    aboutTitle: 'Who we are.',
    aboutText:
      'We are an independent bicycle dealer in Freiburg im Breisgau. Our range includes certified used bikes and selected new bikes — for every purpose and every budget.',
    aboutMission:
      'Our mission: Making quality mobility accessible — sustainable, fair, and personal.',
    openingHours: 'Opening Hours',
    findUs: 'Find Us',

    contactLabel: 'CONTACT',
    contactTitle: 'Get in touch.',
    contactSub: "We're happy to advise you — in person or by phone.",
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    visitUs: 'Visit Us',

    footerTagline: 'New & used bikes in Freiburg.',
    quickLinks: 'Navigation',
    footerNavAria: 'Footer navigation',
    footerLogoAlt: 'Bike Haus Freiburg logo',
    footerLogoText: 'Bike Haus Freiburg',
    footerLocationEmmendingen: 'Bike Emmendingen',
    footerLocationBadKrozingen: 'Bike Bad Krozingen',
    footerLocationBreisach: 'Bike Breisach',
    footerLocationGundelfingen: 'Bike Gundelfingen',
    footerLocationMarch: 'Bike March',
    legalNotice: 'Legal Notice',
    privacy: 'Privacy Policy',
    warrantyTerms: 'Warranty Terms',
    terms: 'Terms',
    allRights: 'All rights reserved.',

    // Warranty Page
    warrantyPageLabel: 'LEGAL',
    warrantyPageTitle: 'Warranty Terms',
    warrantyNewTitle: 'New Bicycles',
    warrantyNewText:
      'This bicycle is new merchandise and is subject to the statutory 2-year warranty. The invoice is included. The seller guarantees that the bicycle is free of defects at handover. The buyer has the right to return the bicycle within 3 days without giving reasons, provided the bicycle is returned complete and undamaged.',
    warrantyUsedTitle: 'Used Bicycles',
    warrantyUsedText:
      '3 months warranty on: chain, gears, derailleur, dynamo, pedals and hydraulic brakes.',
    warrantyRepairNote:
      'Warranty repairs must be carried out exclusively by Bike Haus Freiburg.',
    warrantyExcludedTitle: 'Excluded from Warranty',
    warrantyExcludedItems:
      'Tires, tubes, brake pads, lights. Also excluded: damage from accidents or improper use.',
    warrantyReturnTitle: 'Return Policy',
    warrantyReturnText: 'Within 3 business days.',

    // Bike Rental Page
    bikeService: 'Bike Service',
    bikeRental: 'Bike Rental',
    bikeRentalPageLabel: 'SERVICE',
    bikeRentalPageTitle: 'Bike Rental – Simple and Flexible',
    bikeRentalIntro:
      'Discover Freiburg comfortably by bike. Rent bicycles from us at affordable prices with no hassle.',
    bikeRentalPricesTitle: 'Bike Rental Prices',
    bikeRentalHeroPrice: '1 day -> 12 €',
    bikeRentalTierShort: 'Short-term',
    bikeRentalTierPopular: 'Popular',
    bikeRentalTierTop: 'Most popular',
    bikeRentalTierLong: 'Long-term',
    bikeRentalTierBest: 'Best deal',
    bikeRentalTierAddon: 'Add-on',
    bikeRentalDurationDay1: '1 day',
    bikeRentalDurationDay3: '3 days',
    bikeRentalDurationDay7: '7 days',
    bikeRentalDurationDay14: 'From day 8',
    bikeRentalDurationDay30: 'Long rental',
    bikeRentalDurationFromDay10: 'Extra day',
    bikeRentalPriceDay1: 'manual',
    bikeRentalPriceDay3: 'per bike',
    bikeRentalPriceDay7: 'days 1-7',
    bikeRentalPriceDay14: '7-day base',
    bikeRentalPriceDay30: '+ surcharge',
    bikeRentalPriceAddon: 'per added day',
    bikeRentalDay1: '1-7 days: individual',
    bikeRentalDay7: '7 days: base price',
    bikeRentalDay8Plus: 'From day 8: fixed surcharge per day',
    bikeRentalMonth: 'Long rental: automatic calculation',
    bikeRentalDepositTitle: 'Deposit',
    bikeRentalDepositText:
      'The rental fee is paid in advance. In addition, a cash deposit is required per bicycle, depending on the bike type — from 100 € to 200 € (e.g. city bike 100 €, road/gravel bike 150 €, e-bike 200 €). You will see the exact amount at booking. If the bicycle is returned properly without damage or loss, the deposit is fully refunded.',
    bikeRentalNoteTitle: 'Note',
    bikeRentalNoteText:
      'Handover is possible Mon-Fri from 10:00 and Sat from 11:00, and return must be completed by 18:00 at the latest. If the bike is available the next day, the rental can be extended by letting us know; each additional day is charged at the regular daily rate.',
    bikeRentalIncludedTitle: 'Included',
    bikeRentalIncluded1: 'Folding lock',
    bikeRentalIncluded2: 'Bicycle basket',
    bikeRentalIncludedNote:
      'Lost or damaged accessories (lock, helmet or basket) are charged at 30 € each.',
    bikeRentalAvailableLabel: 'AVAILABLE BICYCLES',
    bikeRentalAvailableTitle: 'Our Rental Bikes',
    bikeRentalNoBikes: 'No bicycles currently available. Please contact us.',
    bikeRentalBookBtn: 'Reserve bike',
    bikeRentalDay: 'Day',
    bikeRentalDays: 'Days',
    rentalLinksTitle: 'Discover more',
    rentalLinkCatalog: 'View all rental bikes',
    rentalLinkGuide: 'Guide: Bike Rental Freiburg',
    rentalLinkFaq: 'Frequently Asked Questions',

    rentalHeroTitle: 'Rent a Bike in Freiburg',
    rentalHeroSub:
      'Rent a bike in Freiburg same day — fair daily rates, no hidden costs. City bikes, e-bikes & trekking. Pick up directly at Heckerstraße 27.',
    rentalHeroWaCta: 'Questions? WhatsApp',
    rentalHeroScrollCta: 'Choose a bike & reserve now',
    rentalPricingTitle: 'Fair. Transparent. No extras.',
    rentalPricingSub:
      'The longer, the cheaper – lock and helmet always included.',
    rentalBikesSub: 'Choose a bike and book your desired period directly.',
    rentalFormPeriod: 'Select period',
    rentalFormYourData: 'Your details',
    rentalFormFirstName: 'First name',
    rentalFormLastName: 'Last name',
    rentalFormPhone: 'Phone',
    rentalFormAddress: 'Address',
    rentalFormStrasse: 'Street',
    rentalFormHausNr: 'House no.',
    rentalFormPlz: 'Postcode',
    rentalFormOrt: 'City',
    rentalFormLang: 'Communication language',
    rentalFormNotes: 'Notes (optional)',
    rentalFormSubmit: 'Send request',
    rentalFormSending: 'Sending...',
    rentalFormConfirmNote:
      'After receiving your request, you will get a confirmation email. The final booking is confirmed by our team.',
    rentalSuccessTitle: 'Booking request sent!',
    rentalSuccessText:
      'We have received your request and will get back to you as soon as possible.',
    rentalSuccessBookingNr: 'Booking number',
    rentalSuccessNewRequest: 'New request',
    rentalBikeDetails: 'Bike details',
    rentalChangeBike: 'Change',
    rentalLoadingAvail: 'Loading availability...',
    rentalSelectEndDate: 'Select end date',
    rentalEstPrice: 'estimated price',
    rentalStatusBooked: 'Booked',
    rentalStatusPending: 'Pending',
    rentalStatusClosed: 'Closed',
    rentalStatusSelected: 'Selected',
    rentalSundayLabel: 'Sunday',

    rentalReviewsTitle: 'Customer Reviews',
    rentalReviewsSubtitle: 'What our customers say',
    rentalReviewsNoReviews: 'No reviews yet.',
    rentalReviewsFormTitle: 'Leave a Review',
    rentalReviewsFormName: 'Your name',
    rentalReviewsFormEmail: 'Email (optional)',
    rentalReviewsFormStars: 'Rating',
    rentalReviewsFormComment: 'Your comment',
    rentalReviewsFormSubmit: 'Submit review',
    rentalReviewsFormSending: 'Sending...',
    rentalReviewsFormSuccess:
      'Thank you! Your review will be published after review.',
    rentalReviewsFormError: 'An error occurred. Please try again.',
    rentalReviewsFormValidation: 'Please fill in your name and comment.',

    // Memory Corner
    navMemories: 'Memories',
    memoriesTitle: 'Memory Corner',
    memoriesSubtitle: "Our customers' moments on two wheels",
    memoriesIntro: 'Share your favorite bike trip moments with us!',
    memoriesEmpty: 'No memories yet — be the first!',
    memoriesLoadMore: 'Load more',
    memoriesSeeAll: 'See all memories',
    memoryPhotoCountLabel: 'photos',
    memoryFormTitle: 'Share your memory',
    memoryFormName: 'Your name',
    memoryFormLocation: 'Trip location',
    memoryFormStory: 'Your story (2–3 sentences)',
    memoryFormPhotos: 'Photos',
    memoryFormPhotosHint: 'max. 5 photos, 8 MB each (JPG, PNG, WebP)',
    memoryFormConsent:
      'I agree to the publication of my name and photos.',
    memoryFormSubmit: 'Submit memory',
    memoryFormSending: 'Sending...',
    memoryFormSuccess: 'Thank you! Your memory will be published after review.',
    memoryFormError: 'Submission failed. Please try again.',
    memoryFormValidation: 'Please fill in name, location and story.',
    memoryFormPhotoTooLarge: 'Each photo may be at most 8 MB.',
    memoryFormTooManyPhotos: 'A maximum of 5 photos is allowed.',
    memoryFormConsentRequired: 'Please agree to publication to continue.',
    memoryFormAge: 'Age',
    memoryFormCountry: 'Country',
    memoryFormEmail: 'Email address',
    memoryStepEmailTitle: 'Confirm your email',
    memoryStepEmailHint:
      'We will send you a 4-digit code. This is how we make sure your memory is genuine.',
    memoryRequestCode: 'Request code',
    memoryCodeSent:
      'We have sent you a code. Please check your inbox (and spam folder).',
    memoryFormCode: '4-digit code',
    memoryVerifyContinue: 'Continue',
    memoryCodeInvalid: 'The code is invalid or has expired.',
    memoryEmailInvalid: 'Please enter a valid email address.',
    memoryResendCode: 'Resend code',
    memoryChangeEmail: 'Change email',
    memoryViewsLabel: 'views',
    memoryEmailVerified: 'Email confirmed',
    memoryFormPrivacyPre: 'I have read the ',
    memoryFormPrivacyLink: 'privacy policy',
    memoryFormPrivacyPost: ' and agree to the processing of my data.',
    memoryFormPrivacyRequired: 'Please accept the privacy policy to continue.',

    loading: 'Loading...',
    error: 'An error occurred.',
    homeServicesAria: 'Services',
    homeGalleryImageAltPrefix: 'Bike Haus Freiburg - Photo',
    homeLightboxCloseAria: 'Close',
    homeLightboxPrevAria: 'Previous',
    homeLightboxNextAria: 'Next',
    navbarMainNavAria: 'Main navigation',
    navbarHomeAria: 'Bike Haus Freiburg home',
    navbarLogoAlt: 'Bike Haus Freiburg',
    navbarMenuAria: 'Menu',
    noResults: 'No results.',
    categories: 'Categories',
    ourShowroom: 'Showroom',
    conditionNew: 'New',
    conditionUsed: 'Used',
    contactEmailHint: 'We respond within 24 hours',
    contactKaHint: 'View all our listings on Kleinanzeigen',

    testimonialsLabel: 'TESTIMONIALS',
    testimonialsTitle: 'What our customers say',
    testimonialsSub: 'Over 500 satisfied customers in Freiburg trust us',

    repairLabel: 'SERVICE',
    repairTitle: 'Our Service',
    repairSub: 'Insights into our bike service',

    faqLabel: 'FAQ',
    faqTitle: 'Questions & Answers',
    faqSub: 'Everything you need to know about our service.',
    faq1Q: 'Can I test a bike before buying?',
    faq1A:
      'Yes! Just drop by during our opening hours — no appointment needed.',
    faq2Q: 'Do you offer a warranty on used bikes?',
    faq2A:
      'Every used bike is technically inspected. 3-day return policy, 3 months warranty on used bikes, 24 months on new bikes.',
    faq3Q: 'How can I pay?',
    faq3A: 'Cash, debit card, bank transfer, and PayPal.',
    faq4Q: 'Do you also repair bikes?',
    faq4A:
      'We specialize in sales. For repairs, please contact us in advance by phone or email.',
    faq5Q: 'Where can I find you?',
    faq5A:
      'Heckerstraße 27, 79114 Freiburg. Just drop by during opening hours — no appointment needed.',

    whatsappTitle: 'Contact Seller',
    whatsappPlaceholder: 'Your question or message...',
    whatsappSend: 'Send via WhatsApp',
    whatsappInterested: "I'm interested in this bike:",
    whatsappQuestion: 'My question:',

    ankaufTitle: 'Sell your bike?',
    ankaufDesc:
      'We buy your used bike! Just send us photos and your asking price via WhatsApp.',
    ankaufCta: 'Send Offer',
    ankaufHint: 'Photos + asking price via WhatsApp',
    reviewTitle: 'Happy with us? Leave a review!',
    reviewDesc: 'Your Google review helps us and other customers. Thank you!',
    reviewCta: 'Write a Google Review',
    reviewCountLabel: 'Reviews',
    ankaufMessage:
      'Hello, I would like to sell my bike.\n\nBrand/Model:\nCondition:\nAsking price:\n\n(Please attach photos)',

    aboutBadge: 'Family business since 2021',
    aboutHeadline: 'More than just bikes.',
    aboutHeadlineAccent: 'A passion.',
    aboutIntroText:
      'What started as a humble idea has become a place where people of all ages find their perfect bike. As a small family business in Freiburg, we believe that every bike tells a story — and everyone deserves the freedom to write their own story on two wheels.',
    aboutFeatureInvoice: 'Invoice & Purchase Contract',
    aboutFeatureTrust: 'Trust & Quality',
    aboutQuote:
      "Every bike we sell brings joy — and that's the greatest reward.",
    aboutQuoteAuthor: '— The Family Behind Bike Haus',
    aboutMetaTitle: 'About Us — Bike Haus Freiburg | Your Bicycle Dealer',
    aboutMetaDescription:
      'Get to know Bike Haus Freiburg. Fair, sustainable, personal — your local bicycle dealer in Freiburg im Breisgau for new and used bikes.',

    brandsLabel: 'BRANDS',
    brandsTitle: 'Our Brands — New & Used',
    brandsIntro:
      'We offer a carefully selected range of bicycles in our shop. Please note: We are not an official dealer for all brands, but we sell bikes sourced through legal channels.',
    brandsNewTitle: 'New Bikes',
    brandVictoriaDesc: 'Robust and elegant city bikes',
    brandConwayDesc: 'Reliable performance in mountain and city bikes',
    brandBikestarDesc: 'Children and youth bikes',
    brandPyroDesc: 'Light and fast sports bikes',
    brandXtractDesc: 'Functional and affordable models',
    brandsUsedTitle: 'Used Bikes',
    brandsUsedDesc:
      'We carry used bikes from well-known brands. These bikes come directly from private individuals or other legal sources.',
    brandsAndMore: 'and many more',
    brandsDisclaimerLabel: 'Note:',
    brandsDisclaimer:
      'We use brand names to describe products. Without authorized partnership, we cannot offer official warranty or service from brand manufacturers.',

    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    closed: 'Closed',
    restDay: 'Rest Day',
    rentalByAppointment: 'Bike rental 10:00–13:00 by appointment only',
    rentalReturnUntil: 'Bike returns until 18:00',
    openGoogleMaps: 'Open Google Maps',

    monShort: 'Mon',
    tueShort: 'Tue',
    wedShort: 'Wed',
    thuShort: 'Thu',
    friShort: 'Fri',
    satShort: 'Sat',
    sunShort: 'Sun',

    contactWhatsappHint: 'Write directly',
    contactMetaTitle: 'Contact — Bike Haus Freiburg | Address & Hours',
    contactMetaDescription:
      'Bike Haus Freiburg ✓ Heckerstraße 27, 79114 Freiburg ✓ Mon–Sat 11am–5:30pm ✓ WhatsApp: +49 155 6630 0011 ✓ No appointment needed — just drop by!',

    trustBadgeSince: 'In Freiburg since 2020',
    trustBadgeCustomers: '500+ satisfied customers',
    ariaStarsRating: '5 out of 5 stars',

    filterCondition: 'Condition',
    filterCategory: 'Category',
    filterAll: 'All',
    filterTireSize: 'Tire Size (inches)',
    filterGears: 'Gears',
    gearsUnit: 'gears',
    filterFrameSize: 'Frame Size',
    showroomMetaTitle:
      'Buy Used Bikes Freiburg | Second-Hand & New | Bike Haus',
    showroomMetaDescription:
      'Buy used & new bikes in Freiburg — 100+ inspected second-hand bikes ✓ City, E-Bike, Trekking, Mountain ✓ 3-month warranty ✓ Ready to ride. Bike Haus Freiburg.',

    detailMetaDescSuffix:
      'View now at Bike Haus Freiburg in 79114 Freiburg im Breisgau.',
    bikeFallbackCategory: 'Bicycle',

    legalLabel: 'Legal',
    languageLabel: 'Language',

    bikeAltSuffix: ' — Bike at Bike Haus Freiburg',

    catDamen: "Women's Bikes",
    catHerren: "Men's Bikes",
    catKinder: "Kids' Bikes",
    catZubehoer: 'Accessories',
    catEBike: 'E-Bikes',
    catTrekking: 'Trekking Bikes',
    catMountain: 'Mountain Bikes',
    catCity: 'City Bikes',
    catRennrad: 'Road Bikes',
    catSonstige: 'Other Bikes',

    accessoriesMetaTitle: 'Bike Accessories Freiburg | Helmets, Bags & Locks',
    accessoriesMetaDescription:
      'Buy bike accessories in Freiburg ✓ Helmets, bags, locks, lights & more ✓ In-store at Bike Haus Freiburg — Heckerstraße 27, 79114 Freiburg.',
    accessoriesTitle: 'Accessories',
    accessoriesSub: 'Bags, helmets, locks, and more for your bike.',
    accessoriesNoItems: 'No accessories available at the moment.',
    accessoriesAllCategories: 'All Categories',
    accessoriesViewDetails: 'View Details',
    accessoriesBrand: 'Brand',
    accessoriesPriceOnRequest: 'Price on request',

    neueFahrraeder: 'New Bikes',
    neueFahrraederMetaTitle:
      'New Bikes Freiburg | City, Trekking & E-Bike | Bike Haus',
    neueFahrraederMetaDescription:
      'Buy new bikes in Freiburg ✓ City, Trekking, Mountain & E-Bikes ✓ 2-year warranty ✓ In stock & ready to ride ✓ Fair prices. Visit our showroom — Bike Haus Freiburg.',
    neueFahrraederTitle: 'New Bikes Freiburg',
    neueFahrraederSub: 'Brand new bikes with 2 years shop warranty.',
    neueFahrraederBrand: 'Brand',
    neueFahrraederModel: 'Model',
    neueFahrraederColor: 'Color',
    neueFahrraederFrameSize: 'Frame Size',
    neueFahrraederWheelSize: 'Wheel Size',
    neueFahrraederGears: 'Gears',
    neueFahrraederCondition: 'Condition',
    neueFahrraederWarranty: '2 Year Warranty',
    neueFahrraederBackToList: 'Back to List',
    neueFahrraederNoItems: 'No new bikes available at the moment.',
    neueFahrraederContactUs: 'Contact Us',
    neueFahrraederInterested: 'Interested in this bike?',

    eBikesNav: 'E-Bikes',
    eBikes: 'E-Bikes',
    eBikesMetaTitle: 'Buy E-Bikes Freiburg | City, Trekking & Mountain E-Bikes',
    eBikesMetaDescription:
      'Buy e-bikes in Freiburg ✓ City, Trekking & Mountain e-bikes ✓ Bosch, Shimano & more ✓ 2 year warranty ✓ Fair prices. Visit our showroom — Bike Haus Freiburg.',
    eBikesTitle: 'Buy E-Bikes in Freiburg',
    eBikesSub: 'New e-bikes with 2 years shop warranty.',
    eBikesNoItems: 'No e-bikes available at the moment.',
    eBikesBackToList: 'Back to List',
    eBikesInterested: 'Interested in this e-bike?',
    eBikeMotorBrand: 'Motor',
    eBikeMotorPosition: 'Motor Position',
    eBikeBatteryCapacity: 'Battery Capacity',
    eBikeRange: 'Range',
    eBikeTorque: 'Torque',
    filterMotorBrand: 'Motor',
    filterMotorPosition: 'Motor Position',
    filterBatteryRange: 'Battery (Wh)',
    filterRange: 'Range (km)',

    // Ratgeber / Blog
    bikeToursNav: 'Bike Tours',
    ausflugszieleNav: 'Excursions',
    ratgeberNav: 'Guide',
    ratgeberLabel: 'Knowledge & Tips',
    ratgeberTitle: 'Bike Guide',
    ratgeberSub:
      'Tips, checklists and everything you need to know about bikes — from your Freiburg bike dealer.',
    ratgeberMetaTitle:
      'Bike Guide Freiburg — Tips, Checklists & Advice | Bike Haus Freiburg',
    ratgeberMetaDescription:
      'Bike buying guides, rental tips, and cycling routes in Freiburg. Expert advice from your local bike shop — Bike Haus Freiburg.',
    ratgeberReadMore: 'Read more',
    ratgeberReadTime: 'read',
    ratgeberTip: 'Tip from Bike Haus',
    ratgeberTldr: 'Summary',
    ratgeberRelated: 'Related guides',
    ratgeberBackToList: 'Back to all guides',
    faqMetaTitle:
      'FAQ — Bike Shop Freiburg | Frequently Asked Questions | Bike Haus',
    faqMetaDescription:
      'Frequently asked questions about buying & renting bikes in Freiburg: warranty, e-bikes, test rides, opening hours, prices. Answered by Bike Haus Freiburg.',
    bikeRentalMetaTitle:
      'Rent a Bike Freiburg | Helmet & Lock Included | Bike Haus',
    bikeRentalMetaDescription:
      'Rent a bike in Freiburg — city bikes, e-bikes & trekking daily ✓ Helmet & lock included ✓ Pick up same day ✓ No hidden fees ✓ Heckerstraße 27, Freiburg.',
    garantieMetaTitle: 'Warranty Terms — Bike Haus Freiburg',
    garantieMetaDescription:
      'Warranty terms for new and used bicycles at Bike Haus Freiburg. 2 years for new bikes, 3 months for used bikes.',
    impressumMetaTitle: 'Legal Notice — Bike Haus Freiburg',
    impressumMetaDescription:
      'Legal notice and business information of Bike Haus Freiburg according to § 5 TMG.',
    datenschutzMetaTitle: 'Privacy Policy — Bike Haus Freiburg',
    datenschutzMetaDescription:
      'Privacy policy of Bike Haus Freiburg. Information about the processing of your personal data.',
    faqCtaText: 'Still have questions? Contact us!',
    faqCtaButton: 'Get in touch',
    faqQ1: 'Where can I buy a bike in Freiburg?',
    faqA1:
      'At Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. We have over 100 new and used bikes in stock — just stop by, no appointment needed.',
    faqQ2: 'Can I test ride a bike before buying?',
    faqA2:
      'Yes! All bikes can be test ridden during our opening hours — no appointment required.',
    faqQ3: 'Do you offer warranty on used bikes?',
    faqA3:
      'Every used bike is technically inspected. You get 3 days return policy and 3 months warranty on all used bikes. New bikes come with 24 months warranty.',
    faqQ4: 'How much does a used bike cost?',
    faqA4:
      'Used bikes start from approx. €180. Used e-bikes from approx. €800. All prices are fairly calculated.',
    faqQ5: 'Do you have used e-bikes?',
    faqA5:
      'Yes, we offer high-quality used e-bikes with documented battery condition and warranty.',
    faqQ6: 'What payment methods do you accept?',
    faqA6: 'We accept cash, debit card, credit card, PayPal and bank transfer.',
    faqQ7: 'Do you buy used bikes?',
    faqA7:
      'Yes, we buy used bikes in good condition at fair prices. Just bring your bike by.',
    faqQ8: 'What bike types do you carry?',
    faqA8:
      "City bikes, trekking bikes, mountain bikes, e-bikes, children's bikes, Dutch bikes and road bikes — both new and used.",
    faqQ9: 'What are your opening hours?',
    faqA9:
      'Monday, Tuesday, Wednesday, Thursday: 13:00–17:00. Friday: 11:00–13:00 & 15:00–18:00. Saturday: 11:30–17:00. Sunday and holidays: closed.',
    faqQ10: 'Can I rent a bike in Freiburg?',
    faqA10:
      'Yes. Bike Haus Freiburg rents city bikes, trekking bikes and e-bikes with prices configured per bike for days 1 to 7. From day 8 onward, a fixed extra-day surcharge is added to the 7-day price. No reservation needed — just come by Heckerstraße 27.',

    svcRepairBadge: 'Service',
    svcRepairTitle: 'Bike Service',
    svcRepairSub: 'Professional maintenance & service – fast, reliable, fair.',
    svcRepairItem1: 'Brakes, Gears, Tyres',
    svcRepairItem2: 'Full Inspection',
    svcRepairItem3: 'Bike Diagnostics & Maintenance',
    svcRepairItem4: 'Spare Parts in Stock',
    svcRepairCta: 'View Service',
    svcRepairWaCta: 'Book via WhatsApp',
    svcRentalBadge: 'Rental',
    svcRentalTitle: 'Bike Rental',
    svcRentalSub:
      'City bike, trekking or mountain bike – rent flexibly from one day.',
    svcRentalItem1: 'City & Trekking Bikes',
    svcRentalItem2: 'Mountain Bikes available',
    svcRentalItem3: 'Daily & Weekly Rental',
    svcRentalItem4: 'Lock & Helmet included',
    svcRentalCta: 'Rent a Bike',
    homeRentalCardTitle: 'Rent a Bike',
    homeRentalInlinePrice: '1-7 days, custom pricing',
    homeRentalBestBadge: 'Best Deal · Save 30%',
    homeRentalPopularBadge: 'Popular',
    homeRentalPkgDays: 'Days 1-7',
    homeRentalPkgPrice: 'per bike',
    homeRentalPkgSub: 'configured by exact day',
    homeRentalPkgFromDay8: 'From day 8',
    homeRentalPkgPlusPrice: '7-day price + surcharge',
    homeRentalPkgPlusSub: 'fixed for each extra day',
    homeRentalLock: 'Lock included',
    homeRentalHelmet: 'Helmet free',
    homeRentalAvail: 'Available immediately',
    homeRentalBookCta: 'Choose a bike & reserve now',
    svcAngeboteBadge: 'New Bikes',
    svcAngeboteTitle: 'New Bikes',
    svcAngeboteSub:
      'Brand-new bikes with 2-year dealer warranty – direct from Freiburg.',
    svcAngeboteCta: 'All New Bikes',

    cityWarrantyIncl: 'Warranty incl.',
    cityMin: 'min.',
    cityDirectionsFrom: 'Directions from',
    cityOpenMap: 'Open route in Google Maps →',
    cityViewShowroom: 'View Showroom',
    footerLocations: 'Locations',

    relatedBikes: 'Similar Bikes',
    blogCta1: 'Buying a Used Bike — Tips & Checklist',
    blogCta2: 'Which Bike Fits Me?',
    blogCta3: 'Bike Inspection — What Does It Cost?',

    rentalCatalogMetaTitle:
      'Rental Bikes Freiburg | City, E-Bike & Trekking | Bike Haus',
    rentalCatalogMetaDescription:
      'Browse every rental bike in Freiburg ✓ City, trekking, e-bikes & kids bikes ✓ Per-day pricing ✓ Filter by brand, size & type ✓ Book online — Heckerstraße 27.',
    rentalCatalogLabel: 'Rental Fleet',
    rentalCatalogTitle: 'Bikes to rent in Freiburg.',
    rentalCatalogSub: 'rental bikes available',
    rentalCatalogIntro:
      'Browse our complete rental fleet in Freiburg-Haid: city bikes, trekking, e-bikes, kids bikes and more. Filter by brand, tyre size, frame size and type. Every bike has per-day pricing and can be reserved online instantly.',
    rentalCatalogPerDay: '/day',
    rentalCatalogFrom: 'from',
    rentalCatalogReserveCta: 'Reserve now',
    rentalCatalogViewDetail: 'View details',
    rentalCatalogFilterBrand: 'Brand',
    rentalCatalogFilterType: 'Bike type',
    rentalCatalogPriceMaxDaily: 'Max price/day (€)',
    rentalCatalogNoBikes: 'No rental bikes match your filters.',

    rentalDetailBackToCatalog: 'Back to rentals',
    rentalDetailReserveCta: 'Reserve this bike',
    rentalDetailPriceHeading: 'Rental prices',
    rentalDetailPriceNote:
      'Prices are per bike and scale with rental duration. From day 8 onwards the extra-day rate applies.',
    rentalDetailDay: 'day',
    rentalDetailDays: 'days',
    rentalDetailExtraDay: 'Each additional day (from day 8)',
    rentalDetailDeposit: 'Deposit',
    rentalDetailDepositInfo:
      'Deposit is collected on handover and refunded in full when the bike is returned undamaged.',
    rentalDetailSpecsHeading: 'Specifications',
    rentalDetailDescHeading: 'Description',
    rentalDetailMetaTitleSuffix: 'to rent in Freiburg | Bike Haus Freiburg',
    rentalDetailMetaDescPrefix: 'Rent this bike in Freiburg:',

    kiBeraterNav: 'AI Bike Adviser',
    kiBeraterMetaTitle: 'Free AI Bike Adviser Freiburg – Which Bike Fits You?',
    kiBeraterMetaDescription:
      'Not sure which bike to buy? Our free AI adviser finds the right bike from our Freiburg stock. Ask now – no sign-up needed, instant answer.',
    kiBeraterTitle: 'AI Bike Adviser Freiburg',
    kiBeraterSubtitle:
      'Tell us your budget, height or who the bike is for – our AI assistant finds the right bike from our Freiburg stock.',
    kiBeraterWelcome: "Hello! I'm your personal bike adviser.",
    kiBeraterWelcomeSub:
      "Tell me what you're looking for – budget, height or bike type – and I'll recommend bikes from our Freiburg stock.",
    kiBeraterQuick1: "Children's bike for an 8-year-old – which size?",
    kiBeraterQuick2: 'Used e-bike under €800',
    kiBeraterQuick3: 'City bike for everyday use under €300',
    kiBeraterQuick4: "Men's trekking bike, approx. 180 cm",
    kiBeraterInputPlaceholder: 'Ask me about the perfect bike…',
    kiBeraterSend: 'Send',
    kiBeraterTyping: 'Typing…',
    kiBeraterViewBike: 'View details',
    kiBeraterShopCtaTitle: 'Want personal advice?',
    kiBeraterShopCtaText:
      'Our team looks forward to welcoming you in the shop.',
    kiBeraterShopCtaBtn: 'Visit Showroom',
    kiBeraterContactCtaBtn: 'Get in touch',
    kiBeraterError: 'Connection error. Please try again.',
    kiBeraterClearChat: 'Clear chat',
    kiBeraterPriceOnRequest: 'Price on request',
  },

  fr: {
    metaTitle: 'Acheter & louer un vélo à Fribourg | Bike Haus Freiburg',
    metaDescription:
      'Votre magasin de vélos à Fribourg Haid ✓ Achat & location ✓ 100+ vélos contrôlés ✓ Ville, Trekking, VAE ✓ Location avec tarifs journaliers par vélo ✓ 3 mois de garantie. Sans rendez-vous — Heckerstraße 27!',

    home: 'Accueil',
    showroom: 'Showroom',
    accessories: 'Accessoires',
    about: 'À propos',
    contact: 'Contact',

    heroH1: 'Vélos à Fribourg — neufs & occasion.',
    heroSub:
      "Achetez ou louez votre vélo à Fribourg-en-Brisgau ✓ Vélos inspectés dès 180 € ✓ Location avec tarifs journaliers définis par vélo ✓ Retrait immédiat ✓ À 25 km de l'Alsace.",
    ctaPrimary: 'Découvrir les nouveaux vélos',
    ctaSecondary: 'Voir le showroom',
    ctaRental: 'Louer un vélo',
    heroBannerAria: 'Section hero',
    heroBadgeText: 'Bike Haus Freiburg',
    heroTitleLine1: 'La meilleure',
    heroTitleGradient: 'experience velo',
    heroTitleLine3: 'a Fribourg',
    heroStatBikes: 'Velos',
    heroStatYears: 'Annees',
    heroStatRating: 'Note',
    heroScrollLabel: 'Defiler',

    valueLabel: 'POURQUOI NOUS',
    valueTitle: "Plus qu'un simple magasin de vélos.",
    value1Title: 'Qualité certifiée',
    value1Desc:
      "Chaque vélo d'occasion passe par un processus d'inspection et de remise en état rigoureux.",
    value2Title: 'Prix honnêtes',
    value2Desc:
      'Calculés de manière transparente. Pas de négociation, pas de surprise.',
    value3Title: 'Conseil personnalisé',
    value3Desc: 'Nous trouvons ensemble le vélo qui vous correspond vraiment.',
    value4Title: 'Engagement durable',
    value4Desc:
      "Les vélos d'occasion prolongent les cycles de vie et préservent les ressources.",

    showroomLabel: 'SHOWROOM',
    showroomTitle: "Acheter des vélos d'occasion à Fribourg.",
    showroomSub: 'Découvrez notre sélection — mise à jour régulièrement.',
    viewAll: 'Tout voir',
    viewDetails: 'Détails',
    newBikes: 'Vélos neufs',
    usedBikes: 'Occasion',
    allBikes: 'Tous les vélos',

    newBikesLabel: 'NOUVEAUTÉS',
    newBikesTitle: 'Découvrez nos vélos neufs.',
    newBikesSub: 'Vélos neufs avec 2 ans de garantie magasin.',
    browseNewBikes: 'Voir les vélos neufs',
    ebikeAngeboteTitle: 'Offres E-Bike',
    ebikeAngeboteSub:
      'Offres spéciales sur une sélection de vélos électriques — jusqu’à épuisement des stocks.',
    usedBikesLabel: 'CONTRÔLÉS & PRÊTS',
    usedBikesTitle: "Découvrez nos vélos d'occasion.",
    usedBikesSub: 'Vérifiés avec soin, remis en état et prêts à rouler.',
    browseUsedBikes: "Voir les vélos d'occasion",

    allCategories: 'Tous',
    noBikesFound: 'Aucun vélo dans cette catégorie actuellement.',
    searchPlaceholder: 'Recherche par marque, type ou taille...',
    priceOnRequest: 'Prix sur demande',
    viewOnKleinanzeigen: 'Voir sur Kleinanzeigen',
    lastUpdated: 'Dernière mise à jour',
    bikesAvailable: 'vélos disponibles',
    filterByCategory: 'Catégorie',
    sortBy: 'Trier par',
    sortNewest: 'Plus récent',
    sortPriceLow: 'Prix croissant',
    sortPriceHigh: 'Prix décroissant',
    sortAZ: 'A — Z',
    priceRange: 'Gamme de prix',
    allPrices: 'Tous les prix',
    under500: 'Moins de 500 €',
    range500to1000: '500 € — 1 000 €',
    over1000: 'Plus de 1 000 €',
    filters: 'Filtres',
    clearFilters: 'Réinitialiser',
    showFilters: 'Afficher les filtres',
    hideFilters: 'Masquer les filtres',

    description: 'Description',
    price: 'Prix',
    category: 'Catégorie',
    location: 'Localisation',
    photos: 'Photos',
    backToShowroom: 'Retour au showroom',

    trustLabel: 'QUALITÉ',
    trustTitle: 'Une qualité en laquelle vous pouvez avoir confiance.',
    trustSub:
      "Chaque vélo chez Bike Haus Freiburg est soigneusement inspecté avant d'être proposé.",
    trust1: 'Inspection technique complète de tous les composants de sécurité',
    trust2: 'Remise en état professionnelle et nettoyage approfondi',
    trust3: 'Évaluation honnête et tarification transparente',
    trust4: 'Garantie : 24 mois (neuf) / 3 mois (occasion)',

    storyLabel: 'NOTRE HISTOIRE',
    storyTitle: 'Par passion pour le vélo.',
    storyText:
      'Bike Haus Freiburg est né de la conviction que les bons vélos ne doivent pas coûter cher — et que chaque vélo mérite une seconde chance.',
    storyValue1Title: 'Durabilité',
    storyValue1Desc:
      "Chaque vélo d'occasion que nous remettons en état signifie moins de déchets.",
    storyValue2Title: 'Communauté',
    storyValue2Desc:
      'Nous mettons les gens en selle — quel que soit leur budget.',
    storyValue3Title: 'Artisanat',
    storyValue3Desc:
      'La mécanique rencontre la passion. Chaque vélo est traité avec soin.',

    galleryLabel: 'NOTRE BOUTIQUE',
    galleryTitle: 'Aperçu de notre Bike Haus.',
    gallerySub:
      'Découvrez notre magasin à Fribourg — vos prochains vélos vous y attendent.',

    bikeCheckLabel: 'SERVICE',
    bikeCheckTitle: 'Contrôle vélo gratuit !',
    bikeCheckSub:
      'Réparation uniquement sur demande — prix justes, conseil transparent.',
    bikeCheckFreeTitle: 'Contrôle gratuit',
    bikeCheckBrakeCheck: 'Vérification des freins',
    bikeCheckGearTest: 'Test des vitesses',
    bikeCheckTireChain: 'Vérification pneus & chaîne',
    bikeCheckLightCheck: "Vérification de l'éclairage",
    bikeCheckReflectorCheck: 'Réflecteurs & visibilité',
    bikeCheckBellCheck: 'Vérification sonnette & klaxon',
    bikeCheckSafetyCheck: 'Contrôle de sécurité général',
    bikeCheckRepairTitle: 'Réparation sur demande',
    bikeCheckBrakeAdjust: 'Réglage des freins',
    bikeCheckChainCassette: 'Remplacement chaîne & cassette',
    bikeCheckGearAdjust: 'Ajustement des vitesses',
    bikeCheckTireService: 'Service pneus',
    bikeCheckCableReplace: 'Remplacement de câble',
    bikeCheckBottomBracket: 'Entretien du pédalier',
    bikeCheckSpokeRepair: 'Contrôle & centrage des rayons',
    bikeCheckLightInstall: "Installation d'éclairage",
    bikeCheckPedalReplace: 'Remplacement des pédales',
    bikeCheckNote: 'Uniquement pour les vélos classiques',
    bikeCheckExclusion: 'Pas de vélos électriques, pas de vélos de course',
    bikeCheckNoLiability: 'Pas de responsabilité pour les réparations',
    bikeCheckFairPrices: 'Prix justes — Conseil transparent.',

    ctaSectionTitle: 'Prêt pour votre prochaine aventure ?',
    ctaSectionSub:
      'Visitez notre showroom ou parcourez notre sélection en ligne.',
    ctaSectionButton: 'Trouver un vélo',

    aboutLabel: 'À PROPOS',
    aboutTitle: 'Qui nous sommes.',
    aboutText:
      "Nous sommes un marchand de vélos indépendant à Fribourg-en-Brisgau. Notre sélection comprend des vélos d'occasion certifiés et des vélos neufs — pour chaque usage et chaque budget.",
    aboutMission:
      'Notre mission : rendre la mobilité de qualité accessible — de manière durable, honnête et personnelle.',
    openingHours: "Heures d'ouverture",
    findUs: 'Comment nous trouver',

    contactLabel: 'CONTACT',
    contactTitle: 'Parlons ensemble.',
    contactSub:
      'Nous serons ravis de vous conseiller — en personne ou par téléphone.',
    phone: 'Téléphone',
    email: 'E-mail',
    address: 'Adresse',
    visitUs: 'Rendez-nous visite',

    footerTagline: "Vélos neufs & d'occasion à Fribourg.",
    quickLinks: 'Navigation',
    footerNavAria: 'Navigation pied de page',
    footerLogoAlt: 'Logo Bike Haus Freiburg',
    footerLogoText: 'Bike Haus Freiburg',
    footerLocationEmmendingen: 'Velo Emmendingen',
    footerLocationBadKrozingen: 'Velo Bad Krozingen',
    footerLocationBreisach: 'Velo Breisach',
    footerLocationGundelfingen: 'Velo Gundelfingen',
    footerLocationMarch: 'Velo March',
    legalNotice: 'Mentions légales',
    privacy: 'Confidentialité',
    warrantyTerms: 'Conditions de garantie',
    terms: 'CGV',
    allRights: 'Tous droits réservés.',

    // Warranty Page
    warrantyPageLabel: 'JURIDIQUE',
    warrantyPageTitle: 'Conditions de garantie',
    warrantyNewTitle: 'Vélos neufs',
    warrantyNewText:
      "Ce vélo est un produit neuf et est soumis à la garantie légale de 2 ans. La facture est fournie. Le vendeur garantit que le vélo est exempt de défauts lors de la remise. L'acheteur a le droit de retourner le vélo dans les 3 jours sans donner de raison, à condition que le vélo soit retourné complet et en bon état.",
    warrantyUsedTitle: "Vélos d'occasion",
    warrantyUsedText:
      '3 mois de garantie sur : chaîne, vitesses, dérailleur, dynamo, pédales et freins hydrauliques.',
    warrantyRepairNote:
      'Les réparations sous garantie doivent être effectuées exclusivement par Bike Haus Freiburg.',
    warrantyExcludedTitle: 'Exclus de la garantie',
    warrantyExcludedItems:
      'Pneus, chambres à air, plaquettes de frein, lampes. Également exclus : dommages causés par des accidents ou une utilisation inappropriée.',
    warrantyReturnTitle: 'Droit de retour',
    warrantyReturnText: 'Dans les 3 jours ouvrables.',

    // Bike Rental Page
    bikeService: 'Entretien',
    bikeRental: 'Location de vélos',
    bikeRentalPageLabel: 'SERVICE',
    bikeRentalPageTitle: 'Location de vélos – Simple et flexible',
    bikeRentalIntro:
      'Découvrez Fribourg confortablement à vélo. Louez des vélos chez nous à des prix abordables et sans complications.',
    bikeRentalPricesTitle: 'Tarifs location de vélos',
    bikeRentalHeroPrice: '1 jour -> 12 €',
    bikeRentalTierShort: 'Court terme',
    bikeRentalTierPopular: 'Populaire',
    bikeRentalTierTop: 'Le plus populaire',
    bikeRentalTierLong: 'Long terme',
    bikeRentalTierBest: 'Meilleure offre',
    bikeRentalTierAddon: 'Supplément',
    bikeRentalDurationDay1: '1 jour',
    bikeRentalDurationDay3: '3 jours',
    bikeRentalDurationDay7: '7 jours',
    bikeRentalDurationDay14: 'À partir du 8e jour',
    bikeRentalDurationDay30: 'Longue durée',
    bikeRentalDurationFromDay10: 'Jour supplémentaire',
    bikeRentalPriceDay1: 'manuel',
    bikeRentalPriceDay3: 'par vélo',
    bikeRentalPriceDay7: 'jours 1-7',
    bikeRentalPriceDay14: 'base 7 jours',
    bikeRentalPriceDay30: '+ supplément',
    bikeRentalPriceAddon: 'par jour ajouté',
    bikeRentalDay1: '1 à 7 jours : individuel',
    bikeRentalDay7: '7 jours : prix de base',
    bikeRentalDay8Plus: 'À partir du 8e jour : supplément fixe par jour',
    bikeRentalMonth: 'Longue durée : calcul automatique',
    bikeRentalDepositTitle: 'Caution',
    bikeRentalDepositText:
      "Le prix de location est payé à l'avance. En plus, une caution en espèces est exigée par vélo, selon le type de vélo — de 100 € à 200 € (par ex. vélo de ville 100 €, vélo de course/gravel 150 €, vélo électrique 200 €). Le montant exact s'affiche lors de la réservation. Si le vélo est retourné correctement, sans dommage ni perte, la caution est remboursée intégralement.",
    bikeRentalNoteTitle: 'Remarque',
    bikeRentalNoteText:
      'La remise du vélo est possible du lundi au vendredi à partir de 10:00 et le samedi à partir de 11:00 ; le retour doit être effectué au plus tard à 18:00. Si le vélo est disponible le lendemain, la location peut être prolongée en nous prévenant ; chaque jour supplémentaire est facturé au tarif journalier normal.',
    bikeRentalIncludedTitle: 'Inclus',
    bikeRentalIncluded1: 'Antivol pliable',
    bikeRentalIncluded2: 'Panier de vélo',
    bikeRentalIncludedNote:
      'Les accessoires perdus ou endommagés (antivol, casque ou panier) sont facturés 30 € chacun.',
    bikeRentalAvailableLabel: 'VÉLOS DISPONIBLES',
    bikeRentalAvailableTitle: 'Nos vélos de location',
    bikeRentalNoBikes:
      'Aucun vélo disponible pour le moment. Veuillez nous contacter.',
    bikeRentalBookBtn: 'Demander maintenant',
    bikeRentalDay: 'Jour',
    bikeRentalDays: 'Jours',
    rentalLinksTitle: 'En savoir plus',
    rentalLinkCatalog: 'Voir tous les vélos de location',
    rentalLinkGuide: 'Guide : location de vélo à Fribourg',
    rentalLinkFaq: 'Questions fréquentes',

    rentalHeroTitle: 'Louer un vélo à Fribourg',
    rentalHeroSub:
      'Louer un vélo à Fribourg le jour même — tarifs journaliers équitables, sans frais cachés. Vélos de ville, VAE & trekking. Récupérez directement à Heckerstraße 27.',
    rentalHeroWaCta: 'Questions ? WhatsApp',
    rentalHeroScrollCta: 'Choisir un vélo & réserver',
    rentalPricingTitle: 'Juste. Transparent. Sans suppléments.',
    rentalPricingSub:
      "Plus c'est long, moins c'est cher – antivol et casque toujours inclus.",
    rentalBikesSub:
      'Choisissez un vélo et réservez directement votre période souhaitée.',
    rentalFormPeriod: 'Choisir la période',
    rentalFormYourData: 'Vos coordonnées',
    rentalFormFirstName: 'Prénom',
    rentalFormLastName: 'Nom de famille',
    rentalFormPhone: 'Téléphone',
    rentalFormAddress: 'Adresse',
    rentalFormStrasse: 'Rue',
    rentalFormHausNr: 'N°',
    rentalFormPlz: 'Code postal',
    rentalFormOrt: 'Ville',
    rentalFormLang: 'Langue de communication',
    rentalFormNotes: 'Remarques (optionnel)',
    rentalFormSubmit: 'Envoyer la demande',
    rentalFormSending: 'Envoi en cours...',
    rentalFormConfirmNote:
      'Après réception de votre demande, vous recevrez un e-mail de confirmation. La réservation définitive est confirmée par notre équipe.',
    rentalSuccessTitle: 'Demande de réservation envoyée !',
    rentalSuccessText:
      'Nous avons bien reçu votre demande et vous recontacterons dès que possible.',
    rentalSuccessBookingNr: 'Numéro de réservation',
    rentalSuccessNewRequest: 'Nouvelle demande',
    rentalBikeDetails: 'Détails du vélo',
    rentalChangeBike: 'Modifier',
    rentalLoadingAvail: 'Chargement des disponibilités...',
    rentalSelectEndDate: 'Sélectionner la date de fin',
    rentalEstPrice: 'prix estimé',
    rentalStatusBooked: 'Réservé',
    rentalStatusPending: 'En attente',
    rentalStatusClosed: 'Fermé',
    rentalStatusSelected: 'Sélectionné',
    rentalSundayLabel: 'Dimanche',

    rentalReviewsTitle: 'Avis clients',
    rentalReviewsSubtitle: 'Ce que disent nos clients',
    rentalReviewsNoReviews: 'Aucun avis pour le moment.',
    rentalReviewsFormTitle: 'Laisser un avis',
    rentalReviewsFormName: 'Votre nom',
    rentalReviewsFormEmail: 'E-mail (optionnel)',
    rentalReviewsFormStars: 'Note',
    rentalReviewsFormComment: 'Votre commentaire',
    rentalReviewsFormSubmit: "Envoyer l'avis",
    rentalReviewsFormSending: 'Envoi en cours...',
    rentalReviewsFormSuccess:
      'Merci ! Votre avis sera publié après vérification.',
    rentalReviewsFormError: 'Une erreur est survenue. Veuillez réessayer.',
    rentalReviewsFormValidation:
      'Veuillez remplir votre nom et votre commentaire.',

    // Coin des souvenirs
    navMemories: 'Souvenirs',
    memoriesTitle: 'Coin des souvenirs',
    memoriesSubtitle: 'Les moments de nos clients à vélo',
    memoriesIntro: 'Partagez vos plus beaux moments à vélo !',
    memoriesEmpty: 'Pas encore de souvenirs — soyez le premier !',
    memoriesLoadMore: 'Voir plus',
    memoriesSeeAll: 'Voir tous les souvenirs',
    memoryPhotoCountLabel: 'photos',
    memoryFormTitle: 'Partager votre souvenir',
    memoryFormName: 'Votre nom',
    memoryFormLocation: "Lieu de l'excursion",
    memoryFormStory: 'Votre histoire (2–3 phrases)',
    memoryFormPhotos: 'Photos',
    memoryFormPhotosHint: 'max. 5 photos, 8 Mo chacune (JPG, PNG, WebP)',
    memoryFormConsent:
      'J’accepte la publication de mon nom et de mes photos.',
    memoryFormSubmit: 'Envoyer',
    memoryFormSending: 'Envoi...',
    memoryFormSuccess:
      'Merci ! Votre souvenir sera publié après vérification.',
    memoryFormError: "Échec de l'envoi. Veuillez réessayer.",
    memoryFormValidation: 'Veuillez remplir le nom, le lieu et l’histoire.',
    memoryFormPhotoTooLarge: 'Chaque photo ne doit pas dépasser 8 Mo.',
    memoryFormTooManyPhotos: '5 photos au maximum sont autorisées.',
    memoryFormConsentRequired:
      'Veuillez accepter la publication pour continuer.',
    memoryFormAge: 'Âge',
    memoryFormCountry: 'Pays',
    memoryFormEmail: 'Adresse e-mail',
    memoryStepEmailTitle: 'Confirmez votre e-mail',
    memoryStepEmailHint:
      'Nous vous enverrons un code à 4 chiffres. Cela nous permet de vérifier que votre souvenir est authentique.',
    memoryRequestCode: 'Demander le code',
    memoryCodeSent:
      'Nous vous avons envoyé un code. Veuillez vérifier votre boîte de réception (et les spams).',
    memoryFormCode: 'Code à 4 chiffres',
    memoryVerifyContinue: 'Continuer',
    memoryCodeInvalid: 'Le code est invalide ou a expiré.',
    memoryEmailInvalid: 'Veuillez saisir une adresse e-mail valide.',
    memoryResendCode: 'Renvoyer le code',
    memoryChangeEmail: "Changer d'e-mail",
    memoryViewsLabel: 'vues',
    memoryEmailVerified: 'E-mail confirmé',
    memoryFormPrivacyPre: 'J’ai lu la ',
    memoryFormPrivacyLink: 'politique de confidentialité',
    memoryFormPrivacyPost: ' et j’accepte le traitement de mes données.',
    memoryFormPrivacyRequired:
      'Veuillez accepter la politique de confidentialité pour continuer.',

    loading: 'Chargement...',
    error: 'Une erreur est survenue.',
    homeServicesAria: 'Services',
    homeGalleryImageAltPrefix: 'Bike Haus Freiburg - Photo',
    homeLightboxCloseAria: 'Fermer',
    homeLightboxPrevAria: 'Precedent',
    homeLightboxNextAria: 'Suivant',
    navbarMainNavAria: 'Navigation principale',
    navbarHomeAria: 'Accueil Bike Haus Freiburg',
    navbarLogoAlt: 'Bike Haus Freiburg',
    navbarMenuAria: 'Menu',
    noResults: 'Aucun résultat.',
    categories: 'Catégories',
    ourShowroom: 'Showroom',
    conditionNew: 'Neuf',
    conditionUsed: 'Occasion',
    contactEmailHint: 'Nous répondons sous 24 heures',
    contactKaHint: 'Voir toutes nos offres sur Kleinanzeigen',

    testimonialsLabel: 'TÉMOIGNAGES',
    testimonialsTitle: 'Ce que disent nos clients',
    testimonialsSub:
      'Plus de 500 clients satisfaits à Fribourg nous font confiance',

    repairLabel: 'SERVICE',
    repairTitle: 'Notre service',
    repairSub: 'Aperçu de notre service vélo',

    faqLabel: 'QUESTIONS FRÉQUENTES',
    faqTitle: 'Questions & Réponses',
    faqSub: 'Tout ce que vous devez savoir sur notre service.',
    faq1Q: "Puis-je essayer un vélo avant de l'acheter ?",
    faq1A:
      "Oui ! Passez simplement pendant nos heures d'ouverture — pas de rendez-vous nécessaire.",
    faq2Q: "Offrez-vous une garantie sur les vélos d'occasion ?",
    faq2A:
      "Chaque vélo d'occasion est vérifié techniquement. 3 jours pour retourner, 3 mois de garantie sur l'occasion, 24 mois sur le neuf.",
    faq3Q: 'Comment puis-je payer ?',
    faq3A: 'Espèces, carte bancaire, virement et PayPal.',
    faq4Q: 'Réparez-vous aussi les vélos ?',
    faq4A:
      "Nous nous spécialisons dans la vente. Pour les réparations, contactez-nous à l'avance par téléphone ou e-mail.",
    faq5Q: 'Où vous trouver ?',
    faq5A:
      "Heckerstraße 27, 79114 Fribourg. Passez simplement pendant les heures d'ouverture — pas de rendez-vous nécessaire.",

    // WhatsApp Contact
    whatsappTitle: 'Contacter le vendeur',
    whatsappPlaceholder: 'Votre question ou message...',
    whatsappSend: 'Envoyer via WhatsApp',
    whatsappInterested: 'Je suis intéressé(e) par ce vélo :',
    whatsappQuestion: 'Ma question :',

    // Ankauf
    ankaufTitle: 'Vendre votre vélo ?',
    ankaufDesc:
      "Nous achetons votre vélo d'occasion ! Envoyez-nous simplement des photos et votre prix souhaité via WhatsApp.",
    ankaufCta: 'Envoyer une offre',
    ankaufHint: 'Photos + prix souhaité via WhatsApp',
    reviewTitle: 'Satisfait de notre service? Laissez un avis!',
    reviewDesc:
      'Votre avis Google nous aide ainsi que les autres clients. Merci!',
    reviewCta: 'Écrire un avis Google',
    reviewCountLabel: 'Avis',
    ankaufMessage:
      'Bonjour, je souhaite vendre mon vélo.\n\nMarque/Modèle :\nÉtat :\nPrix souhaité :\n\n(Veuillez joindre des photos)',

    // About page extended
    aboutBadge: 'Entreprise familiale depuis 2021',
    aboutHeadline: 'Plus que de simples vélos.',
    aboutHeadlineAccent: 'Une passion.',
    aboutIntroText:
      "Ce qui a commencé comme une modeste idée est devenu un lieu où des personnes de tous âges trouvent leur vélo idéal. En tant que petite entreprise familiale à Fribourg, nous croyons que chaque vélo raconte une histoire — et que chacun mérite la liberté d'écrire la sienne sur deux roues.",
    aboutFeatureInvoice: 'Facture & contrat de vente',
    aboutFeatureTrust: 'Confiance & Qualité',
    aboutQuote:
      "Chaque vélo que nous vendons apporte de la joie — et c'est la plus belle récompense.",
    aboutQuoteAuthor: '— La famille derrière Bike Haus',
    aboutMetaTitle: 'À propos — Bike Haus Freiburg | Votre marchand de vélos',
    aboutMetaDescription:
      "Découvrez Bike Haus Freiburg. Honnête, durable, personnel — votre marchand de vélos local à Fribourg pour vélos neufs et d'occasion.",

    // Brands
    brandsLabel: 'MARQUES',
    brandsTitle: 'Nos marques — Neufs & Occasion',
    brandsIntro:
      'Dans notre magasin, nous proposons une sélection soigneusement choisie de vélos. Veuillez noter : nous ne sommes pas un revendeur officiel de toutes les marques, mais nous vendons des vélos provenant de sources légales.',
    brandsNewTitle: 'Vélos neufs',
    brandVictoriaDesc: 'Vélos de ville robustes et élégants',
    brandConwayDesc: 'Performance fiable pour VTT et vélos urbains',
    brandBikestarDesc: 'Vélos pour enfants et adolescents',
    brandPyroDesc: 'Vélos de sport légers et rapides',
    brandXtractDesc: 'Modèles fonctionnels et abordables',
    brandsUsedTitle: "Vélos d'occasion",
    brandsUsedDesc:
      "Nous proposons des vélos d'occasion de marques connues. Ces vélos proviennent directement de particuliers ou d'autres sources légales.",
    brandsAndMore: "et bien d'autres",
    brandsDisclaimerLabel: 'Remarque :',
    brandsDisclaimer:
      'Nous utilisons les noms de marques pour décrire les produits. Sans partenariat autorisé, nous ne pouvons pas offrir de garantie officielle ou de services des fabricants.',

    // Days (full)
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
    closed: 'Fermé',
    restDay: 'Jour de repos',
    rentalByAppointment: 'Location de vélos 10:00–13:00 uniquement sur rendez-vous',
    rentalReturnUntil: "Retour des vélos jusqu'à 18h00",
    openGoogleMaps: 'Ouvrir Google Maps',

    // Days (short)
    monShort: 'Lu',
    tueShort: 'Ma',
    wedShort: 'Me',
    thuShort: 'Je',
    friShort: 'Ve',
    satShort: 'Sa',
    sunShort: 'Di',

    // Contact extended
    contactWhatsappHint: 'Écrire directement',
    contactMetaTitle: 'Contact — Bike Haus Freiburg | Adresse & Horaires',
    contactMetaDescription:
      'Bike Haus Freiburg ✓ Heckerstraße 27, Fribourg ✓ Lun–Sam 11h–17h30 ✓ WhatsApp: +49 155 6630 0011 ✓ Sans rendez-vous — venez nous rendre visite !',

    // Home trust badges
    trustBadgeSince: 'Depuis 2020 à Fribourg',
    trustBadgeCustomers: '500+ clients satisfaits',
    ariaStarsRating: '5 étoiles sur 5',

    // Showroom filters
    filterCondition: 'État',
    filterCategory: 'Catégorie',
    filterAll: 'Tous',
    filterTireSize: 'Taille de pneu (pouces)',
    filterGears: 'Vitesses',
    gearsUnit: 'vitesses',
    filterFrameSize: 'Taille de cadre',
    showroomMetaTitle: 'Acheter vélo occasion Fribourg | Bike Haus',
    showroomMetaDescription:
      "Achetez des vélos neufs et d'occasion à Fribourg-en-Brisgau ✓ 100+ vélos certifiés ✓ Ville, Trekking, VTT, VAE ✓ 3 mois de garantie ✓ Disponibles immédiatement.",

    // Showroom detail
    detailMetaDescSuffix:
      'Voir maintenant chez Bike Haus Freiburg à 79114 Fribourg-en-Brisgau.',
    bikeFallbackCategory: 'Vélo',

    // Footer
    legalLabel: 'Mentions légales',
    languageLabel: 'Langue',

    // Bike card
    bikeAltSuffix: ' — Vélo chez Bike Haus Freiburg',

    // Category translations
    catDamen: 'Vélos femmes',
    catHerren: 'Vélos hommes',
    catKinder: 'Vélos enfants',
    catZubehoer: 'Accessoires',
    catEBike: 'Vélos électriques',
    catTrekking: 'Vélos trekking',
    catMountain: 'VTT',
    catCity: 'Vélos de ville',
    catRennrad: 'Vélos de course',
    catSonstige: 'Autres vélos',

    // Accessories page
    accessoriesMetaTitle:
      'Accessoires vélo Fribourg | Casques, Sacoches & Antivols',
    accessoriesMetaDescription:
      'Achetez des accessoires vélo à Fribourg-en-Brisgau ✓ Casques, sacoches, antivols, éclairage & plus ✓ En magasin — Heckerstraße 27, 79114 Freiburg.',
    accessoriesTitle: 'Accessoires',
    accessoriesSub: 'Sacoches, casques, antivols et plus pour votre vélo.',
    accessoriesNoItems: 'Aucun accessoire disponible pour le moment.',
    accessoriesAllCategories: 'Toutes les catégories',
    accessoriesViewDetails: 'Voir les détails',
    accessoriesBrand: 'Marque',
    accessoriesPriceOnRequest: 'Prix sur demande',

    // Neue Fahrräder
    neueFahrraeder: 'Vélos neufs',
    neueFahrraederMetaTitle:
      'Vélos neufs Fribourg | City, Trekking, VAE | Bike Haus',
    neueFahrraederMetaDescription:
      'Achetez des vélos neufs à Fribourg-en-Brisgau ✓ Vélos de ville, trekking, VTT & VAE ✓ 2 ans de garantie ✓ En stock immédiatement ✓ Prix honnêtes. Bike Haus Freiburg.',
    neueFahrraederTitle: 'Vélos neufs Fribourg',
    neueFahrraederSub: 'Vélos neufs avec 2 ans de garantie magasin.',
    neueFahrraederBrand: 'Marque',
    neueFahrraederModel: 'Modèle',
    neueFahrraederColor: 'Couleur',
    neueFahrraederFrameSize: 'Taille du cadre',
    neueFahrraederWheelSize: 'Taille des pneus',
    neueFahrraederGears: 'Vitesses',
    neueFahrraederCondition: 'État',
    neueFahrraederWarranty: '2 ans de garantie',
    neueFahrraederBackToList: 'Retour à la liste',
    neueFahrraederNoItems: 'Aucun vélo neuf disponible actuellement.',
    neueFahrraederContactUs: 'Contactez-nous',
    neueFahrraederInterested: 'Intéressé par ce vélo ?',

    eBikesNav: 'Vélos électriques',
    eBikes: 'Vélos électriques',
    eBikesMetaTitle:
      'Acheter des vélos électriques Fribourg | Ville, Trekking & VTT',
    eBikesMetaDescription:
      'Achetez des vélos électriques à Fribourg ✓ Ville, Trekking & VTT électriques ✓ Bosch, Shimano & plus ✓ 2 ans de garantie ✓ Prix justes. Découvrez notre showroom — Bike Haus Freiburg.',
    eBikesTitle: 'Acheter un vélo électrique à Fribourg',
    eBikesSub: 'Vélos électriques neufs avec 2 ans de garantie magasin.',
    eBikesNoItems: 'Aucun vélo électrique disponible actuellement.',
    eBikesBackToList: 'Retour à la liste',
    eBikesInterested: 'Intéressé par ce vélo électrique ?',
    eBikeMotorBrand: 'Moteur',
    eBikeMotorPosition: 'Position du moteur',
    eBikeBatteryCapacity: 'Capacité de la batterie',
    eBikeRange: 'Autonomie',
    eBikeTorque: 'Couple',
    filterMotorBrand: 'Moteur',
    filterMotorPosition: 'Position du moteur',
    filterBatteryRange: 'Batterie (Wh)',
    filterRange: 'Autonomie (km)',

    // Ratgeber / Blog
    bikeToursNav: 'Circuits vélo',
    ausflugszieleNav: 'Excursions',
    ratgeberNav: 'Guide',
    ratgeberLabel: 'Savoir & Conseils',
    ratgeberTitle: 'Guide Vélo',
    ratgeberSub:
      "Conseils, checklists et tout ce qu'il faut savoir sur les vélos — par votre vélociste à Freiburg.",
    ratgeberMetaTitle:
      'Guide Vélo Fribourg — Conseils & Astuces | Bike Haus Freiburg',
    ratgeberMetaDescription:
      "Guides d'achat vélo, conseils location et itinéraires cyclables à Fribourg. Expertise de votre vélociste local — Bike Haus Freiburg.",
    ratgeberReadMore: 'Lire la suite',
    ratgeberReadTime: 'de lecture',
    ratgeberTip: 'Conseil de Bike Haus',
    ratgeberTldr: 'Résumé',
    ratgeberRelated: 'Autres guides',
    ratgeberBackToList: 'Retour aux guides',
    faqMetaTitle:
      'FAQ — Magasin vélo Fribourg | Questions fréquentes | Bike Haus',
    faqMetaDescription:
      "Questions fréquentes sur l'achat et la location de vélos à Fribourg : garantie, VAE, essais, horaires, tarifs. Répondu par Bike Haus Freiburg.",
    bikeRentalMetaTitle: 'Louer un vélo à Fribourg | Casque inclus | Bike Haus',
    bikeRentalMetaDescription:
      'Location vélo à Fribourg avec tarifs journaliers définis vélo par vélo pour 1 à 7 jours, puis supplément fixe à partir du 8e jour. Casque & antivol inclus. ✓ Bike Haus Freiburg.',
    garantieMetaTitle: 'Conditions de garantie — Bike Haus Freiburg',
    garantieMetaDescription:
      "Conditions de garantie pour les vélos neufs et d'occasion chez Bike Haus Freiburg. 2 ans pour les neufs, 3 mois pour les occasions.",
    impressumMetaTitle: 'Mentions légales — Bike Haus Freiburg',
    impressumMetaDescription:
      'Mentions légales et informations juridiques de Bike Haus Freiburg conformément au § 5 TMG.',
    datenschutzMetaTitle: 'Politique de confidentialité — Bike Haus Freiburg',
    datenschutzMetaDescription:
      'Politique de confidentialité de Bike Haus Freiburg. Informations sur le traitement de vos données personnelles.',
    faqCtaText: 'Encore des questions ? Contactez-nous !',
    faqCtaButton: 'Nous contacter',
    faqQ1: 'Où acheter un vélo à Freiburg ?',
    faqA1:
      'Chez Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Plus de 100 vélos neufs et occasion en stock — venez sans rendez-vous.',
    faqQ2: "Puis-je essayer un vélo avant l'achat ?",
    faqA2:
      "Oui ! Tous les vélos peuvent être testés pendant nos heures d'ouverture — sans rendez-vous.",
    faqQ3: "Offrez-vous une garantie sur les vélos d'occasion ?",
    faqA3:
      "Chaque vélo d'occasion est contrôlé. Vous bénéficiez de 3 jours de droit de retour et 3 mois de garantie. Les vélos neufs ont 24 mois de garantie.",
    faqQ4: "Combien coûte un vélo d'occasion ?",
    faqA4:
      "Les vélos d'occasion commencent à env. 180 €. Les VAE d'occasion à env. 999 €.",
    faqQ5: "Avez-vous des VAE d'occasion ?",
    faqA5:
      "Oui, nous proposons des VAE d'occasion contrôlés avec état de batterie documenté et garantie.",
    faqQ6: 'Quels modes de paiement acceptez-vous ?',
    faqA6: 'Espèces, carte bancaire, carte de crédit, PayPal et virement.',
    faqQ7: 'Rachetez-vous des vélos ?',
    faqA7: 'Oui, nous rachetons les vélos en bon état à des prix justes.',
    faqQ8: 'Quels types de vélos proposez-vous ?',
    faqA8:
      'Vélos de ville, trekking, VTT, VAE, vélos enfants, hollandais et vélos de route — neufs et occasion.',
    faqQ9: 'Quels sont vos horaires ?',
    faqA9:
      'Lundi, mardi, mercredi, jeudi : 13:00–17:00. Vendredi : 11:00–13:00 & 15:00–18:00. Samedi : 11:30–17:00. Dimanche et jours fériés : fermé.',
    faqQ10: 'Louez-vous des vélos à Fribourg ?',
    faqA10:
      'Oui. Bike Haus Freiburg loue des vélos city, trekking et VAE avec des tarifs configurés par vélo pour 1 à 7 jours. À partir du 8e jour, un supplément fixe est ajouté au prix 7 jours. Sans réservation — venez directement Heckerstraße 27.',

    svcRepairBadge: 'Service',
    svcRepairTitle: 'Service vélo',
    svcRepairSub: 'Entretien & service professionnels – rapide, fiable, juste.',
    svcRepairItem1: 'Freins, Vitesses, Pneus',
    svcRepairItem2: 'Inspection complète',
    svcRepairItem3: 'Diagnostic & entretien E-Bike',
    svcRepairItem4: 'Pièces détachées en stock',
    svcRepairCta: 'Voir le service',
    svcRepairWaCta: 'Réserver via WhatsApp',
    svcRentalBadge: 'Location',
    svcRentalTitle: 'Location de vélos',
    svcRentalSub:
      'Vélo de ville, trekking ou VTT – location flexible dès un jour.',
    svcRentalItem1: 'Vélos ville & trekking',
    svcRentalItem2: 'VTT disponibles',
    svcRentalItem3: 'Location jour & semaine',
    svcRentalItem4: 'Antivol & casque inclus',
    svcRentalCta: 'Louer un vélo',
    homeRentalCardTitle: 'Louer un vélo',
    homeRentalInlinePrice: '1-7 jours, prix individuel',
    homeRentalBestBadge: 'Meilleure offre · Économisez 30%',
    homeRentalPopularBadge: 'Populaire',
    homeRentalPkgDays: 'Jours 1-7',
    homeRentalPkgPrice: 'par vélo',
    homeRentalPkgSub: 'configuré au jour près',
    homeRentalPkgFromDay8: 'À partir du 8e jour',
    homeRentalPkgPlusPrice: 'Prix 7 jours + supplément',
    homeRentalPkgPlusSub: 'fixe pour chaque jour supplémentaire',
    homeRentalLock: 'Antivol inclus',
    homeRentalHelmet: 'Casque gratuit',
    homeRentalAvail: 'Disponible immédiatement',
    homeRentalBookCta: 'Choisir un vélo & réserver',
    svcAngeboteBadge: 'Vélos neufs',
    svcAngeboteTitle: 'Vélos neufs',
    svcAngeboteSub:
      'Vélos neufs de marque avec 2 ans de garantie revendeur – depuis Freiburg.',
    svcAngeboteCta: 'Tous les vélos neufs',

    cityWarrantyIncl: 'Garantie incl.',
    cityMin: 'min.',
    cityDirectionsFrom: 'Itinéraire depuis',
    cityOpenMap: "Ouvrir l'itinéraire dans Google Maps →",
    cityViewShowroom: 'Voir le showroom',
    footerLocations: 'Emplacements',

    relatedBikes: 'Vélos similaires',
    blogCta1: "Acheter un vélo d'occasion — Conseils & Checklist",
    blogCta2: 'Quel vélo me convient?',
    blogCta3: 'Révision vélo — Combien ça coûte?',

    rentalCatalogMetaTitle:
      'Vélos de location Fribourg — Toute la flotte | Bike Haus',
    rentalCatalogMetaDescription:
      'Parcourez tous nos vélos de location à Fribourg ✓ Ville, trekking, VAE & vélos enfants ✓ Tarifs à la journée ✓ Filtrez par marque, taille & type ✓ Réservez en ligne — Heckerstraße 27.',
    rentalCatalogLabel: 'Flotte de location',
    rentalCatalogTitle: 'Vélos à louer à Fribourg.',
    rentalCatalogSub: 'vélos de location disponibles',
    rentalCatalogIntro:
      'Découvrez toute notre flotte de location à Fribourg-Haid : vélos de ville, trekking, vélos électriques, vélos enfants et plus. Filtrez par marque, taille de roue, taille de cadre et type. Chaque vélo a un tarif à la journée et se réserve en ligne.',
    rentalCatalogPerDay: '/jour',
    rentalCatalogFrom: 'dès',
    rentalCatalogReserveCta: 'Réserver',
    rentalCatalogViewDetail: 'Voir les détails',
    rentalCatalogFilterBrand: 'Marque',
    rentalCatalogFilterType: 'Type de vélo',
    rentalCatalogPriceMaxDaily: 'Prix max/jour (€)',
    rentalCatalogNoBikes: 'Aucun vélo ne correspond à vos filtres.',

    rentalDetailBackToCatalog: 'Retour à la flotte',
    rentalDetailReserveCta: 'Réserver ce vélo',
    rentalDetailPriceHeading: 'Tarifs de location',
    rentalDetailPriceNote:
      "Tarifs par vélo, dégressifs selon la durée. Au-delà du 7e jour, le tarif jour supplémentaire s'applique.",
    rentalDetailDay: 'jour',
    rentalDetailDays: 'jours',
    rentalDetailExtraDay: 'Chaque jour supplémentaire (à partir du 8e jour)',
    rentalDetailDeposit: 'Caution',
    rentalDetailDepositInfo:
      'La caution est versée à la remise du vélo et restituée intégralement au retour si le vélo est en bon état.',
    rentalDetailSpecsHeading: 'Caractéristiques',
    rentalDetailDescHeading: 'Description',
    rentalDetailMetaTitleSuffix: 'à louer à Fribourg | Bike Haus Freiburg',
    rentalDetailMetaDescPrefix: 'Louez ce vélo à Fribourg :',

    kiBeraterNav: 'Conseiller vélo IA',
    kiBeraterMetaTitle:
      'Conseiller vélo IA Fribourg – Quel vélo vous convient?',
    kiBeraterMetaDescription:
      'Quel vélo vous convient ? Notre conseiller IA gratuit recommande des vélos de notre stock à Fribourg. Posez votre question – réponse immédiate, sans inscription !',
    kiBeraterTitle: 'Conseiller vélo IA Fribourg',
    kiBeraterSubtitle:
      'Décrivez votre budget, votre taille ou pour qui est le vélo – notre IA trouve le vélo idéal depuis notre stock fribourgeois.',
    kiBeraterWelcome: 'Bonjour ! Je suis votre conseiller vélo personnel.',
    kiBeraterWelcomeSub:
      'Dites-moi ce que vous cherchez – budget, taille ou type de vélo – et je recommande des vélos de notre stock à Fribourg.',
    kiBeraterQuick1: 'Vélo enfant pour 8 ans – quelle taille ?',
    kiBeraterQuick2: "Vélo électrique d'occasion sous 800 €",
    kiBeraterQuick3: 'Vélo de ville pour le quotidien sous 300 €',
    kiBeraterQuick4: 'Vélo de trekking homme, environ 180 cm',
    kiBeraterInputPlaceholder: 'Posez-moi une question sur le vélo idéal…',
    kiBeraterSend: 'Envoyer',
    kiBeraterTyping: "En train d'écrire…",
    kiBeraterViewBike: 'Voir les détails',
    kiBeraterShopCtaTitle: 'Vous souhaitez un conseil personnalisé ?',
    kiBeraterShopCtaText:
      'Notre équipe vous accueille avec plaisir en magasin.',
    kiBeraterShopCtaBtn: 'Visiter le showroom',
    kiBeraterContactCtaBtn: 'Nous contacter',
    kiBeraterError: 'Erreur de connexion. Veuillez réessayer.',
    kiBeraterClearChat: 'Effacer le chat',
    kiBeraterPriceOnRequest: 'Prix sur demande',
  },

  tr: {
    metaTitle: "Freiburg'da Bisiklet Al & Kirala | Bike Haus Freiburg",
    metaDescription:
      "Freiburg Haid'de bisiklet mağazanız ✓ Yeni & ikinci el bisiklet ✓ Bisiklet bazlı günlük kiralama fiyatları ✓ 3 ay garanti ✓ Randevu gerekmez — Heckerstraße 27, Freiburg!",

    home: 'Ana Sayfa',
    showroom: 'Showroom',
    accessories: 'Aksesuar',
    about: 'Hakkımızda',
    contact: 'İletişim',

    heroH1: "Freiburg'da Bisikletler — yeni & ikinci el.",
    heroSub:
      "Freiburg'da yeni ve kontrol edilmiş ikinci el bisikletler — adil fiyat, sürdürülebilir bakım, kişisel danışmanlık.",
    ctaPrimary: 'Yeni Bisikletleri Keşfet',
    ctaSecondary: "Showroom'u Gör",
    ctaRental: 'Bisiklet Kirala',
    heroBannerAria: 'Hero bolumu',
    heroBadgeText: 'Bike Haus Freiburg',
    heroTitleLine1: 'En iyi',
    heroTitleGradient: 'bisiklet deneyimi',
    heroTitleLine3: "Freiburg'da",
    heroStatBikes: 'Bisiklet',
    heroStatYears: 'Yil',
    heroStatRating: 'Puan',
    heroScrollLabel: 'Kaydir',

    valueLabel: 'NEDEN BİZ',
    valueTitle: 'Sıradan bir bisiklet dükkanından fazlası.',
    value1Title: 'Kontrol Edilmiş Kalite',
    value1Desc:
      'Her ikinci el bisiklet, çok aşamalı bir kontrol ve yenileme sürecinden geçer.',
    value2Title: 'Adil Fiyatlar',
    value2Desc: 'Şeffaf hesaplanmış. Pazarlık yok, sürpriz yok.',
    value3Title: 'Kişisel Danışmanlık',
    value3Desc: 'Size gerçekten uyan bisikleti birlikte buluyoruz.',
    value4Title: 'Sürdürülebilir Hareket',
    value4Desc:
      'İkinci el bisikletler yaşam döngülerini uzatır ve kaynakları korur.',

    showroomLabel: 'SHOWROOM',
    showroomTitle: "Freiburg'da İkinci El Bisiklet Satın Al.",
    showroomSub: 'Seçkimizi keşfedin — düzenli olarak güncellenir.',
    viewAll: 'Tümünü Gör',
    viewDetails: 'Detaylar',
    newBikes: 'Yeni Bisikletler',
    usedBikes: 'İkinci El',
    allBikes: 'Tüm Bisikletler',

    newBikesLabel: 'YENİ ÜRÜNLER',
    newBikesTitle: 'Yeni bisikletleri keşfedin.',
    newBikesSub: '2 yıl mağaza garantili sıfır bisikletler.',
    browseNewBikes: 'Yeni bisikletleri gör',
    ebikeAngeboteTitle: 'E-Bike Fırsatları',
    ebikeAngeboteSub:
      'Seçili e-bike’larda güncel indirimler — stoklarla sınırlı.',
    usedBikesLabel: 'KONTROL EDİLMİŞ & HAZIR',
    usedBikesTitle: 'İkinci el bisikletleri keşfedin.',
    usedBikesSub: 'Titizlikle kontrol edilmiş, yenilenmiş ve sürüşe hazır.',
    browseUsedBikes: 'İkinci el bisikletleri gör',

    allCategories: 'Tümü',
    noBikesFound: 'Bu kategoride şu an bisiklet bulunmuyor.',
    searchPlaceholder: 'Marka, tür veya beden ara...',
    priceOnRequest: 'Fiyat sorulacak',
    viewOnKleinanzeigen: "Kleinanzeigen'de Gör",
    lastUpdated: 'Son güncelleme',
    bikesAvailable: 'bisiklet mevcut',
    filterByCategory: 'Kategori',
    sortBy: 'Sırala',
    sortNewest: 'En yeni',
    sortPriceLow: 'Fiyat artan',
    sortPriceHigh: 'Fiyat azalan',
    sortAZ: 'A — Z',
    priceRange: 'Fiyat aralığı',
    allPrices: 'Tüm fiyatlar',
    under500: '500 € altı',
    range500to1000: '500 € — 1.000 €',
    over1000: '1.000 € üzeri',
    filters: 'Filtreler',
    clearFilters: 'Filtreleri temizle',
    showFilters: 'Filtreleri göster',
    hideFilters: 'Filtreleri gizle',

    description: 'Açıklama',
    price: 'Fiyat',
    category: 'Kategori',
    location: 'Konum',
    photos: 'Fotoğraflar',
    backToShowroom: "Showroom'a Dön",

    trustLabel: 'KALİTE',
    trustTitle: 'Güvenebileceğiniz kalite.',
    trustSub:
      "Bike Haus Freiburg'daki her bisiklet, showroom'a çıkmadan önce titizlikle kontrol edilir.",
    trust1: 'Tüm güvenlik bileşenlerinin teknik kontrolü',
    trust2: 'Profesyonel yenileme ve kapsamlı temizlik',
    trust3: 'Adil değerleme ve şeffaf fiyatlandırma',
    trust4: 'Garanti: 24 ay (yeni) / 3 ay (ikinci el)',

    storyLabel: 'HİKAYEMİZ',
    storyTitle: 'Bisiklet tutkusuyla.',
    storyText:
      'Bike Haus Freiburg, iyi bisikletlerin pahalı olması gerekmediği ve her bisikletin ikinci bir şansı hak ettiği inancıyla kuruldu.',
    storyValue1Title: 'Sürdürülebilirlik',
    storyValue1Desc:
      'Yenilediğimiz her ikinci el bisiklet, daha az atık ve daha fazla mobilite demek.',
    storyValue2Title: 'Topluluk',
    storyValue2Desc: 'Bütçe ne olursa olsun insanları bisiklete bindiriyoruz.',
    storyValue3Title: 'Zanaatkarlık',
    storyValue3Desc:
      'Mekanik tutku ile buluşur. Her bisiklet özenle ele alınır.',

    galleryLabel: 'DÜKKAN',
    galleryTitle: "Bike Haus'tan kareler.",
    gallerySub:
      "Freiburg'daki dükkânımıza göz atın — bir sonraki bisikletiniz sizi burada bekliyor.",

    bikeCheckLabel: 'SERVİS',
    bikeCheckTitle: 'Ücretsiz Bisiklet Kontrolü!',
    bikeCheckSub:
      'Tamir sadece istek üzerine — adil fiyatlar, şeffaf danışmanlık.',
    bikeCheckFreeTitle: 'Ücretsiz Kontrol',
    bikeCheckBrakeCheck: 'Fren kontrolü',
    bikeCheckGearTest: 'Vites testi',
    bikeCheckTireChain: 'Lastik & zincir kontrolü',
    bikeCheckLightCheck: 'Aydınlatma kontrolü',
    bikeCheckReflectorCheck: 'Reflektör & görünürlük',
    bikeCheckBellCheck: 'Zil & korna kontrolü',
    bikeCheckSafetyCheck: 'Genel güvenlik kontrolü',
    bikeCheckRepairTitle: 'İsteğe Bağlı Tamir',
    bikeCheckBrakeAdjust: 'Fren ayarı',
    bikeCheckChainCassette: 'Zincir & kaset değişimi',
    bikeCheckGearAdjust: 'Vites ayarı',
    bikeCheckTireService: 'Lastik servisi',
    bikeCheckCableReplace: 'Bowden teli değişimi',
    bikeCheckBottomBracket: 'Orta göbek bakımı',
    bikeCheckSpokeRepair: 'Jant teli kontrolü & merkezleme',
    bikeCheckLightInstall: 'Aydınlatma montajı',
    bikeCheckPedalReplace: 'Pedal değişimi',
    bikeCheckNote: 'Sadece normal bisikletler için',
    bikeCheckExclusion: 'E-Bike ve yarış bisikleti hariç',
    bikeCheckNoLiability: 'Tamir için sorumluluk kabul edilmez',
    bikeCheckFairPrices: 'Adil fiyatlar — Şeffaf danışmanlık.',

    ctaSectionTitle: 'Bir sonraki maceranıza hazır mısınız?',
    ctaSectionSub:
      "Showroom'umuzu ziyaret edin veya güncel seçkimize online göz atın.",
    ctaSectionButton: 'Bisiklet Bul',

    aboutLabel: 'HAKKIMIZDA',
    aboutTitle: 'Biz kimiz.',
    aboutText:
      "Freiburg'da bağımsız bir bisiklet satıcısıyız. Seçkimiz kontrol edilmiş ikinci el bisikletler ve özenle seçilmiş yeni bisikletlerden oluşur — her kullanım amacı ve bütçe için.",
    aboutMission:
      'Misyonumuz: Kaliteli mobiliteyi erişilebilir kılmak — sürdürülebilir, adil ve kişisel.',
    openingHours: 'Çalışma Saatleri',
    findUs: 'Bizi Bulun',

    contactLabel: 'İLETİŞİM',
    contactTitle: 'Bizimle konuşun.',
    contactSub:
      'Size yardımcı olmaktan memnuniyet duyarız — mağazamızda veya telefonla.',
    phone: 'Telefon',
    email: 'E-posta',
    address: 'Adres',
    visitUs: 'Bizi Ziyaret Edin',

    footerTagline: "Freiburg'da yeni & ikinci el bisikletler.",
    quickLinks: 'Navigasyon',
    footerNavAria: 'Altbilgi navigasyonu',
    footerLogoAlt: 'Bike Haus Freiburg logosu',
    footerLogoText: 'Bike Haus Freiburg',
    footerLocationEmmendingen: 'Bisiklet Emmendingen',
    footerLocationBadKrozingen: 'Bisiklet Bad Krozingen',
    footerLocationBreisach: 'Bisiklet Breisach',
    footerLocationGundelfingen: 'Bisiklet Gundelfingen',
    footerLocationMarch: 'Bisiklet March',
    legalNotice: 'Yasal Bildirim',
    privacy: 'Gizlilik',
    warrantyTerms: 'Garanti Şartları',
    terms: 'Şartlar',
    allRights: 'Tüm hakları saklıdır.',

    // Warranty Page
    warrantyPageLabel: 'YASAL',
    warrantyPageTitle: 'Garanti Şartları',
    warrantyNewTitle: 'Yeni Bisikletler',
    warrantyNewText:
      'Bu bisiklet yeni üründür ve yasal 2 yıllık garanti kapsamındadır. Fatura dahildir. Satıcı, bisikletin teslim anında kusursuz olduğunu garanti eder. Alıcı, bisikletin eksiksiz ve hasarsız olarak iade edilmesi koşuluyla, 3 gün içinde sebep göstermeksizin bisikleti iade etme hakkına sahiptir.',
    warrantyUsedTitle: 'İkinci El Bisikletler',
    warrantyUsedText:
      '3 ay garanti: zincir, vites, aktarıcı, dinamo, pedallar ve hidrolik frenler.',
    warrantyRepairNote:
      'Garanti kapsamındaki onarımlar yalnızca Bike Haus Freiburg tarafından yapılmalıdır.',
    warrantyExcludedTitle: 'Garanti Dışı',
    warrantyExcludedItems:
      'Lastikler, iç lastikler, fren balataları, lambalar. Ayrıca kapsam dışı: kaza veya uygunsuz kullanımdan kaynaklanan hasarlar.',
    warrantyReturnTitle: 'İade Hakkı',
    warrantyReturnText: '3 iş günü içinde.',

    // Bike Rental Page
    bikeService: 'Servis',
    bikeRental: 'Bisiklet Kiralama',
    bikeRentalPageLabel: 'HİZMET',
    bikeRentalPageTitle: 'Bisiklet Kiralama – Kolay ve Esnek',
    bikeRentalIntro:
      "Freiburg'u bisikletle keşfedin. Bizden uygun fiyatlı ve kolay bir şekilde bisiklet kiralayabilirsiniz.",
    bikeRentalPricesTitle: 'Bisiklet Kiralama Fiyatları',
    bikeRentalHeroPrice: '1 Gün -> 12 €',
    bikeRentalTierShort: 'Kısa süre',
    bikeRentalTierPopular: 'Popüler',
    bikeRentalTierTop: 'En popüler',
    bikeRentalTierLong: 'Uzun süre',
    bikeRentalTierBest: 'En iyi teklif',
    bikeRentalTierAddon: 'Ek ücret',
    bikeRentalDurationDay1: '1 gün',
    bikeRentalDurationDay3: '3 gün',
    bikeRentalDurationDay7: '7 gün',
    bikeRentalDurationDay14: '8. günden itibaren',
    bikeRentalDurationDay30: 'Uzun kiralama',
    bikeRentalDurationFromDay10: 'Ek gün',
    bikeRentalPriceDay1: 'manuel',
    bikeRentalPriceDay3: 'bisiklet bazlı',
    bikeRentalPriceDay7: '1-7 gün',
    bikeRentalPriceDay14: '7 günlük baz',
    bikeRentalPriceDay30: '+ ek ücret',
    bikeRentalPriceAddon: 'her ek gün için',
    bikeRentalDay1: '1-7 gün: ayrı fiyat',
    bikeRentalDay7: '7 gün: baz fiyat',
    bikeRentalDay8Plus: '8. günden sonra: sabit ek gün fiyatı',
    bikeRentalMonth: 'Uzun kiralama: otomatik hesaplanır',
    bikeRentalDepositTitle: 'Depozito',
    bikeRentalDepositText:
      'Kiralama ücreti peşin ödenir. Buna ek olarak her bisiklet için bisiklet tipine göre nakit depozito alınır — 100 € ile 200 € arası (ör. şehir bisikleti 100 €, yarış/gravel 150 €, e-bisiklet 200 €). Kesin tutarı rezervasyonda görürsün. Bisiklet hasar veya kayıp olmadan düzgün şekilde iade edilirse depozito tamamen geri ödenir.',
    bikeRentalNoteTitle: 'Not',
    bikeRentalNoteText:
      "Teslimat hafta içi 10:00'dan, cumartesi 11:00'dan itibaren mümkündür, iade ise en geç 18:00'e kadar yapılmalıdır. Bisiklet ertesi gün müsaitse bize haber vererek kiralamayı uzatabilirsiniz; her ek gün için normal günlük ücret alınır.",
    bikeRentalIncludedTitle: 'Dahil',
    bikeRentalIncluded1: 'Katlanabilir kilit',
    bikeRentalIncluded2: 'Bisiklet sepeti',
    bikeRentalIncludedNote:
      'Kaybolan veya hasar gören aksesuarlar (kilit, kask veya sepet) için ayrı ayrı 30 € ücret alınır.',
    bikeRentalAvailableLabel: 'MEVCUT BİSİKLETLER',
    bikeRentalAvailableTitle: 'Kiralık Bisikletlerimiz',
    bikeRentalNoBikes:
      'Şu anda mevcut bisiklet yok. Lütfen bizimle iletişime geçin.',
    bikeRentalBookBtn: 'Bisikletini rezerve edin',
    bikeRentalDay: 'Gün',
    bikeRentalDays: 'Gün',
    rentalLinksTitle: 'Daha fazla keşfet',
    rentalLinkCatalog: 'Tüm kiralık bisikletleri gör',
    rentalLinkGuide: 'Rehber: Freiburg Bisiklet Kiralama',
    rentalLinkFaq: 'Sık sorulan sorular',

    rentalHeroTitle: "Freiburg'da Bisiklet Kirala",
    rentalHeroSub:
      "Hemen mevcut – adil, esnek, gizli maliyet yok. Doğrudan Freiburg'daki dükkânımızdan teslim alın.",
    rentalHeroWaCta: 'Sorularınız? WhatsApp',
    rentalHeroScrollCta: 'Bisiklet seç & hemen rezerve et',
    rentalPricingTitle: 'Adil. Şeffaf. Ekstra yok.',
    rentalPricingSub:
      'Ne kadar uzun, o kadar ucuz – kilit ve kask her zaman dahil.',
    rentalBikesSub:
      'Bir bisiklet seçin ve doğrudan istediğiniz dönemi rezerve edin.',
    rentalFormPeriod: 'Dönem seç',
    rentalFormYourData: 'Bilgileriniz',
    rentalFormFirstName: 'Ad',
    rentalFormLastName: 'Soyad',
    rentalFormPhone: 'Telefon',
    rentalFormLang: 'İletişim dili',
    rentalFormAddress: 'Adres',
    rentalFormStrasse: 'Sokak',
    rentalFormHausNr: 'Kapı No.',
    rentalFormPlz: 'Posta Kodu',
    rentalFormOrt: 'Şehir',
    rentalFormNotes: 'Notlar (isteğe bağlı)',
    rentalFormSubmit: 'Talep gönder',
    rentalFormSending: 'Gönderiliyor...',
    rentalFormConfirmNote:
      'Talebiniz alındıktan sonra bir onay e-postası alacaksınız. Kesin rezervasyon ekibimizin onayıyla gerçekleşir.',
    rentalSuccessTitle: 'Rezervasyon talebi gönderildi!',
    rentalSuccessText: 'Talebinizi aldık, en kısa sürede size geri döneceğiz.',
    rentalSuccessBookingNr: 'Rezervasyon numarası',
    rentalSuccessNewRequest: 'Yeni talep oluştur',
    rentalBikeDetails: 'Bisiklet Detayları',
    rentalChangeBike: 'Değiştir',
    rentalLoadingAvail: 'Müsaitlik yükleniyor...',
    rentalSelectEndDate: 'Bitiş tarihi seç',
    rentalEstPrice: 'tahmini fiyat',
    rentalStatusBooked: 'Dolu',
    rentalStatusPending: 'Beklemede',
    rentalStatusClosed: 'Kapalı',
    rentalStatusSelected: 'Seçildi',
    rentalSundayLabel: 'Pazar',

    rentalReviewsTitle: 'Müşteri Yorumları',
    rentalReviewsSubtitle: 'Müşterilerimiz ne diyor',
    rentalReviewsNoReviews: 'Henüz yorum yok.',
    rentalReviewsFormTitle: 'Yorum Yaz',
    rentalReviewsFormName: 'Adınız',
    rentalReviewsFormEmail: 'E-posta (isteğe bağlı)',
    rentalReviewsFormStars: 'Puan',
    rentalReviewsFormComment: 'Yorumunuz',
    rentalReviewsFormSubmit: 'Yorum gönder',
    rentalReviewsFormSending: 'Gönderiliyor...',
    rentalReviewsFormSuccess:
      'Teşekkürler! Yorumunuz incelendikten sonra yayınlanacak.',
    rentalReviewsFormError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    rentalReviewsFormValidation: 'Lütfen adınızı ve yorumunuzu doldurun.',

    // Anı Köşesi
    navMemories: 'Anılar',
    memoriesTitle: 'Anı Köşesi',
    memoriesSubtitle: 'Müşterilerimizin iki teker üzerindeki anları',
    memoriesIntro: 'En güzel bisiklet turu anılarını bizimle paylaş!',
    memoriesEmpty: 'Henüz anı yok — ilk sen ol!',
    memoriesLoadMore: 'Daha fazla',
    memoriesSeeAll: 'Tüm anıları gör',
    memoryPhotoCountLabel: 'fotoğraf',
    memoryFormTitle: 'Anını paylaş',
    memoryFormName: 'Adın',
    memoryFormLocation: 'Gezi yeri',
    memoryFormStory: 'Hikayen (2–3 cümle)',
    memoryFormPhotos: 'Fotoğraflar',
    memoryFormPhotosHint: 'en fazla 5 fotoğraf, her biri en fazla 8 MB (JPG, PNG, WebP)',
    memoryFormConsent:
      'Adımın ve fotoğraflarımın yayınlanmasını kabul ediyorum.',
    memoryFormSubmit: 'Anıyı gönder',
    memoryFormSending: 'Gönderiliyor...',
    memoryFormSuccess: 'Teşekkürler! Anın incelendikten sonra yayınlanacak.',
    memoryFormError: 'Gönderim başarısız. Lütfen tekrar dene.',
    memoryFormValidation: 'Lütfen ad, yer ve hikaye alanlarını doldur.',
    memoryFormPhotoTooLarge: 'Her fotoğraf en fazla 8 MB olabilir.',
    memoryFormTooManyPhotos: 'En fazla 5 fotoğraf yükleyebilirsin.',
    memoryFormConsentRequired: 'Devam etmek için lütfen yayın iznini onayla.',
    memoryFormAge: 'Yaş',
    memoryFormCountry: 'Ülke',
    memoryFormEmail: 'E-posta adresi',
    memoryStepEmailTitle: 'E-postanı doğrula',
    memoryStepEmailHint:
      'Sana 4 haneli bir kod göndereceğiz. Böylece anının gerçek olduğundan emin oluyoruz.',
    memoryRequestCode: 'Kod iste',
    memoryCodeSent:
      'Sana bir kod gönderdik. Lütfen gelen kutunu (ve spam klasörünü) kontrol et.',
    memoryFormCode: '4 haneli kod',
    memoryVerifyContinue: 'Devam et',
    memoryCodeInvalid: 'Kod geçersiz veya süresi dolmuş.',
    memoryEmailInvalid: 'Lütfen geçerli bir e-posta adresi gir.',
    memoryResendCode: 'Kodu tekrar gönder',
    memoryChangeEmail: 'E-postayı değiştir',
    memoryViewsLabel: 'görüntülenme',
    memoryEmailVerified: 'E-posta doğrulandı',
    memoryFormPrivacyPre: '',
    memoryFormPrivacyLink: 'Gizlilik politikasını',
    memoryFormPrivacyPost: ' okudum ve verilerimin işlenmesini kabul ediyorum.',
    memoryFormPrivacyRequired:
      'Devam etmek için lütfen gizlilik politikasını onayla.',

    loading: 'Yükleniyor...',
    error: 'Bir hata oluştu.',
    homeServicesAria: 'Hizmetler',
    homeGalleryImageAltPrefix: 'Bike Haus Freiburg - Fotograf',
    homeLightboxCloseAria: 'Kapat',
    homeLightboxPrevAria: 'Onceki',
    homeLightboxNextAria: 'Sonraki',
    navbarMainNavAria: 'Ana navigasyon',
    navbarHomeAria: 'Bike Haus Freiburg ana sayfa',
    navbarLogoAlt: 'Bike Haus Freiburg',
    navbarMenuAria: 'Menu',
    noResults: 'Sonuç bulunamadı.',
    categories: 'Kategoriler',
    ourShowroom: 'Showroom',
    conditionNew: 'Yeni',
    conditionUsed: 'İkinci El',
    contactEmailHint: '24 saat içinde yanıt veriyoruz',
    contactKaHint: "Tüm ilanlarımızı Kleinanzeigen'de görün",

    testimonialsLabel: 'MÜŞTERİ YORUMLARI',
    testimonialsTitle: 'Müşterilerimiz ne diyor',
    testimonialsSub: "Freiburg'da 500'den fazla memnun müşteri bize güveniyor",

    repairLabel: 'SERVİS',
    repairTitle: 'Servis Çalışmalarımız',
    repairSub: 'Bisiklet servisimizden görüntüler',

    faqLabel: 'SIK SORULAN SORULAR',
    faqTitle: 'Sorular & Cevaplar',
    faqSub: 'Hizmetimiz hakkında bilmeniz gereken her şey.',
    faq1Q: 'Satın almadan önce bisikleti test edebilir miyim?',
    faq1A: 'Evet! Açılış saatlerinde gelin — randevu gerekmiyor.',
    faq2Q: 'İkinci el bisikletlerde garanti var mı?',
    faq2A:
      'Her ikinci el bisiklet teknik olarak kontrol edilir. 3 gün iade hakkı, ikinci el için 3 ay garanti, yeni için 24 ay garanti.',
    faq3Q: 'Nasıl ödeme yapabilirim?',
    faq3A: 'Nakit, banka kartı, havale ve PayPal.',
    faq4Q: 'Bisiklet tamiri de yapıyor musunuz?',
    faq4A:
      'Satış konusunda uzmanız. Tamir için önceden telefon veya e-posta ile iletişime geçin.',
    faq5Q: 'Sizi nerede bulabilirim?',
    faq5A:
      'Heckerstraße 27, 79114 Freiburg. Açılış saatlerinde gelin — randevu gerekmiyor.',

    // WhatsApp Contact
    whatsappTitle: 'Satıcıyla İletişime Geç',
    whatsappPlaceholder: 'Sorunuzu veya mesajınızı yazın...',
    whatsappSend: 'WhatsApp ile Gönder',
    whatsappInterested: 'Bu bisikletle ilgileniyorum:',
    whatsappQuestion: 'Sorum:',

    // Ankauf
    ankaufTitle: 'Bisikletinizi satmak mı istiyorsunuz?',
    ankaufDesc:
      'İkinci el bisikletinizi satın alıyoruz! Bize WhatsApp üzerinden fotoğraf ve istediğiniz fiyatı gönderin.',
    ankaufCta: 'Teklif gönder',
    ankaufHint: 'Fotoğraf + istenen fiyat WhatsApp ile',
    reviewTitle: 'Bizi beğendiniz mi? Değerlendirin!',
    reviewDesc:
      'Google değerlendirmeniz bize ve diğer müşterilere yardımcı olur. Teşekkürler!',
    reviewCta: 'Google Değerlendirmesi Yaz',
    reviewCountLabel: 'Değerlendirme',
    ankaufMessage:
      'Merhaba, bisikletimi satmak istiyorum.\n\nMarka/Model:\nDurum:\nİstenen fiyat:\n\n(Lütfen fotoğraf ekleyin)',

    // About page extended
    aboutBadge: "2021'den beri aile işletmesi",
    aboutHeadline: 'Bisikletten fazlası.',
    aboutHeadlineAccent: 'Bir tutku.',
    aboutIntroText:
      "Mütevazı bir fikirle başlayan şey, bugün her yaştan insanın mükemmel bisikletini bulduğu bir yer haline geldi. Freiburg'daki küçük bir aile işletmesi olarak, her bisikletin bir hikaye anlattığına ve herkesin iki tekerlek üzerinde kendi hikayesini yazma özgürlüğünü hak ettiğine inanıyoruz.",
    aboutFeatureInvoice: 'Fatura & Satış Sözleşmesi',
    aboutFeatureTrust: 'Güven & Kalite',
    aboutQuote:
      'Sattığımız her bisiklet mutluluk getiriyor — ve bu en güzel ödül.',
    aboutQuoteAuthor: "— Bike Haus'un arkasındaki aile",
    aboutMetaTitle: 'Hakkımızda — Bike Haus Freiburg | Bisiklet Mağazanız',
    aboutMetaDescription:
      "Bike Haus Freiburg'u tanıyın. Adil, sürdürülebilir, kişisel — Freiburg'daki yerel bisiklet mağazanız.",

    // Brands
    brandsLabel: 'MARKALAR',
    brandsTitle: 'Markalarımız — Yeni & İkinci El',
    brandsIntro:
      'Mağazamızda özenle seçilmiş bir bisiklet yelpazesi sunuyoruz. Lütfen dikkat: tüm markaların resmi satıcısı değiliz, ancak yasal kaynaklardan temin ettiğimiz bisikletleri satıyoruz.',
    brandsNewTitle: 'Yeni Bisikletler',
    brandVictoriaDesc: 'Sağlam ve zarif şehir bisikletleri',
    brandConwayDesc: 'Dağ ve şehir bisikletlerinde güvenilir performans',
    brandBikestarDesc: 'Çocuk ve gençlik bisikletleri',
    brandPyroDesc: 'Hafif ve hızlı spor bisikletleri',
    brandXtractDesc: 'Fonksiyonel ve uygun fiyatlı modeller',
    brandsUsedTitle: 'İkinci El Bisikletler',
    brandsUsedDesc:
      'Tanınmış markaların ikinci el bisikletlerini sunuyoruz. Bu bisikletler doğrudan bireylerden veya diğer yasal kaynaklardan temin edilmektedir.',
    brandsAndMore: 've daha fazlası',
    brandsDisclaimerLabel: 'Not:',
    brandsDisclaimer:
      'Marka adlarını ürünleri tanımlamak için kullanıyoruz. Yetkili ortaklık olmadan üreticilerin resmi garanti veya servis hizmetlerini sunamayız.',

    // Days (full)
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar',
    closed: 'Kapalı',
    restDay: 'Tatil günü',
    rentalByAppointment: 'Bisiklet kiralama 10:00–13:00 sadece randevuyla',
    rentalReturnUntil: "Bisiklet iadesi en geç 18:00",
    openGoogleMaps: "Google Maps'i aç",

    // Days (short)
    monShort: 'Pzt',
    tueShort: 'Sal',
    wedShort: 'Çar',
    thuShort: 'Per',
    friShort: 'Cum',
    satShort: 'Cmt',
    sunShort: 'Paz',

    // Contact extended
    contactWhatsappHint: 'Doğrudan yaz',
    contactMetaTitle:
      'İletişim — Bike Haus Freiburg | Adres & Çalışma Saatleri',
    contactMetaDescription:
      'Bike Haus Freiburg ✓ Heckerstraße 27, 79114 Freiburg ✓ Pzt–Prş 13:00–17:00, Cum 11:00–13:00 & 15:00–18:00, Cmt 11:30–17:00, Paz kapalı ✓ WhatsApp: +49 155 6630 0011 ✓ Randevu gerekmez — bizi ziyaret edin!',

    // Home trust badges
    trustBadgeSince: "2020'den beri Freiburg'da",
    trustBadgeCustomers: '500+ memnun müşteri',
    ariaStarsRating: '5 üzerinden 5 yıldız',

    // Showroom filters
    filterCondition: 'Durum',
    filterCategory: 'Kategori',
    filterAll: 'Tümü',
    filterTireSize: 'Lastik Boyutu (inç)',
    filterGears: 'Vites',
    gearsUnit: 'Vites',
    filterFrameSize: 'Kadro Boyutu',
    showroomMetaTitle: "Freiburg'da İkinci El Bisiklet Al | Bike Haus",
    showroomMetaDescription:
      "Freiburg'da yeni ve ikinci el bisiklet satın alın ✓ 100+ kontrollü bisiklet ✓ Şehir, Trekking, Dağ, E-bisiklet ✓ 3 ay garanti ✓ Hemen teslim. Bike Haus Freiburg.",

    // Showroom detail
    detailMetaDescSuffix:
      "Şimdi 79114 Freiburg'daki Bike Haus Freiburg'da görün.",
    bikeFallbackCategory: 'Bisiklet',

    // Footer
    legalLabel: 'Yasal',
    languageLabel: 'Dil',

    // Bike card
    bikeAltSuffix: " — Bike Haus Freiburg'da Bisiklet",

    // Category translations
    catDamen: 'Kadın Bisikletleri',
    catHerren: 'Erkek Bisikletleri',
    catKinder: 'Çocuk Bisikletleri',
    catZubehoer: 'Aksesuar',
    catEBike: 'Elektrikli Bisikletler',
    catTrekking: 'Trekking Bisikletleri',
    catMountain: 'Dağ Bisikletleri',
    catCity: 'Şehir Bisikletleri',
    catRennrad: 'Yarış Bisikletleri',
    catSonstige: 'Diğer Bisikletler',

    // Accessories page
    accessoriesMetaTitle:
      'Bisiklet Aksesuarları Freiburg | Kask, Çanta & Kilit',
    accessoriesMetaDescription:
      "Freiburg'da bisiklet aksesuarı satın alın ✓ Kask, çanta, kilit, aydınlatma & daha fazlası ✓ Bike Haus Freiburg — Heckerstraße 27, 79114 Freiburg.",
    accessoriesTitle: 'Aksesuar',
    accessoriesSub: 'Bisikletiniz için çanta, kask, kilit ve daha fazlası.',
    accessoriesNoItems: 'Şu anda mevcut aksesuar bulunmamaktadır.',
    accessoriesAllCategories: 'Tüm Kategoriler',
    accessoriesViewDetails: 'Detayları Gör',
    accessoriesBrand: 'Marka',
    accessoriesPriceOnRequest: 'Fiyat talep üzerine',

    // Neue Fahrräder
    neueFahrraeder: 'Yeni Bisikletler',
    neueFahrraederMetaTitle:
      "Freiburg'da Yeni Bisiklet | City, Trekking, E-Bike",
    neueFahrraederMetaDescription:
      "Freiburg'da yeni bisiklet satın alın ✓ Şehir, Trekking, Dağ & E-bisiklet ✓ 2 yıl garanti ✓ Stokta & hemen teslim ✓ Uygun fiyat. Bike Haus Freiburg.",
    neueFahrraederTitle: "Freiburg'da Yeni Bisikletler",
    neueFahrraederSub: '2 yıl mağaza garantili sıfır bisikletler.',
    neueFahrraederBrand: 'Marka',
    neueFahrraederModel: 'Model',
    neueFahrraederColor: 'Renk',
    neueFahrraederFrameSize: 'Kadro Boyutu',
    neueFahrraederWheelSize: 'Tekerlek Boyutu',
    neueFahrraederGears: 'Vites',
    neueFahrraederCondition: 'Durum',
    neueFahrraederWarranty: '2 Yıl Garanti',
    neueFahrraederBackToList: 'Listeye Dön',
    neueFahrraederNoItems: 'Şu anda yeni bisiklet mevcut değil.',
    neueFahrraederContactUs: 'Bize Ulaşın',
    neueFahrraederInterested: 'Bu bisikletle ilgileniyor musunuz?',

    eBikesNav: 'E-Bisikletler',
    eBikes: 'E-Bisikletler',
    eBikesMetaTitle:
      "Freiburg'da E-Bisiklet | Şehir, Trekking & Dağ E-Bisikletleri",
    eBikesMetaDescription:
      "Freiburg'da e-bisiklet satın alın ✓ Şehir, Trekking & Dağ e-bisikletleri ✓ Bosch, Shimano & daha fazlası ✓ 2 yıl garanti ✓ Uygun fiyat. Bike Haus Freiburg.",
    eBikesTitle: "Freiburg'da E-Bisiklet Satın Al",
    eBikesSub: '2 yıl mağaza garantili yeni e-bisikletler.',
    eBikesNoItems: 'Şu anda e-bisiklet mevcut değil.',
    eBikesBackToList: 'Listeye Dön',
    eBikesInterested: 'Bu e-bisikletle ilgileniyor musunuz?',
    eBikeMotorBrand: 'Motor',
    eBikeMotorPosition: 'Motor Konumu',
    eBikeBatteryCapacity: 'Batarya Kapasitesi',
    eBikeRange: 'Menzil',
    eBikeTorque: 'Tork',
    filterMotorBrand: 'Motor',
    filterMotorPosition: 'Motor Konumu',
    filterBatteryRange: 'Batarya (Wh)',
    filterRange: 'Menzil (km)',

    // Ratgeber / Blog
    bikeToursNav: 'Bisiklet Turları',
    ausflugszieleNav: 'Geziler',
    ratgeberNav: 'Rehber',
    ratgeberLabel: 'Bilgi & İpuçları',
    ratgeberTitle: 'Bisiklet Rehberi',
    ratgeberSub:
      'İpuçları, kontrol listeleri ve bisiklet hakkında bilmeniz gereken her şey.',
    ratgeberMetaTitle:
      'Bisiklet Rehberi — İpuçları & Bilgi | Bike Haus Freiburg',
    ratgeberMetaDescription:
      'Bisiklet rehberi: ikinci el bisiklet alma, kadro boyu hesaplama, e-bisiklet ipuçları ve daha fazlası.',
    ratgeberReadMore: 'Devamını oku',
    ratgeberReadTime: 'okuma',
    ratgeberTip: 'Bike Haus İpucu',
    ratgeberTldr: 'Özet',
    ratgeberRelated: 'İlgili rehberler',
    ratgeberBackToList: 'Tüm rehberlere dön',
    faqMetaTitle:
      'SSS — Freiburg Bisiklet Mağazası | Sık Sorulan Sorular | Bike Haus',
    faqMetaDescription:
      "Freiburg'da bisiklet alma ve kiralama hakkında sık sorulan sorular: garanti, e-bisiklet, deneme sürüşü, çalışma saatleri, fiyatlar. Bike Haus Freiburg.",
    bikeRentalMetaTitle: 'Freiburg Bisiklet Kiralama | Kask Dahil | Bike Haus',
    bikeRentalMetaDescription:
      "Freiburg'da bisiklet kiralama: 1-7 gün için bisiklet bazlı günlük fiyatlar, 8. günden sonra sabit ek gün ücreti. Kask ve kilit dahil. ✓ Bike Haus Freiburg.",
    garantieMetaTitle: 'Garanti Koşulları — Bike Haus Freiburg',
    garantieMetaDescription:
      "Bike Haus Freiburg'da yeni ve ikinci el bisikletler için garanti koşulları. Yeni bisikletlerde 2 yıl, ikinci elde 3 ay garanti.",
    impressumMetaTitle: 'Yasal Bildirim — Bike Haus Freiburg',
    impressumMetaDescription:
      "Bike Haus Freiburg'un § 5 TMG uyarınca yasal bilgi ve künye bilgileri.",
    datenschutzMetaTitle: 'Gizlilik Politikası — Bike Haus Freiburg',
    datenschutzMetaDescription:
      'Bike Haus Freiburg gizlilik politikası. Kişisel verilerinizin işlenmesi hakkında bilgiler.',
    faqCtaText: 'Başka sorunuz mu var? Bize ulaşın!',
    faqCtaButton: 'İletişime geçin',
    faqQ1: "Freiburg'da bisiklet nereden alabilirim?",
    faqA1:
      'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. 100+ yeni ve ikinci el bisiklet stokta — randevusuz gelin.',
    faqQ2: 'Satın almadan önce bisikleti deneyebilir miyim?',
    faqA2:
      'Evet! Tüm bisikletler çalışma saatlerinde denenebilir — randevu gerekmez.',
    faqQ3: 'İkinci el bisikletlerde garanti var mı?',
    faqA3:
      'Her ikinci el bisiklet teknik kontrolden geçer. 3 gün iade hakkı ve 3 ay garanti. Yeni bisikletlerde 24 ay garanti.',
    faqQ4: 'İkinci el bisiklet ne kadar?',
    faqA4:
      "İkinci el bisikletler yaklaşık 180 €'dan başlar. İkinci el e-bisikletler yaklaşık 999 €'dan.",
    faqQ5: 'İkinci el e-bisikletiniz var mı?',
    faqA5:
      'Evet, belgelenmiş akü durumu ve garantili kontrollü ikinci el e-bisikletler sunuyoruz.',
    faqQ6: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    faqA6: 'Nakit, banka kartı, kredi kartı, PayPal ve havale kabul ediyoruz.',
    faqQ7: 'Bisiklet satın alıyor musunuz?',
    faqA7:
      'Evet, iyi durumda ikinci el bisikletleri adil fiyatla satın alıyoruz.',
    faqQ8: 'Hangi bisiklet tiplerini satıyorsunuz?',
    faqA8:
      'Şehir, trekking, dağ, e-bisiklet, çocuk, Hollanda ve yol bisikletleri — yeni ve ikinci el.',
    faqQ9: 'Çalışma saatleriniz nedir?',
    faqA9:
      'Pazartesi, Salı, Çarşamba, Perşembe: 13:00–17:00. Cuma: 11:00–13:00 & 15:00–18:00. Cumartesi: 11:30–17:00. Pazar ve tatil günleri: kapalı.',
    faqQ10: 'Eski bisikletimi takas edebilir miyim?',
    faqA10:
      'Evet, bireysel durumlarda takas mümkündür. Bize danışın — bir çözüm buluruz.',

    svcRepairBadge: 'Servis',
    svcRepairTitle: 'Bisiklet Servisi',
    svcRepairSub: 'Profesyonel bakım & servis – hızlı, güvenilir, adil.',
    svcRepairItem1: 'Frenler, Vites, Lastik',
    svcRepairItem2: 'Tam Kontrol',
    svcRepairItem3: 'Bisiklet Tanı & Bakım',
    svcRepairItem4: 'Yedek Parça Stokta',
    svcRepairCta: 'Servise Git',
    svcRepairWaCta: 'WhatsApp ile Randevu',
    svcRentalBadge: 'Kiralama',
    svcRentalTitle: 'Bisiklet Kiralama',
    svcRentalSub: 'Şehir, Trekking veya Dağ Bisikleti – günlük esnek kiralama.',
    svcRentalItem1: 'Şehir & Trekking Bisikletleri',
    svcRentalItem2: 'Dağ Bisikletleri mevcut',
    svcRentalItem3: 'Günlük & Haftalık Kiralama',
    svcRentalItem4: 'Kilit & Kask dahil',
    svcRentalCta: 'Bisikletini rezerve edin',
    homeRentalCardTitle: 'Bisiklet Kirala',
    homeRentalInlinePrice: '1-7 gün, esnek fiyat',
    homeRentalBestBadge: 'En İyi Teklif · %30 Tasarruf',
    homeRentalPopularBadge: 'Popüler',
    homeRentalPkgDays: '1-7 gün',
    homeRentalPkgPrice: 'bisiklet başına',
    homeRentalPkgSub: 'güne göre yapılandırılır',
    homeRentalPkgFromDay8: '8. günden itibaren',
    homeRentalPkgPlusPrice: '7 günlük fiyat + ek ücret',
    homeRentalPkgPlusSub: 'her ek gün için sabit',
    homeRentalLock: 'Kilit dahil',
    homeRentalHelmet: 'Kask ücretsiz',
    homeRentalAvail: 'Hemen müsait',
    homeRentalBookCta: 'Bisiklet seç & hemen rezerve et',
    svcAngeboteBadge: 'Yeni Bisikletler',
    svcAngeboteTitle: 'Yeni Bisikletler',
    svcAngeboteSub:
      "2 yıl bayi garantili sıfır bisikletler – Freiburg'dan direkt.",
    svcAngeboteCta: 'Tüm Yeni Bisikletler',

    cityWarrantyIncl: 'Garanti dahil',
    cityMin: 'dk.',
    cityDirectionsFrom: 'Yol tarifi:',
    cityOpenMap: "Google Maps'ta rotayı aç →",
    cityViewShowroom: "Showroom'u Gör",
    footerLocations: 'Konumlar',

    relatedBikes: 'Benzer Bisikletler',
    blogCta1: 'İkinci El Bisiklet Alma — İpuçları & Kontrol Listesi',
    blogCta2: 'Hangi Bisiklet Bana Uyar?',
    blogCta3: 'Bisiklet Bakımı — Ne Kadara Mal Olur?',

    rentalCatalogMetaTitle:
      'Kiralık Bisikletler Freiburg | Filo & Fiyatlar | Bike Haus',
    rentalCatalogMetaDescription:
      "Freiburg'daki tüm kiralık bisikletler ✓ Şehir, trekking, e-bike & çocuk bisikletleri ✓ Günlük fiyatlar ✓ Marka, beden ve tipe göre filtrele ✓ Online rezervasyon — Heckerstraße 27.",
    rentalCatalogLabel: 'Kiralık Filo',
    rentalCatalogTitle: "Freiburg'da kiralık bisikletler.",
    rentalCatalogSub: 'kiralık bisiklet mevcut',
    rentalCatalogIntro:
      "Freiburg-Haid'deki tüm kiralık filomuza göz atın: şehir bisikletleri, trekking, e-bike, çocuk bisikletleri ve daha fazlası. Marka, lastik boyutu, kadro boyu ve tipe göre filtreleyin. Her bisikletin günlük fiyatı vardır ve doğrudan online rezerve edilebilir.",
    rentalCatalogPerDay: '/gün',
    rentalCatalogFrom: 'şu fiyattan başlayarak',
    rentalCatalogReserveCta: 'Şimdi rezerve et',
    rentalCatalogViewDetail: 'Detayları gör',
    rentalCatalogFilterBrand: 'Marka',
    rentalCatalogFilterType: 'Bisiklet tipi',
    rentalCatalogPriceMaxDaily: 'Maks. fiyat/gün (€)',
    rentalCatalogNoBikes: 'Filtrelerinize uyan kiralık bisiklet bulunamadı.',

    rentalDetailBackToCatalog: 'Filoya geri dön',
    rentalDetailReserveCta: 'Bu bisikleti rezerve et',
    rentalDetailPriceHeading: 'Kiralama fiyatları',
    rentalDetailPriceNote:
      'Fiyatlar bisiklet başınadır ve süreye göre değişir. 8. günden itibaren ek gün fiyatı uygulanır.',
    rentalDetailDay: 'gün',
    rentalDetailDays: 'gün',
    rentalDetailExtraDay: 'Her ek gün (8. günden itibaren)',
    rentalDetailDeposit: 'Depozito',
    rentalDetailDepositInfo:
      'Depozito teslim sırasında alınır ve bisiklet hasarsız iade edildiğinde tam olarak iade edilir.',
    rentalDetailSpecsHeading: 'Özellikler',
    rentalDetailDescHeading: 'Açıklama',
    rentalDetailMetaTitleSuffix: "Freiburg'da kiralık | Bike Haus Freiburg",
    rentalDetailMetaDescPrefix: "Bu bisikleti Freiburg'da kiralayın:",

    kiBeraterNav: 'Yapay Zeka Bisiklet Danışmanı',
    kiBeraterMetaTitle:
      'YZ Bisiklet Danışmanı Freiburg – Hangi Bisiklet Sana Uyar?',
    kiBeraterMetaDescription:
      'Hangi bisiklet sana uyar? Ücretsiz YZ danışmanımız Freiburg stoğumuzdan en uygun bisikleti buluyor. Hemen sor – anında cevap, kayıt gerekmez!',
    kiBeraterTitle: 'YZ Bisiklet Danışmanı Freiburg',
    kiBeraterSubtitle:
      'Bütçeni, boyunu veya kimin için bisiklet aradığını söyle – YZ asistanımız Freiburg stoğumuzdan sana en uygun bisikleti buluyor.',
    kiBeraterWelcome: 'Merhaba! Ben senin kişisel bisiklet danışmanınım.',
    kiBeraterWelcomeSub:
      'Ne aradığını söyle – bütçe, boy veya bisiklet türü – ve Freiburg stoğumuzdan sana uygun bisikleti bulayım.',
    kiBeraterQuick1: '8 yaşındaki çocuk için bisiklet – hangi beden?',
    kiBeraterQuick2: '800 € altında ikinci el e-bisiklet',
    kiBeraterQuick3: '300 € altında günlük şehir bisikleti',
    kiBeraterQuick4: 'Erkek trekking bisikleti, yaklaşık 180 cm',
    kiBeraterInputPlaceholder: 'Mükemmel bisiklet hakkında soru sor…',
    kiBeraterSend: 'Gönder',
    kiBeraterTyping: 'Yazıyor…',
    kiBeraterViewBike: 'Detayları gör',
    kiBeraterShopCtaTitle: 'Kişisel danışma ister misiniz?',
    kiBeraterShopCtaText: 'Ekibimiz mağazamızda sizi bekliyor.',
    kiBeraterShopCtaBtn: "Showroom'a git",
    kiBeraterContactCtaBtn: 'İletişime geç',
    kiBeraterError: 'Bağlantı hatası. Lütfen tekrar deneyin.',
    kiBeraterClearChat: 'Sohbeti temizle',
    kiBeraterPriceOnRequest: 'Fiyat için sorunuz',
  },
};

const RENTAL_STEPS_TRANSLATIONS: Partial<
  Record<Language, RentalStepsTranslations>
> = {
  de: {
    dateSelection: 'Termin wählen',
    bikeSelection: 'Fahrrad wählen',
    accessoryStep: 'Zubehör',
    accessoryTitle: 'Zubehör hinzufügen',
    accessorySubtitle: 'Optionales Zubehör für Ihre Miete (Preis pro Tag).',
    accessoryNone: 'Kein Zubehör verfügbar.',
    accessoryTotal: 'Zubehör gesamt',
    customerInfo: 'Daten eintragen',
    review: 'Bestätigung',
    selectDates: 'Wählen Sie einen Zeitraum',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    continue: 'Weiter',
    selectBike: 'Wählen Sie ein Fahrrad',
    days: 'Tage',
    loading: 'Laden...',
    noBikesAvailable: 'Keine Fahrräder für diesen Zeitraum verfügbar',
    from: 'ab',
    day: 'Tag',
    accessoryOneTime: 'einmalig',
    accessoryOnlyIfUsed: 'nur bei Verbrauch',
    free: 'Kostenlos',
    pickupTime: 'Abholzeit',
    pickupTimeSelect: 'Uhrzeit wählen',
    pickupTimeHint: 'Zu welcher Uhrzeit möchten Sie das Fahrrad abholen?',
    pickupTimeClosed:
      'An diesem Tag ist der Laden geschlossen. Bitte ein anderes Startdatum wählen.',
    pickupTimeRequired: 'Bitte wählen Sie eine Abholzeit',
    oClock: 'Uhr',
    to: 'bis',
    calendarHint:
      'Wählen Sie zuerst den Starttermin und dann den Endtermin. Sonntage sind geschlossen; Feiertage bitte vorab per WhatsApp anfragen.',
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    back: 'Zurück',
    type: 'Typ',
    frameSize: 'Rahmengröße',
    tireSize: 'Reifengröße',
    color: 'Farbe',
    description: 'Beschreibung',
    pricing: 'Preisberechnung',
    rentalPrice: 'Mietpreis',
    deposit: 'Kaution',
    selectColor: 'Farbe wählen',
    frameNumber: 'Rahmennummer',
    optional: 'optional',
    addToCart: 'Zur Buchung hinzufügen',
    book: 'Buchen',
    selectDifferent: 'Anderes Fahrrad wählen',
    bikeAdded: 'Fahrrad zur Buchung hinzugefügt',
    bikeInCart: 'Fahrrad in der Buchung',
    bikesInCart: 'Fahrräder in der Buchung',
    continueToBooking: 'Mit Buchung fortfahren',
    yourInfo: 'Ihre Angaben',
    cartItems: 'Ausgewählte Fahrräder',
    addAnotherBike: '+ Weiteres Fahrrad hinzufügen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    phone: 'Telefon',
    street: 'Straße',
    houseNumber: 'Hausnummer',
    postalCode: 'Postleitzahl',
    city: 'Stadt',
    notes: 'Notizen',
    submitting: 'Wird gesendet...',
    confirmBooking: 'Buchung bestätigen',
    bikeDetails: 'Fahrraddetails',
    contactInfo: 'Kontaktinformationen',
    priceSummary: 'Preisübersicht',
    totalRental: 'Gesamtmiete',
    totalDeposit: 'Gesamtkaution',
    depositNote: 'Die Kaution wird bei Rückgabe des Fahrrads erstattet.',
    depositCashNote:
      'Wichtig: Die Kaution kann ausschließlich in bar bezahlt werden.',
    confirm: 'Buchung bestätigen',
    bookingSuccess: 'Buchung erfolgreich!',
    confirmationSent: 'Eine Bestätigungsmail wurde an',
    sent: 'gesendet',
    bookingNumber: 'Buchungsnummer',
    newBooking: 'Neue Buchung',
    colorLabel: 'Farbe',
    frameNumberLabel: 'Rahmennummer',
    priceLabel: 'Preis',
    selectBothDates: 'Bitte wählen Sie Start- und Enddatum',
    invalidDateRange: 'Enddatum muss nach Startdatum liegen',
    loadError: 'Fehler beim Laden der Fahrräder',
    bookingError: 'Fehler beim Erstellen der Buchung',
    firstNameRequired: 'Vorname erforderlich',
    lastNameRequired: 'Nachname erforderlich',
    emailRequired: 'Gültige E-Mail erforderlich',
    phoneRequired: 'Telefon erforderlich',
    streetRequired: 'Straße erforderlich',
    houseNumberRequired: 'Hausnummer erforderlich',
    postalCodeRequired: 'Postleitzahl erforderlich',
    cityRequired: 'Stadt erforderlich',
    termsPrefix: 'Ich akzeptiere die',
    termsLinkText: 'Fahrradverleih-Bedingungen',
    chooseStartDate: 'Bitte wählen Sie den Starttermin',
    chooseEndDate: 'Jetzt den Endtermin antippen',
    selectThisBike: 'Auswählen',
    riderHeight: 'Körpergröße',
    filterAll: 'Alle',
    filterType: 'Typ',
    forDays: 'für',
    bookingPageTitle: 'Fahrrad online buchen',
    backToInfo: 'Zurück zum Fahrradverleih',
    bookingCtaTitle: 'Jetzt Fahrrad reservieren',
    bookingCtaText:
      'In 4 einfachen Schritten: Termin wählen, Fahrrad aussuchen, Daten eintragen – fertig.',
    zoomImage: 'Bild vergrößern',
    closeLabel: 'Schließen',
    prevImage: 'Vorheriges Bild',
    nextImage: 'Nächstes Bild',
    closureNotice: '',
    closurePeriodError:
      'In diesem Zeitraum (15.–30. August 2026) machen wir Urlaub. Bitte wählen Sie andere Daten.',
  },
  en: {
    dateSelection: 'Choose date',
    bikeSelection: 'Choose bike',
    accessoryStep: 'Accessories',
    accessoryTitle: 'Add accessories',
    accessorySubtitle: 'Optional accessories for your rental (price per day).',
    accessoryNone: 'No accessories available.',
    accessoryTotal: 'Accessories total',
    customerInfo: 'Enter details',
    review: 'Confirmation',
    selectDates: 'Choose a rental period',
    startDate: 'Start date',
    endDate: 'End date',
    continue: 'Continue',
    selectBike: 'Choose a bike',
    days: 'days',
    loading: 'Loading...',
    noBikesAvailable: 'No bikes available for this period',
    from: 'from',
    day: 'day',
    accessoryOneTime: 'one-time',
    accessoryOnlyIfUsed: 'only if used',
    free: 'Free',
    pickupTime: 'Pickup time',
    pickupTimeSelect: 'Select a time',
    pickupTimeHint: 'What time would you like to pick up the bike?',
    pickupTimeClosed:
      'We are closed on this day. Please choose a different start date.',
    pickupTimeRequired: 'Please select a pickup time',
    oClock: '',
    to: 'to',
    calendarHint:
      'Select the start date first and then the end date. Sundays and public holidays are closed.',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    back: 'Back',
    type: 'Type',
    frameSize: 'Frame size',
    tireSize: 'Tire size',
    color: 'Color',
    description: 'Description',
    pricing: 'Price calculation',
    rentalPrice: 'Rental price',
    deposit: 'Deposit',
    selectColor: 'Choose color',
    frameNumber: 'Frame number',
    optional: 'optional',
    addToCart: 'Add to booking',
    book: 'Book',
    selectDifferent: 'Choose another bike',
    bikeAdded: 'Bike added to booking',
    bikeInCart: 'bike in booking',
    bikesInCart: 'bikes in booking',
    continueToBooking: 'Continue to booking',
    yourInfo: 'Your details',
    cartItems: 'Selected bikes',
    addAnotherBike: '+ Add another bike',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    street: 'Street',
    houseNumber: 'House number',
    postalCode: 'Postal code',
    city: 'City',
    notes: 'Notes',
    submitting: 'Submitting...',
    confirmBooking: 'Confirm booking',
    bikeDetails: 'Bike details',
    contactInfo: 'Contact information',
    priceSummary: 'Price summary',
    totalRental: 'Total rental',
    totalDeposit: 'Total deposit',
    depositNote: 'The deposit is refunded when the bike is returned.',
    depositCashNote: 'Important: The deposit can only be paid in cash.',
    confirm: 'Confirm booking',
    bookingSuccess: 'Booking successful!',
    confirmationSent: 'A confirmation email was sent to',
    sent: 'sent',
    bookingNumber: 'Booking number',
    newBooking: 'New booking',
    colorLabel: 'Color',
    frameNumberLabel: 'Frame number',
    priceLabel: 'Price',
    selectBothDates: 'Please select start and end dates',
    invalidDateRange: 'End date must be after start date',
    loadError: 'Error loading bikes',
    bookingError: 'Error creating booking',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    emailRequired: 'Valid email is required',
    phoneRequired: 'Phone number is required',
    streetRequired: 'Street is required',
    houseNumberRequired: 'House number is required',
    postalCodeRequired: 'Postal code is required',
    cityRequired: 'City is required',
    termsPrefix: 'I accept the',
    termsLinkText: 'Rental Terms',
    chooseStartDate: 'Please tap your start date',
    chooseEndDate: 'Now tap your end date',
    selectThisBike: 'Select',
    riderHeight: 'Rider height',
    filterAll: 'All',
    filterType: 'Type',
    forDays: 'for',
    bookingPageTitle: 'Book a bike online',
    backToInfo: 'Back to bike rental',
    bookingCtaTitle: 'Reserve your bike now',
    bookingCtaText:
      'In 4 simple steps: pick a date, choose a bike, enter your details – done.',
    zoomImage: 'Zoom image',
    closeLabel: 'Close',
    prevImage: 'Previous image',
    nextImage: 'Next image',
    closureNotice: '',
    closurePeriodError:
      'We are on holiday during this period (15–30 August 2026). Please choose different dates.',
  },
  fr: {
    dateSelection: 'Choisir la date',
    bikeSelection: 'Choisir un vélo',
    accessoryStep: 'Accessoires',
    accessoryTitle: 'Ajouter des accessoires',
    accessorySubtitle:
      'Accessoires en option pour votre location (prix par jour).',
    accessoryNone: 'Aucun accessoire disponible.',
    accessoryTotal: 'Total accessoires',
    customerInfo: 'Saisir les informations',
    review: 'Confirmation',
    selectDates: 'Choisissez une période',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    continue: 'Continuer',
    selectBike: 'Choisissez un vélo',
    days: 'jours',
    loading: 'Chargement...',
    noBikesAvailable: 'Aucun vélo disponible pour cette période',
    from: 'à partir de',
    day: 'jour',
    accessoryOneTime: 'unique',
    accessoryOnlyIfUsed: 'uniquement si utilisé',
    free: 'Gratuit',
    pickupTime: 'Heure de retrait',
    pickupTimeSelect: 'Choisir une heure',
    pickupTimeHint: 'À quelle heure souhaitez-vous récupérer le vélo ?',
    pickupTimeClosed:
      'Nous sommes fermés ce jour-là. Veuillez choisir une autre date de début.',
    pickupTimeRequired: 'Veuillez choisir une heure de retrait',
    oClock: '',
    to: 'au',
    calendarHint:
      'Sélectionnez d’abord la date de début puis la date de fin. Les dimanches et jours fériés sont fermés.',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    back: 'Retour',
    type: 'Type',
    frameSize: 'Taille du cadre',
    tireSize: 'Taille des pneus',
    color: 'Couleur',
    description: 'Description',
    pricing: 'Calcul du prix',
    rentalPrice: 'Prix de location',
    deposit: 'Caution',
    selectColor: 'Choisir la couleur',
    frameNumber: 'Numéro de cadre',
    optional: 'optionnel',
    addToCart: 'Ajouter à la réservation',
    book: 'Réserver',
    selectDifferent: 'Choisir un autre vélo',
    bikeAdded: 'Vélo ajouté à la réservation',
    bikeInCart: 'vélo dans la réservation',
    bikesInCart: 'vélos dans la réservation',
    continueToBooking: 'Continuer la réservation',
    yourInfo: 'Vos informations',
    cartItems: 'Vélos sélectionnés',
    addAnotherBike: '+ Ajouter un autre vélo',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'E-mail',
    phone: 'Téléphone',
    street: 'Rue',
    houseNumber: 'Numéro',
    postalCode: 'Code postal',
    city: 'Ville',
    notes: 'Remarques',
    submitting: 'Envoi en cours...',
    confirmBooking: 'Confirmer la réservation',
    bikeDetails: 'Détails du vélo',
    contactInfo: 'Coordonnées',
    priceSummary: 'Récapitulatif des prix',
    totalRental: 'Location totale',
    totalDeposit: 'Caution totale',
    depositNote: 'La caution est remboursée lors de la restitution du vélo.',
    depositCashNote:
      'Important : la caution est payable uniquement en espèces.',
    confirm: 'Confirmer la réservation',
    bookingSuccess: 'Réservation réussie !',
    confirmationSent: 'Un e-mail de confirmation a été envoyé à',
    sent: 'envoyé',
    bookingNumber: 'Numéro de réservation',
    newBooking: 'Nouvelle réservation',
    colorLabel: 'Couleur',
    frameNumberLabel: 'Numéro de cadre',
    priceLabel: 'Prix',
    selectBothDates: 'Veuillez sélectionner la date de début et de fin',
    invalidDateRange: 'La date de fin doit être postérieure à la date de début',
    loadError: 'Erreur lors du chargement des vélos',
    bookingError: 'Erreur lors de la création de la réservation',
    firstNameRequired: 'Prénom requis',
    lastNameRequired: 'Nom requis',
    emailRequired: 'E-mail valide requis',
    phoneRequired: 'Téléphone requis',
    streetRequired: 'Rue requise',
    houseNumberRequired: 'Numéro requis',
    postalCodeRequired: 'Code postal requis',
    cityRequired: 'Ville requise',
    termsPrefix: "J'accepte les",
    termsLinkText: 'Conditions de location',
    chooseStartDate: 'Veuillez sélectionner la date de début',
    chooseEndDate: 'Sélectionnez maintenant la date de fin',
    selectThisBike: 'Choisir',
    riderHeight: 'Taille',
    filterAll: 'Tous',
    filterType: 'Type',
    forDays: 'pour',
    bookingPageTitle: 'Réserver un vélo en ligne',
    backToInfo: 'Retour à la location de vélos',
    bookingCtaTitle: 'Réservez votre vélo maintenant',
    bookingCtaText:
      'En 4 étapes simples : choisissez une date, un vélo, saisissez vos coordonnées – c’est fait.',
    zoomImage: 'Agrandir l’image',
    closeLabel: 'Fermer',
    prevImage: 'Image précédente',
    nextImage: 'Image suivante',
    closureNotice: '',
    closurePeriodError:
      "Nous sommes en congés durant cette période (15–30 août 2026). Veuillez choisir d'autres dates.",
  },
  tr: {
    dateSelection: 'Tarih seç',
    bikeSelection: 'Bisiklet seç',
    accessoryStep: 'Aksesuar',
    accessoryTitle: 'Aksesuar ekle',
    accessorySubtitle: 'Kiralamanız için opsiyonel aksesuarlar (günlük fiyat).',
    accessoryNone: 'Uygun aksesuar yok.',
    accessoryTotal: 'Aksesuar toplamı',
    customerInfo: 'Bilgileri gir',
    review: 'Onay',
    selectDates: 'Tarih aralığı seçin',
    startDate: 'Başlangıç tarihi',
    endDate: 'Bitiş tarihi',
    continue: 'Devam',
    selectBike: 'Bir bisiklet seçin',
    days: 'gün',
    loading: 'Yükleniyor...',
    noBikesAvailable: 'Bu aralık için uygun bisiklet yok',
    from: 'itibaren',
    day: 'gün',
    accessoryOneTime: 'tek seferlik',
    accessoryOnlyIfUsed: 'yalnızca kullanılırsa',
    free: 'Ücretsiz',
    pickupTime: 'Alış saati',
    pickupTimeSelect: 'Saat seçin',
    pickupTimeHint: 'Bisikleti saat kaçta almak istiyorsunuz?',
    pickupTimeClosed:
      'Bu gün kapalıyız. Lütfen başka bir başlangıç tarihi seçin.',
    pickupTimeRequired: 'Lütfen bir alış saati seçin',
    oClock: '',
    to: 'ile',
    calendarHint:
      'Önce başlangıç tarihini, sonra bitiş tarihini seçin. Pazar ve resmi tatiller kapalıdır.',
    previousMonth: 'Önceki ay',
    nextMonth: 'Sonraki ay',
    back: 'Geri',
    type: 'Tip',
    frameSize: 'Kadro boyu',
    tireSize: 'Lastik boyu',
    color: 'Renk',
    description: 'Açıklama',
    pricing: 'Fiyat hesaplama',
    rentalPrice: 'Kiralama ücreti',
    deposit: 'Depozito',
    selectColor: 'Renk seç',
    frameNumber: 'Kadro numarası',
    optional: 'isteğe bağlı',
    addToCart: 'Rezervasyona ekle',
    book: 'Rezerve et',
    selectDifferent: 'Başka bisiklet seç',
    bikeAdded: 'Bisiklet rezervasyona eklendi',
    bikeInCart: 'rezervasyonda bisiklet',
    bikesInCart: 'rezervasyonda bisiklet',
    continueToBooking: 'Rezervasyona devam et',
    yourInfo: 'Bilgileriniz',
    cartItems: 'Seçilen bisikletler',
    addAnotherBike: '+ Bir bisiklet daha ekle',
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    street: 'Sokak',
    houseNumber: 'Kapı no',
    postalCode: 'Posta kodu',
    city: 'Şehir',
    notes: 'Notlar',
    submitting: 'Gönderiliyor...',
    confirmBooking: 'Rezervasyonu onayla',
    bikeDetails: 'Bisiklet detayları',
    contactInfo: 'İletişim bilgileri',
    priceSummary: 'Fiyat özeti',
    totalRental: 'Toplam kiralama',
    totalDeposit: 'Toplam depozito',
    depositNote: 'Bisiklet iade edildiğinde depozito geri ödenir.',
    depositCashNote: 'Önemli: Depozito yalnızca nakit olarak ödenebilir.',
    confirm: 'Rezervasyonu onayla',
    bookingSuccess: 'Rezervasyon başarılı!',
    confirmationSent: 'Onay e-postası şu adrese gönderildi',
    sent: 'gönderildi',
    bookingNumber: 'Rezervasyon numarası',
    newBooking: 'Yeni rezervasyon',
    colorLabel: 'Renk',
    frameNumberLabel: 'Kadro numarası',
    priceLabel: 'Fiyat',
    selectBothDates: 'Lütfen başlangıç ve bitiş tarihlerini seçin',
    invalidDateRange: 'Bitiş tarihi başlangıçtan sonra olmalıdır',
    loadError: 'Bisikletler yüklenirken hata oluştu',
    bookingError: 'Rezervasyon oluşturulurken hata oluştu',
    firstNameRequired: 'Ad zorunludur',
    lastNameRequired: 'Soyad zorunludur',
    emailRequired: 'Geçerli bir e-posta zorunludur',
    phoneRequired: 'Telefon zorunludur',
    streetRequired: 'Sokak zorunludur',
    houseNumberRequired: 'Kapı no zorunludur',
    postalCodeRequired: 'Posta kodu zorunludur',
    cityRequired: 'Şehir zorunludur',
    termsPrefix: 'Kabul ediyorum',
    termsLinkText: 'Kiralama Koşulları',
    chooseStartDate: 'Lütfen başlangıç tarihini seçin',
    chooseEndDate: 'Şimdi bitiş tarihini seçin',
    selectThisBike: 'Seç',
    riderHeight: 'Boy',
    filterAll: 'Tümü',
    filterType: 'Tip',
    forDays: 'için',
    bookingPageTitle: 'Online bisiklet kirala',
    backToInfo: 'Bisiklet kiralama sayfasına dön',
    bookingCtaTitle: 'Hemen bisiklet rezerve edin',
    bookingCtaText:
      '4 kolay adımda: tarih seçin, bisiklet seçin, bilgilerinizi girin – tamam.',
    zoomImage: 'Görseli büyüt',
    closeLabel: 'Kapat',
    prevImage: 'Önceki görsel',
    nextImage: 'Sonraki görsel',
    closureNotice: '',
    closurePeriodError:
      'Bu tarihlerde (15–30 Ağustos 2026) tatildeyiz. Lütfen farklı tarihler seçin.',
  },
  es: {
    dateSelection: 'Elegir fecha',
    bikeSelection: 'Elegir bicicleta',
    customerInfo: 'Ingresar datos',
    review: 'Confirmación',
    selectDates: 'Elige un período',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    continue: 'Continuar',
    selectBike: 'Elige una bicicleta',
    days: 'días',
    loading: 'Cargando...',
    noBikesAvailable: 'No hay bicicletas disponibles para este período',
    from: 'desde',
    day: 'día',
    accessoryOneTime: 'único',
    accessoryOnlyIfUsed: 'solo si se usa',
    free: 'Gratis',
    to: 'hasta',
    calendarHint:
      'Selecciona primero la fecha de inicio y luego la de fin. Los domingos y festivos están cerrados.',
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    back: 'Atrás',
    type: 'Tipo',
    frameSize: 'Tamaño del cuadro',
    tireSize: 'Tamaño de la rueda',
    color: 'Color',
    description: 'Descripción',
    pricing: 'Cálculo de precio',
    rentalPrice: 'Precio de alquiler',
    deposit: 'Depósito',
    selectColor: 'Elegir color',
    frameNumber: 'Número de cuadro',
    optional: 'opcional',
    addToCart: 'Añadir a la reserva',
    book: 'Reservar',
    selectDifferent: 'Elegir otra bicicleta',
    bikeAdded: 'Bicicleta añadida a la reserva',
    bikeInCart: 'bicicleta en la reserva',
    bikesInCart: 'bicicletas en la reserva',
    continueToBooking: 'Continuar con la reserva',
    yourInfo: 'Tus datos',
    cartItems: 'Bicicletas seleccionadas',
    addAnotherBike: '+ Añadir otra bicicleta',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    street: 'Calle',
    houseNumber: 'Número',
    postalCode: 'Código postal',
    city: 'Ciudad',
    notes: 'Notas',
    submitting: 'Enviando...',
    confirmBooking: 'Confirmar reserva',
    bikeDetails: 'Detalles de la bicicleta',
    contactInfo: 'Información de contacto',
    priceSummary: 'Resumen de precios',
    totalRental: 'Alquiler total',
    totalDeposit: 'Depósito total',
    depositNote: 'El depósito se devuelve al entregar la bicicleta.',
    depositCashNote: 'Importante: el depósito solo se puede pagar en efectivo.',
    confirm: 'Confirmar reserva',
    bookingSuccess: '¡Reserva exitosa!',
    confirmationSent: 'Se envió un correo de confirmación a',
    sent: 'enviado',
    bookingNumber: 'Número de reserva',
    newBooking: 'Nueva reserva',
    colorLabel: 'Color',
    frameNumberLabel: 'Número de cuadro',
    priceLabel: 'Precio',
    selectBothDates: 'Por favor selecciona fecha de inicio y fin',
    invalidDateRange: 'La fecha de fin debe ser posterior a la de inicio',
    loadError: 'Error al cargar las bicicletas',
    bookingError: 'Error al crear la reserva',
    firstNameRequired: 'El nombre es obligatorio',
    lastNameRequired: 'El apellido es obligatorio',
    emailRequired: 'Se requiere un correo electrónico válido',
    phoneRequired: 'El teléfono es obligatorio',
    streetRequired: 'La calle es obligatoria',
    houseNumberRequired: 'El número es obligatorio',
    postalCodeRequired: 'El código postal es obligatorio',
    cityRequired: 'La ciudad es obligatoria',
    termsPrefix: 'Acepto los',
    termsLinkText: 'Términos de alquiler',
    chooseStartDate: 'Seleccione la fecha de inicio',
    chooseEndDate: 'Ahora seleccione la fecha de fin',
    selectThisBike: 'Seleccionar',
    riderHeight: 'Estatura',
    filterAll: 'Todas',
    filterType: 'Tipo',
    forDays: 'por',
    bookingPageTitle: 'Reservar una bicicleta en línea',
    backToInfo: 'Volver al alquiler de bicicletas',
    bookingCtaTitle: 'Reserve su bicicleta ahora',
    bookingCtaText:
      'En 4 pasos sencillos: elija la fecha, la bicicleta, introduzca sus datos – listo.',
    zoomImage: 'Ampliar imagen',
    closeLabel: 'Cerrar',
    prevImage: 'Imagen anterior',
    nextImage: 'Imagen siguiente',
    closureNotice: '',
    closurePeriodError:
      'Estamos de vacaciones durante este periodo (15–30 de agosto de 2026). Elija otras fechas.',
  },
  it: {
    dateSelection: 'Scegli data',
    bikeSelection: 'Scegli bici',
    customerInfo: 'Inserisci dati',
    review: 'Conferma',
    selectDates: 'Scegli un periodo',
    startDate: 'Data inizio',
    endDate: 'Data fine',
    continue: 'Continua',
    selectBike: 'Scegli una bici',
    days: 'giorni',
    loading: 'Caricamento...',
    noBikesAvailable: 'Nessuna bici disponibile per questo periodo',
    from: 'da',
    day: 'giorno',
    accessoryOneTime: 'una volta',
    accessoryOnlyIfUsed: 'solo se usato',
    free: 'Gratis',
    to: 'a',
    calendarHint:
      'Seleziona prima la data di inizio e poi la data di fine. Le domeniche e i giorni festivi sono chiusi.',
    previousMonth: 'Mese precedente',
    nextMonth: 'Mese successivo',
    back: 'Indietro',
    type: 'Tipo',
    frameSize: 'Misura telaio',
    tireSize: 'Misura ruota',
    color: 'Colore',
    description: 'Descrizione',
    pricing: 'Calcolo prezzo',
    rentalPrice: 'Prezzo noleggio',
    deposit: 'Deposito',
    selectColor: 'Scegli colore',
    frameNumber: 'Numero telaio',
    optional: 'opzionale',
    addToCart: 'Aggiungi alla prenotazione',
    book: 'Prenota',
    selectDifferent: "Scegli un'altra bici",
    bikeAdded: 'Bici aggiunta alla prenotazione',
    bikeInCart: 'bici nella prenotazione',
    bikesInCart: 'bici nella prenotazione',
    continueToBooking: 'Continua con la prenotazione',
    yourInfo: 'I tuoi dati',
    cartItems: 'Bici selezionate',
    addAnotherBike: "+ Aggiungi un'altra bici",
    firstName: 'Nome',
    lastName: 'Cognome',
    email: 'Email',
    phone: 'Telefono',
    street: 'Via',
    houseNumber: 'Numero civico',
    postalCode: 'CAP',
    city: 'Città',
    notes: 'Note',
    submitting: 'Invio in corso...',
    confirmBooking: 'Conferma prenotazione',
    bikeDetails: 'Dettagli bici',
    contactInfo: 'Informazioni di contatto',
    priceSummary: 'Riepilogo prezzi',
    totalRental: 'Totale noleggio',
    totalDeposit: 'Totale deposito',
    depositNote: 'Il deposito viene restituito alla riconsegna della bici.',
    depositCashNote:
      'Importante: il deposito può essere pagato solo in contanti.',
    confirm: 'Conferma prenotazione',
    bookingSuccess: 'Prenotazione completata!',
    confirmationSent: 'Una email di conferma è stata inviata a',
    sent: 'inviata',
    bookingNumber: 'Numero prenotazione',
    newBooking: 'Nuova prenotazione',
    colorLabel: 'Colore',
    frameNumberLabel: 'Numero telaio',
    priceLabel: 'Prezzo',
    selectBothDates: 'Seleziona data di inizio e fine',
    invalidDateRange:
      'La data di fine deve essere successiva alla data di inizio',
    loadError: 'Errore durante il caricamento delle bici',
    bookingError: 'Errore durante la creazione della prenotazione',
    firstNameRequired: 'Il nome è obbligatorio',
    lastNameRequired: 'Il cognome è obbligatorio',
    emailRequired: "È richiesta un'email valida",
    phoneRequired: 'Il telefono è obbligatorio',
    streetRequired: 'La via è obbligatoria',
    houseNumberRequired: 'Il numero civico è obbligatorio',
    postalCodeRequired: 'Il CAP è obbligatorio',
    cityRequired: 'La città è obbligatoria',
    termsPrefix: 'Accetto i',
    termsLinkText: 'Termini di noleggio',
    chooseStartDate: 'Seleziona la data di inizio',
    chooseEndDate: 'Ora seleziona la data di fine',
    selectThisBike: 'Seleziona',
    riderHeight: 'Altezza',
    filterAll: 'Tutte',
    filterType: 'Tipo',
    forDays: 'per',
    bookingPageTitle: 'Prenota una bici online',
    backToInfo: 'Torna al noleggio bici',
    bookingCtaTitle: 'Prenota subito la tua bici',
    bookingCtaText:
      'In 4 semplici passaggi: scegli la data, la bici, inserisci i tuoi dati – fatto.',
    zoomImage: 'Ingrandisci immagine',
    closeLabel: 'Chiudi',
    prevImage: 'Immagine precedente',
    nextImage: 'Immagine successiva',
    closureNotice: '',
    closurePeriodError:
      'Siamo in ferie in questo periodo (15–30 agosto 2026). Scegli altre date.',
  },
  ar: {
    dateSelection: 'اختيار التاريخ',
    bikeSelection: 'اختيار الدراجة',
    customerInfo: 'إدخال البيانات',
    review: 'التأكيد',
    selectDates: 'اختر فترة',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    continue: 'متابعة',
    selectBike: 'اختر دراجة',
    days: 'أيام',
    loading: 'جار التحميل...',
    noBikesAvailable: 'لا توجد دراجات متاحة لهذه الفترة',
    from: 'من',
    day: 'يوم',
    accessoryOneTime: 'لمرة واحدة',
    accessoryOnlyIfUsed: 'فقط في حال الاستخدام',
    free: 'مجانًا',
    to: 'إلى',
    calendarHint:
      'اختر تاريخ البدء أولاً ثم تاريخ الانتهاء. أيام الأحد والعطل الرسمية مغلقة.',
    previousMonth: 'الشهر السابق',
    nextMonth: 'الشهر التالي',
    back: 'رجوع',
    type: 'النوع',
    frameSize: 'مقاس الهيكل',
    tireSize: 'مقاس الإطار',
    color: 'اللون',
    description: 'الوصف',
    pricing: 'حساب السعر',
    rentalPrice: 'سعر الإيجار',
    deposit: 'التأمين',
    selectColor: 'اختر اللون',
    frameNumber: 'رقم الهيكل',
    optional: 'اختياري',
    addToCart: 'إضافة إلى الحجز',
    book: 'احجز',
    selectDifferent: 'اختر دراجة أخرى',
    bikeAdded: 'تمت إضافة الدراجة إلى الحجز',
    bikeInCart: 'دراجة في الحجز',
    bikesInCart: 'دراجات في الحجز',
    continueToBooking: 'المتابعة إلى الحجز',
    yourInfo: 'بياناتك',
    cartItems: 'الدراجات المختارة',
    addAnotherBike: '+ إضافة دراجة أخرى',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    street: 'الشارع',
    houseNumber: 'رقم المنزل',
    postalCode: 'الرمز البريدي',
    city: 'المدينة',
    notes: 'ملاحظات',
    submitting: 'جار الإرسال...',
    confirmBooking: 'تأكيد الحجز',
    bikeDetails: 'تفاصيل الدراجة',
    contactInfo: 'معلومات الاتصال',
    priceSummary: 'ملخص الأسعار',
    totalRental: 'إجمالي الإيجار',
    totalDeposit: 'إجمالي التأمين',
    depositNote: 'يتم رد مبلغ التأمين عند إعادة الدراجة.',
    depositCashNote: 'مهم: لا يمكن دفع مبلغ التأمين إلا نقدًا.',
    confirm: 'تأكيد الحجز',
    bookingSuccess: 'تم الحجز بنجاح!',
    confirmationSent: 'تم إرسال رسالة تأكيد إلى',
    sent: 'تم الإرسال',
    bookingNumber: 'رقم الحجز',
    newBooking: 'حجز جديد',
    colorLabel: 'اللون',
    frameNumberLabel: 'رقم الهيكل',
    priceLabel: 'السعر',
    selectBothDates: 'يرجى اختيار تاريخ البدء والانتهاء',
    invalidDateRange: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء',
    loadError: 'حدث خطأ أثناء تحميل الدراجات',
    bookingError: 'حدث خطأ أثناء إنشاء الحجز',
    firstNameRequired: 'الاسم الأول مطلوب',
    lastNameRequired: 'اسم العائلة مطلوب',
    emailRequired: 'مطلوب بريد إلكتروني صحيح',
    phoneRequired: 'رقم الهاتف مطلوب',
    streetRequired: 'الشارع مطلوب',
    houseNumberRequired: 'رقم المنزل مطلوب',
    postalCodeRequired: 'الرمز البريدي مطلوب',
    cityRequired: 'المدينة مطلوبة',
    termsPrefix: 'أوافق على',
    termsLinkText: 'شروط الإيجار',
    chooseStartDate: 'يرجى اختيار تاريخ البدء',
    chooseEndDate: 'اختر الآن تاريخ الانتهاء',
    selectThisBike: 'اختيار',
    riderHeight: 'الطول',
    filterAll: 'الكل',
    filterType: 'النوع',
    forDays: 'لمدة',
    bookingPageTitle: 'احجز دراجة عبر الإنترنت',
    backToInfo: 'العودة إلى تأجير الدراجات',
    bookingCtaTitle: 'احجز دراجتك الآن',
    bookingCtaText:
      'في 4 خطوات بسيطة: اختر التاريخ والدراجة وأدخل بياناتك – وانتهيت.',
    zoomImage: 'تكبير الصورة',
    closeLabel: 'إغلاق',
    prevImage: 'الصورة السابقة',
    nextImage: 'الصورة التالية',
    closureNotice: '',
    closurePeriodError:
      'نحن في إجازة خلال هذه الفترة (15–30 أغسطس 2026). يرجى اختيار تواريخ أخرى.',
  },
  ru: {
    dateSelection: 'Выбор даты',
    bikeSelection: 'Выбор велосипеда',
    customerInfo: 'Ввод данных',
    review: 'Подтверждение',
    selectDates: 'Выберите период',
    startDate: 'Дата начала',
    endDate: 'Дата окончания',
    continue: 'Далее',
    selectBike: 'Выберите велосипед',
    days: 'дней',
    loading: 'Загрузка...',
    noBikesAvailable: 'Нет доступных велосипедов на этот период',
    from: 'от',
    day: 'день',
    accessoryOneTime: 'разово',
    accessoryOnlyIfUsed: 'только при использовании',
    free: 'Бесплатно',
    to: 'до',
    calendarHint:
      'Сначала выберите дату начала, затем дату окончания. Воскресенья и официальные праздники закрыты.',
    previousMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    back: 'Назад',
    type: 'Тип',
    frameSize: 'Размер рамы',
    tireSize: 'Размер шин',
    color: 'Цвет',
    description: 'Описание',
    pricing: 'Расчет цены',
    rentalPrice: 'Стоимость аренды',
    deposit: 'Залог',
    selectColor: 'Выберите цвет',
    frameNumber: 'Номер рамы',
    optional: 'необязательно',
    addToCart: 'Добавить в бронирование',
    book: 'Забронировать',
    selectDifferent: 'Выбрать другой велосипед',
    bikeAdded: 'Велосипед добавлен в бронирование',
    bikeInCart: 'велосипед в бронировании',
    bikesInCart: 'велосипедов в бронировании',
    continueToBooking: 'Продолжить бронирование',
    yourInfo: 'Ваши данные',
    cartItems: 'Выбранные велосипеды',
    addAnotherBike: '+ Добавить еще велосипед',
    firstName: 'Имя',
    lastName: 'Фамилия',
    email: 'Эл. почта',
    phone: 'Телефон',
    street: 'Улица',
    houseNumber: 'Номер дома',
    postalCode: 'Почтовый индекс',
    city: 'Город',
    notes: 'Примечания',
    submitting: 'Отправка...',
    confirmBooking: 'Подтвердить бронирование',
    bikeDetails: 'Детали велосипеда',
    contactInfo: 'Контактная информация',
    priceSummary: 'Сводка по цене',
    totalRental: 'Итого аренда',
    totalDeposit: 'Итого залог',
    depositNote: 'Залог возвращается при возврате велосипеда.',
    depositCashNote: 'Важно: залог можно оплатить только наличными.',
    confirm: 'Подтвердить бронирование',
    bookingSuccess: 'Бронирование успешно!',
    confirmationSent: 'Письмо с подтверждением отправлено на',
    sent: 'отправлено',
    bookingNumber: 'Номер бронирования',
    newBooking: 'Новое бронирование',
    colorLabel: 'Цвет',
    frameNumberLabel: 'Номер рамы',
    priceLabel: 'Цена',
    selectBothDates: 'Пожалуйста, выберите дату начала и окончания',
    invalidDateRange: 'Дата окончания должна быть позже даты начала',
    loadError: 'Ошибка при загрузке велосипедов',
    bookingError: 'Ошибка при создании бронирования',
    firstNameRequired: 'Введите имя',
    lastNameRequired: 'Введите фамилию',
    emailRequired: 'Укажите корректный email',
    phoneRequired: 'Укажите номер телефона',
    streetRequired: 'Укажите улицу',
    houseNumberRequired: 'Укажите номер дома',
    postalCodeRequired: 'Укажите почтовый индекс',
    cityRequired: 'Укажите город',
    termsPrefix: 'Я принимаю',
    termsLinkText: 'Условия аренды',
    chooseStartDate: 'Пожалуйста, выберите дату начала',
    chooseEndDate: 'Теперь выберите дату окончания',
    selectThisBike: 'Выбрать',
    riderHeight: 'Рост',
    filterAll: 'Все',
    filterType: 'Тип',
    forDays: 'на',
    bookingPageTitle: 'Забронировать велосипед онлайн',
    backToInfo: 'Назад к прокату велосипедов',
    bookingCtaTitle: 'Забронируйте велосипед сейчас',
    bookingCtaText:
      'Всего 4 простых шага: выберите дату, велосипед, введите данные – готово.',
    zoomImage: 'Увеличить изображение',
    closeLabel: 'Закрыть',
    prevImage: 'Предыдущее изображение',
    nextImage: 'Следующее изображение',
    closureNotice: '',
    closurePeriodError:
      'В этот период (15–30 августа 2026) у нас отпуск. Пожалуйста, выберите другие даты.',
  },

  nl: {
    dateSelection: 'Datum kiezen',
    bikeSelection: 'Fiets kiezen',
    accessoryStep: 'Accessoires',
    accessoryTitle: 'Accessoires toevoegen',
    accessorySubtitle: 'Optionele accessoires voor je huur (prijs per dag).',
    accessoryNone: 'Geen accessoires beschikbaar.',
    accessoryTotal: 'Accessoires totaal',
    customerInfo: 'Gegevens invoeren',
    review: 'Bevestiging',
    selectDates: 'Kies een huurperiode',
    startDate: 'Startdatum',
    endDate: 'Einddatum',
    continue: 'Doorgaan',
    selectBike: 'Kies een fiets',
    days: 'dagen',
    loading: 'Laden...',
    noBikesAvailable: 'Geen fietsen beschikbaar voor deze periode',
    from: 'vanaf',
    day: 'dag',
    accessoryOneTime: 'eenmalig',
    accessoryOnlyIfUsed: 'alleen bij gebruik',
    free: 'Gratis',
    pickupTime: 'Ophaaltijd',
    pickupTimeSelect: 'Kies een tijd',
    pickupTimeHint: 'Hoe laat wil je de fiets ophalen?',
    pickupTimeClosed:
      'We zijn op deze dag gesloten. Kies een andere startdatum.',
    pickupTimeRequired: 'Kies een ophaaltijd',
    oClock: 'uur',
    to: 'tot',
    calendarHint:
      'Kies eerst de startdatum en daarna de einddatum. Zondagen en feestdagen zijn gesloten.',
    previousMonth: 'Vorige maand',
    nextMonth: 'Volgende maand',
    back: 'Terug',
    type: 'Type',
    frameSize: 'Framemaat',
    tireSize: 'Bandenmaat',
    color: 'Kleur',
    description: 'Beschrijving',
    pricing: 'Prijsberekening',
    rentalPrice: 'Huurprijs',
    deposit: 'Borg',
    selectColor: 'Kies kleur',
    frameNumber: 'Framenummer',
    optional: 'optioneel',
    addToCart: 'Aan boeking toevoegen',
    book: 'Boeken',
    selectDifferent: 'Kies een andere fiets',
    bikeAdded: 'Fiets toegevoegd aan boeking',
    bikeInCart: 'fiets in boeking',
    bikesInCart: 'fietsen in boeking',
    continueToBooking: 'Doorgaan naar boeking',
    yourInfo: 'Jouw gegevens',
    cartItems: 'Geselecteerde fietsen',
    addAnotherBike: '+ Nog een fiets toevoegen',
    firstName: 'Voornaam',
    lastName: 'Achternaam',
    email: 'E-mail',
    phone: 'Telefoon',
    street: 'Straat',
    houseNumber: 'Huisnummer',
    postalCode: 'Postcode',
    city: 'Plaats',
    notes: 'Opmerkingen',
    submitting: 'Versturen...',
    confirmBooking: 'Boeking bevestigen',
    bikeDetails: 'Fietsdetails',
    contactInfo: 'Contactgegevens',
    priceSummary: 'Prijsoverzicht',
    totalRental: 'Totale huur',
    totalDeposit: 'Totale borg',
    depositNote: 'De borg wordt terugbetaald wanneer de fiets wordt teruggebracht.',
    depositCashNote: 'Belangrijk: de borg kan alleen contant worden betaald.',
    confirm: 'Boeking bevestigen',
    bookingSuccess: 'Boeking geslaagd!',
    confirmationSent: 'Een bevestigingsmail is verzonden naar',
    sent: 'verzonden',
    bookingNumber: 'Boekingsnummer',
    newBooking: 'Nieuwe boeking',
    colorLabel: 'Kleur',
    frameNumberLabel: 'Framenummer',
    priceLabel: 'Prijs',
    selectBothDates: 'Kies start- en einddatum',
    invalidDateRange: 'Einddatum moet na de startdatum liggen',
    loadError: 'Fout bij het laden van fietsen',
    bookingError: 'Fout bij het aanmaken van de boeking',
    firstNameRequired: 'Voornaam is verplicht',
    lastNameRequired: 'Achternaam is verplicht',
    emailRequired: 'Geldig e-mailadres is verplicht',
    phoneRequired: 'Telefoonnummer is verplicht',
    streetRequired: 'Straat is verplicht',
    houseNumberRequired: 'Huisnummer is verplicht',
    postalCodeRequired: 'Postcode is verplicht',
    cityRequired: 'Plaats is verplicht',
    termsPrefix: 'Ik accepteer de',
    termsLinkText: 'Huurvoorwaarden',
    chooseStartDate: 'Tik op je startdatum',
    chooseEndDate: 'Tik nu op je einddatum',
    selectThisBike: 'Kiezen',
    riderHeight: 'Lichaamslengte',
    filterAll: 'Alle',
    filterType: 'Type',
    forDays: 'voor',
    bookingPageTitle: 'Fiets online boeken',
    backToInfo: 'Terug naar fietsverhuur',
    bookingCtaTitle: 'Reserveer nu je fiets',
    bookingCtaText:
      'In 4 eenvoudige stappen: kies een datum, kies een fiets, voer je gegevens in – klaar.',
    zoomImage: 'Afbeelding vergroten',
    closeLabel: 'Sluiten',
    prevImage: 'Vorige afbeelding',
    nextImage: 'Volgende afbeelding',
    closureNotice: '',
    closurePeriodError:
      'In deze periode (15–30 augustus 2026) hebben wij vakantie. Kies andere data.',
  },

  da: {
    dateSelection: 'Vælg dato',
    bikeSelection: 'Vælg cykel',
    accessoryStep: 'Tilbehør',
    accessoryTitle: 'Tilføj tilbehør',
    accessorySubtitle: 'Valgfrit tilbehør til din leje (pris pr. dag).',
    accessoryNone: 'Intet tilbehør tilgængeligt.',
    accessoryTotal: 'Tilbehør i alt',
    customerInfo: 'Indtast oplysninger',
    review: 'Bekræftelse',
    selectDates: 'Vælg en lejeperiode',
    startDate: 'Startdato',
    endDate: 'Slutdato',
    continue: 'Fortsæt',
    selectBike: 'Vælg en cykel',
    days: 'dage',
    loading: 'Indlæser...',
    noBikesAvailable: 'Ingen cykler tilgængelige i denne periode',
    from: 'fra',
    day: 'dag',
    accessoryOneTime: 'engangs',
    accessoryOnlyIfUsed: 'kun ved brug',
    free: 'Gratis',
    pickupTime: 'Afhentningstidspunkt',
    pickupTimeSelect: 'Vælg et tidspunkt',
    pickupTimeHint: 'Hvornår vil du hente cyklen?',
    pickupTimeClosed:
      'Vi har lukket denne dag. Vælg venligst en anden startdato.',
    pickupTimeRequired: 'Vælg venligst et afhentningstidspunkt',
    oClock: '',
    to: 'til',
    calendarHint:
      'Vælg først startdatoen og derefter slutdatoen. Søndage og helligdage er lukket.',
    previousMonth: 'Forrige måned',
    nextMonth: 'Næste måned',
    back: 'Tilbage',
    type: 'Type',
    frameSize: 'Stelstørrelse',
    tireSize: 'Dækstørrelse',
    color: 'Farve',
    description: 'Beskrivelse',
    pricing: 'Prisberegning',
    rentalPrice: 'Lejepris',
    deposit: 'Depositum',
    selectColor: 'Vælg farve',
    frameNumber: 'Stelnummer',
    optional: 'valgfrit',
    addToCart: 'Tilføj til booking',
    book: 'Book',
    selectDifferent: 'Vælg en anden cykel',
    bikeAdded: 'Cykel tilføjet til booking',
    bikeInCart: 'cykel i booking',
    bikesInCart: 'cykler i booking',
    continueToBooking: 'Fortsæt til booking',
    yourInfo: 'Dine oplysninger',
    cartItems: 'Valgte cykler',
    addAnotherBike: '+ Tilføj endnu en cykel',
    firstName: 'Fornavn',
    lastName: 'Efternavn',
    email: 'E-mail',
    phone: 'Telefon',
    street: 'Gade',
    houseNumber: 'Husnummer',
    postalCode: 'Postnummer',
    city: 'By',
    notes: 'Bemærkninger',
    submitting: 'Sender...',
    confirmBooking: 'Bekræft booking',
    bikeDetails: 'Cykeldetaljer',
    contactInfo: 'Kontaktoplysninger',
    priceSummary: 'Prisoversigt',
    totalRental: 'Leje i alt',
    totalDeposit: 'Depositum i alt',
    depositNote: 'Depositummet tilbagebetales, når cyklen returneres.',
    depositCashNote: 'Vigtigt: Depositummet kan kun betales kontant.',
    confirm: 'Bekræft booking',
    bookingSuccess: 'Booking gennemført!',
    confirmationSent: 'En bekræftelsesmail blev sendt til',
    sent: 'sendt',
    bookingNumber: 'Bookingnummer',
    newBooking: 'Ny booking',
    colorLabel: 'Farve',
    frameNumberLabel: 'Stelnummer',
    priceLabel: 'Pris',
    selectBothDates: 'Vælg start- og slutdato',
    invalidDateRange: 'Slutdatoen skal være efter startdatoen',
    loadError: 'Fejl ved indlæsning af cykler',
    bookingError: 'Fejl ved oprettelse af booking',
    firstNameRequired: 'Fornavn er påkrævet',
    lastNameRequired: 'Efternavn er påkrævet',
    emailRequired: 'Gyldig e-mail er påkrævet',
    phoneRequired: 'Telefonnummer er påkrævet',
    streetRequired: 'Gade er påkrævet',
    houseNumberRequired: 'Husnummer er påkrævet',
    postalCodeRequired: 'Postnummer er påkrævet',
    cityRequired: 'By er påkrævet',
    termsPrefix: 'Jeg accepterer',
    termsLinkText: 'lejebetingelserne',
    chooseStartDate: 'Tryk på din startdato',
    chooseEndDate: 'Tryk nu på din slutdato',
    selectThisBike: 'Vælg',
    riderHeight: 'Højde',
    filterAll: 'Alle',
    filterType: 'Type',
    forDays: 'i',
    bookingPageTitle: 'Book en cykel online',
    backToInfo: 'Tilbage til cykeludlejning',
    bookingCtaTitle: 'Reservér din cykel nu',
    bookingCtaText:
      'I 4 enkle trin: vælg en dato, vælg en cykel, indtast dine oplysninger – færdig.',
    zoomImage: 'Zoom billede',
    closeLabel: 'Luk',
    prevImage: 'Forrige billede',
    nextImage: 'Næste billede',
    closureNotice: '',
    closurePeriodError:
      'I denne periode (15.–30. august 2026) holder vi ferie. Vælg venligst andre datoer.',
  },

  no: {
    dateSelection: 'Velg dato',
    bikeSelection: 'Velg sykkel',
    accessoryStep: 'Tilbehør',
    accessoryTitle: 'Legg til tilbehør',
    accessorySubtitle: 'Valgfritt tilbehør til leien din (pris per dag).',
    accessoryNone: 'Ingen tilbehør tilgjengelig.',
    accessoryTotal: 'Tilbehør totalt',
    customerInfo: 'Fyll inn opplysninger',
    review: 'Bekreftelse',
    selectDates: 'Velg en leieperiode',
    startDate: 'Startdato',
    endDate: 'Sluttdato',
    continue: 'Fortsett',
    selectBike: 'Velg en sykkel',
    days: 'dager',
    loading: 'Laster...',
    noBikesAvailable: 'Ingen sykler tilgjengelige for denne perioden',
    from: 'fra',
    day: 'dag',
    accessoryOneTime: 'engangs',
    accessoryOnlyIfUsed: 'kun ved bruk',
    free: 'Gratis',
    pickupTime: 'Hentetidspunkt',
    pickupTimeSelect: 'Velg et tidspunkt',
    pickupTimeHint: 'Når vil du hente sykkelen?',
    pickupTimeClosed:
      'Vi har stengt denne dagen. Vennligst velg en annen startdato.',
    pickupTimeRequired: 'Vennligst velg et hentetidspunkt',
    oClock: '',
    to: 'til',
    calendarHint:
      'Velg først startdatoen og deretter sluttdatoen. Søndager og helligdager er stengt.',
    previousMonth: 'Forrige måned',
    nextMonth: 'Neste måned',
    back: 'Tilbake',
    type: 'Type',
    frameSize: 'Rammestørrelse',
    tireSize: 'Dekkstørrelse',
    color: 'Farge',
    description: 'Beskrivelse',
    pricing: 'Prisberegning',
    rentalPrice: 'Leiepris',
    deposit: 'Depositum',
    selectColor: 'Velg farge',
    frameNumber: 'Rammenummer',
    optional: 'valgfritt',
    addToCart: 'Legg til i bestilling',
    book: 'Bestill',
    selectDifferent: 'Velg en annen sykkel',
    bikeAdded: 'Sykkel lagt til i bestilling',
    bikeInCart: 'sykkel i bestilling',
    bikesInCart: 'sykler i bestilling',
    continueToBooking: 'Fortsett til bestilling',
    yourInfo: 'Dine opplysninger',
    cartItems: 'Valgte sykler',
    addAnotherBike: '+ Legg til en sykkel til',
    firstName: 'Fornavn',
    lastName: 'Etternavn',
    email: 'E-post',
    phone: 'Telefon',
    street: 'Gate',
    houseNumber: 'Husnummer',
    postalCode: 'Postnummer',
    city: 'By',
    notes: 'Merknader',
    submitting: 'Sender...',
    confirmBooking: 'Bekreft bestilling',
    bikeDetails: 'Sykkeldetaljer',
    contactInfo: 'Kontaktinformasjon',
    priceSummary: 'Prisoversikt',
    totalRental: 'Total leie',
    totalDeposit: 'Totalt depositum',
    depositNote: 'Depositumet tilbakebetales når sykkelen leveres tilbake.',
    depositCashNote: 'Viktig: Depositumet kan kun betales kontant.',
    confirm: 'Bekreft bestilling',
    bookingSuccess: 'Bestilling vellykket!',
    confirmationSent: 'En bekreftelses-e-post ble sendt til',
    sent: 'sendt',
    bookingNumber: 'Bestillingsnummer',
    newBooking: 'Ny bestilling',
    colorLabel: 'Farge',
    frameNumberLabel: 'Rammenummer',
    priceLabel: 'Pris',
    selectBothDates: 'Velg start- og sluttdato',
    invalidDateRange: 'Sluttdatoen må være etter startdatoen',
    loadError: 'Feil ved lasting av sykler',
    bookingError: 'Feil ved oppretting av bestilling',
    firstNameRequired: 'Fornavn er påkrevd',
    lastNameRequired: 'Etternavn er påkrevd',
    emailRequired: 'Gyldig e-post er påkrevd',
    phoneRequired: 'Telefonnummer er påkrevd',
    streetRequired: 'Gate er påkrevd',
    houseNumberRequired: 'Husnummer er påkrevd',
    postalCodeRequired: 'Postnummer er påkrevd',
    cityRequired: 'By er påkrevd',
    termsPrefix: 'Jeg godtar',
    termsLinkText: 'leievilkårene',
    chooseStartDate: 'Trykk på startdatoen din',
    chooseEndDate: 'Trykk nå på sluttdatoen din',
    selectThisBike: 'Velg',
    riderHeight: 'Høyde',
    filterAll: 'Alle',
    filterType: 'Type',
    forDays: 'i',
    bookingPageTitle: 'Bestill en sykkel online',
    backToInfo: 'Tilbake til sykkelutleie',
    bookingCtaTitle: 'Reserver sykkelen din nå',
    bookingCtaText:
      'I 4 enkle trinn: velg en dato, velg en sykkel, fyll inn opplysningene dine – ferdig.',
    zoomImage: 'Forstørr bilde',
    closeLabel: 'Lukk',
    prevImage: 'Forrige bilde',
    nextImage: 'Neste bilde',
    closureNotice: '',
    closurePeriodError:
      'I denne perioden (15.–30. august 2026) har vi ferie. Vennligst velg andre datoer.',
  },

  pl: {
    dateSelection: 'Wybierz datę',
    bikeSelection: 'Wybierz rower',
    accessoryStep: 'Akcesoria',
    accessoryTitle: 'Dodaj akcesoria',
    accessorySubtitle: 'Opcjonalne akcesoria do wypożyczenia (cena za dzień).',
    accessoryNone: 'Brak dostępnych akcesoriów.',
    accessoryTotal: 'Akcesoria razem',
    customerInfo: 'Wprowadź dane',
    review: 'Potwierdzenie',
    selectDates: 'Wybierz okres wypożyczenia',
    startDate: 'Data rozpoczęcia',
    endDate: 'Data zakończenia',
    continue: 'Dalej',
    selectBike: 'Wybierz rower',
    days: 'dni',
    loading: 'Ładowanie...',
    noBikesAvailable: 'Brak rowerów dostępnych w tym okresie',
    from: 'od',
    day: 'dzień',
    accessoryOneTime: 'jednorazowo',
    accessoryOnlyIfUsed: 'tylko w razie użycia',
    free: 'Gratis',
    pickupTime: 'Godzina odbioru',
    pickupTimeSelect: 'Wybierz godzinę',
    pickupTimeHint: 'O której godzinie chcesz odebrać rower?',
    pickupTimeClosed:
      'W tym dniu jesteśmy zamknięci. Wybierz inną datę rozpoczęcia.',
    pickupTimeRequired: 'Wybierz godzinę odbioru',
    oClock: '',
    to: 'do',
    calendarHint:
      'Najpierw wybierz datę rozpoczęcia, a potem datę zakończenia. Niedziele i święta są zamknięte.',
    previousMonth: 'Poprzedni miesiąc',
    nextMonth: 'Następny miesiąc',
    back: 'Wstecz',
    type: 'Typ',
    frameSize: 'Rozmiar ramy',
    tireSize: 'Rozmiar opon',
    color: 'Kolor',
    description: 'Opis',
    pricing: 'Kalkulacja ceny',
    rentalPrice: 'Cena wypożyczenia',
    deposit: 'Kaucja',
    selectColor: 'Wybierz kolor',
    frameNumber: 'Numer ramy',
    optional: 'opcjonalnie',
    addToCart: 'Dodaj do rezerwacji',
    book: 'Rezerwuj',
    selectDifferent: 'Wybierz inny rower',
    bikeAdded: 'Rower dodany do rezerwacji',
    bikeInCart: 'rower w rezerwacji',
    bikesInCart: 'rowerów w rezerwacji',
    continueToBooking: 'Przejdź do rezerwacji',
    yourInfo: 'Twoje dane',
    cartItems: 'Wybrane rowery',
    addAnotherBike: '+ Dodaj kolejny rower',
    firstName: 'Imię',
    lastName: 'Nazwisko',
    email: 'E-mail',
    phone: 'Telefon',
    street: 'Ulica',
    houseNumber: 'Numer domu',
    postalCode: 'Kod pocztowy',
    city: 'Miejscowość',
    notes: 'Uwagi',
    submitting: 'Wysyłanie...',
    confirmBooking: 'Potwierdź rezerwację',
    bikeDetails: 'Szczegóły roweru',
    contactInfo: 'Dane kontaktowe',
    priceSummary: 'Podsumowanie ceny',
    totalRental: 'Całkowite wypożyczenie',
    totalDeposit: 'Całkowita kaucja',
    depositNote: 'Kaucja jest zwracana po oddaniu roweru.',
    depositCashNote: 'Ważne: Kaucję można zapłacić tylko gotówką.',
    confirm: 'Potwierdź rezerwację',
    bookingSuccess: 'Rezerwacja udana!',
    confirmationSent: 'E-mail z potwierdzeniem został wysłany na',
    sent: 'wysłano',
    bookingNumber: 'Numer rezerwacji',
    newBooking: 'Nowa rezerwacja',
    colorLabel: 'Kolor',
    frameNumberLabel: 'Numer ramy',
    priceLabel: 'Cena',
    selectBothDates: 'Wybierz datę początkową i końcową',
    invalidDateRange: 'Data zakończenia musi być po dacie rozpoczęcia',
    loadError: 'Błąd podczas ładowania rowerów',
    bookingError: 'Błąd podczas tworzenia rezerwacji',
    firstNameRequired: 'Imię jest wymagane',
    lastNameRequired: 'Nazwisko jest wymagane',
    emailRequired: 'Wymagany jest prawidłowy e-mail',
    phoneRequired: 'Numer telefonu jest wymagany',
    streetRequired: 'Ulica jest wymagana',
    houseNumberRequired: 'Numer domu jest wymagany',
    postalCodeRequired: 'Kod pocztowy jest wymagany',
    cityRequired: 'Miejscowość jest wymagana',
    termsPrefix: 'Akceptuję',
    termsLinkText: 'warunki wypożyczenia',
    chooseStartDate: 'Dotknij daty rozpoczęcia',
    chooseEndDate: 'Teraz dotknij daty zakończenia',
    selectThisBike: 'Wybierz',
    riderHeight: 'Wzrost',
    filterAll: 'Wszystkie',
    filterType: 'Typ',
    forDays: 'na',
    bookingPageTitle: 'Zarezerwuj rower online',
    backToInfo: 'Powrót do wypożyczalni rowerów',
    bookingCtaTitle: 'Zarezerwuj swój rower teraz',
    bookingCtaText:
      'W 4 prostych krokach: wybierz datę, wybierz rower, wprowadź swoje dane – gotowe.',
    zoomImage: 'Powiększ zdjęcie',
    closeLabel: 'Zamknij',
    prevImage: 'Poprzednie zdjęcie',
    nextImage: 'Następne zdjęcie',
    closureNotice: '',
    closurePeriodError:
      'W tym okresie (15–30 sierpnia 2026) mamy urlop. Wybierz inne daty.',
  },
};

function getTranslations(language: Language): Translations {
  if (language in TRANSLATIONS) {
    return {
      ...TRANSLATIONS[language as BaseLanguage],
      rentalSteps:
        RENTAL_STEPS_TRANSLATIONS[language] ?? RENTAL_STEPS_TRANSLATIONS.en!,
    };
  }

  const fallback = TRANSLATIONS.en;
  const overrides =
    EXTENDED_TRANSLATION_OVERRIDES[
      language as keyof typeof EXTENDED_TRANSLATION_OVERRIDES
    ] ?? {};

  return {
    ...fallback,
    ...(overrides as Partial<Translations>),
    rentalSteps:
      RENTAL_STEPS_TRANSLATIONS[language] ?? RENTAL_STEPS_TRANSLATIONS.en!,
  };
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(this.platformId);

  private _currentLanguage = signal<Language>(this.getStoredLanguage());

  currentLanguage = this._currentLanguage.asReadonly();
  translations = computed(() => getTranslations(this._currentLanguage()));

  setLanguage(language: Language): void {
    this._currentLanguage.set(language);
    this.document.documentElement.lang = language;
    this.document.documentElement.dir = getLanguageDirection(language);
    if (this.isBrowser) {
      localStorage.setItem('bikehaus-homepage-language', language);
    }
  }

  private getStoredLanguage(): Language {
    if (!this.isBrowser) {
      return DEFAULT_LANGUAGE;
    }

    const stored = localStorage.getItem('bikehaus-homepage-language');
    if (isSupportedLanguage(stored)) {
      return stored;
    }
    const browserLang = navigator.language.substring(0, 2);
    if (isSupportedLanguage(browserLang)) {
      return browserLang;
    }
    return DEFAULT_LANGUAGE;
  }
}
