import { SupportedLanguageCode } from './language-config';

/**
 * Übersetzung deutscher Stammdaten-Begriffe für die öffentliche Buchungsseite.
 *
 * Zubehörnamen ("Fahrradschloss"), Fahrradnamen ("20 zoll Kinder Fahrrad") und
 * Fahrradtypen ("Kinderrad") werden in der Verwaltung auf Deutsch gepflegt.
 * Auf der englischen, türkischen oder französischen Seite standen sie deshalb
 * mitten in ansonsten übersetztem Text.
 *
 * Übersetzt werden nur bekannte Fachbegriffe INNERHALB des Namens, alles andere
 * bleibt stehen — so überleben Marken, Zahlen und Maße:
 *
 *   "Ortlieb Fahrradtaschen"  →  "Ortlieb panniers"
 *   "20 zoll Kinder Fahrrad"  →  "20 inch kids' bike"
 *   "Reperatur set"           →  "Repair kit"          (Tippfehler inbegriffen)
 *
 * Unbekanntes bleibt unverändert — ein deutscher Name ist besser als ein
 * leerer. Neue Begriffe hier ergänzen.
 */
type Translations = Partial<Record<SupportedLanguageCode, string>>;

interface AccessoryTerm {
  /** Erkennt den Begriff im gepflegten Namen (auch als Wortteil). */
  pattern: RegExp;
  translations: Translations;
}

const TERMS: AccessoryTerm[] = [
  {
    pattern: /fahrradschl(o|ö)ss(er)?|schloss/i,
    translations: {
      en: 'Bike lock',
      fr: 'Antivol',
      tr: 'Bisiklet kilidi',
      es: 'Candado',
      it: 'Lucchetto',
      ar: 'قفل دراجة',
      ru: 'Велозамок',
      no: 'Sykkellås',
      da: 'Cykellås',
      nl: 'Fietsslot',
      pl: 'Zapięcie rowerowe',
    },
  },
  {
    pattern: /fahrradtaschen|fahrradtasche|packtaschen/i,
    translations: {
      en: 'panniers',
      fr: 'sacoches',
      tr: 'bisiklet çantası',
      es: 'alforjas',
      it: 'borse laterali',
      ar: 'حقائب دراجة',
      ru: 'велосумки',
      no: 'sykkelvesker',
      da: 'cykeltasker',
      nl: 'fietstassen',
      pl: 'sakwy rowerowe',
    },
  },
  {
    pattern: /kindersitz/i,
    translations: {
      en: 'Child seat',
      fr: 'Siège enfant',
      tr: 'Çocuk koltuğu',
      es: 'Silla infantil',
      it: 'Seggiolino',
      ar: 'مقعد أطفال',
      ru: 'Детское кресло',
      no: 'Barnesete',
      da: 'Barnestol',
      nl: 'Kinderzitje',
      pl: 'Fotelik dziecięcy',
    },
  },
  {
    pattern: /handyhalter(ung)?/i,
    translations: {
      en: 'Phone holder',
      fr: 'Support téléphone',
      tr: 'Telefon tutucu',
      es: 'Soporte de móvil',
      it: 'Porta-cellulare',
      ar: 'حامل الهاتف',
      ru: 'Держатель телефона',
      no: 'Mobilholder',
      da: 'Mobilholder',
      nl: 'Telefoonhouder',
      pl: 'Uchwyt na telefon',
    },
  },
  {
    pattern: /rep(a|e)ratur[- ]?set|flickzeug/i,
    translations: {
      en: 'Repair kit',
      fr: 'Kit de réparation',
      tr: 'Tamir seti',
      es: 'Kit de reparación',
      it: 'Kit di riparazione',
      ar: 'طقم إصلاح',
      ru: 'Ремкомплект',
      no: 'Reparasjonssett',
      da: 'Reparationssæt',
      nl: 'Reparatieset',
      pl: 'Zestaw naprawczy',
    },
  },
  {
    pattern: /schlauch/i,
    translations: {
      en: 'Inner tube',
      fr: 'Chambre à air',
      tr: 'İç lastik',
      es: 'Cámara de aire',
      it: "Camera d'aria",
      ar: 'أنبوب داخلي',
      ru: 'Камера',
      no: 'Slange',
      da: 'Slange',
      nl: 'Binnenband',
      pl: 'Dętka',
    },
  },
  {
    pattern: /helm/i,
    translations: {
      en: 'Helmet',
      fr: 'Casque',
      tr: 'Kask',
      es: 'Casco',
      it: 'Casco',
      ar: 'خوذة',
      ru: 'Шлем',
      no: 'Hjelm',
      da: 'Hjelm',
      nl: 'Helm',
      pl: 'Kask',
    },
  },
  {
    pattern: /korb/i,
    translations: {
      en: 'Basket',
      fr: 'Panier',
      tr: 'Sepet',
      es: 'Cesta',
      it: 'Cestino',
      ar: 'سلة',
      ru: 'Корзина',
      no: 'Kurv',
      da: 'Kurv',
      nl: 'Mand',
      pl: 'Koszyk',
    },
  },
  {
    pattern: /licht|beleuchtung/i,
    translations: {
      en: 'Lights',
      fr: 'Éclairage',
      tr: 'Işık',
      es: 'Luces',
      it: 'Luci',
      ar: 'إضاءة',
      ru: 'Фонари',
      no: 'Lys',
      da: 'Lygter',
      nl: 'Verlichting',
      pl: 'Oświetlenie',
    },
  },
  {
    pattern: /luftpumpe|pumpe/i,
    translations: {
      en: 'Pump',
      fr: 'Pompe',
      tr: 'Pompa',
      es: 'Bomba',
      it: 'Pompa',
      ar: 'منفاخ',
      ru: 'Насос',
      no: 'Pumpe',
      da: 'Pumpe',
      nl: 'Pomp',
      pl: 'Pompka',
    },
  },
  {
    pattern: /anh(ä|ae)nger/i,
    translations: {
      en: 'Trailer',
      fr: 'Remorque',
      tr: 'Römork',
      es: 'Remolque',
      it: 'Rimorchio',
      ar: 'مقطورة',
      ru: 'Прицеп',
      no: 'Sykkelvogn',
      da: 'Cykelanhænger',
      nl: 'Aanhanger',
      pl: 'Przyczepka',
    },
  },
];

