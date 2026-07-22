import { Language } from './translation.service';

/**
 * Ausflugsziele rund um Freiburg, die sich per Fahrrad erreichen lassen —
 * Seen, Tiergehege, Aussichtspunkte und schöne Orte, vor allem für Familien.
 *
 * Aufbau bewusst wie bei [[bike-tours.data]]: sprachneutrale Fakten getrennt
 * vom übersetzten Text. Start ist Deutsch; weitere Sprachen fallen bis zur
 * Übersetzung auf Deutsch zurück.
 *
 * Bilder: `image` zeigt auf /assets/ausflugsziele/<id>.jpg. Fehlt die Datei,
 * rendert die Komponente einen gestylten Platzhalter. `credit` trägt die für
 * CC-Bilder (z. B. Wikimedia Commons) verpflichtende Namensnennung — bleibt
 * leer, solange das Bild ein Platzhalter ist.
 */

export type ZielKategorie =
  | 'see'
  | 'tiergehege'
  | 'aussicht'
  | 'dorf'
  | 'natur';

export type ZielSchwierigkeit = 'leicht' | 'mittel' | 'anspruchsvoll';

/** Bildnachweis für CC-lizenzierte Fotos (Pflicht bei Wikimedia Commons). */
export interface Bildnachweis {
  autor: string;
  lizenz: string; // z. B. "CC BY-SA 4.0"
  quelleUrl: string;
  titel?: string;
}

/** Sprachneutrale Fakten zu einem Ausflugsziel. */
export interface ZielFakten {
  id: string;
  image: string;
  credit?: Bildnachweis;
  /** Luftlinie/Radweg ab Freiburg-Zentrum, grob (km). */
  distanzKm: number;
  schwierigkeit: ZielSchwierigkeit;
  /** Familienfreundlichkeit 1–3 (3 = besonders geeignet). */
  familie: 1 | 2 | 3;
  /** Kann man dort baden? */
  baden: boolean;
  /** Optionaler Kartenlink (Google Maps o. Ä.). */
  mapUrl?: string;
}

/** Übersetzbarer Text zu einem Ziel. */
export interface ZielText {
  name: string;
  kategorieLabel: string;
  kurz: string;
  beschreibung: string;
  highlights: string[];
  tipp: string;
}

export interface AusflugszielePageText {
  metaTitle: string;
  metaDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  introHeading: string;
  introText: string;
  badgeFamily: string;
  badgeBathing: string;
  labelDistance: string;
  labelDifficulty: string;
  labelBathing: string;
  labelBathingYes: string;
  labelBathingNo: string;
  difficultyEasy: string;
  difficultyMedium: string;
  difficultyHard: string;
  unitKm: string;
  mapLink: string;
  photoBy: string;
  ctaHeading: string;
  ctaText: string;
  ctaButton: string;
  ziele: Record<string, ZielText>;
}

