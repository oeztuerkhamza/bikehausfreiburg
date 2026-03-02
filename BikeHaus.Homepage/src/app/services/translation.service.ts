import { Injectable, signal, computed } from '@angular/core';

export type Language = 'de' | 'fr' | 'tr';

export interface Translations {
  // Meta / SEO
  metaTitle: string;
  metaDescription: string;

  // Nav
  home: string;
  showroom: string;
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
}

const TRANSLATIONS: Record<Language, Translations> = {
  de: {
    metaTitle: 'Bike Haus Freiburg — Neue & gebrauchte Fahrräder',
    metaDescription:
      'Ihr Fahrradhändler in Freiburg. Neue und geprüfte Gebrauchträder — City, Trekking, Mountain, E-Bike. Fair, nachhaltig, persönlich.',

    home: 'Start',
    showroom: 'Showroom',
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
    trust4: '30 Tage Funktionsgarantie auf alle Gebrauchträder',

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
  },

  fr: {
    metaTitle: "Bike Haus Freiburg — Vélos neufs & d'occasion",
    metaDescription:
      "Votre marchand de vélos à Fribourg. Vélos neufs et d'occasion certifiés — ville, trekking, VTT, vélo électrique. Honnête, durable, personnel.",

    home: 'Accueil',
    showroom: 'Showroom',
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
    trust4:
      "Garantie de fonctionnement de 30 jours sur tous les vélos d'occasion",

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
  },

  tr: {
    metaTitle: 'Bike Haus Freiburg — Yeni & İkinci El Bisikletler',
    metaDescription:
      "Freiburg'daki bisiklet mağazanız. Yeni ve kontrol edilmiş ikinci el bisikletler — şehir, trekking, dağ, elektrikli. Adil, sürdürülebilir, kişisel.",

    home: 'Ana Sayfa',
    showroom: 'Showroom',
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
    trust4: 'Tüm ikinci el bisikletlerde 30 gün işlev garantisi',

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
    if (stored && ['de', 'fr', 'tr'].includes(stored)) {
      return stored as Language;
    }
    const browserLang = navigator.language.substring(0, 2);
    if (['de', 'fr', 'tr'].includes(browserLang)) {
      return browserLang as Language;
    }
    return 'de';
  }
}
