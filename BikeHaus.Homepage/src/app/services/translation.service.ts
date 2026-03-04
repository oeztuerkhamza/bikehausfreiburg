import { Injectable, signal, computed } from '@angular/core';

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
  bikeCheckRepairTitle: string;
  bikeCheckBrakeAdjust: string;
  bikeCheckChainCassette: string;
  bikeCheckGearAdjust: string;
  bikeCheckTireService: string;
  bikeCheckNote: string;
  bikeCheckExclusion: string;
  bikeCheckNoObligation: string;
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
  terms: string;
  allRights: string;

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
}

const TRANSLATIONS: Record<Language, Translations> = {
  de: {
    metaTitle: 'Bike Haus Freiburg — Neue & gebrauchte Fahrräder',
    metaDescription:
      'Ihr Fahrradhändler in Freiburg. Neue und geprüfte Gebrauchträder — City, Trekking, Mountain, E-Bike. Fair, nachhaltig, persönlich.',

    home: 'Start',
    showroom: 'Showroom',
    accessories: 'Zubehör',
    about: 'Über uns',
    contact: 'Kontakt',

    heroH1: 'Dein nächstes Fahrrad wartet.',
    heroSub:
      'Neue und geprüfte Gebrauchträder in Freiburg — fair bewertet, nachhaltig aufbereitet, persönlich beraten.',
    ctaPrimary: 'Fahrräder entdecken',
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
      'Reparatur nur nach Wunsch — faire Preise, transparente Beratung.',
    bikeCheckFreeTitle: 'Kostenloser Check',
    bikeCheckBrakeCheck: 'Bremsenprüfung',
    bikeCheckGearTest: 'Schaltungstest',
    bikeCheckTireChain: 'Reifen & Kette prüfen',
    bikeCheckRepairTitle: 'Reparatur auf Wunsch',
    bikeCheckBrakeAdjust: 'Bremsen einstellen',
    bikeCheckChainCassette: 'Kette & Kassette tauschen',
    bikeCheckGearAdjust: 'Schaltung justieren',
    bikeCheckTireService: 'Reifenservice',
    bikeCheckNote: 'Nur für normale Fahrräder',
    bikeCheckExclusion: 'Keine E-Bikes, keine Rennräder',
    bikeCheckNoObligation: 'Keine Pflicht!',
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
    terms: 'AGB',
    allRights: 'Alle Rechte vorbehalten.',

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
    aboutMetaTitle: 'Über uns — Bike Haus Freiburg | Ihr Fahrradhändler',
    aboutMetaDescription:
      'Lernen Sie Bike Haus Freiburg kennen. Fair, nachhaltig, persönlich — Ihr lokaler Fahrradhändler in Freiburg im Breisgau für neue und gebrauchte Fahrräder.',

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
    contactMetaTitle: 'Kontakt — Bike Haus Freiburg | Adresse & Öffnungszeiten',
    contactMetaDescription:
      'Kontaktieren Sie Bike Haus Freiburg. Adresse, Öffnungszeiten, WhatsApp, Telefon. Besuchen Sie uns in 79114 Freiburg im Breisgau.',

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
    showroomMetaTitle: 'Showroom — Bike Haus Freiburg | Alle Fahrräder',
    showroomMetaDescription:
      'Entdecken Sie über 100 neue und gebrauchte Fahrräder in unserem Showroom. City, Trekking, Mountain, E-Bike, Kinderfahrräder — fair bewertet, geprüft, sofort verfügbar.',

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
    accessoriesMetaTitle: 'Zubehör — Bike Haus Freiburg',
    accessoriesMetaDescription:
      'Fahrradzubehör bei Bike Haus Freiburg. Taschen, Helme, Schlösser und mehr.',
    accessoriesTitle: 'Zubehör',
    accessoriesSub: 'Taschen, Helme, Schlösser und mehr für Ihr Fahrrad.',

    // Neue Fahrräder
    neueFahrraeder: 'Neue Fahrräder',
    neueFahrraederMetaTitle: 'Neue Fahrräder — Bike Haus Freiburg',
    neueFahrraederMetaDescription:
      'Fabrikneue Fahrräder bei Bike Haus Freiburg. City, Trekking, Mountain, E-Bike — mit 2 Jahren Geschäftsgarantie.',
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
  },

  en: {
    metaTitle: 'Bike Haus Freiburg — New & Used Bicycles',
    metaDescription:
      'Your bicycle shop in Freiburg. New and certified used bikes — city, trekking, mountain, e-bike. Fair, sustainable, personal.',

    home: 'Home',
    showroom: 'Showroom',
    accessories: 'Accessories',
    about: 'About',
    contact: 'Contact',

    heroH1: 'Your next bike is waiting.',
    heroSub:
      'New and certified used bikes in Freiburg — fair prices, sustainable refurbishment, personal advice.',
    ctaPrimary: 'Discover Bikes',
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
      'Bike Haus Freiburg was founded on the belief that good bikes don\'t have to be expensive — and that every bike deserves a second chance.',
    storyValue1Title: 'Sustainability',
    storyValue1Desc:
      'Every used bike we refurbish means less waste and more mobility.',
    storyValue2Title: 'Community',
    storyValue2Desc: 'We get people on bikes — regardless of budget.',
    storyValue3Title: 'Craftsmanship',
    storyValue3Desc: 'Mechanics meets passion. Every bike is treated with care.',

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
    bikeCheckRepairTitle: 'Repairs on Request',
    bikeCheckBrakeAdjust: 'Brake adjustment',
    bikeCheckChainCassette: 'Chain & cassette replacement',
    bikeCheckGearAdjust: 'Gear adjustment',
    bikeCheckTireService: 'Tire service',
    bikeCheckNote: 'Regular bikes only',
    bikeCheckExclusion: 'No e-bikes, no racing bikes',
    bikeCheckNoObligation: 'No obligation!',
    bikeCheckNoLiability: 'No liability for repairs',
    bikeCheckFairPrices: 'Fair prices — Transparent advice.',

    ctaSectionTitle: 'Ready for your next adventure?',
    ctaSectionSub:
      'Visit our showroom or browse our current selection online.',
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
    contactSub: 'We\'re happy to advise you — in person or by phone.',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    visitUs: 'Visit Us',

    footerTagline: 'New & used bikes in Freiburg.',
    quickLinks: 'Navigation',
    legalNotice: 'Legal Notice',
    privacy: 'Privacy Policy',
    terms: 'Terms',
    allRights: 'All rights reserved.',

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

    faqLabel: 'FAQ',
    faqTitle: 'Questions & Answers',
    faqSub: 'Everything you need to know about our service.',
    faq1Q: 'Can I test a bike before buying?',
    faq1A: 'Yes! Just drop by during our opening hours — no appointment needed.',
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
    whatsappInterested: 'I\'m interested in this bike:',
    whatsappQuestion: 'My question:',

    ankaufTitle: 'Sell your bike?',
    ankaufDesc:
      'We buy your used bike! Just send us photos and your asking price via WhatsApp.',
    ankaufCta: 'Send Offer',
    ankaufHint: 'Photos + asking price via WhatsApp',
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
      'Every bike we sell brings joy — and that\'s the greatest reward.',
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
      'Contact Bike Haus Freiburg. Address, opening hours, WhatsApp, phone. Visit us at 79114 Freiburg im Breisgau.',

    trustBadgeSince: 'In Freiburg since 2020',
    trustBadgeCustomers: '500+ satisfied customers',
    ariaStarsRating: '5 out of 5 stars',

    filterCondition: 'Condition',
    filterCategory: 'Category',
    filterTireSize: 'Tire Size (inches)',
    filterGears: 'Gears',
    gearsUnit: 'gears',
    filterFrameSize: 'Frame Size',
    showroomMetaTitle: 'Showroom — Bike Haus Freiburg | All Bikes',
    showroomMetaDescription:
      'Discover over 100 new and used bikes in our showroom. City, trekking, mountain, e-bike, kids bikes — fairly priced, inspected, immediately available.',

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

    accessoriesMetaTitle: 'Accessories — Bike Haus Freiburg',
    accessoriesMetaDescription:
      'Bike accessories at Bike Haus Freiburg. Bags, helmets, locks, and more.',
    accessoriesTitle: 'Accessories',
    accessoriesSub: 'Bags, helmets, locks, and more for your bike.',

    neueFahrraeder: 'New Bikes',
    neueFahrraederMetaTitle: 'New Bikes — Bike Haus Freiburg',
    neueFahrraederMetaDescription:
      'Brand new bikes at Bike Haus Freiburg. City, trekking, mountain, e-bike — with 2 years shop warranty.',
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
  },

  fr: {
    metaTitle: "Bike Haus Freiburg — Vélos neufs & d'occasion",
    metaDescription:
      "Votre marchand de vélos à Fribourg. Vélos neufs et d'occasion certifiés — ville, trekking, VTT, vélo électrique. Honnête, durable, personnel.",

    home: 'Accueil',
    showroom: 'Showroom',
    accessories: 'Accessoires',
    about: 'À propos',
    contact: 'Contact',

    heroH1: 'Votre prochain vélo vous attend.',
    heroSub:
      "Vélos neufs et d'occasion certifiés à Fribourg — prix transparents, remise en état durable, conseil personnalisé.",
    ctaPrimary: 'Découvrir les vélos',
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
    bikeCheckRepairTitle: 'Réparation sur demande',
    bikeCheckBrakeAdjust: 'Réglage des freins',
    bikeCheckChainCassette: 'Remplacement chaîne & cassette',
    bikeCheckGearAdjust: 'Ajustement des vitesses',
    bikeCheckTireService: 'Service pneus',
    bikeCheckNote: 'Uniquement pour les vélos classiques',
    bikeCheckExclusion: 'Pas de vélos électriques, pas de vélos de course',
    bikeCheckNoObligation: 'Aucune obligation !',
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
    terms: 'CGV',
    allRights: 'Tous droits réservés.',

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
      "Contactez Bike Haus Freiburg. Adresse, horaires d'ouverture, WhatsApp, téléphone. Rendez-nous visite à 79114 Fribourg-en-Brisgau.",

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
    showroomMetaTitle: 'Showroom — Bike Haus Freiburg | Tous les vélos',
    showroomMetaDescription:
      "Découvrez plus de 100 vélos neufs et d'occasion dans notre showroom. Ville, trekking, VTT, vélo électrique — évalués, vérifiés, disponibles immédiatement.",

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
    accessoriesMetaTitle: 'Accessoires — Bike Haus Freiburg',
    accessoriesMetaDescription:
      'Accessoires vélo chez Bike Haus Freiburg. Sacoches, casques, antivols et plus.',
    accessoriesTitle: 'Accessoires',
    accessoriesSub: 'Sacoches, casques, antivols et plus pour votre vélo.',

    // Neue Fahrräder
    neueFahrraeder: 'Vélos neufs',
    neueFahrraederMetaTitle: 'Vélos neufs — Bike Haus Freiburg',
    neueFahrraederMetaDescription:
      'Vélos neufs chez Bike Haus Freiburg. Ville, trekking, VTT, vélo électrique — avec 2 ans de garantie magasin.',
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
  },

  tr: {
    metaTitle: 'Bike Haus Freiburg — Yeni & İkinci El Bisikletler',
    metaDescription:
      "Freiburg'daki bisiklet mağazanız. Yeni ve kontrol edilmiş ikinci el bisikletler — şehir, trekking, dağ, elektrikli. Adil, sürdürülebilir, kişisel.",

    home: 'Ana Sayfa',
    showroom: 'Showroom',
    accessories: 'Aksesuar',
    about: 'Hakkımızda',
    contact: 'İletişim',

    heroH1: 'Bir sonraki bisikletin seni bekliyor.',
    heroSub:
      "Freiburg'da yeni ve kontrol edilmiş ikinci el bisikletler — adil fiyat, sürdürülebilir bakım, kişisel danışmanlık.",
    ctaPrimary: 'Bisikletleri Keşfet',
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
    bikeCheckRepairTitle: 'İsteğe Bağlı Tamir',
    bikeCheckBrakeAdjust: 'Fren ayarı',
    bikeCheckChainCassette: 'Zincir & kaset değişimi',
    bikeCheckGearAdjust: 'Vites ayarı',
    bikeCheckTireService: 'Lastik servisi',
    bikeCheckNote: 'Sadece normal bisikletler için',
    bikeCheckExclusion: 'E-Bike ve yarış bisikleti hariç',
    bikeCheckNoObligation: 'Zorunluluk yok!',
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
    terms: 'Şartlar',
    allRights: 'Tüm hakları saklıdır.',

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
      "Bike Haus Freiburg ile iletişime geçin. Adres, çalışma saatleri, WhatsApp, telefon. 79114 Freiburg'da bizi ziyaret edin.",

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
    showroomMetaTitle: 'Showroom — Bike Haus Freiburg | Tüm Bisikletler',
    showroomMetaDescription:
      "Showroom'umuzda 100'den fazla yeni ve ikinci el bisikleti keşfedin. Şehir, trekking, dağ, elektrikli bisiklet — değerlendi, kontrol edildi, hemen mevcut.",

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
    accessoriesMetaTitle: 'Aksesuar — Bike Haus Freiburg',
    accessoriesMetaDescription:
      "Bike Haus Freiburg'da bisiklet aksesuarları. Çanta, kask, kilit ve daha fazlası.",
    accessoriesTitle: 'Aksesuar',
    accessoriesSub: 'Bisikletiniz için çanta, kask, kilit ve daha fazlası.',

    // Neue Fahrräder
    neueFahrraeder: 'Yeni Bisikletler',
    neueFahrraederMetaTitle: 'Yeni Bisikletler — Bike Haus Freiburg',
    neueFahrraederMetaDescription:
      "Bike Haus Freiburg'da sıfır bisikletler. Şehir, trekking, dağ, elektrikli — 2 yıl mağaza garantili.",
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
  },
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private _currentLanguage = signal<Language>(this.getStoredLanguage());

  currentLanguage = this._currentLanguage.asReadonly();
  translations = computed(() => TRANSLATIONS[this._currentLanguage()]);

  setLanguage(language: Language): void {
    this._currentLanguage.set(language);
    localStorage.setItem('bikehaus-homepage-language', language);
    document.documentElement.lang = language;
  }

  private getStoredLanguage(): Language {
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