// ─────────────────────────────────────────────────────────────
// Sprachneutrale Fakten (Reihenfolge = Anzeige-Reihenfolge)
// ─────────────────────────────────────────────────────────────
export const AUSFLUGSZIELE_FAKTEN: ZielFakten[] = [
  {
    id: 'seepark',
    image: '/assets/ausflugsziele/seepark.jpg',
    credit: {
      autor: 'CrazyD',
      lizenz: 'CC BY-SA 3.0',
      quelleUrl: 'https://commons.wikimedia.org/wiki/File:Fl%C3%BCckiger_See_1.jpg',
    },
    distanzKm: 4,
    schwierigkeit: 'leicht',
    familie: 3,
    baden: true,
    mapUrl: 'https://maps.google.com/?q=Seepark+Freiburg',
  },
  {
    id: 'mundenhof',
    image: '/assets/ausflugsziele/mundenhof.jpg',
    distanzKm: 7,
    schwierigkeit: 'leicht',
    familie: 3,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=Mundenhof+Freiburg',
  },
  {
    id: 'opfinger-see',
    image: '/assets/ausflugsziele/opfinger-see.jpg',
    distanzKm: 9,
    schwierigkeit: 'leicht',
    familie: 3,
    baden: true,
    mapUrl: 'https://maps.google.com/?q=Opfinger+See',
  },
  {
    id: 'tunisee',
    image: '/assets/ausflugsziele/tunisee.jpg',
    distanzKm: 10,
    schwierigkeit: 'leicht',
    familie: 3,
    baden: true,
    mapUrl: 'https://maps.google.com/?q=Tunisee',
  },
  {
    id: 'dietenbachsee',
    image: '/assets/ausflugsziele/dietenbachsee.jpg',
    distanzKm: 5,
    schwierigkeit: 'leicht',
    familie: 3,
    baden: true,
    mapUrl: 'https://maps.google.com/?q=Dietenbachsee+Freiburg',
  },
  {
    id: 'waldsee',
    image: '/assets/ausflugsziele/waldsee.jpg',
    distanzKm: 3,
    schwierigkeit: 'leicht',
    familie: 3,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=Waldsee+Freiburg',
  },
  {
    id: 'moosweiher',
    image: '/assets/ausflugsziele/moosweiher.jpg',
    distanzKm: 6,
    schwierigkeit: 'leicht',
    familie: 2,
    baden: true,
    mapUrl: 'https://maps.google.com/?q=Moosweiher+Freiburg',
  },
  {
    id: 'schlossberg',
    image: '/assets/ausflugsziele/schlossberg.jpg',
    credit: {
      autor: 'Zerohund',
      lizenz: 'CC BY-SA 3.0',
      quelleUrl:
        'https://commons.wikimedia.org/wiki/File:Freiburg_Schlossbergturm_von_Eichhalde_Oktober_2009.JPG',
    },
    distanzKm: 2,
    schwierigkeit: 'mittel',
    familie: 2,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=Schlossberg+Freiburg',
  },
  {
    id: 'glottertal',
    image: '/assets/ausflugsziele/glottertal.jpg',
    distanzKm: 12,
    schwierigkeit: 'mittel',
    familie: 2,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=Glottertal',
  },
  {
    id: 'kaiserstuhl',
    image: '/assets/ausflugsziele/kaiserstuhl.jpg',
    credit: {
      autor: 'Wladyslaw Sojka',
      lizenz: 'CC BY-SA 3.0',
      quelleUrl: 'https://commons.wikimedia.org/wiki/File:Kaiserstuhl_Totenkopf.JPG',
    },
    distanzKm: 20,
    schwierigkeit: 'anspruchsvoll',
    familie: 2,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=Kaiserstuhl',
  },
  {
    id: 'staufen',
    image: '/assets/ausflugsziele/staufen.jpg',
    credit: {
      autor: 'W. Bulach',
      lizenz: 'CC BY-SA 4.0',
      quelleUrl:
        'https://commons.wikimedia.org/wiki/File:00_3319_Burgruine_Staufen_bei_der_Stadt_Staufen_im_Breisgau.jpg',
    },
    distanzKm: 20,
    schwierigkeit: 'mittel',
    familie: 2,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=Staufen+im+Breisgau',
  },
  {
    id: 'breisach',
    image: '/assets/ausflugsziele/breisach.jpg',
    credit: {
      autor: 'Rémi Stosskopf',
      lizenz: 'CC BY-SA 3.0',
      quelleUrl: 'https://commons.wikimedia.org/wiki/File:Breisach_et_le_Rhin.JPG',
    },
    distanzKm: 25,
    schwierigkeit: 'mittel',
    familie: 2,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=Breisach+am+Rhein',
  },
  {
    id: 'st-peter',
    image: '/assets/ausflugsziele/st-peter.jpg',
    distanzKm: 25,
    schwierigkeit: 'anspruchsvoll',
    familie: 2,
    baden: false,
    mapUrl: 'https://maps.google.com/?q=St.+Peter+Schwarzwald',
  },
  {
    id: 'titisee',
    image: '/assets/ausflugsziele/titisee.jpg',
    credit: {
      autor: 'Runner1928',
      lizenz: 'CC BY-SA 3.0',
      quelleUrl: 'https://commons.wikimedia.org/wiki/File:Titisee_Rundfahrt.JPG',
    },
    distanzKm: 35,
    schwierigkeit: 'anspruchsvoll',
    familie: 3,
    baden: true,
    mapUrl: 'https://maps.google.com/?q=Titisee',
  },
  {
    id: 'schluchsee',
    image: '/assets/ausflugsziele/schluchsee.jpg',
    credit: {
      autor: 'Filzstift',
      lizenz: 'Gemeinfrei',
      quelleUrl: 'https://commons.wikimedia.org/wiki/File:Schluchsee.jpg',
    },
    distanzKm: 45,
    schwierigkeit: 'anspruchsvoll',
    familie: 3,
    baden: true,
    mapUrl: 'https://maps.google.com/?q=Schluchsee',
  },
];