/** Begriffe rund ums Rad selbst: Typ-Chips und die Namen aus dem Bestand. */
const BIKE_TERMS: AccessoryTerm[] = [
  {
    // Vor "Fahrrad" prüfen, sonst bliebe "Kinder" stehen.
    pattern: /kinder[- ]?(fahr)?rad|kinder[- ]?fahrrad|kinderrad/i,
    translations: {
      en: "kids' bike",
      fr: 'vélo enfant',
      tr: 'çocuk bisikleti',
      es: 'bicicleta infantil',
      it: 'bici per bambini',
      ar: 'دراجة أطفال',
      ru: 'детский велосипед',
      no: 'barnesykkel',
      da: 'børnecykel',
      nl: 'kinderfiets',
      pl: 'rower dziecięcy',
    },
  },
  {
    pattern: /damen(fahr)?rad/i,
    translations: {
      en: "women's bike",
      fr: 'vélo femme',
      tr: 'kadın bisikleti',
      es: 'bicicleta de mujer',
      it: 'bici da donna',
      ar: 'دراجة نسائية',
      ru: 'женский велосипед',
      no: 'damesykkel',
      da: 'damecykel',
      nl: 'damesfiets',
      pl: 'rower damski',
    },
  },
  {
    pattern: /herren(fahr)?rad/i,
    translations: {
      en: "men's bike",
      fr: 'vélo homme',
      tr: 'erkek bisikleti',
      es: 'bicicleta de hombre',
      it: 'bici da uomo',
      ar: 'دراجة رجالية',
      ru: 'мужской велосипед',
      no: 'herresykkel',
      da: 'herrecykel',
      nl: 'herenfiets',
      pl: 'rower męski',
    },
  },
  {
    pattern: /lastenrad|transportrad/i,
    translations: {
      en: 'cargo bike',
      fr: 'vélo cargo',
      tr: 'kargo bisikleti',
      es: 'bicicleta de carga',
      it: 'cargo bike',
      ar: 'دراجة شحن',
      ru: 'грузовой велосипед',
      no: 'lastesykkel',
      da: 'ladcykel',
      nl: 'bakfiets',
      pl: 'rower cargo',
    },
  },
  {
    pattern: /rennrad/i,
    translations: {
      en: 'road bike',
      fr: 'vélo de course',
      tr: 'yarış bisikleti',
      es: 'bicicleta de carretera',
      it: 'bici da corsa',
      ar: 'دراجة سباق',
      ru: 'шоссейный велосипед',
      no: 'landeveissykkel',
      da: 'racercykel',
      nl: 'racefiets',
      pl: 'rower szosowy',
    },
  },
  {
    // Auch das einzelne "City" aus den Typ-Chips.
    pattern: /city[- ]?rad|cityrad|\bcity\b/i,
    translations: {
      en: 'city bike',
      fr: 'vélo de ville',
      tr: 'şehir bisikleti',
      es: 'bicicleta urbana',
      it: 'city bike',
      ar: 'دراجة مدينة',
      ru: 'городской велосипед',
      no: 'bysykkel',
      da: 'bycykel',
      nl: 'stadsfiets',
      pl: 'rower miejski',
    },
  },
  {
    pattern: /trekking(rad)?/i,
    translations: {
      en: 'trekking bike',
      fr: 'vélo de randonnée',
      tr: 'trekking bisikleti',
      es: 'bicicleta de trekking',
      it: 'bici da trekking',
      ar: 'دراجة تريكينغ',
      ru: 'трекинговый велосипед',
      no: 'turSykkel',
      da: 'trekkingcykel',
      nl: 'trekkingfiets',
      pl: 'rower trekkingowy',
    },
  },
  {
    pattern: /mountainbike|mountain[- ]?bike/i,
    translations: {
      en: 'mountain bike',
      fr: 'VTT',
      tr: 'dağ bisikleti',
      es: 'bicicleta de montaña',
      it: 'mountain bike',
      ar: 'دراجة جبلية',
      ru: 'горный велосипед',
      no: 'terrengsykkel',
      da: 'mountainbike',
      nl: 'mountainbike',
      pl: 'rower górski',
    },
  },
  {
    // Nur das allgemeine Wort — die zusammengesetzten Formen stehen oben.
    pattern: /fahrr(a|ä)d(er)?\b|(?<!e-)\brad\b/i,
    translations: {
      en: 'bike',
      fr: 'vélo',
      tr: 'bisiklet',
      es: 'bicicleta',
      it: 'bici',
      ar: 'دراجة',
      ru: 'велосипед',
      no: 'sykkel',
      da: 'cykel',
      nl: 'fiets',
      pl: 'rower',
    },
  },
  {
    // Sammel-Chip aus den Stammdaten ("Sonstiges").
    pattern: /sonstige(s|r)?/i,
    translations: {
      en: 'other',
      fr: 'autre',
      tr: 'diğer',
      es: 'otros',
      it: 'altro',
      ar: 'أخرى',
      ru: 'прочее',
      no: 'annet',
      da: 'andet',
      nl: 'overig',
      pl: 'inne',
    },
  },
  {
    pattern: /\bzoll\b/i,
    translations: {
      en: 'inch',
      fr: 'pouces',
      tr: 'inç',
      es: 'pulgadas',
      it: 'pollici',
      ar: 'بوصة',
      ru: 'дюйм',
      no: 'tommer',
      da: 'tommer',
      nl: 'inch',
      pl: 'cali',
    },
  },
];

