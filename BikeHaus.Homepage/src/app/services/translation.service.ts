import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';

export type Language = 'de' | 'en' | 'fr' | 'tr';

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
  homeRentalBestBadge: string;
  homeRentalPopularBadge: string;
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

  // General
  loading: string;
  error: string;
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
}

const TRANSLATIONS: Record<Language, Translations> = {
  de: {
    metaTitle:
      'Fahrradladen Freiburg — Fahrrad kaufen & mieten | Bike Haus Freiburg',
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
    showroomTitle: 'Aktuelle Fahrräder.',
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
    bikeCheckSpokeRepair: 'Speichen reparieren & zentrieren',
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
      'Die Mietgebühr wird im Voraus bezahlt. Zusätzlich ist pro Fahrrad eine Kaution in Höhe von 300 € in bar zu hinterlegen. Bei ordnungsgemäßer Rückgabe ohne Schäden oder Verluste wird die Kaution vollständig erstattet.',
    bikeRentalNoteTitle: 'Hinweis',
    bikeRentalNoteText:
      'Die Übergabe ist täglich ab 10:00 Uhr möglich, die Rückgabe spätestens bis 18:00 Uhr. Bei verspäteter Rückgabe berechnen wir 12 € pro angefangenem Tag.',
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

    rentalHeroTitle: 'Fahrrad mieten',
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

    loading: 'Wird geladen...',
    error: 'Ein Fehler ist aufgetreten.',
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

    repairLabel: 'WERKSTATT',
    repairTitle: 'Unsere Reparaturen',
    repairSub: 'Einblicke in unsere professionelle Fahrradwerkstatt',

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
      'Bike Haus Freiburg Haid — Heckerstraße 27, 79114 Freiburg ✓ Öffnungszeiten: Mo/Di/Do 11–17:30, Mi 14–17:30, Fr 11–13 & 15–18, Sa 11:30–17 ✓ WhatsApp: +49 155 6630 0011.',

    // Home trust badges
    trustBadgeSince: 'Seit 2020 in Freiburg',
    trustBadgeCustomers: '500+ zufriedene Kunden',
    ariaStarsRating: '5 von 5 Sternen',

    // Showroom filters
    filterCondition: 'Zustand',
    filterCategory: 'Kategorie',
    filterTireSize: 'Reifengröße (Zoll)',
    filterGears: 'Gänge',
    gearsUnit: 'Gänge',
    filterFrameSize: 'Rahmengröße (Size)',
    showroomMetaTitle:
      'Gebrauchte Fahrräder kaufen Freiburg | Showroom | Bike Haus Freiburg',
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
    accessoriesMetaTitle:
      'Fahrradzubehör Freiburg | Helme, Taschen & Schlösser | Bike Haus',
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
      'Neue Fahrräder kaufen Freiburg | City, Trekking, E-Bike | Bike Haus',
    neueFahrraederMetaDescription:
      'Neue Fahrräder in Freiburg kaufen ✓ City, Trekking, Mountain & E-Bikes ✓ 2 Jahre Garantie ✓ Sofort verfügbar ✓ Faire Preise. Jetzt im Showroom ansehen — Bike Haus Freiburg.',
    neueFahrraederTitle: 'Neue Fahrräder',
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

    // Ratgeber / Blog
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
    bikeRentalMetaTitle:
      'Fahrrad mieten Freiburg | Tagespreise pro Fahrrad | Bike Haus Freiburg',
    bikeRentalMetaDescription:
      'Fahrradverleih Freiburg — 1 bis 7 Tage pro Fahrrad individuell bepreist, ab Tag 8 mit festem Zusatzpreis. Helm & Schloss inklusive. Sofort abholen. ✓ Bike Haus Freiburg.',
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
      'Gebrauchte Fahrräder beginnen ab ca. 80 €. Gebrauchte E-Bikes ab ca. 800 €. Alle Preise sind fair kalkuliert.',
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
      'Mo, Di, Do: 11:00–17:30 Uhr. Mittwoch: 14:00–17:30 Uhr. Freitag: 11:00–13:00 & 15:00–18:00 Uhr. Samstag: 11:30–17:00 Uhr. Sonn- und feiertags geschlossen.',
    faqQ10: 'Kann ich mein altes Fahrrad in Zahlung geben?',
    faqA10:
      'Ja, in Einzelfällen ist eine Inzahlungnahme möglich. Sprechen Sie uns einfach an — wir finden eine Lösung.',

    svcRepairBadge: 'Service',
    svcRepairTitle: 'Fahrrad Reparatur',
    svcRepairSub:
      'Professionelle Wartung & Service – schnell, zuverlässig, fair.',
    svcRepairItem1: 'Bremsen, Schaltung, Reifen',
    svcRepairItem2: 'Komplette Inspektion',
    svcRepairItem3: 'Fahrrad Diagnose & Wartung',
    svcRepairItem4: 'Ersatzteile auf Lager',
    svcRepairCta: 'Termin anfragen',
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
    homeRentalBestBadge: 'Bestes Angebot · Spare 30%',
    homeRentalPopularBadge: 'Beliebt',
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
  },

  en: {
    metaTitle: 'Buy & Rent a Bike in Freiburg | Bike Haus Freiburg',
    metaDescription:
      'Bike shop in Freiburg Haid ✓ Buy or rent a bike ✓ 100+ inspected bikes ✓ City, Trekking, E-Bike ✓ Daily bike rental pricing per bike ✓ 3-month warranty. No appointment needed — Heckerstraße 27!',

    home: 'Home',
    showroom: 'Showroom',
    accessories: 'Accessories',
    about: 'About',
    contact: 'Contact',

    heroH1: 'Bikes in Freiburg — new & used.',
    heroSub:
      'Buy or rent a bike in Freiburg ✓ Inspected used bikes from €80 ✓ Bike rental with per-bike daily pricing ✓ City, Trekking & E-Bikes ✓ Pick up same day.',
    ctaPrimary: 'Discover New Bikes',
    ctaSecondary: 'View Showroom',

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
    showroomTitle: 'Current Bikes.',
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
    bikeCheckRepairTitle: 'Repairs on Request',
    bikeCheckBrakeAdjust: 'Brake adjustment',
    bikeCheckChainCassette: 'Chain & cassette replacement',
    bikeCheckGearAdjust: 'Gear adjustment',
    bikeCheckTireService: 'Tire service',
    bikeCheckCableReplace: 'Cable replacement',
    bikeCheckBottomBracket: 'Bottom bracket service',
    bikeCheckSpokeRepair: 'Spoke repair & truing',
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
      'The rental fee is paid in advance. In addition, a cash deposit of 300 € is required per bicycle. If the bicycle is returned properly without damage or loss, the deposit is fully refunded.',
    bikeRentalNoteTitle: 'Note',
    bikeRentalNoteText:
      'Handover is possible daily from 10:00, and return must be completed by 18:00 at the latest. A late return fee of 12 € per started day will be charged.',
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

    rentalHeroTitle: 'Rent a bike',
    rentalHeroSub:
      'Available immediately – fair, flexible, no hidden costs. Pick up directly from us in Freiburg.',
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

    loading: 'Loading...',
    error: 'An error occurred.',
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

    repairLabel: 'WORKSHOP',
    repairTitle: 'Our Repairs',
    repairSub: 'Insights into our professional bicycle workshop',

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
    filterTireSize: 'Tire Size (inches)',
    filterGears: 'Gears',
    gearsUnit: 'gears',
    filterFrameSize: 'Frame Size',
    showroomMetaTitle:
      'Buy Used Bikes in Freiburg | Showroom | Bike Haus Freiburg',
    showroomMetaDescription:
      'Buy used & new bikes in Freiburg ✓ 100+ inspected bikes ✓ City, Trekking, Mountain, E-Bike ✓ 3-month warranty ✓ Ready to ride. Bike Haus Freiburg.',

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

    accessoriesMetaTitle:
      'Bike Accessories Freiburg | Helmets, Bags & Locks | Bike Haus',
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
      'New Bikes Freiburg | City, Trekking & E-Bikes | Bike Haus Freiburg',
    neueFahrraederMetaDescription:
      'Buy new bikes in Freiburg ✓ City, Trekking, Mountain & E-Bikes ✓ 2-year warranty ✓ In stock & ready to ride ✓ Fair prices. Visit our showroom — Bike Haus Freiburg.',
    neueFahrraederTitle: 'New Bikes',
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

    // Ratgeber / Blog
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
      'Bike Rental Freiburg | Daily Pricing Per Bike | Bike Haus Freiburg',
    bikeRentalMetaDescription:
      'Bike rental in Freiburg with daily pricing configured per bike for days 1 to 7, plus a fixed extra-day surcharge from day 8. Helmet & lock included. ✓ Bike Haus Freiburg.',
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
      'Used bikes start from approx. €80. Used e-bikes from approx. €800. All prices are fairly calculated.',
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
      'Monday, Tuesday, Thursday: 11:00–17:30. Wednesday: 14:00–17:30. Friday: 11:00–13:00 & 15:00–18:00. Saturday: 11:30–17:00. Sunday and holidays: closed.',
    faqQ10: 'Can I rent a bike in Freiburg?',
    faqA10:
      'Yes. Bike Haus Freiburg rents city bikes, trekking bikes and e-bikes with prices configured per bike for days 1 to 7. From day 8 onward, a fixed extra-day surcharge is added to the 7-day price. No reservation needed — just come by Heckerstraße 27.',

    svcRepairBadge: 'Service',
    svcRepairTitle: 'Bicycle Repair',
    svcRepairSub: 'Professional maintenance & repairs – fast, reliable, fair.',
    svcRepairItem1: 'Brakes, Gears, Tyres',
    svcRepairItem2: 'Full Inspection',
    svcRepairItem3: 'Bike Diagnostics & Maintenance',
    svcRepairItem4: 'Spare Parts in Stock',
    svcRepairCta: 'Request Appointment',
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
    homeRentalBestBadge: 'Best Deal · Save 30%',
    homeRentalPopularBadge: 'Popular',
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
      "Achetez ou louez votre vélo à Fribourg-en-Brisgau ✓ Vélos inspectés dès 80 € ✓ Location avec tarifs journaliers définis par vélo ✓ Retrait immédiat ✓ À 25 km de l'Alsace.",
    ctaPrimary: 'Découvrir les nouveaux vélos',
    ctaSecondary: 'Voir le showroom',

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
    showroomTitle: 'Vélos disponibles.',
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
    bikeCheckSpokeRepair: 'Réparation & centrage des rayons',
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
      "Le prix de location est payé à l'avance. En plus, une caution en espèces de 300 € est exigée par vélo. Si le vélo est retourné correctement, sans dommage ni perte, la caution est remboursée intégralement.",
    bikeRentalNoteTitle: 'Remarque',
    bikeRentalNoteText:
      'La remise du vélo est possible tous les jours à partir de 10:00 et le retour doit être effectué au plus tard à 18:00. En cas de retour tardif, des frais de 12 € par jour entamé sont facturés.',
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

    rentalHeroTitle: 'Louer un vélo',
    rentalHeroSub:
      'Disponible immédiatement – juste, flexible, sans frais cachés. Récupérez directement chez nous à Fribourg.',
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

    loading: 'Chargement...',
    error: 'Une erreur est survenue.',
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

    repairLabel: 'ATELIER',
    repairTitle: 'Nos réparations',
    repairSub: 'Aperçu de notre atelier de réparation de vélos professionnel',

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
    filterTireSize: 'Taille de pneu (pouces)',
    filterGears: 'Vitesses',
    gearsUnit: 'vitesses',
    filterFrameSize: 'Taille de cadre',
    showroomMetaTitle: 'Acheter vélo Fribourg | Showroom | Bike Haus Freiburg',
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
      'Accessoires vélo Fribourg | Casques, Sacoches & Antivols | Bike Haus',
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
      'Acheter vélos neufs à Fribourg | City, Trekking, VAE | Bike Haus',
    neueFahrraederMetaDescription:
      'Achetez des vélos neufs à Fribourg-en-Brisgau ✓ Vélos de ville, trekking, VTT & VAE ✓ 2 ans de garantie ✓ En stock immédiatement ✓ Prix honnêtes. Bike Haus Freiburg.',
    neueFahrraederTitle: 'Vélos neufs',
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

    // Ratgeber / Blog
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
    bikeRentalMetaTitle:
      'Location vélo Fribourg | Tarifs journaliers par vélo | Bike Haus Freiburg',
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
      "Les vélos d'occasion commencent à env. 80 €. Les VAE d'occasion à env. 800 €.",
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
      'Lundi, mardi, jeudi : 11:00–17:30. Mercredi : 14:00–17:30. Vendredi : 11:00–13:00 & 15:00–18:00. Samedi : 11:30–17:00. Dimanche et jours fériés : fermé.',
    faqQ10: 'Louez-vous des vélos à Fribourg ?',
    faqA10:
      'Oui. Bike Haus Freiburg loue des vélos city, trekking et VAE avec des tarifs configurés par vélo pour 1 à 7 jours. À partir du 8e jour, un supplément fixe est ajouté au prix 7 jours. Sans réservation — venez directement Heckerstraße 27.',

    svcRepairBadge: 'Service',
    svcRepairTitle: 'Réparation de vélos',
    svcRepairSub:
      'Entretien & réparation professionnels – rapide, fiable, juste.',
    svcRepairItem1: 'Freins, Vitesses, Pneus',
    svcRepairItem2: 'Inspection complète',
    svcRepairItem3: 'Diagnostic & entretien E-Bike',
    svcRepairItem4: 'Pièces détachées en stock',
    svcRepairCta: 'Prendre rendez-vous',
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
    homeRentalBestBadge: 'Meilleure offre · Économisez 30%',
    homeRentalPopularBadge: 'Populaire',
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
    showroomTitle: 'Mevcut Bisikletler.',
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
    bikeCheckSpokeRepair: 'Jant teli onarımı & merkezleme',
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
      'Kiralama ücreti peşin ödenir. Buna ek olarak her bisiklet için 300 € nakit depozito alınır. Bisiklet hasar veya kayıp olmadan düzgün şekilde iade edilirse depozito tamamen geri ödenir.',
    bikeRentalNoteTitle: 'Not',
    bikeRentalNoteText:
      "Teslimat her gün 10:00'dan itibaren mümkündür, iade ise en geç 18:00'e kadar yapılmalıdır. Geç iade için başlayan her gün başına 12 € ücret alınır.",
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

    rentalHeroTitle: 'Bisiklet Kirala',
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

    loading: 'Yükleniyor...',
    error: 'Bir hata oluştu.',
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

    repairLabel: 'ATÖLYE',
    repairTitle: 'Tamir Çalışmalarımız',
    repairSub: 'Profesyonel bisiklet atölyemizden görüntüler',

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
      'Bike Haus Freiburg ✓ Heckerstraße 27, 79114 Freiburg ✓ Pzt–Cmt 11:00–17:30 ✓ WhatsApp: +49 155 6630 0011 ✓ Randevu gerekmez — bizi ziyaret edin!',

    // Home trust badges
    trustBadgeSince: "2020'den beri Freiburg'da",
    trustBadgeCustomers: '500+ memnun müşteri',
    ariaStarsRating: '5 üzerinden 5 yıldız',

    // Showroom filters
    filterCondition: 'Durum',
    filterCategory: 'Kategori',
    filterTireSize: 'Lastik Boyutu (inç)',
    filterGears: 'Vites',
    gearsUnit: 'Vites',
    filterFrameSize: 'Kadro Boyutu',
    showroomMetaTitle:
      "Freiburg'da İkinci El & Yeni Bisiklet Al | Showroom | Bike Haus",
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
      'Bisiklet Aksesuarları Freiburg | Kask, Çanta & Kilit | Bike Haus',
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
      "Freiburg'da Yeni Bisiklet Al | Şehir, Trekking, E-Bisiklet | Bike Haus",
    neueFahrraederMetaDescription:
      "Freiburg'da yeni bisiklet satın alın ✓ Şehir, Trekking, Dağ & E-bisiklet ✓ 2 yıl garanti ✓ Stokta & hemen teslim ✓ Uygun fiyat. Bike Haus Freiburg.",
    neueFahrraederTitle: 'Yeni Bisikletler',
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

    // Ratgeber / Blog
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
    bikeRentalMetaTitle:
      'Freiburg Bisiklet Kiralama | Bisiklet Bazlı Günlük Fiyat | Bike Haus Freiburg',
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
      "İkinci el bisikletler yaklaşık 80 €'dan başlar. İkinci el e-bisikletler yaklaşık 800 €'dan.",
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
      'Pazartesi, Salı, Perşembe: 11:00–17:30. Çarşamba: 14:00–17:30. Cuma: 11:00–13:00 & 15:00–18:00. Cumartesi: 11:30–17:00. Pazar ve tatil günleri: kapalı.',
    faqQ10: 'Eski bisikletimi takas edebilir miyim?',
    faqA10:
      'Evet, bireysel durumlarda takas mümkündür. Bize danışın — bir çözüm buluruz.',

    svcRepairBadge: 'Servis',
    svcRepairTitle: 'Bisiklet Tamiri',
    svcRepairSub: 'Profesyonel bakım & tamir – hızlı, güvenilir, adil.',
    svcRepairItem1: 'Frenler, Vites, Lastik',
    svcRepairItem2: 'Tam Kontrol',
    svcRepairItem3: 'Bisiklet Tanı & Bakım',
    svcRepairItem4: 'Yedek Parça Stokta',
    svcRepairCta: 'Randevu Talep Et',
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
    homeRentalBestBadge: 'En İyi Teklif · %30 Tasarruf',
    homeRentalPopularBadge: 'Popüler',
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
  },
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(this.platformId);

  private _currentLanguage = signal<Language>(this.getStoredLanguage());

  currentLanguage = this._currentLanguage.asReadonly();
  translations = computed(() => TRANSLATIONS[this._currentLanguage()]);

  setLanguage(language: Language): void {
    this._currentLanguage.set(language);
    if (this.isBrowser) {
      localStorage.setItem('bikehaus-homepage-language', language);
      this.document.documentElement.lang = language;
    }
  }

  private getStoredLanguage(): Language {
    if (!this.isBrowser) {
      return 'de';
    }

    const stored = localStorage.getItem('bikehaus-homepage-language');
    if (stored && ['de', 'en', 'fr', 'tr'].includes(stored)) {
      return stored as Language;
    }
    const browserLang = navigator.language.substring(0, 2);
    if (['de', 'en', 'fr', 'tr'].includes(browserLang)) {
      return browserLang as Language;
    }
    return 'de';
  }
}