// ─────────────────────────────────────────────────────────────
// Texte — Start: Deutsch. Weitere Sprachen später.
// ─────────────────────────────────────────────────────────────
const DE: AusflugszielePageText = {
  metaTitle:
    'Ausflugsziele mit dem Fahrrad rund um Freiburg — 15 schöne Orte für Familien',
  metaDescription:
    'Seen, Tiergehege und Aussichtspunkte rund um Freiburg, bequem mit dem Fahrrad erreichbar. 15 familienfreundliche Ausflugsziele mit Entfernung, Schwierigkeit und Tipps.',
  heroKicker: 'Freiburg & Umgebung',
  heroTitle: 'Die schönsten Ausflugsziele mit dem Fahrrad',
  heroSub:
    'Baden, Tiere, Weinberge und Schwarzwald — 15 lohnende Ziele rund um Freiburg, die sich prima mit dem Rad erkunden lassen. Ideal für Familien.',
  introHeading: 'Raus aus der Stadt — rein in die Natur',
  introText:
    'Freiburg liegt mitten zwischen Rhein, Kaiserstuhl und Schwarzwald. Viele der schönsten Plätze erreichst du in wenigen Minuten mit dem Rad: Badeseen zum Abkühlen, ein großes Tiergehege für Kinder, Weinberge mit Fernsicht und kleine Schwarzwalddörfer. Wir haben 15 Ziele zusammengestellt — von der leichten Familienrunde bis zur sportlichen Tour. Passende Miet- und E-Bikes gibt es bei uns im Bike Haus.',
  badgeFamily: 'Besonders familienfreundlich',
  badgeBathing: 'Baden möglich',
  labelDistance: 'Ab Freiburg',
  labelDifficulty: 'Anfahrt',
  labelBathing: 'Baden',
  labelBathingYes: 'Ja',
  labelBathingNo: 'Nein',
  difficultyEasy: 'Leicht',
  difficultyMedium: 'Mittel',
  difficultyHard: 'Anspruchsvoll',
  unitKm: 'km',
  mapLink: 'Auf der Karte ansehen',
  photoBy: 'Foto',
  ctaHeading: 'Noch kein passendes Rad?',
  ctaText:
    'Ob City-Bike für die Runde um den See oder E-Bike für den Schwarzwald — bei uns findest du das richtige Rad zum Mieten.',
  ctaButton: 'Fahrrad mieten',
  ziele: {
    seepark: {
      name: 'Seepark & Flückiger See',
      kategorieLabel: 'Stadtsee',
      kurz: 'Der grüne Wohnzimmer-See mitten in Freiburg.',
      beschreibung:
        'Der Seepark im Stadtteil Betzenhausen ist der beliebteste Erholungsort der Freiburger. Rund um den Flückiger See gibt es große Liegewiesen, Spielplätze, ein japanisches Gartenareal und einen Biergarten. Zum Baden, Tretbootfahren oder einfach zum Faulenzen — in nur wenigen Radminuten vom Zentrum.',
      highlights: [
        'Große Liegewiesen und Badebereich',
        'Spielplätze und Tretbootverleih',
        'Café und Biergarten am Wasser',
      ],
      tipp: 'Über den Dreisamradweg staufrei und fast eben zu erreichen.',
    },
    mundenhof: {
      name: 'Mundenhof',
      kategorieLabel: 'Tiergehege',
      kurz: 'Größtes Tiergehege der Region — Eintritt frei.',
      beschreibung:
        'Der Mundenhof ist Freiburgs großes Tiergehege mit Kamelen, Zebras, Ziegen, Ponys und vielen weiteren Tieren auf weitläufigem Gelände. Der Eintritt ist frei, es gibt Spielplätze, einen großen Streichelbereich und ein Café. Ein Klassiker für Familien mit Kindern.',
      highlights: [
        'Freier Eintritt, große Anlage',
        'Streichelgehege und Spielplätze',
        'Flache, sichere Anfahrt durchs Rieselfeld',
      ],
      tipp: 'Morgens kommen — dann sind die Tiere am aktivsten.',
    },
    'opfinger-see': {
      name: 'Opfinger See',
      kategorieLabel: 'Badesee',
      kurz: 'Klarer Badesee am Fuß des Tuniberg.',
      beschreibung:
        'Der Opfinger See westlich der Stadt ist ein gepflegter Badesee mit Liegewiesen und flachem Einstieg — gut für Familien. Rundherum führt ein schöner Weg, ideal für eine kleine Radrunde. Das Wasser gilt als besonders klar.',
      highlights: [
        'Flacher Einstieg, ideal für Kinder',
        'Umrundung per Rad möglich',
        'Nah am Tuniberg mit seinen Weinbergen',
      ],
      tipp: 'Mit einem Abstecher zum Tuniberg lässt sich der Ausflug verlängern.',
    },
    tunisee: {
      name: 'Tunisee',
      kategorieLabel: 'Badesee',
      kurz: 'Großer Badesee mit Sandstrand.',
      beschreibung:
        'Der Tunisee bei Hochdorf ist einer der größten Badeseen der Umgebung — mit Sandstrand, Liegewiesen und Freizeitangeboten. An heißen Tagen ein beliebtes Ziel, gut über flache Radwege erreichbar.',
      highlights: [
        'Sandstrand und weitläufige Wiesen',
        'Gastronomie vor Ort',
        'Ebene Anfahrt über Feld- und Radwege',
      ],
      tipp: 'An Wochenenden früh da sein, dann gibt es die besten Plätze.',
    },
    dietenbachsee: {
      name: 'Dietenbachsee',
      kategorieLabel: 'Badesee',
      kurz: 'Baden und Spielen im Dietenbachpark.',
      beschreibung:
        'Der Dietenbachsee liegt im großen Dietenbachpark im Westen der Stadt. Baden, Grillen, Spielplätze und viel Platz zum Toben — und das ganz nah am Zentrum. Ein entspanntes Familienziel ohne weite Anfahrt.',
      highlights: [
        'Badesee mit Liegewiesen',
        'Großer Park zum Spielen und Grillen',
        'Sehr kurze, ebene Anfahrt',
      ],
      tipp: 'Grill mitnehmen — Grillen ist in ausgewiesenen Bereichen erlaubt.',
    },
    waldsee: {
      name: 'Waldsee',
      kategorieLabel: 'Idylle',
      kurz: 'Romantischer kleiner See am Waldrand.',
      beschreibung:
        'Der Waldsee am östlichen Stadtrand ist ein idyllischer kleiner See mit traditionsreichem Café direkt am Wasser. Baden ist hier nicht erlaubt, aber der Ort ist perfekt für eine kurze, ruhige Radrunde mit Einkehr und Blick auf die Enten.',
      highlights: [
        'Historisches Café direkt am See',
        'Ruhige Lage am Waldrand',
        'Sehr kurze Anfahrt vom Zentrum',
      ],
      tipp: 'Guter Startpunkt für eine Tour Richtung Schwarzwald.',
    },
    moosweiher: {
      name: 'Moosweiher',
      kategorieLabel: 'Badesee',
      kurz: 'Kleiner Badesee im Grünen im Stadtteil Landwasser.',
      beschreibung:
        'Der Moosweiher ist ein ruhiger Badesee im Nordwesten Freiburgs, umgeben von Wiesen und Bäumen. Weniger überlaufen als die großen Seen und gut für eine entspannte Abkühlung nach einer kleinen Runde.',
      highlights: [
        'Ruhiger als die großen Badeseen',
        'Liegewiesen und Schatten',
        'Ebene Anfahrt',
      ],
      tipp: 'Ideal für einen Feierabend-Sprung ins Wasser.',
    },
    schlossberg: {
      name: 'Schlossberg',
      kategorieLabel: 'Aussicht',
      kurz: 'Hausberg mit Aussichtsturm über der Altstadt.',
      beschreibung:
        'Der Schlossberg erhebt sich direkt über der Freiburger Altstadt. Bis zum Fuß rollst du in wenigen Minuten, hoch geht es zu Fuß oder — sportlich — mit dem E-MTB. Oben belohnen der Aussichtsturm und Blicke über Stadt, Rheinebene und Schwarzwald.',
      highlights: [
        'Panoramablick über Freiburg',
        'Aussichtsturm und Waldwege',
        'Einkehr im Biergarten Kastaniengarten',
      ],
      tipp: 'Das Rad unten sicher anschließen und den letzten Teil zu Fuß gehen.',
    },
    glottertal: {
      name: 'Glottertal',
      kategorieLabel: 'Tal & Weinberge',
      kurz: 'Weinberge, Fachwerk und Schwarzwald-Idylle.',
      beschreibung:
        'Das Glottertal nordöstlich von Freiburg ist bekannt für seine steilen Weinberge, urige Straußwirtschaften und die typische Schwarzwaldlandschaft. Eine wunderschöne, leicht ansteigende Strecke — ein E-Bike macht die Sache besonders entspannt.',
      highlights: [
        'Weinberge und Straußwirtschaften',
        'Fachwerkorte und Schwarzwaldflair',
        'Schöne Strecke entlang der Glotter',
      ],
      tipp: 'Mit dem E-Bike lässt sich das Tal ganz entspannt hinauffahren.',
    },
    kaiserstuhl: {
      name: 'Kaiserstuhl',
      kategorieLabel: 'Weinberge',
      kurz: 'Wärmstes Weinbaugebiet mit Fernsicht.',
      beschreibung:
        'Der Kaiserstuhl ist ein kleines Vulkangebirge in der Rheinebene, berühmt für Wein, Terrassen und seltene Tier- und Pflanzenarten. Von den Höhen reicht der Blick weit über die Ebene bis zu den Vogesen. Eine lohnende, sportliche Tour — ideal mit dem E-Bike.',
      highlights: [
        'Weinterrassen und weite Ausblicke',
        'Besonders artenreiche Natur',
        'Gemütliche Winzerorte zur Einkehr',
      ],
      tipp: 'Der Kaiserstuhl-Radweg verbindet die schönsten Orte auf ebener Strecke.',
    },
    staufen: {
      name: 'Staufen im Breisgau',
      kategorieLabel: 'Städtchen',
      kurz: 'Malerisches Fauststädtchen mit Burgruine.',
      beschreibung:
        'Das kleine Staufen südlich von Freiburg besticht mit einer hübschen Altstadt, Weinbergen und der Burgruine über dem Ort. Die Anfahrt durch das Markgräflerland ist überwiegend flach und schön — ein perfektes Ausflugsziel mit Einkehr.',
      highlights: [
        'Charmante Altstadt und Marktplatz',
        'Burgruine mit Aussicht',
        'Flache Anfahrt durchs Markgräflerland',
      ],
      tipp: 'Bäckereien und Cafés am Marktplatz laden zur Pause ein.',
    },
    breisach: {
      name: 'Breisach am Rhein',
      kategorieLabel: 'Am Rhein',
      kurz: 'Münsterberg mit Blick über den Rhein.',
      beschreibung:
        'Breisach liegt direkt am Rhein, gekrönt vom St.-Stephans-Münster hoch über der Stadt. Vom Münsterberg reicht der Blick über den Fluss bis ins Elsass. Die überwiegend flache Strecke dorthin führt durch Felder und Weinorte.',
      highlights: [
        'St.-Stephans-Münster mit Rheinblick',
        'Rheinpromenade und Fähre nach Frankreich',
        'Flache Anfahrt durch die Rheinebene',
      ],
      tipp: 'Von hier lässt sich ein Abstecher in den Kaiserstuhl anhängen.',
    },
    'st-peter': {
      name: 'St. Peter',
      kategorieLabel: 'Schwarzwalddorf',
      kurz: 'Barockdorf hoch über dem Dreisamtal.',
      beschreibung:
        'St. Peter im Hochschwarzwald ist berühmt für sein prächtiges Barockkloster und die weite Landschaft ringsum. Der Weg hinauf ist sportlich, die Aussicht und die Ruhe oben aber jede Kurbelumdrehung wert. Mit E-Bike gut machbar.',
      highlights: [
        'Barocke Klosteranlage',
        'Weite Wiesen und Fernblicke',
        'Traumhafte Abfahrt zurück ins Tal',
      ],
      tipp: 'Als Runde über St. Märgen und den Wagensteigpass planen.',
    },
    titisee: {
      name: 'Titisee',
      kategorieLabel: 'Schwarzwaldsee',
      kurz: 'Der berühmteste See des Schwarzwalds.',
      beschreibung:
        'Der Titisee ist das Postkarten-Ziel im Hochschwarzwald: ein glasklarer See, umgeben von bewaldeten Höhen, mit Promenade, Bootsverleih und vielen Cafés. Die Anfahrt per Rad ist anspruchsvoll — entspannter wird es mit Bahn bis Titisee und Rad ab dort.',
      highlights: [
        'Baden und Bootfahren im klaren See',
        'Promenade mit Cafés und Läden',
        'Kombination Bahn + Rad ideal',
      ],
      tipp: 'Rad in der Regionalbahn mitnehmen und erst am See starten.',
    },
    schluchsee: {
      name: 'Schluchsee',
      kategorieLabel: 'Schwarzwaldsee',
      kurz: 'Größter See des Schwarzwalds mit Rundweg.',
      beschreibung:
        'Der Schluchsee ist der größte See im Schwarzwald und liegt am höchsten — ideal zum Baden, Segeln und für eine Umrundung mit dem Rad. Rundherum führt ein weitgehend autofreier Weg durch Wald und über sonnige Ufer. Am besten mit Bahn und Rad kombinieren.',
      highlights: [
        'Rundweg um den gesamten See',
        'Baden und Wassersport',
        'Gut mit der Bahn erreichbar',
      ],
      tipp: 'Die Seeumrundung ist rund 18 km lang und meist eben.',
    },
  },
};

/**
 * Text pro Sprache. Start ist Deutsch; die Komponente fällt für alle anderen
 * Sprachen auf Deutsch zurück (`?? AUSFLUGSZIELE_TEXT.de`). Übersetzungen werden
 * hier ergänzt, ohne dass fehlende Sprachen den Build brechen.
 */
export const AUSFLUGSZIELE_TEXT: Partial<
  Record<Language, AusflugszielePageText>
> = {
  de: DE,
};