/**
 * Ersetzt alle bekannten Begriffe im Text. Groß-/Kleinschreibung richtet sich
 * nach der Fundstelle: am Anfang groß, mitten im Namen klein — sonst stünde da
 * "Ortlieb Panniers" oder "20 Inch kids' bike".
 */
function translateTerms(
  value: string | null | undefined,
  lang: SupportedLanguageCode,
  terms: AccessoryTerm[],
): string {
  const original = (value ?? '').trim();
  if (!original || lang === 'de') return original;

  let result = original;
  for (const term of terms) {
    const match = result.match(term.pattern);
    if (!match || match.index === undefined) continue;

    const replacement = term.translations[lang];
    if (!replacement) continue;

    const atStart = match.index === 0;
    const text = atStart
      ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
      : replacement.charAt(0).toLowerCase() + replacement.slice(1);

    result =
      result.slice(0, match.index) + text + result.slice(match.index + match[0].length);
  }

  return result.replace(/\s{2,}/g, ' ').trim();
}

/** Zubehörname ("Ortlieb Fahrradtaschen"). */
export function translateAccessoryName(
  name: string | null | undefined,
  lang: SupportedLanguageCode,
): string {
  return translateTerms(name, lang, TERMS);
}

/** Fahrradname aus dem Bestand ("20 zoll Kinder Fahrrad") und Typ-Chips ("Kinderrad"). */
export function translateBikeText(
  value: string | null | undefined,
  lang: SupportedLanguageCode,
): string {
  return translateTerms(value, lang, BIKE_TERMS);
}
