import { Language } from './translation.service';

export type TourDifficulty = 'easy' | 'moderate' | 'hard';
export type RentalBikeKind = 'city' | 'trekking' | 'e-bike' | 'e-mtb' | 'road';

/** Language-neutral facts for one tour (stored once). */
export interface BikeTourFacts {
  id: string;
  svg: string;
  distanceKm: number;
  elevationGainM: number;
  difficulty: TourDifficulty;
  recommendedBike: RentalBikeKind;
  externalUrl: string;
}

/** Per-language text for one tour. */
export interface BikeTourText {
  name: string;
  startPoint: string;
  durationText: string;
  description: string;
  bestFor: string;
  highlights: string[];
  externalLabel: string;
}

export interface BikeToursTip {
  title: string;
  text: string;
}

/** Per-language page chrome + the per-route text map. */
export interface BikeToursPageText {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSub: string;
  badge1: string;
  badge2: string;
  badge3: string;
  introHeading: string;
  introText: string;
  labelDistance: string;
  labelElevation: string;
  labelDuration: string;
  labelBestFor: string;
  labelRecommended: string;
  unitKm: string;
  unitM: string;
  difficultyEasy: string;
  difficultyModerate: string;
  difficultyHard: string;
  bikeCity: string;
  bikeTrekking: string;
  bikeEbike: string;
  bikeEmtb: string;
  bikeRoad: string;
  highlightsHeading: string;
  rentThisBike: string;
  tipsHeading: string;
  tips: BikeToursTip[];
  guideLinkText: string;
  guideLinkLabel: string;
  ctaHeading: string;
  ctaText: string;
  ctaButton: string;
  ctaSecondary: string;
  routes: Record<string, BikeTourText>;
}

/** Language-neutral route facts. Order = display order on the page. */
export const BIKE_TOURS_FACTS: BikeTourFacts[] = [
  {
    id: 'dreisamtal-radweg',
    svg: 'river-dreisamtal.svg',
    distanceKm: 39,
    elevationGainM: 372,
    difficulty: 'easy',
    recommendedBike: 'trekking',
    externalUrl:
      'https://www.schwarzwald-tourismus.info/touren/dreisamtal-radwanderweg-a680048de4',
  },
  {
    id: 'opfinger-see-mooswald-rieselfeld',
    svg: 'lake-opfinger.svg',
    distanceKm: 18,
    elevationGainM: 40,
    difficulty: 'easy',
    recommendedBike: 'city',
    externalUrl: 'https://www.komoot.com/de-de/highlight/159890',
  },
  {
    id: 'tuniberg-vineyard-loop',
    svg: 'vineyard-tuniberg.svg',
    distanceKm: 32,
    elevationGainM: 220,
    difficulty: 'easy',
    recommendedBike: 'trekking',
    externalUrl:
      'https://www.schwarzwald-tourismus.info/touren/tuniberg-tour-9a6f7c73ea',
  },
  {
    id: 'kaiserstuhl-weinradweg',
    svg: 'winehills-kaiserstuhl.svg',
    distanceKm: 52,
    elevationGainM: 350,
    difficulty: 'moderate',
    recommendedBike: 'e-bike',
    externalUrl:
      'https://www.outdooractive.com/en/cycle-routes/vogtsburg-in-the-kaiserstuhl/cycling-in-vogtsburg-in-the-kaiserstuhl/1429459/',
  },
  {
    id: 'glottertal-valley-loop',
    svg: 'forest-glottertal.svg',
    distanceKm: 44,
    elevationGainM: 480,
    difficulty: 'moderate',
    recommendedBike: 'e-bike',
    externalUrl:
      'https://www.outdooractive.com/en/cycle-routes/glottertal/cycling-in-glottertal/1433771/',
  },
  {
    id: 'schauinsland-climb-freiburg',
    svg: 'mountain-schauinsland.svg',
    distanceKm: 17.9,
    elevationGainM: 927,
    difficulty: 'hard',
    recommendedBike: 'road',
    externalUrl: 'https://www.quaeldich.de/paesse/schauinsland/',
  },
  {
    id: 'freiburg-breisach-rhein',
    svg: 'rhine-breisach.svg',
    distanceKm: 35,
    elevationGainM: 100,
    difficulty: 'moderate',
    recommendedBike: 'e-bike',
    externalUrl: 'https://www.komoot.com/smarttour/2342267',
  },
];

const DE: BikeToursPageText = {
  metaTitle:
    'Fahrradtouren Freiburg & Umgebung — die 7 schönsten Radtouren | Bike Haus',
  metaDescription:
    'Die schönsten Fahrradtouren rund um Freiburg: Dreisamtal, Kaiserstuhl, Schauinsland & mehr — mit Distanz, Höhenmetern & Schwierigkeit. Passendes Leihrad direkt mieten.',
  heroTitle: 'Fahrradtouren in Freiburg & Umgebung',
  heroSub:
    'Vom flachen Dreisamtal bis zum Schauinsland-Gipfel: 7 handverlesene Radtouren durch Schwarzwald, Kaiserstuhl und Rheinebene — für jede Kondition. Das passende Leihrad gibt es bei uns.',
  badge1: '7 Touren',
  badge2: 'Alle Schwierigkeiten',
  badge3: 'Schwarzwald & Kaiserstuhl',
  introHeading: 'Freiburg — eine der schönsten Fahrradregionen Deutschlands',
  introText:
    'Freiburg liegt perfekt zwischen Schwarzwald, Kaiserstuhl und Rheinebene — kaum eine andere Stadt bietet so viele Radtouren direkt vor der Haustür. Ob entspannte Familienrunde am Fluss, Weinberg-Genusstour oder knackiger Berganstieg: Hier sind unsere 7 Lieblingstouren mit allen Eckdaten. Kein eigenes Rad dabei? Bei Bike Haus Freiburg mieten Sie City-, Trekking- und E-Bikes — mit Helm und Schloss, zu fairen Tagespreisen und ohne Termin.',
  labelDistance: 'Distanz',
  labelElevation: 'Höhenmeter',
  labelDuration: 'Dauer',
  labelBestFor: 'Ideal für',
  labelRecommended: 'Empfohlenes Rad',
  unitKm: 'km',
  unitM: 'Hm',
  difficultyEasy: 'Leicht',
  difficultyModerate: 'Mittel',
  difficultyHard: 'Schwer',
  bikeCity: 'City-Bike',
  bikeTrekking: 'Trekkingrad',
  bikeEbike: 'E-Bike',
  bikeEmtb: 'E-Mountainbike',
  bikeRoad: 'Rennrad',
  highlightsHeading: 'Highlights',
  rentThisBike: 'Passendes Rad mieten',
  tipsHeading: 'Praktische Tipps für deine Radtour',
  tips: [
    {
      title: 'Beste Reisezeit',
      text: 'Mai bis Oktober ist ideal. Die Weinberge am Kaiserstuhl leuchten im Herbst, das Dreisamtal bleibt auch im Hochsommer schattig und kühl.',
    },
    {
      title: 'Was mitnehmen',
      text: 'Helm (bei uns inklusive), Wasser, Sonnenschutz und etwas Bargeld für Hofläden und Straußwirtschaften. Für Bergtouren eine leichte Jacke.',
    },
    {
      title: 'Start & Anreise',
      text: 'Viele Touren starten am Freiburger Hauptbahnhof oder direkt bei uns in der Heckerstraße 27. Mit der S-Bahn ins Dreisamtal oder zum Kaiserstuhl spart Höhenmeter.',
    },
    {
      title: 'E-Bike für mehr Reichweite',
      text: 'Kaiserstuhl, Glottertal oder Schauinsland mit Rückenwind? Mit einem Miet-E-Bike schaffst du auch lange Touren entspannt — bis zu 100 km Reichweite.',
    },
  ],
  guideLinkText:
    'Noch mehr Routen, Karten und Tipps findest du in unserem',
  guideLinkLabel: 'Radfahren-in-Freiburg-Ratgeber',
  ctaHeading: 'Bereit für deine Tour? Wir haben das passende Rad dazu.',
  ctaText:
    'Ob City-Bike für die Dreisam-Runde oder E-Bike für den Kaiserstuhl — bei Bike Haus Freiburg mietest du genau das richtige Rad. Mit Helm und Schloss, fairen Tagespreisen und ohne Termin. Reserviere online oder komm direkt in der Heckerstraße 27 vorbei.',
  ctaButton: 'Jetzt Fahrrad mieten',
  ctaSecondary: 'Alle Leihräder ansehen',
  routes: {
    'dreisamtal-radweg': {
      name: 'Dreisamtal-Radweg — von Freiburg ins Schwarzwald-Tor',
      startPoint: 'Freiburg Hauptbahnhof',
      durationText: '2,5–3,5 Std.',
      description:
        'Ab dem Freiburger Hauptbahnhof folgt die Tour flussaufwärts der Dreisam durch saftige Wiesen und typische Schwarzwälder Höfe bis nach Kirchzarten und weiter in die Dörfer Oberried und Buchenbach. Mit nur rund 370 Höhenmetern auf 39 Kilometern ist die Steigung sanft genug für Kinder und entspannte Radler. Unterwegs laden Hofläden mit regionalem Honig und Obst ein, die Klosterkirche samt Kräutergarten in Oberried bietet eine schöne Pause, und das Dreisambad Kirchzarten lockt im Sommer zur erfrischenden Abkühlung, bevor es flussabwärts zurück in die Stadt geht.',
      bestFor: 'Familien, Freizeitradler und alle, die zum ersten Mal ins Dreisamtal fahren',
      highlights: [
        'Dreisamuferradweg ab der Freiburger Innenstadt durch Littenweiler',
        'Ortsteil Himmelreich — idyllische Raststelle mit traditionellem Gasthaus',
        'Klosterkirche und Kräutergarten in Oberried',
        'Hofläden am Baldenwegerhof mit regionalen Schwarzwälder Produkten',
        'Dreisambad Kirchzarten — erfrischender Badestopp im Sommer',
      ],
      externalLabel: 'Route auf Schwarzwald Tourismus',
    },
    'opfinger-see-mooswald-rieselfeld': {
      name: 'Opfinger See & Mooswald-Runde',
      startPoint: 'Freiburg Rieselfeld (Tram 5 oder Parkplatz Mundenhof)',
      durationText: '1,5–2,5 Std.',
      description:
        'Diese flache, fast autofreie Runde führt westlich von Freiburg durch den schattigen Mooswald — einen der größten zusammenhängenden Wälder der Oberrheinebene — und endet am funkelnden Opfinger See, einem 48 Hektar großen Baggersee mit EU-ausgezeichneter Wasserqualität und breiten Liegewiesen für einen Badestopp im Sommer. Der Rückweg führt durch das Rieselfeld, ein ehemaliges Klärfeld, das heute als Naturschutzgebiet seltene Vogelarten beherbergt, und streift den kostenlosen Mundenhof-Tierpark — ein Highlight für Familien mit Kindern. Mit gerade einmal rund 40 Höhenmetern ist diese Tour für jedermann geeignet.',
      bestFor: 'Familien mit Kindern, Einsteiger und alle, die eine entspannte Halbtagesrunde mit Badestopp suchen',
      highlights: [
        'Mooswald — schattige Wege durch einen der größten Wälder der Oberrheinebene',
        'Waltershofener See — stiller Waldsee, ideal für Vogelbeobachtung',
        'Opfinger See — Baggersee mit ausgezeichneter Wasserqualität und Badestelle',
        'Rieselfeld-Naturschutzgebiet — Lebensraum seltener Feuchtlandvögel',
        'Mundenhof — kostenloser Tier- und Naturerlebnispark',
      ],
      externalLabel: 'Opfinger See auf Komoot',
    },
    'tuniberg-vineyard-loop': {
      name: 'Tuniberg-Weinberg-Rundtour',
      startPoint: 'Freiburg-Munzingen',
      durationText: '2,5–3,5 Std.',
      description:
        'Der Tuniberg, ein sanfter Kalksteinrücken auf 312 Metern westlich von Freiburg, ist der stille Geheimtipp unter den Weinberg-Radrouten der Region — kleiner und ruhiger als der Kaiserstuhl, aber ebenso reich an Burgunder-Reben, rosengesäumten Wegen und weiten Ausblicken. Die Rundtour verbindet die Freiburger Stadtteile Munzingen, Tiengen und Opfingen mit den Winzerdörfern Merdingen und Gottenheim auf gut ausgeschilderten, überwiegend asphaltierten Radwegen. An klaren Abenden bieten die Höhenwegpunkte ein beeindruckendes Panorama: westlich über die Rheinebene bis zu den Vogesen im Elsass, östlich zu den Schwarzwaldgipfeln — eine der schönsten Sonnenuntergangs-Radtouren rund um Freiburg.',
      bestFor: 'Familien, Weinliebhaber und Genussradler mit Sinn für Panoramablicke',
      highlights: [
        'Erentrudiskapelle oberhalb Munzingen — Wallfahrtskapelle mit Panoramablick ins Elsass',
        'Tunibergkreuz — Aussichtspunkt über Rheinebene, Kaiserstuhl, Vogesen und Schwarzwald',
        'Straußwirtschaften in Opfingen — Breisgauer Heurigenkultur mit Gutswein',
        'St.-Remigius-Kirche Merdingen — spätbarockes Meisterwerk (1738–1741)',
        'Burgunderpfad durch Gottenheim und Merdingen — Themenweg zu den Rebsorten',
      ],
      externalLabel: 'Tuniberg-Tour auf Schwarzwald Tourismus',
    },
    'kaiserstuhl-weinradweg': {
      name: 'Kaiserstuhl-Weinradweg',
      startPoint: 'Breisach am Rhein (Bahnhof)',
      durationText: '3–5 Std.',
      description:
        'Der Kaiserstuhl ist ein kompakter Vulkankegel, der bis auf 556 Meter über die Oberrheinebene nordwestlich von Freiburg aufragt und von Spätburgunder- und Grauburgunder-Reben bedeckt ist, die einige der wärmsten und charaktervollsten Weine Deutschlands ergeben. Die Rundtour führt durch goldfarbene Weinorte — Ihringen, Burkheim mit seinem mittelalterlichen Stadttor und die Vogtsburger Teilorte — entlang markanter Lösshohlen, die Jahrhunderte der Erosion tief in die Steilhänge gegraben haben. Höhepunkt ist der Texaspass, ein 1,7 km langer Anstieg mit durchschnittlich 7,5 % Steigung: Enge Kehren zwischen Oberbergen und Kiechlinsbergen belohnen mit einem Panoramablick über Weinbergterrassen bis zum Rhein und den Vogesen.',
      bestFor: 'Weinliebhaber und Genussradler, die vulkanische Reblandschaft mit wenig Verkehr genießen möchten',
      highlights: [
        'Texaspass — 1,7 km langer Profi-Anstieg (7,5 % Ø) mit Weinbergpanorama',
        'Burkheim — mittelalterlicher Weinort mit erhaltenem Stadttor und Straußwirtschaften',
        'Ihringen — sonnenreichste Gemeinde Deutschlands',
        'Lösshohlen — tiefe, von Erosion geformte Hohlwege in goldgelbe Lösswände',
        'Vogtsburg / Oberbergen — Herz des Vulkankegels mit Panoramablick',
      ],
      externalLabel: 'Kaiserstuhl-Route auf Outdooractive',
    },
    'glottertal-valley-loop': {
      name: 'Glottertal-Schleifen-Tour',
      startPoint: 'Freiburg Hauptbahnhof',
      durationText: '3–4 Std.',
      description:
        'Diese lohnende Rundtour verlässt Freiburg Richtung Norden durch die Rheinebenen-Dörfer Gundelfingen und Denzlingen, bevor sie ostwärts ins enge, bewaldete Glottertal abbiegt — ein Schwarzwald-Seitental, das durch die Kultserie Schwarzwaldklinik weltberühmt wurde. Der Anstieg entlang des Glotterbachs ist stetig, aber nie anstrengend, und belohnt Radler mit Weinbergen, Fachwerkhöfen und echter Schwarzwälder Abgeschiedenheit. Der Rückweg führt flach und entspannt am Dreisamradweg entlang — einem der schönsten Uferwege Baden-Württembergs — zurück nach Freiburg.',
      bestFor: 'Genussradler und E-Biker, die malerische Schwarzwaldtäler und eine entspannte Rückfahrt suchen',
      highlights: [
        'Schwarzwaldklinik in Glottertal — ikonischer Drehort der Kultserie',
        'Glotterbachtal — enge, bewaldete Schlucht mit Wiesen und Weinbergen',
        'Denzlingen und Gundelfingen — Rheinebenen-Dörfer mit lokalen Bäckereien',
        'Panoramablick auf den Kandel (1.241 m) beim Aufstieg ins Glottertal',
        'Dreisamradweg auf dem Rückweg — flacher, schattiger Uferweg in die Stadt',
      ],
      externalLabel: 'Glottertal auf Outdooractive',
    },
    'schauinsland-climb-freiburg': {
      name: 'Schauinsland-Auffahrt',
      startPoint: 'Freiburg, Johanneskirche / Günterstal',
      durationText: '1,5–3 Std.',
      description:
        'Die Schauinslandstraße — seit 1896 für den Verkehr geöffnet — ist Freiburgs bekannteste Radfahrerprüfung: 17,9 km reiner Asphalt und knapp 930 Höhenmeter vom Stadtrand bis zum 1.284 m hohen Gipfel des Hausbergs. Die ersten 6 km gleiten gemächlich durch den grünen Vorort Günterstal; nach Bohrer rollt die Straße in engen Haarnadelkurven durch den dichten Schwarzwälder Tannenwald, mit Rampen bis 12 %, bevor das Gelände an der Holzschlägermatte (910 m) aufreißt und der Blick über die Rheinebene bis zu den Vogesen schweift. An Sommerwochenenden ist die Schauinslandstraße teilweise für Autos gesperrt — Radfahrerparadies pur.',
      bestFor: 'Rennradfahrer und sportliche E-MTB-Fahrer, die einen klassischen Gipfelanstieg suchen',
      highlights: [
        'Günterstal — der grüne Vorort-Auftakt, ab dem der echte Anstieg beginnt',
        'Bohrer-Abzweig — Beginn der legendären Haarnadelkurven',
        'Holzschlägermatte (910 m) — erster Panoramablick über Rheinebene und Vogesen',
        'Schauinsland-Gipfel (1.284 m) — Bergstation der Seilbahn und Fernsicht bis zu den Alpen',
        'Schauinslandkönig — das historische Bergzeitfahren findet hier jeden Juli statt',
      ],
      externalLabel: 'Höhenprofil auf Quäldich',
    },
    'freiburg-breisach-rhein': {
      name: 'Freiburg nach Breisach am Rhein — Rheinebene & Weingärten',
      startPoint: 'Freiburg Hauptbahnhof',
      durationText: '2–3 Std.',
      description:
        'Vom Freiburger Hauptbahnhof führt die Route entlang des Dreisamradwegs nach Westen, bevor sie sich in die weite, sonnenreiche Rheinebene öffnet — vorbei an Obstgärten und Spargelfeldern bei Opfingen bis hin zum Altrhein mit seinen stillen Auenwäldern. In den letzten Kilometern erklimmt man den markanten Münsterberg, den Vulkankegel über Breisach, und wird mit einem atemberaubenden Panorama über den Rhein, den Kaiserstuhl und hinüber zum französischen Elsass mit der Vauban-Festungsstadt Neuf-Brisach belohnt. Auf dem Gipfel thront das romanisch-gotische Breisacher Münster St. Stephan, darunter lockt der historische Marktplatz.',
      bestFor: 'Radfahrende, die einen entspannten Tagesausflug mit Geschichte, Weinkultur und Rheinpanorama suchen — ideal mit dem E-Bike',
      highlights: [
        'Dreisamradweg ab Freiburg — schattiger, autofreier Einstieg durch die Stadtteile',
        'Rheinebene — Obstgärten, Spargelfelder und weiter Horizont',
        'Altrhein — stille Flussauen mit Auenwald und Vogelwelt',
        'Münsterberg-Aussichtspunkt — Panorama über Rhein, Kaiserstuhl und Vogesen',
        'Altstadt Breisach — Münster St. Stephan, Marktplatz und Weinstuben am Rhein',
      ],
      externalLabel: 'Route auf Komoot',
    },
  },
};

const EN: BikeToursPageText = {
  metaTitle:
    'Bike Tours Freiburg & Surroundings — the 7 Best Cycling Routes | Bike Haus',
  metaDescription:
    'The best bike tours around Freiburg: Dreisam Valley, Kaiserstuhl, Schauinsland & more — with distance, elevation & difficulty. Rent the right bike straight away.',
  heroTitle: 'Bike Tours in Freiburg & the Surrounding Region',
  heroSub:
    'From the flat Dreisam Valley to the Schauinsland summit: 7 hand-picked cycling routes through the Black Forest, Kaiserstuhl and Rhine plain — for every fitness level. The right rental bike is waiting at our shop.',
  badge1: '7 tours',
  badge2: 'All difficulty levels',
  badge3: 'Black Forest & Kaiserstuhl',
  introHeading: 'Freiburg — one of Germany’s finest cycling regions',
  introText:
    'Freiburg sits perfectly between the Black Forest, the Kaiserstuhl and the Rhine plain — few cities offer so many rides right on the doorstep. Whether you want a relaxed riverside family loop, a wine-country cruise or a punchy mountain climb, here are our 7 favourite tours with all the key figures. No bike with you? At Bike Haus Freiburg you can rent city, trekking and e-bikes — helmet and lock included, at fair daily rates and without an appointment.',
  labelDistance: 'Distance',
  labelElevation: 'Elevation',
  labelDuration: 'Duration',
  labelBestFor: 'Best for',
  labelRecommended: 'Recommended bike',
  unitKm: 'km',
  unitM: 'm',
  difficultyEasy: 'Easy',
  difficultyModerate: 'Moderate',
  difficultyHard: 'Hard',
  bikeCity: 'City bike',
  bikeTrekking: 'Trekking bike',
  bikeEbike: 'E-bike',
  bikeEmtb: 'E-mountain bike',
  bikeRoad: 'Road bike',
  highlightsHeading: 'Highlights',
  rentThisBike: 'Rent the right bike',
  tipsHeading: 'Practical tips for your bike tour',
  tips: [
    {
      title: 'Best time to go',
      text: 'May to October is ideal. The Kaiserstuhl vineyards glow in autumn, while the Dreisam Valley stays shaded and cool even in high summer.',
    },
    {
      title: 'What to bring',
      text: 'Helmet (included with our rentals), water, sun protection and some cash for farm shops and wine taverns. Pack a light jacket for mountain rides.',
    },
    {
      title: 'Start & getting there',
      text: 'Many tours start at Freiburg main station or right at our shop on Heckerstraße 27. Taking the regional train into the Dreisam Valley or to the Kaiserstuhl saves you elevation.',
    },
    {
      title: 'E-bike for more range',
      text: 'Kaiserstuhl, Glottertal or Schauinsland with a tailwind? A rental e-bike lets you tackle long tours in comfort — up to 100 km of range.',
    },
  ],
  guideLinkText: 'Find even more routes, maps and tips in our',
  guideLinkLabel: 'Cycling-in-Freiburg guide',
  ctaHeading: 'Ready for your tour? We have the bike for it.',
  ctaText:
    'A city bike for the Dreisam loop or an e-bike for the Kaiserstuhl — at Bike Haus Freiburg you rent exactly the right bike. Helmet and lock included, fair daily rates, no appointment needed. Book online or simply drop by at Heckerstraße 27.',
  ctaButton: 'Rent a bike now',
  ctaSecondary: 'See all rental bikes',
  routes: {
    'dreisamtal-radweg': {
      name: 'Dreisam Valley Cycle Path — from Freiburg to the Black Forest',
      startPoint: 'Freiburg Hauptbahnhof (main station)',
      durationText: '2.5–3.5 h',
      description:
        'Starting at Freiburg main station, this flat riverside route follows the Dreisam upstream through sun-dappled meadows and traditional Black Forest farmsteads all the way to Kirchzarten and on into the villages of Oberried and Buchenbach. With barely 370 metres of total ascent spread over 39 kilometres, the gradient is gentle enough for children and relaxed riders alike. Along the way, farm shops sell regional honey and fruit, the monastery church and herb garden in Oberried invite a short pause, and the Dreisambad open-air pool in Kirchzarten is a perfect summer finish before turning back downstream to Freiburg.',
      bestFor: 'Families, leisure cyclists and first-time Black Forest explorers',
      highlights: [
        'Dreisam riverside path from Freiburg city centre through Littenweiler',
        'Himmelreich hamlet — a charming rest stop with a traditional gasthaus',
        'Monastery church and herb garden in Oberried',
        'Farm shops at Baldenwegerhof selling regional Black Forest produce',
        'Dreisambad open-air pool in Kirchzarten for a summer swim',
      ],
      externalLabel: 'Route on Schwarzwald Tourismus',
    },
    'opfinger-see-mooswald-rieselfeld': {
      name: 'Opfinger See & Mooswald Forest Loop',
      startPoint: 'Freiburg Rieselfeld (Tram 5 stop or Mundenhof car park)',
      durationText: '1.5–2.5 h',
      description:
        'This flat, almost car-free loop runs west of Freiburg through the cool shade of the Mooswald, one of the largest contiguous forests of the Upper Rhine plain, before emerging at the Opfinger See — a glittering 48-hectare lake with EU-rated excellent water quality and wide sunbathing meadows perfect for a summer swim. The return leg threads through the Rieselfeld, a former sewage-field nature reserve now teeming with rare birds, and passes the free-entry Mundenhof animal park, making it an ideal detour for families. With only about 40 metres of total ascent, no fitness base is required whatsoever.',
      bestFor: 'Families with children, beginners and anyone after a relaxed half-day ride with a lake swim',
      highlights: [
        'Mooswald forest — shaded paths through one of the Upper Rhine’s largest forests',
        'Waltershofener See — a quiet forest lake, great for bird-watching',
        'Opfinger See — a lake with EU-certified excellent water quality and a swimming area',
        'Rieselfeld nature reserve — a protected habitat for rare wetland birds',
        'Mundenhof — free-entry animal and nature park',
      ],
      externalLabel: 'Opfinger See on Komoot',
    },
    'tuniberg-vineyard-loop': {
      name: 'Tuniberg Vineyard Loop',
      startPoint: 'Freiburg-Munzingen',
      durationText: '2.5–3.5 h',
      description:
        'The Tuniberg, a gentle limestone ridge rising to 312 metres west of Freiburg, is the region’s best-kept cycling secret — smaller and quieter than its volcanic neighbour the Kaiserstuhl, but equally rich in Burgundy-variety vines, flower-bordered lanes and far-reaching views. This loop connects the Freiburg districts of Munzingen, Tiengen and Opfingen with the wine villages of Merdingen and Gottenheim on well-signed, mostly paved paths. On clear evenings the ridge viewpoints deliver a sweeping panorama stretching west across the Rhine plain to the Vosges mountains in Alsace and east to the Black Forest peaks — one of the finest sunset rides in the Freiburg region.',
      bestFor: 'Families, wine lovers and leisure cyclists who enjoy panoramic views',
      highlights: [
        'Erentrudiskapelle above Munzingen — a pilgrimage chapel with panoramic views to Alsace',
        'Tunibergkreuz viewpoint — sightlines over the Rhine plain, Kaiserstuhl, Vosges and Black Forest',
        'Wine taverns in Opfingen — classic Breisgau Straußwirtschaft culture with estate wines',
        'St. Remigius church in Merdingen — a late-Baroque masterpiece (1738–1741)',
        'Burgunderpfad wine trail through Gottenheim and Merdingen — themed grape-variety panels',
      ],
      externalLabel: 'Tuniberg tour on Schwarzwald Tourismus',
    },
    'kaiserstuhl-weinradweg': {
      name: 'Kaiserstuhl Wine Tour',
      startPoint: 'Breisach am Rhein (train station)',
      durationText: '3–5 h',
      description:
        'The Kaiserstuhl is a compact volcanic massif rising up to 556 metres above the Upper Rhine plain northwest of Freiburg, blanketed in Pinot Noir and Pinot Gris vineyards that produce some of Germany’s warmest, richest wines. The circular route loops through honey-coloured wine villages — Ihringen, Burkheim with its medieval town gate, and the Vogtsburg hamlets — passing distinctive loess hollow-ways carved deep into the cliffs by centuries of erosion. The signature moment is the Texaspass, a 1.7 km climb averaging 7.5 %, whose tight bends between Oberbergen and Kiechlinsbergen reward riders with panoramic views over vine-terraced hills stretching to the Rhine and the Vosges beyond.',
      bestFor: 'Wine lovers and leisure cyclists who want rolling vineyard scenery with little traffic',
      highlights: [
        'Texaspass — a 1.7 km pro-race climb (7.5 % avg) with vineyard panoramas',
        'Burkheim — a medieval wine village with its original town gate and wine taverns',
        'Ihringen — the sunniest municipality in Germany',
        'Loess hollow-ways — ancient sunken lanes carved into golden cliff-faces',
        'Vogtsburg / Oberbergen — the heart of the volcanic cone with sweeping views',
      ],
      externalLabel: 'Kaiserstuhl routes on Outdooractive',
    },
    'glottertal-valley-loop': {
      name: 'Glottertal Valley Loop',
      startPoint: 'Freiburg Hauptbahnhof (main station)',
      durationText: '3–4 h',
      description:
        'This rewarding loop leaves Freiburg heading north through the Rhine plain villages of Gundelfingen and Denzlingen before turning east into the narrow, forested Glottertal — a Black Forest side valley made famous worldwide by the long-running German TV series Schwarzwaldklinik. The climb along the Glotter stream is steady but never brutal, rewarding riders with vineyards, half-timbered farmhouses and a genuine sense of Black Forest seclusion. The return leg sweeps back to Freiburg along the flat, tree-lined Dreisam cycle path — one of the most enjoyable riverside routes in Baden-Württemberg.',
      bestFor: 'Leisure cyclists and e-bikers seeking scenic Black Forest valleys and a gentle return',
      highlights: [
        'Schwarzwaldklinik building in Glottertal — iconic filming location of the cult TV series',
        'Glotterbach valley — a narrow forested gorge with meadows and vineyards',
        'Denzlingen and Gundelfingen — Rhine plain villages with local bakeries',
        'Panoramic views of the Kandel massif (1,241 m) as you climb into the valley',
        'Dreisam cycle path on the return — a flat, shaded riverside route into the city',
      ],
      externalLabel: 'Glottertal on Outdooractive',
    },
    'schauinsland-climb-freiburg': {
      name: 'Schauinsland Summit Climb',
      startPoint: 'Freiburg, Johanneskirche / Günterstal',
      durationText: '1.5–3 h',
      description:
        'The Schauinslandstraße — open to traffic since 1896 — is Freiburg’s most iconic cycling challenge: 17.9 km of pure tarmac rising nearly 930 metres from the city’s southern edge to the 1,284 m summit of Freiburg’s local mountain. The first 6 km roll gently through the leafy suburb of Günterstal; after Bohrer the road unleashes a series of tight hairpin bends through dense Black Forest fir, with ramps hitting 11–12 % before easing across the open ridge at Holzschlägermatte (910 m), where the Rhine plain and the Vosges suddenly appear. On summer weekends sections of the road are closed to cars, making the final approach to the summit all the more rewarding.',
      bestFor: 'Road cyclists and strong e-MTB riders after a classic summit climb',
      highlights: [
        'Günterstal village — the green gateway where the serious climbing begins',
        'Bohrer junction — the start of the famous hairpin section',
        'Holzschlägermatte meadow (910 m) — first panoramic view of the Rhine plain and Vosges',
        'Schauinsland summit (1,284 m) — cable-car station and views as far as the Alps',
        'Schauinslandkönig — the historic hill-climb time trial runs this road every July',
      ],
      externalLabel: 'Climb profile on Quäldich',
    },
    'freiburg-breisach-rhein': {
      name: 'Freiburg to Breisach am Rhein — Rhine Plain & Vineyards',
      startPoint: 'Freiburg Hauptbahnhof (main station)',
      durationText: '2–3 h',
      description:
        'From Freiburg main station the route rolls west along the Dreisam cycle path and then opens into the wide, sun-baked Rhine plain, passing the orchards and asparagus fields of Opfingen before reaching the Altrhein (old Rhine channel) and its tranquil floodplain forests. The final kilometres climb the iconic Münsterberg — the volcanic plug that crowns Breisach — rewarding riders with a sweeping panorama over the Rhine, the Kaiserstuhl massif and across the border to French Alsace and the star-shaped Vauban fortress of Neuf-Brisach. At the summit, the Romanesque-Gothic St. Stephan’s Minster dominates the skyline and the historic market square awaits below.',
      bestFor: 'Cyclists who want a leisurely, largely flat day trip combining history, wine culture and Rhine scenery — ideal on an e-bike',
      highlights: [
        'Dreisam cycle path out of Freiburg — a shaded, car-free start through the suburbs',
        'Rhine plain farmland — orchards, asparagus fields and open skies',
        'Altrhein (old Rhine channel) — a tranquil backwater with riparian forest and birdlife',
        'Münsterberg viewpoint — panorama over the Rhine, Kaiserstuhl and Vosges',
        'Breisach old town — St. Stephan’s Minster, market square and Rhine-side wine taverns',
      ],
      externalLabel: 'Route on Komoot',
    },
  },
};

const FR: BikeToursPageText = {
  "metaTitle": "Tours à vélo à Freiburg : les 7 plus beaux itinéraires",
  "metaDescription": "Les plus belles sorties à vélo autour de Fribourg : vallée de la Dreisam, Kaiserstuhl, Schauinsland et plus. Distances, dénivelés, niveaux. Louez le bon vélo.",
  "heroTitle": "Tours à vélo à Fribourg-en-Brisgau et dans la région",
  "heroSub": "De la vallée plate de la Dreisam au sommet du Schauinsland : 7 itinéraires triés sur le volet à travers la Forêt-Noire, le Kaiserstuhl et la plaine du Rhin, pour tous les niveaux. Le vélo de location qu'il vous faut vous attend dans notre boutique.",
  "badge1": "7 tours",
  "badge2": "Tous les niveaux",
  "badge3": "Forêt-Noire et Kaiserstuhl",
  "introHeading": "Fribourg, l'une des plus belles régions cyclables d'Allemagne",
  "introText": "Fribourg occupe une situation idéale entre la Forêt-Noire, le Kaiserstuhl et la plaine du Rhin : peu de villes offrent autant de parcours à portée de roue. Que vous rêviez d'une boucle familiale paisible au bord de l'eau, d'une escapade au cœur des vignes ou d'une ascension qui décoiffe, voici nos 7 tours préférés avec toutes les données clés. Pas de vélo sous la main ? Chez Bike Haus Freiburg, vous louez vélos de ville, de trekking et électriques — casque et antivol inclus, à des tarifs journaliers justes et sans rendez-vous.",
  "labelDistance": "Distance",
  "labelElevation": "Dénivelé",
  "labelDuration": "Durée",
  "labelBestFor": "Idéal pour",
  "labelRecommended": "Vélo recommandé",
  "unitKm": "km",
  "unitM": "m",
  "difficultyEasy": "Facile",
  "difficultyModerate": "Modéré",
  "difficultyHard": "Difficile",
  "bikeCity": "Vélo de ville",
  "bikeTrekking": "Vélo de trekking",
  "bikeEbike": "Vélo électrique",
  "bikeEmtb": "VTT électrique",
  "bikeRoad": "Vélo de route",
  "highlightsHeading": "Points forts",
  "rentThisBike": "Louer le bon vélo",
  "tipsHeading": "Conseils pratiques pour votre sortie à vélo",
  "guideLinkText": "Retrouvez encore plus d'itinéraires, de cartes et de conseils dans notre",
  "guideLinkLabel": "guide du vélo à Fribourg",
  "ctaHeading": "Prêt à partir ? Nous avons le vélo qu'il vous faut.",
  "ctaText": "Un vélo de ville pour la boucle de la Dreisam ou un vélo électrique pour le Kaiserstuhl — chez Bike Haus Freiburg, vous louez exactement le bon vélo. Casque et antivol inclus, tarifs journaliers justes, sans rendez-vous. Réservez en ligne ou passez tout simplement nous voir au 27 Heckerstraße.",
  "ctaButton": "Louer un vélo",
  "ctaSecondary": "Voir tous les vélos de location",
  "tips": [
    {
      "title": "Meilleure période",
      "text": "De mai à octobre, c'est l'idéal. Les vignes du Kaiserstuhl s'embrasent en automne, tandis que la vallée de la Dreisam reste ombragée et fraîche même au cœur de l'été."
    },
    {
      "title": "Que prendre avec soi",
      "text": "Casque (inclus dans nos locations), eau, protection solaire et un peu d'argent liquide pour les fermes-boutiques et les guinguettes vigneronnes. Glissez une veste légère pour les sorties en montagne."
    },
    {
      "title": "Départ et accès",
      "text": "De nombreux tours partent de la gare centrale de Fribourg ou directement de notre boutique au 27 Heckerstraße. Prendre le train régional vers la vallée de la Dreisam ou le Kaiserstuhl vous épargne du dénivelé."
    },
    {
      "title": "Le vélo électrique pour aller plus loin",
      "text": "Le Kaiserstuhl, le Glottertal ou le Schauinsland avec le vent dans le dos ? Un vélo électrique de location vous permet d'aborder les longues sorties tout en confort — jusqu'à 100 km d'autonomie."
    }
  ],
  "routes": {
    "dreisamtal-radweg": {
      "name": "La piste cyclable de la vallée de la Dreisam — de Fribourg à la Forêt-Noire",
      "startPoint": "Gare centrale de Fribourg (Hauptbahnhof)",
      "durationText": "2,5–3,5 h",
      "description": "Au départ de la gare centrale de Fribourg, cet itinéraire plat longe la Dreisam à contre-courant, à travers des prairies baignées de soleil et de fermes traditionnelles de la Forêt-Noire, jusqu'à Kirchzarten puis vers les villages d'Oberried et de Buchenbach. Avec à peine 370 mètres de dénivelé total répartis sur 39 kilomètres, la pente reste assez douce pour les enfants comme pour les cyclistes tranquilles. En chemin, les fermes-boutiques vendent miel et fruits de la région, l'église et le jardin de plantes aromatiques du couvent d'Oberried invitent à une courte pause, et la piscine en plein air Dreisambad de Kirchzarten offre une fin d'étape parfaite en été, avant de redescendre vers Fribourg.",
      "bestFor": "Familles, cyclistes loisir et premières découvertes de la Forêt-Noire",
      "highlights": [
        "Le chemin au bord de la Dreisam, du centre de Fribourg jusqu'à Littenweiler",
        "Le hameau de Himmelreich — une halte pleine de charme avec son auberge traditionnelle",
        "L'église et le jardin de plantes aromatiques du couvent d'Oberried",
        "Les fermes-boutiques du Baldenwegerhof et leurs produits de la Forêt-Noire",
        "La piscine en plein air Dreisambad de Kirchzarten pour une baignade estivale"
      ],
      "externalLabel": "Itinéraire sur Schwarzwald Tourismus"
    },
    "opfinger-see-mooswald-rieselfeld": {
      "name": "Boucle de l'Opfinger See et de la forêt du Mooswald",
      "startPoint": "Fribourg-Rieselfeld (arrêt du tram 5 ou parking du Mundenhof)",
      "durationText": "1,5–2,5 h",
      "description": "Cette boucle plate, presque sans voitures, file à l'ouest de Fribourg à travers la fraîche ombre du Mooswald — l'une des plus vastes forêts d'un seul tenant de la plaine du Rhin supérieur — avant de déboucher sur l'Opfinger See, un lac scintillant de 48 hectares à la qualité d'eau jugée excellente selon les normes de l'UE, bordé de larges prairies parfaites pour une baignade estivale. Le retour se faufile à travers le Rieselfeld, ancien champ d'épandage devenu réserve naturelle où foisonnent désormais des oiseaux rares, et passe devant le parc animalier du Mundenhof, à l'entrée gratuite — un détour idéal pour les familles. Avec à peine 40 mètres de dénivelé total, aucune condition physique particulière n'est requise.",
      "bestFor": "Familles avec enfants, débutants et tous ceux qui cherchent une demi-journée tranquille avec baignade au lac",
      "highlights": [
        "La forêt du Mooswald — des chemins ombragés dans l'une des plus grandes forêts du Rhin supérieur",
        "Le Waltershofener See — un lac forestier paisible, parfait pour observer les oiseaux",
        "L'Opfinger See — un lac à la qualité d'eau certifiée excellente par l'UE, avec zone de baignade",
        "La réserve naturelle du Rieselfeld — un habitat protégé pour des oiseaux de zones humides rares",
        "Le Mundenhof — parc animalier et naturel à l'entrée gratuite"
      ],
      "externalLabel": "L'Opfinger See sur Komoot"
    },
    "tuniberg-vineyard-loop": {
      "name": "Boucle des vignobles du Tuniberg",
      "startPoint": "Fribourg-Munzingen",
      "durationText": "2,5–3,5 h",
      "description": "Le Tuniberg, douce crête calcaire culminant à 312 mètres à l'ouest de Fribourg, est le secret le mieux gardé de la région pour les cyclistes — plus petit et plus calme que son voisin volcanique, le Kaiserstuhl, mais tout aussi riche en cépages bourguignons, en chemins bordés de fleurs et en panoramas à perte de vue. Cette boucle relie les quartiers fribourgeois de Munzingen, Tiengen et Opfingen aux villages vignerons de Merdingen et Gottenheim, sur des chemins bien balisés et le plus souvent goudronnés. Les soirs de ciel clair, les points de vue de la crête offrent un panorama immense, s'étirant à l'ouest par-delà la plaine du Rhin jusqu'aux Vosges en Alsace, et à l'est jusqu'aux cimes de la Forêt-Noire — l'une des plus belles sorties au coucher du soleil de la région de Fribourg.",
      "bestFor": "Familles, amateurs de vin et cyclistes loisir épris de panoramas",
      "highlights": [
        "La chapelle Sainte-Erentrude (Erentrudiskapelle) au-dessus de Munzingen — un lieu de pèlerinage avec vue sur l'Alsace",
        "Le belvédère du Tunibergkreuz — vues sur la plaine du Rhin, le Kaiserstuhl, les Vosges et la Forêt-Noire",
        "Les guinguettes vigneronnes d'Opfingen — la culture des Straußwirtschaften du Brisgau et ses vins de domaine",
        "L'église Saint-Remi (St. Remigius) de Merdingen — un chef-d'œuvre baroque tardif (1738–1741)",
        "Le sentier du vin Burgunderpfad à travers Gottenheim et Merdingen — panneaux thématiques sur les cépages"
      ],
      "externalLabel": "Le tour du Tuniberg sur Schwarzwald Tourismus"
    },
    "kaiserstuhl-weinradweg": {
      "name": "La route des vins du Kaiserstuhl",
      "startPoint": "Breisach am Rhein (gare)",
      "durationText": "3–5 h",
      "description": "Le Kaiserstuhl est un massif volcanique compact qui s'élève jusqu'à 556 mètres au-dessus de la plaine du Rhin supérieur, au nord-ouest de Fribourg, tapissé de vignes de pinot noir et de pinot gris qui donnent quelques-uns des vins les plus chaleureux et les plus généreux d'Allemagne. Cet itinéraire en boucle traverse des villages vignerons couleur miel — Ihringen, Burkheim et sa porte de ville médiévale, ainsi que les hameaux de Vogtsburg — en longeant de spectaculaires chemins creux de loess, taillés au fil des siècles dans les falaises par l'érosion. Le moment fort, c'est le Texaspass, une ascension de 1,7 km à 7,5 % de moyenne, dont les lacets serrés entre Oberbergen et Kiechlinsbergen récompensent les cyclistes d'un panorama sur les coteaux en terrasses qui s'étirent jusqu'au Rhin et, au-delà, jusqu'aux Vosges.",
      "bestFor": "Amateurs de vin et cyclistes loisir en quête de paysages de vignes vallonnés et peu de circulation",
      "highlights": [
        "Le Texaspass — une montée de course pro de 1,7 km (7,5 % de moyenne) avec panoramas sur les vignes",
        "Burkheim — un village vigneron médiéval avec sa porte de ville d'origine et ses guinguettes",
        "Ihringen — la commune la plus ensoleillée d'Allemagne",
        "Les chemins creux de loess — anciennes voies encaissées taillées dans les falaises dorées",
        "Vogtsburg / Oberbergen — le cœur du cône volcanique et ses vues à 360°"
      ],
      "externalLabel": "Itinéraires du Kaiserstuhl sur Outdooractive"
    },
    "glottertal-valley-loop": {
      "name": "Boucle de la vallée du Glottertal",
      "startPoint": "Gare centrale de Fribourg (Hauptbahnhof)",
      "durationText": "3–4 h",
      "description": "Cette boucle gratifiante quitte Fribourg en direction du nord, à travers les villages de la plaine du Rhin que sont Gundelfingen et Denzlingen, avant de bifurquer à l'est vers le Glottertal, vallée étroite et boisée — une vallée latérale de la Forêt-Noire rendue célèbre dans le monde entier par la longue série télévisée allemande Schwarzwaldklinik. La montée le long du ruisseau de la Glotter est régulière mais jamais brutale, récompensant les cyclistes de vignes, de fermes à colombages et d'un véritable sentiment de quiétude au cœur de la Forêt-Noire. Le retour ramène vers Fribourg par la piste cyclable plate et bordée d'arbres de la Dreisam — l'un des parcours au fil de l'eau les plus agréables du Bade-Wurtemberg.",
      "bestFor": "Cyclistes loisir et adeptes du vélo électrique en quête de vallées pittoresques de la Forêt-Noire et d'un retour tout en douceur",
      "highlights": [
        "Le bâtiment de la Schwarzwaldklinik à Glottertal — le lieu de tournage culte de la série télévisée",
        "La vallée de la Glotter — une gorge étroite et boisée, parsemée de prairies et de vignes",
        "Denzlingen et Gundelfingen — des villages de la plaine du Rhin et leurs boulangeries locales",
        "Les vues sur le massif du Kandel (1 241 m) à mesure que l'on monte dans la vallée",
        "La piste cyclable de la Dreisam au retour — un parcours plat et ombragé au bord de l'eau jusqu'à la ville"
      ],
      "externalLabel": "Le Glottertal sur Outdooractive"
    },
    "schauinsland-climb-freiburg": {
      "name": "L'ascension du sommet du Schauinsland",
      "startPoint": "Fribourg, Johanneskirche / Günterstal",
      "durationText": "1,5–3 h",
      "description": "La Schauinslandstraße — ouverte à la circulation depuis 1896 — est le défi cycliste le plus emblématique de Fribourg : 17,9 km de bitume pur s'élevant de près de 930 mètres depuis la lisière sud de la ville jusqu'au sommet, à 1 284 m, de la montagne fétiche des Fribourgeois. Les 6 premiers kilomètres déroulent en douceur à travers le verdoyant faubourg de Günterstal ; passé Bohrer, la route déchaîne une série de lacets serrés au cœur des denses sapins de la Forêt-Noire, avec des rampes atteignant 11–12 % avant de s'adoucir sur la crête dégagée de la Holzschlägermatte (910 m), d'où la plaine du Rhin et les Vosges surgissent soudain. Les week-ends d'été, certains tronçons de la route sont fermés aux voitures, rendant l'assaut final vers le sommet plus jouissif encore.",
      "bestFor": "Cyclistes sur route et vététistes électriques aguerris en quête d'une ascension de sommet classique",
      "highlights": [
        "Le village de Günterstal — la porte verte où commence la vraie grimpée",
        "Le carrefour de Bohrer — le début de la célèbre série de lacets",
        "La prairie de la Holzschlägermatte (910 m) — première vue panoramique sur la plaine du Rhin et les Vosges",
        "Le sommet du Schauinsland (1 284 m) — sa station de téléphérique et des vues jusqu'aux Alpes",
        "Le Schauinslandkönig — la course de côte chronométrée historique emprunte cette route chaque mois de juillet"
      ],
      "externalLabel": "Profil de l'ascension sur Quäldich"
    },
    "freiburg-breisach-rhein": {
      "name": "De Fribourg à Breisach am Rhein — plaine du Rhin et vignobles",
      "startPoint": "Gare centrale de Fribourg (Hauptbahnhof)",
      "durationText": "2–3 h",
      "description": "Depuis la gare centrale de Fribourg, l'itinéraire file vers l'ouest le long de la piste cyclable de la Dreisam, puis s'ouvre sur la vaste plaine du Rhin gorgée de soleil, traversant les vergers et les champs d'asperges d'Opfingen avant d'atteindre l'Altrhein (ancien bras du Rhin) et ses paisibles forêts alluviales. Les derniers kilomètres grimpent l'emblématique Münsterberg — le piton volcanique qui couronne Breisach — récompensant les cyclistes d'un large panorama sur le Rhin, le massif du Kaiserstuhl et, de l'autre côté de la frontière, sur l'Alsace française et la forteresse en étoile de Neuf-Brisach, signée Vauban. Au sommet, la cathédrale Saint-Étienne, de style roman-gothique, domine l'horizon, tandis que la place du marché historique attend en contrebas.",
      "bestFor": "Cyclistes en quête d'une sortie à la journée, tranquille et presque plate, mêlant histoire, culture du vin et paysages du Rhin — idéale en vélo électrique",
      "highlights": [
        "La piste cyclable de la Dreisam à la sortie de Fribourg — un départ ombragé et sans voitures à travers les faubourgs",
        "Les terres agricoles de la plaine du Rhin — vergers, champs d'asperges et grands ciels ouverts",
        "L'Altrhein (ancien bras du Rhin) — un bras mort paisible bordé de forêts riveraines et peuplé d'oiseaux",
        "Le belvédère du Münsterberg — panorama sur le Rhin, le Kaiserstuhl et les Vosges",
        "La vieille ville de Breisach — la cathédrale Saint-Étienne, la place du marché et les guinguettes vigneronnes au bord du Rhin"
      ],
      "externalLabel": "Itinéraire sur Komoot"
    }
  }
};

const TR: BikeToursPageText = {
  "metaTitle": "Freiburg Bisiklet Turları — En Güzel 7 Rota | Bike Haus",
  "metaDescription": "Freiburg çevresindeki en güzel bisiklet turları: Dreisamtal, Kaiserstuhl, Schauinsland ve daha fazlası — mesafe, rakım ve zorlukla. Doğru bisikleti hemen kiralayın.",
  "heroTitle": "Freiburg ve Çevresinde Bisiklet Turları",
  "heroSub": "Düz Dreisamtal'dan Schauinsland zirvesine: Kara Orman, Kaiserstuhl ve Ren ovası boyunca özenle seçilmiş 7 bisiklet rotası — her kondisyona uygun. Doğru kiralık bisiklet dükkanımızda sizi bekliyor.",
  "badge1": "7 tur",
  "badge2": "Her zorluk seviyesi",
  "badge3": "Kara Orman ve Kaiserstuhl",
  "introHeading": "Freiburg — Almanya'nın en güzel bisiklet bölgelerinden biri",
  "introText": "Freiburg, Kara Orman, Kaiserstuhl ve Ren ovası arasında kusursuz bir konumda yer alır — çok az şehir kapınızın hemen önünde bu kadar çok rota sunar. İster nehir kıyısında rahat bir aile turu, ister bağlar arasında keyifli bir gezinti, ister sıkı bir dağ tırmanışı isteyin, işte tüm önemli bilgileriyle en sevdiğimiz 7 tur. Yanınızda bisiklet yok mu? Bike Haus Freiburg'da şehir, trekking ve e-bisiklet kiralayabilirsiniz — kask ve kilit dahil, uygun günlük fiyatlarla ve randevusuz.",
  "labelDistance": "Mesafe",
  "labelElevation": "Rakım",
  "labelDuration": "Süre",
  "labelBestFor": "İdeal olduğu kişiler",
  "labelRecommended": "Önerilen bisiklet",
  "unitKm": "km",
  "unitM": "m",
  "difficultyEasy": "Kolay",
  "difficultyModerate": "Orta",
  "difficultyHard": "Zor",
  "bikeCity": "Şehir bisikleti",
  "bikeTrekking": "Trekking bisikleti",
  "bikeEbike": "E-bisiklet",
  "bikeEmtb": "E-dağ bisikleti",
  "bikeRoad": "Yarış bisikleti",
  "highlightsHeading": "Öne çıkanlar",
  "rentThisBike": "Doğru bisikleti kirala",
  "tipsHeading": "Bisiklet turunuz için pratik ipuçları",
  "guideLinkText": "Daha fazla rota, harita ve ipucunu şuradan bulabilirsiniz:",
  "guideLinkLabel": "Freiburg'da Bisiklet rehberimiz",
  "ctaHeading": "Turunuza hazır mısınız? Tam size göre bisikletimiz var.",
  "ctaText": "Dreisam turu için bir şehir bisikleti mi, yoksa Kaiserstuhl için bir e-bisiklet mi — Bike Haus Freiburg'da tam ihtiyacınız olan bisikleti kiralarsınız. Kask ve kilit dahil, uygun günlük fiyatlarla ve randevu gerektirmeden. Online rezervasyon yapın ya da doğrudan Heckerstraße 27'ye uğrayın.",
  "ctaButton": "Hemen bisiklet kirala",
  "ctaSecondary": "Tüm kiralık bisikletleri gör",
  "tips": [
    {
      "title": "En iyi zaman",
      "text": "Mayıs–Ekim arası idealdir. Kaiserstuhl bağları sonbaharda ışıl ışıl parlar, Dreisamtal ise yazın en sıcak günlerinde bile gölgeli ve serin kalır."
    },
    {
      "title": "Yanınıza ne almalı",
      "text": "Kask (kiralamalarımızda dahil), su, güneş koruması ve çiftlik dükkanları ile bağ tavernaları için biraz nakit. Dağ turları için hafif bir ceket alın."
    },
    {
      "title": "Başlangıç ve ulaşım",
      "text": "Birçok tur Freiburg ana garında ya da doğrudan Heckerstraße 27'deki dükkanımızda başlar. Bölgesel trenle Dreisamtal'a ya da Kaiserstuhl'a gitmek size rakım kazandırır."
    },
    {
      "title": "Daha fazla menzil için e-bisiklet",
      "text": "Arkadan rüzgarla Kaiserstuhl, Glottertal ya da Schauinsland mı? Kiralık bir e-bisikletle uzun turları bile rahatça aşarsınız — 100 km'ye varan menzil."
    }
  ],
  "routes": {
    "dreisamtal-radweg": {
      "name": "Dreisamtal Bisiklet Yolu — Freiburg'dan Kara Orman'ın kapısına",
      "startPoint": "Freiburg Hauptbahnhof (ana gar)",
      "durationText": "2,5–3,5 saat",
      "description": "Freiburg ana garından başlayan bu düz nehir kıyısı rota, Dreisam'ı akıntıya karşı izleyerek güneş benekli çayırlar ve geleneksel Kara Orman çiftliklerinin arasından Kirchzarten'e, oradan da Oberried ve Buchenbach köylerine kadar uzanır. 39 kilometreye yayılan yalnızca 370 metrelik toplam tırmanışıyla eğim, çocuklar ve rahat sürücüler için yeterince yumuşaktır. Yol boyunca çiftlik dükkanları yöresel bal ve meyve satar, Oberried'deki manastır kilisesi ile şifalı bitki bahçesi kısa bir mola için davet eder ve Kirchzarten'deki Dreisambad açık hava havuzu, Freiburg'a doğru geri dönmeden önce yaz için mükemmel bir final sunar.",
      "bestFor": "Aileler, keyif amaçlı bisikletçiler ve Dreisamtal'a ilk kez gidenler",
      "highlights": [
        "Freiburg şehir merkezinden Littenweiler üzerinden Dreisam nehir kıyısı yolu",
        "Himmelreich köyü — geleneksel bir Gasthaus'lu şirin bir dinlenme noktası",
        "Oberried'de manastır kilisesi ve şifalı bitki bahçesi",
        "Baldenwegerhof'taki yöresel Kara Orman ürünleri satan çiftlik dükkanları",
        "Yazın serinlemek için Kirchzarten'deki Dreisambad açık hava havuzu"
      ],
      "externalLabel": "Schwarzwald Tourismus'ta rota"
    },
    "opfinger-see-mooswald-rieselfeld": {
      "name": "Opfinger See ve Mooswald Orman Turu",
      "startPoint": "Freiburg Rieselfeld (Tramvay 5 durağı veya Mundenhof otoparkı)",
      "durationText": "1,5–2,5 saat",
      "description": "Bu düz, neredeyse araçsız tur Freiburg'un batısında, Yukarı Ren ovasının en büyük bütünleşik ormanlarından biri olan Mooswald'ın serin gölgesinden geçer ve ardından AB onaylı mükemmel su kalitesine ve yazın yüzmek için ideal geniş güneşlenme çayırlarına sahip, pırıl pırıl 48 hektarlık bir göl olan Opfinger See'ye ulaşır. Dönüş kolu, bugün nadir kuşlarla dolu eski bir arıtma alanı doğa koruma bölgesi olan Rieselfeld'in içinden geçer ve ücretsiz girişli Mundenhof hayvan parkının yanından geçerek aileler için ideal bir rota oluşturur. Yalnızca yaklaşık 40 metrelik toplam tırmanışıyla hiçbir kondisyon gerektirmez.",
      "bestFor": "Çocuklu aileler, yeni başlayanlar ve göl molasıyla rahat bir yarım günlük tur arayan herkes",
      "highlights": [
        "Mooswald ormanı — Yukarı Ren'in en büyük ormanlarından birinde gölgeli yollar",
        "Waltershofener See — kuş gözlemi için harika, sakin bir orman gölü",
        "Opfinger See — AB onaylı mükemmel su kalitesine ve yüzme alanına sahip bir göl",
        "Rieselfeld doğa koruma bölgesi — nadir sulak alan kuşları için korunan bir yaşam alanı",
        "Mundenhof — ücretsiz girişli hayvan ve doğa parkı"
      ],
      "externalLabel": "Komoot'ta Opfinger See"
    },
    "tuniberg-vineyard-loop": {
      "name": "Tuniberg Bağ Turu",
      "startPoint": "Freiburg-Munzingen",
      "durationText": "2,5–3,5 saat",
      "description": "Freiburg'un batısında 312 metreye yükselen yumuşak bir kireçtaşı sırtı olan Tuniberg, bölgenin en iyi saklanan bisiklet sırrıdır — volkanik komşusu Kaiserstuhl'dan daha küçük ve daha sakin, ama Burgonya çeşidi asmalar, çiçeklerle bezeli patikalar ve uzanan manzaralar bakımından bir o kadar zengin. Bu tur, Freiburg'un Munzingen, Tiengen ve Opfingen mahallelerini, iyi işaretlenmiş ve çoğunlukla asfaltlı yollarla Merdingen ve Gottenheim bağ köylerine bağlar. Açık akşamlarda sırttaki seyir noktaları nefes kesen bir panorama sunar: batıda Ren ovasının ötesinden Alsace'taki Vosges dağlarına, doğuda ise Kara Orman zirvelerine kadar — Freiburg bölgesinin en güzel gün batımı turlarından biri.",
      "bestFor": "Aileler, şarap tutkunları ve panoramik manzaralardan keyif alan keyif amaçlı bisikletçiler",
      "highlights": [
        "Munzingen'in üstündeki Erentrudiskapelle — Alsace manzaralı bir hac şapeli",
        "Tunibergkreuz seyir noktası — Ren ovası, Kaiserstuhl, Vosges ve Kara Orman manzarası",
        "Opfingen'deki bağ tavernaları — yöresel şaraplarla klasik Breisgau Straußwirtschaft kültürü",
        "Merdingen'deki St. Remigius kilisesi — geç Barok bir başyapıt (1738–1741)",
        "Gottenheim ve Merdingen üzerinden Burgunderpfad şarap yolu — üzüm çeşitlerine dair tematik panolar"
      ],
      "externalLabel": "Schwarzwald Tourismus'ta Tuniberg turu"
    },
    "kaiserstuhl-weinradweg": {
      "name": "Kaiserstuhl Şarap Turu",
      "startPoint": "Breisach am Rhein (tren garı)",
      "durationText": "3–5 saat",
      "description": "Kaiserstuhl, Freiburg'un kuzeybatısında Yukarı Ren ovasının üzerinde 556 metreye yükselen, Almanya'nın en sıcak ve en dolgun şaraplarından bazılarını üreten Pinot Noir ve Pinot Gris bağlarıyla kaplı kompakt bir volkanik kütledir. Dairesel rota bal renkli şarap köylerinin arasından geçer — Ihringen, ortaçağdan kalma şehir kapısıyla Burkheim ve Vogtsburg köyleri — yüzyıllar süren erozyonun kayalıklara derinlemesine oyduğu kendine özgü loess çukur yollarının yanından dolaşır. Turun zirvesi, Oberbergen ile Kiechlinsbergen arasındaki dar virajlarıyla sürücüleri Ren'e ve ötesindeki Vosges'e uzanan bağ teraslı tepelerin panoramik manzarasıyla ödüllendiren, ortalama %7,5 eğimli 1,7 km'lik tırmanış olan Texaspass'tır.",
      "bestFor": "Az trafikle dalgalı bağ manzarası isteyen şarap tutkunları ve keyif amaçlı bisikletçiler",
      "highlights": [
        "Texaspass — bağ panoramalı 1,7 km'lik profesyonel yarış tırmanışı (ortalama %7,5)",
        "Burkheim — özgün şehir kapısı ve bağ tavernalarıyla ortaçağdan kalma bir şarap köyü",
        "Ihringen — Almanya'nın en güneşli belediyesi",
        "Loess çukur yolları — altın renkli kayalıklara oyulmuş kadim çukur patikalar",
        "Vogtsburg / Oberbergen — uzanan manzaralarıyla volkanik koninin kalbi"
      ],
      "externalLabel": "Outdooractive'de Kaiserstuhl rotaları"
    },
    "glottertal-valley-loop": {
      "name": "Glottertal Vadi Turu",
      "startPoint": "Freiburg Hauptbahnhof (ana gar)",
      "durationText": "3–4 saat",
      "description": "Bu doyurucu tur, Freiburg'dan kuzeye doğru Ren ovasının Gundelfingen ve Denzlingen köylerinden geçerek ayrılır, ardından doğuya dönerek dar ve ormanlık Glottertal'a girer — uzun soluklu Alman dizisi Schwarzwaldklinik sayesinde dünya çapında ün kazanmış bir Kara Orman yan vadisi. Glotter deresi boyunca uzanan tırmanış istikrarlı ama asla yorucu değildir ve sürücüleri bağlar, ahşap iskeletli çiftlik evleri ve gerçek bir Kara Orman izolasyonu duygusuyla ödüllendirir. Dönüş kolu, Baden-Württemberg'in en keyifli nehir kıyısı rotalarından biri olan düz ve ağaçlarla çevrili Dreisam bisiklet yolu boyunca Freiburg'a geri döner.",
      "bestFor": "Manzaralı Kara Orman vadileri ve rahat bir dönüş arayan keyif amaçlı bisikletçiler ve e-bisikletçiler",
      "highlights": [
        "Glottertal'daki Schwarzwaldklinik binası — kült dizinin ikonik çekim mekanı",
        "Glotterbach vadisi — çayırlar ve bağlarla dolu dar, ormanlık bir geçit",
        "Denzlingen ve Gundelfingen — yöresel fırınlarıyla Ren ovası köyleri",
        "Vadiye tırmanırken Kandel kütlesinin (1.241 m) panoramik manzarası",
        "Dönüşte Dreisam bisiklet yolu — şehre uzanan düz, gölgeli bir nehir kıyısı rotası"
      ],
      "externalLabel": "Outdooractive'de Glottertal"
    },
    "schauinsland-climb-freiburg": {
      "name": "Schauinsland Zirve Tırmanışı",
      "startPoint": "Freiburg, Johanneskirche / Günterstal",
      "durationText": "1,5–3 saat",
      "description": "1896'dan beri trafiğe açık olan Schauinslandstraße, Freiburg'un en ikonik bisiklet meydan okumasıdır: şehrin güney kenarından Freiburg'un şehir dağının 1.284 m yüksekliğindeki zirvesine kadar yaklaşık 930 metre yükselen 17,9 km saf asfalt. İlk 6 km, yemyeşil Günterstal banliyösünden yumuşakça akar; Bohrer'den sonra yol, sık Kara Orman köknarlarının arasından bir dizi dar firkete virajı serbest bırakır; rampalar Holzschlägermatte'de (910 m) açık sırta yumuşamadan önce %11–12'ye ulaşır ve burada Ren ovası ile Vosges aniden belirir. Yaz hafta sonlarında yolun bazı bölümleri araçlara kapatılır, bu da zirveye son yaklaşımı daha da ödüllendirici kılar.",
      "bestFor": "Klasik bir zirve tırmanışı arayan yarış bisikletçileri ve güçlü e-MTB sürücüleri",
      "highlights": [
        "Günterstal köyü — ciddi tırmanışın başladığı yeşil giriş kapısı",
        "Bohrer kavşağı — ünlü firkete bölümünün başlangıcı",
        "Holzschlägermatte çayırı (910 m) — Ren ovası ve Vosges'in ilk panoramik manzarası",
        "Schauinsland zirvesi (1.284 m) — teleferik istasyonu ve Alpler'e kadar uzanan manzara",
        "Schauinslandkönig — tarihi yokuş yukarı zaman denemesi her temmuz bu yolda yapılır"
      ],
      "externalLabel": "Quäldich'te tırmanış profili"
    },
    "freiburg-breisach-rhein": {
      "name": "Freiburg'dan Breisach am Rhein'a — Ren ovası ve bağlar",
      "startPoint": "Freiburg Hauptbahnhof (ana gar)",
      "durationText": "2–3 saat",
      "description": "Freiburg ana garından rota, Dreisam bisiklet yolu boyunca batıya doğru akar ve ardından geniş, güneş kavurmuş Ren ovasına açılır; Opfingen'in meyve bahçeleri ile kuşkonmaz tarlalarından geçerek Altrhein'a (eski Ren kolu) ve onun huzurlu taşkın ovası ormanlarına ulaşır. Son kilometreler, Breisach'ı taçlandıran volkanik tıkaç olan ikonik Münsterberg'e tırmanır ve sürücüleri Ren, Kaiserstuhl kütlesi ve sınırın ötesinde Fransız Alsace'ı ile Neuf-Brisach'ın yıldız biçimli Vauban kalesi üzerine uzanan bir panoramayla ödüllendirir. Zirvede, Romanesk-Gotik St. Stephan Katedrali siluete hakimdir ve aşağıda tarihi pazar meydanı sizi bekler.",
      "bestFor": "Tarih, şarap kültürü ve Ren manzarasını bir araya getiren rahat, çoğunlukla düz bir günlük gezi isteyen bisikletçiler — e-bisikletle ideal",
      "highlights": [
        "Freiburg'dan çıkan Dreisam bisiklet yolu — banliyölerden geçen gölgeli, araçsız bir başlangıç",
        "Ren ovası tarım arazileri — meyve bahçeleri, kuşkonmaz tarlaları ve açık gökyüzü",
        "Altrhein (eski Ren kolu) — kıyı ormanı ve kuş yaşamıyla huzurlu bir durgun su",
        "Münsterberg seyir noktası — Ren, Kaiserstuhl ve Vosges üzerine panorama",
        "Breisach eski kenti — St. Stephan Katedrali, pazar meydanı ve Ren kıyısı şarap tavernaları"
      ],
      "externalLabel": "Komoot'ta rota"
    }
  }
};

const ES: BikeToursPageText = {
  "metaTitle": "Rutas en bici por Friburgo — las 7 mejores | Bike Haus",
  "metaDescription": "Las mejores rutas en bici por Friburgo: valle del Dreisam, Kaiserstuhl, Schauinsland y más, con distancia, desnivel y dificultad. Alquila ya tu bici.",
  "heroTitle": "Rutas en bicicleta por Friburgo y su entorno",
  "heroSub": "Desde el llano valle del Dreisam hasta la cima del Schauinsland: 7 rutas en bici escogidas a mano por la Selva Negra, el Kaiserstuhl y la llanura del Rin, para cualquier nivel de forma física. La bici de alquiler perfecta te espera en nuestra tienda.",
  "badge1": "7 rutas",
  "badge2": "Todos los niveles",
  "badge3": "Selva Negra y Kaiserstuhl",
  "introHeading": "Friburgo, una de las mejores regiones ciclistas de Alemania",
  "introText": "Friburgo se asienta en un punto privilegiado entre la Selva Negra, el Kaiserstuhl y la llanura del Rin: pocas ciudades ofrecen tantas rutas a un paso de casa. Tanto si buscas un tranquilo paseo familiar junto al río, una ruta relajada por los viñedos o una exigente subida de montaña, aquí tienes nuestras 7 rutas favoritas con todos los datos clave. ¿No traes bici? En Bike Haus Freiburg puedes alquilar bicicletas de ciudad, de trekking y eléctricas, con casco y candado incluidos, a tarifas diarias justas y sin cita previa.",
  "labelDistance": "Distancia",
  "labelElevation": "Desnivel",
  "labelDuration": "Duración",
  "labelBestFor": "Ideal para",
  "labelRecommended": "Bici recomendada",
  "unitKm": "km",
  "unitM": "m",
  "difficultyEasy": "Fácil",
  "difficultyModerate": "Moderada",
  "difficultyHard": "Difícil",
  "bikeCity": "Bici de ciudad",
  "bikeTrekking": "Bici de trekking",
  "bikeEbike": "Bici eléctrica",
  "bikeEmtb": "Bici de montaña eléctrica",
  "bikeRoad": "Bici de carretera",
  "highlightsHeading": "Lo más destacado",
  "rentThisBike": "Alquila la bici adecuada",
  "tipsHeading": "Consejos prácticos para tu ruta en bici",
  "guideLinkText": "Encuentra aún más rutas, mapas y consejos en nuestra",
  "guideLinkLabel": "guía de cicloturismo en Friburgo",
  "ctaHeading": "¿Listo para tu ruta? Tenemos la bici perfecta.",
  "ctaText": "Una bici de ciudad para el circuito del Dreisam o una eléctrica para el Kaiserstuhl: en Bike Haus Freiburg alquilas justo la bici que necesitas. Casco y candado incluidos, tarifas diarias justas y sin cita previa. Reserva online o pásate sin más por la Heckerstraße 27.",
  "ctaButton": "Alquila una bici ahora",
  "ctaSecondary": "Ver todas las bicis de alquiler",
  "tips": [
    {
      "title": "La mejor época",
      "text": "De mayo a octubre es lo ideal. Los viñedos del Kaiserstuhl resplandecen en otoño, mientras que el valle del Dreisam se mantiene fresco y a la sombra incluso en pleno verano."
    },
    {
      "title": "Qué llevar",
      "text": "Casco (incluido en nuestros alquileres), agua, protección solar y algo de efectivo para las tiendas de granja y las tabernas de vino. Lleva una chaqueta ligera para las rutas de montaña."
    },
    {
      "title": "Salida y cómo llegar",
      "text": "Muchas rutas salen de la estación central de Friburgo o directamente desde nuestra tienda, en la Heckerstraße 27. Tomar el tren regional hacia el valle del Dreisam o el Kaiserstuhl te ahorra desnivel."
    },
    {
      "title": "Bici eléctrica para más alcance",
      "text": "¿El Kaiserstuhl, el Glottertal o el Schauinsland con viento a favor? Una bici eléctrica de alquiler te permite afrontar rutas largas con comodidad, con hasta 100 km de autonomía."
    }
  ],
  "routes": {
    "dreisamtal-radweg": {
      "name": "Carril bici del valle del Dreisam — de Friburgo a la Selva Negra",
      "startPoint": "Friburgo, estación central (Hauptbahnhof)",
      "durationText": "2,5–3,5 h",
      "description": "Desde la estación central de Friburgo, esta ruta llana junto al río remonta el Dreisam a través de prados bañados por el sol y tradicionales granjas de la Selva Negra hasta llegar a Kirchzarten y adentrarse en los pueblos de Oberried y Buchenbach. Con apenas 370 metros de desnivel acumulado repartidos en 39 kilómetros, la pendiente es lo bastante suave para niños y ciclistas tranquilos por igual. Por el camino, las tiendas de granja venden miel y fruta de la región, la iglesia del monasterio y el jardín de hierbas de Oberried invitan a una breve parada, y la piscina al aire libre Dreisambad, en Kirchzarten, es el broche de oro perfecto en verano antes de volver río abajo hacia Friburgo.",
      "bestFor": "Familias, ciclistas de paseo y quienes descubren la Selva Negra por primera vez",
      "highlights": [
        "Sendero junto al Dreisam, desde el centro de Friburgo pasando por Littenweiler",
        "Himmelreich — una encantadora parada con su gasthaus tradicional",
        "Iglesia del monasterio y jardín de hierbas de Oberried",
        "Tiendas de granja en Baldenwegerhof con productos típicos de la Selva Negra",
        "Piscina al aire libre Dreisambad, en Kirchzarten, para un chapuzón veraniego"
      ],
      "externalLabel": "Ruta en Schwarzwald Tourismus"
    },
    "opfinger-see-mooswald-rieselfeld": {
      "name": "Circuito del lago Opfinger See y el bosque de Mooswald",
      "startPoint": "Friburgo-Rieselfeld (parada del tranvía 5 o aparcamiento del Mundenhof)",
      "durationText": "1,5–2,5 h",
      "description": "Este circuito llano y casi sin tráfico discurre al oeste de Friburgo a través de la fresca sombra del Mooswald, uno de los bosques continuos más extensos de la llanura del Alto Rin, antes de desembocar en el Opfinger See: un lago reluciente de 48 hectáreas con una calidad del agua calificada de excelente por la UE y amplias praderas para tomar el sol, perfectas para un baño en verano. La vuelta serpentea por el Rieselfeld, una antigua zona de filtración de aguas convertida hoy en reserva natural repleta de aves singulares, y pasa junto al parque de animales Mundenhof, de entrada gratuita, lo que la convierte en un desvío ideal para familias. Con solo unos 40 metros de desnivel acumulado, no hace falta ninguna preparación física.",
      "bestFor": "Familias con niños, principiantes y cualquiera que busque una ruta relajada de media jornada con baño en el lago",
      "highlights": [
        "Bosque de Mooswald — caminos a la sombra por uno de los mayores bosques del Alto Rin",
        "Waltershofener See — un tranquilo lago en el bosque, ideal para observar aves",
        "Opfinger See — un lago con calidad del agua excelente certificada por la UE y zona de baño",
        "Reserva natural de Rieselfeld — hábitat protegido de aves de humedal poco comunes",
        "Mundenhof — parque de animales y naturaleza de entrada gratuita"
      ],
      "externalLabel": "Opfinger See en Komoot"
    },
    "tuniberg-vineyard-loop": {
      "name": "Circuito por los viñedos del Tuniberg",
      "startPoint": "Friburgo-Munzingen",
      "durationText": "2,5–3,5 h",
      "description": "El Tuniberg, una suave loma calcárea que se eleva hasta los 312 metros al oeste de Friburgo, es el secreto ciclista mejor guardado de la región: más pequeño y tranquilo que su vecino volcánico, el Kaiserstuhl, pero igual de rico en viñas de variedades de Borgoña, caminos bordeados de flores y vistas que se pierden en el horizonte. Este circuito enlaza los barrios friburgueses de Munzingen, Tiengen y Opfingen con los pueblos vitícolas de Merdingen y Gottenheim por senderos bien señalizados y en su mayoría asfaltados. En las tardes despejadas, los miradores de la loma regalan un panorama imponente que se extiende al oeste, cruzando la llanura del Rin hasta los Vosgos en Alsacia, y al este hasta las cumbres de la Selva Negra: una de las mejores rutas para ver la puesta de sol en la región de Friburgo.",
      "bestFor": "Familias, amantes del vino y ciclistas de paseo que disfrutan de las vistas panorámicas",
      "highlights": [
        "Erentrudiskapelle, sobre Munzingen — una capilla de peregrinación con vistas panorámicas a Alsacia",
        "Mirador del Tunibergkreuz — vistas sobre la llanura del Rin, el Kaiserstuhl, los Vosgos y la Selva Negra",
        "Tabernas de vino en Opfingen — la auténtica cultura de las Straußwirtschaft del Breisgau con vinos de la zona",
        "Iglesia de San Remigio en Merdingen — una obra maestra del barroco tardío (1738–1741)",
        "Burgunderpfad, ruta del vino por Gottenheim y Merdingen — con paneles temáticos sobre variedades de uva"
      ],
      "externalLabel": "Ruta del Tuniberg en Schwarzwald Tourismus"
    },
    "kaiserstuhl-weinradweg": {
      "name": "Ruta del vino del Kaiserstuhl",
      "startPoint": "Breisach am Rhein (estación de tren)",
      "durationText": "3–5 h",
      "description": "El Kaiserstuhl es un macizo volcánico compacto que se alza hasta los 556 metros sobre la llanura del Alto Rin, al noroeste de Friburgo, cubierto de viñedos de Pinot Noir y Pinot Gris que dan algunos de los vinos más cálidos e intensos de Alemania. La ruta circular recorre pueblos vitícolas de color miel —Ihringen, Burkheim con su puerta medieval y las aldeas de Vogtsburg— pasando junto a los característicos caminos hundidos labrados en el loess, excavados en los farallones por siglos de erosión. El momento estrella es el Texaspass, una subida de 1,7 km con una pendiente media del 7,5 %, cuyas cerradas curvas entre Oberbergen y Kiechlinsbergen recompensan al ciclista con vistas panorámicas sobre las laderas aterrazadas de viñas que se extienden hasta el Rin y, más allá, los Vosgos.",
      "bestFor": "Amantes del vino y ciclistas de paseo que buscan paisajes ondulados de viñedos con poco tráfico",
      "highlights": [
        "Texaspass — una subida de carrera profesional de 1,7 km (7,5 % de media) con panorámicas de viñedos",
        "Burkheim — un pueblo vitícola medieval con su puerta original y tabernas de vino",
        "Ihringen — el municipio más soleado de Alemania",
        "Caminos hundidos en el loess — antiguas vías excavadas en los farallones dorados",
        "Vogtsburg / Oberbergen — el corazón del cono volcánico con vistas imponentes"
      ],
      "externalLabel": "Rutas del Kaiserstuhl en Outdooractive"
    },
    "glottertal-valley-loop": {
      "name": "Circuito por el valle del Glottertal",
      "startPoint": "Friburgo, estación central (Hauptbahnhof)",
      "durationText": "3–4 h",
      "description": "Este gratificante circuito sale de Friburgo en dirección norte por los pueblos de la llanura del Rin, Gundelfingen y Denzlingen, antes de girar al este hacia el estrecho y boscoso Glottertal: un valle lateral de la Selva Negra que se hizo famoso en todo el mundo gracias a la longeva serie de televisión alemana Schwarzwaldklinik. La subida junto al arroyo Glotter es constante pero nunca brutal, y premia al ciclista con viñedos, granjas con entramado de madera y una auténtica sensación de recogimiento en la Selva Negra. La vuelta desciende hacia Friburgo por el llano carril bici del Dreisam, bordeado de árboles: una de las rutas junto al río más agradables de Baden-Wurtemberg.",
      "bestFor": "Ciclistas de paseo y usuarios de bici eléctrica que buscan pintorescos valles de la Selva Negra y una vuelta cómoda",
      "highlights": [
        "Edificio de la Schwarzwaldklinik en Glottertal — el icónico lugar de rodaje de la serie de culto",
        "Valle del Glotterbach — una estrecha garganta boscosa con prados y viñedos",
        "Denzlingen y Gundelfingen — pueblos de la llanura del Rin con panaderías locales",
        "Vistas panorámicas del macizo del Kandel (1241 m) según asciendes por el valle",
        "Carril bici del Dreisam a la vuelta — una ruta llana y umbría junto al río hacia la ciudad"
      ],
      "externalLabel": "Glottertal en Outdooractive"
    },
    "schauinsland-climb-freiburg": {
      "name": "Subida a la cima del Schauinsland",
      "startPoint": "Friburgo, Johanneskirche / Günterstal",
      "durationText": "1,5–3 h",
      "description": "La Schauinslandstraße —abierta al tráfico desde 1896— es el reto ciclista más emblemático de Friburgo: 17,9 km de puro asfalto que ascienden casi 930 metros desde el borde sur de la ciudad hasta la cima de 1284 m de la montaña local de Friburgo. Los primeros 6 km transcurren suavemente por el frondoso barrio de Günterstal; tras Bohrer, la carretera desata una sucesión de cerradas horquillas entre densos abetos de la Selva Negra, con rampas que alcanzan el 11–12 % antes de suavizarse al cruzar la loma abierta de Holzschlägermatte (910 m), donde la llanura del Rin y los Vosgos aparecen de repente. Los fines de semana de verano se cierran tramos de la carretera al tráfico, lo que hace que la subida final a la cima resulte aún más gratificante.",
      "bestFor": "Ciclistas de carretera y rodadores fuertes de e-MTB que buscan una clásica subida a una cima",
      "highlights": [
        "Pueblo de Günterstal — la verde puerta de entrada donde empieza la subida de verdad",
        "Cruce de Bohrer — el inicio del famoso tramo de horquillas",
        "Pradera de Holzschlägermatte (910 m) — primera vista panorámica de la llanura del Rin y los Vosgos",
        "Cima del Schauinsland (1284 m) — estación del teleférico y vistas que llegan hasta los Alpes",
        "Schauinslandkönig — la histórica contrarreloj de subida recorre esta carretera cada julio"
      ],
      "externalLabel": "Perfil de la subida en Quäldich"
    },
    "freiburg-breisach-rhein": {
      "name": "De Friburgo a Breisach am Rhein — llanura del Rin y viñedos",
      "startPoint": "Friburgo, estación central (Hauptbahnhof)",
      "durationText": "2–3 h",
      "description": "Desde la estación central de Friburgo, la ruta avanza hacia el oeste por el carril bici del Dreisam y luego se abre a la amplia y soleada llanura del Rin, pasando junto a los huertos y campos de espárragos de Opfingen antes de llegar al Altrhein (el antiguo cauce del Rin) y sus apacibles bosques de ribera. Los últimos kilómetros suben al emblemático Münsterberg —el tapón volcánico que corona Breisach—, recompensando al ciclista con un amplio panorama sobre el Rin, el macizo del Kaiserstuhl y, al otro lado de la frontera, la Alsacia francesa con la fortaleza estrellada de Neuf-Brisach. En lo alto, la catedral de San Esteban, de estilo románico-gótico, domina el horizonte y la histórica plaza del mercado aguarda más abajo.",
      "bestFor": "Ciclistas que buscan una excursión tranquila y casi llana que combine historia, cultura del vino y paisaje del Rin — ideal en bici eléctrica",
      "highlights": [
        "Carril bici del Dreisam a la salida de Friburgo — un inicio umbrío y sin tráfico por los barrios",
        "Campos de la llanura del Rin — huertos, campos de espárragos y cielos abiertos",
        "Altrhein (antiguo cauce del Rin) — un remanso tranquilo con bosque de ribera y aves",
        "Mirador del Münsterberg — panorámica sobre el Rin, el Kaiserstuhl y los Vosgos",
        "Casco antiguo de Breisach — la catedral de San Esteban, la plaza del mercado y tabernas de vino junto al Rin"
      ],
      "externalLabel": "Ruta en Komoot"
    }
  }
};

const IT: BikeToursPageText = {
  "metaTitle": "Tour in bici a Freiburg — i 7 itinerari più belli | Bike Haus",
  "metaDescription": "I più bei tour in bici intorno a Freiburg: Valle della Dreisam, Kaiserstuhl, Schauinsland e altri — con distanza, dislivello e difficoltà. Noleggia subito la bici giusta.",
  "heroTitle": "Tour in bici a Freiburg e nei dintorni",
  "heroSub": "Dalla pianeggiante Valle della Dreisam alla vetta dello Schauinsland: 7 itinerari ciclistici selezionati a mano attraverso la Foresta Nera, il Kaiserstuhl e la pianura del Reno — per ogni livello di allenamento. La bici a noleggio giusta ti aspetta nel nostro negozio.",
  "badge1": "7 tour",
  "badge2": "Tutti i livelli di difficoltà",
  "badge3": "Foresta Nera e Kaiserstuhl",
  "introHeading": "Freiburg — una delle più belle regioni ciclistiche della Germania",
  "introText": "Freiburg si trova in posizione perfetta tra la Foresta Nera, il Kaiserstuhl e la pianura del Reno — poche città offrono così tanti itinerari proprio dietro l'angolo. Che tu voglia un rilassante giro in famiglia lungo il fiume, una pedalata tra i vigneti o una salita di montagna impegnativa, ecco i nostri 7 tour preferiti con tutti i dati essenziali. Non hai la bici con te? Da Bike Haus Freiburg puoi noleggiare city bike, bici da trekking ed e-bike — casco e lucchetto inclusi, a tariffe giornaliere eque e senza appuntamento.",
  "labelDistance": "Distanza",
  "labelElevation": "Dislivello",
  "labelDuration": "Durata",
  "labelBestFor": "Ideale per",
  "labelRecommended": "Bici consigliata",
  "unitKm": "km",
  "unitM": "m",
  "difficultyEasy": "Facile",
  "difficultyModerate": "Medio",
  "difficultyHard": "Difficile",
  "bikeCity": "City bike",
  "bikeTrekking": "Bici da trekking",
  "bikeEbike": "E-bike",
  "bikeEmtb": "E-mountain bike",
  "bikeRoad": "Bici da corsa",
  "highlightsHeading": "Punti salienti",
  "rentThisBike": "Noleggia la bici giusta",
  "tipsHeading": "Consigli pratici per il tuo tour in bici",
  "guideLinkText": "Trova ancora più itinerari, mappe e consigli nella nostra",
  "guideLinkLabel": "guida In bici a Freiburg",
  "ctaHeading": "Pronto per il tuo tour? Abbiamo la bici che fa per te.",
  "ctaText": "Una city bike per il giro lungo la Dreisam o un'e-bike per il Kaiserstuhl — da Bike Haus Freiburg noleggi esattamente la bici giusta. Casco e lucchetto inclusi, tariffe giornaliere eque, nessun appuntamento necessario. Prenota online oppure passa semplicemente in Heckerstraße 27.",
  "ctaButton": "Noleggia subito una bici",
  "ctaSecondary": "Vedi tutte le bici a noleggio",
  "tips": [
    {
      "title": "Periodo migliore",
      "text": "Da maggio a ottobre è l'ideale. I vigneti del Kaiserstuhl si accendono di colori in autunno, mentre la Valle della Dreisam resta ombreggiata e fresca anche in piena estate."
    },
    {
      "title": "Cosa portare",
      "text": "Casco (incluso nei nostri noleggi), acqua, protezione solare e un po' di contanti per le botteghe agricole e le osterie del vino. Per le salite in montagna metti in valigia una giacca leggera."
    },
    {
      "title": "Partenza e come arrivare",
      "text": "Molti tour partono dalla stazione centrale di Freiburg o direttamente dal nostro negozio in Heckerstraße 27. Prendere il treno regionale fino alla Valle della Dreisam o al Kaiserstuhl ti risparmia dislivello."
    },
    {
      "title": "E-bike per più autonomia",
      "text": "Kaiserstuhl, Glottertal o Schauinsland con il vento in poppa? Un'e-bike a noleggio ti permette di affrontare i tour più lunghi in tutta comodità — fino a 100 km di autonomia."
    }
  ],
  "routes": {
    "dreisamtal-radweg": {
      "name": "Ciclabile della Valle della Dreisam — da Freiburg alla Foresta Nera",
      "startPoint": "Freiburg Hauptbahnhof (stazione centrale)",
      "durationText": "2,5–3,5 h",
      "description": "Partendo dalla stazione centrale di Freiburg, questo itinerario pianeggiante lungo il fiume risale la Dreisam attraverso prati punteggiati di sole e tradizionali fattorie della Foresta Nera fino a Kirchzarten e oltre, nei villaggi di Oberried e Buchenbach. Con appena 370 metri di dislivello complessivo distribuiti su 39 chilometri, la pendenza è abbastanza dolce da essere adatta sia ai bambini sia ai ciclisti più tranquilli. Lungo il percorso le botteghe agricole vendono miele e frutta locali, la chiesa del monastero e il giardino delle erbe di Oberried invitano a una breve sosta e la piscina all'aperto Dreisambad di Kirchzarten è il finale perfetto in estate, prima di tornare a valle verso Freiburg.",
      "bestFor": "Famiglie, ciclisti per il tempo libero e chi esplora la Foresta Nera per la prima volta",
      "highlights": [
        "Ciclabile lungo la Dreisam dal centro di Freiburg attraverso Littenweiler",
        "Il borgo di Himmelreich — un'incantevole tappa di sosta con un tradizionale gasthaus",
        "Chiesa del monastero e giardino delle erbe a Oberried",
        "Botteghe agricole al Baldenwegerhof con prodotti tipici della Foresta Nera",
        "Piscina all'aperto Dreisambad a Kirchzarten per un tuffo estivo"
      ],
      "externalLabel": "Itinerario su Schwarzwald Tourismus"
    },
    "opfinger-see-mooswald-rieselfeld": {
      "name": "Giro del lago Opfinger e della foresta Mooswald",
      "startPoint": "Freiburg Rieselfeld (fermata Tram 5 o parcheggio Mundenhof)",
      "durationText": "1,5–2,5 h",
      "description": "Questo giro pianeggiante e quasi privo di traffico si snoda a ovest di Freiburg attraverso la fresca ombra del Mooswald, una delle più estese foreste continue della pianura dell'Alto Reno, prima di sbucare al lago Opfinger — uno scintillante specchio d'acqua di 48 ettari con qualità dell'acqua certificata dall'UE e ampi prati per prendere il sole, perfetti per un bagno estivo. Il ritorno attraversa il Rieselfeld, un'ex zona di depurazione oggi riserva naturale brulicante di uccelli rari, e passa accanto al parco faunistico Mundenhof a ingresso gratuito, rendendola una deviazione ideale per le famiglie. Con soli circa 40 metri di dislivello complessivo, non serve alcuna preparazione fisica.",
      "bestFor": "Famiglie con bambini, principianti e chiunque cerchi una pedalata rilassata di mezza giornata con un bagno al lago",
      "highlights": [
        "Foresta del Mooswald — sentieri ombreggiati attraverso uno dei boschi più estesi dell'Alto Reno",
        "Waltershofener See — un tranquillo lago nel bosco, ideale per il birdwatching",
        "Lago Opfinger — uno specchio d'acqua con qualità certificata dall'UE e zona balneabile",
        "Riserva naturale del Rieselfeld — habitat protetto per rari uccelli delle zone umide",
        "Mundenhof — parco faunistico e naturalistico a ingresso gratuito"
      ],
      "externalLabel": "Opfinger See su Komoot"
    },
    "tuniberg-vineyard-loop": {
      "name": "Giro dei vigneti del Tuniberg",
      "startPoint": "Freiburg-Munzingen",
      "durationText": "2,5–3,5 h",
      "description": "Il Tuniberg, una dolce dorsale calcarea che si eleva fino a 312 metri a ovest di Freiburg, è il segreto ciclistico meglio custodito della regione — più piccolo e più tranquillo del suo vicino vulcanico, il Kaiserstuhl, ma altrettanto ricco di vigneti di varietà borgognone, stradine fiancheggiate da fiori e panorami a perdita d'occhio. Questo giro collega i quartieri di Freiburg di Munzingen, Tiengen e Opfingen con i villaggi vinicoli di Merdingen e Gottenheim su strade ben segnalate e per lo più asfaltate. Nelle serate limpide i punti panoramici della dorsale regalano una vista che spazia a ovest sulla pianura del Reno fino ai Vosgi in Alsazia e a est verso le cime della Foresta Nera — una delle pedalate al tramonto più belle della regione di Freiburg.",
      "bestFor": "Famiglie, amanti del vino e ciclisti del tempo libero che apprezzano le viste panoramiche",
      "highlights": [
        "Erentrudiskapelle sopra Munzingen — una cappella di pellegrinaggio con vista panoramica sull'Alsazia",
        "Punto panoramico Tunibergkreuz — vista sulla pianura del Reno, il Kaiserstuhl, i Vosgi e la Foresta Nera",
        "Osterie del vino a Opfingen — la classica cultura delle Straußwirtschaft del Breisgau con i vini delle tenute",
        "Chiesa di San Remigio a Merdingen — un capolavoro tardo-barocco (1738–1741)",
        "Sentiero del vino Burgunderpfad tra Gottenheim e Merdingen — pannelli tematici sui vitigni"
      ],
      "externalLabel": "Tour del Tuniberg su Schwarzwald Tourismus"
    },
    "kaiserstuhl-weinradweg": {
      "name": "Tour del vino del Kaiserstuhl",
      "startPoint": "Breisach am Rhein (stazione ferroviaria)",
      "durationText": "3–5 h",
      "description": "Il Kaiserstuhl è un compatto massiccio vulcanico che si eleva fino a 556 metri sopra la pianura dell'Alto Reno a nord-ovest di Freiburg, ricoperto di vigneti di Pinot Nero e Pinot Grigio che danno alcuni dei vini più caldi e corposi della Germania. Il percorso circolare attraversa villaggi vinicoli color miele — Ihringen, Burkheim con la sua porta medievale e i borghi di Vogtsburg — passando accanto ai caratteristici sentieri incassati nel loess, scavati in profondità nelle scogliere da secoli di erosione. Il momento clou è il Texaspass, una salita di 1,7 km con pendenza media del 7,5 %, le cui curve strette tra Oberbergen e Kiechlinsbergen ricompensano i ciclisti con panorami sulle colline terrazzate di vigne che si estendono fino al Reno e ai Vosgi.",
      "bestFor": "Amanti del vino e ciclisti del tempo libero in cerca di dolci paesaggi di vigneti con poco traffico",
      "highlights": [
        "Texaspass — una salita da gara di 1,7 km (7,5 % di media) con panorami sui vigneti",
        "Burkheim — un villaggio vinicolo medievale con la porta cittadina originale e le osterie del vino",
        "Ihringen — il comune più soleggiato della Germania",
        "Sentieri incassati nel loess — antiche vie scavate nelle dorate pareti di tufo",
        "Vogtsburg / Oberbergen — il cuore del cono vulcanico con viste a perdita d'occhio"
      ],
      "externalLabel": "Itinerari del Kaiserstuhl su Outdooractive"
    },
    "glottertal-valley-loop": {
      "name": "Giro della Valle del Glottertal",
      "startPoint": "Freiburg Hauptbahnhof (stazione centrale)",
      "durationText": "3–4 h",
      "description": "Questo gratificante giro lascia Freiburg dirigendosi verso nord attraverso i villaggi della pianura del Reno di Gundelfingen e Denzlingen, prima di voltare a est nella stretta e boscosa Valle del Glottertal — una valle laterale della Foresta Nera resa famosa in tutto il mondo dalla longeva serie TV tedesca Schwarzwaldklinik. La salita lungo il torrente Glotter è costante ma mai estenuante e ricompensa i ciclisti con vigneti, fattorie a graticcio e un autentico senso di isolamento nella Foresta Nera. Il ritorno riporta a Freiburg lungo la pianeggiante ciclabile della Dreisam, fiancheggiata dagli alberi — uno degli itinerari fluviali più piacevoli del Baden-Württemberg.",
      "bestFor": "Ciclisti del tempo libero ed e-biker in cerca di pittoresche valli della Foresta Nera e di un ritorno tranquillo",
      "highlights": [
        "L'edificio della Schwarzwaldklinik nel Glottertal — iconica location della serie TV di culto",
        "Valle del Glotterbach — una stretta gola boscosa con prati e vigneti",
        "Denzlingen e Gundelfingen — villaggi della pianura del Reno con panetterie locali",
        "Viste panoramiche sul massiccio del Kandel (1.241 m) mentre si sale nella valle",
        "Ciclabile della Dreisam al ritorno — un percorso fluviale pianeggiante e ombreggiato verso la città"
      ],
      "externalLabel": "Glottertal su Outdooractive"
    },
    "schauinsland-climb-freiburg": {
      "name": "Salita alla vetta dello Schauinsland",
      "startPoint": "Freiburg, Johanneskirche / Günterstal",
      "durationText": "1,5–3 h",
      "description": "La Schauinslandstraße — aperta al traffico dal 1896 — è la sfida ciclistica più iconica di Freiburg: 17,9 km di puro asfalto che si arrampicano per quasi 930 metri dal margine meridionale della città fino ai 1.284 m della vetta della montagna di casa di Freiburg. I primi 6 km scorrono dolcemente attraverso il verdeggiante quartiere di Günterstal; dopo Bohrer la strada scatena una serie di strette curve a tornante nel fitto bosco di abeti della Foresta Nera, con rampe che toccano l'11–12 % prima di spianarsi lungo la cresta aperta a Holzschlägermatte (910 m), dove all'improvviso appaiono la pianura del Reno e i Vosgi. Nei fine settimana estivi alcuni tratti della strada sono chiusi alle auto, rendendo l'approccio finale alla vetta ancora più gratificante.",
      "bestFor": "Ciclisti su strada ed e-MTB allenati in cerca di una classica salita di vetta",
      "highlights": [
        "Il villaggio di Günterstal — la verde porta d'accesso dove inizia la salita vera",
        "Bivio di Bohrer — l'inizio del celebre tratto di tornanti",
        "Prato di Holzschlägermatte (910 m) — prima vista panoramica sulla pianura del Reno e sui Vosgi",
        "Vetta dello Schauinsland (1.284 m) — stazione della funivia e vista fino alle Alpi",
        "Schauinslandkönig — la storica cronoscalata si corre su questa strada ogni luglio"
      ],
      "externalLabel": "Profilo altimetrico su Quäldich"
    },
    "freiburg-breisach-rhein": {
      "name": "Da Freiburg a Breisach am Rhein — pianura del Reno e vigneti",
      "startPoint": "Freiburg Hauptbahnhof (stazione centrale)",
      "durationText": "2–3 h",
      "description": "Dalla stazione centrale di Freiburg l'itinerario procede verso ovest lungo la ciclabile della Dreisam e poi si apre nell'ampia e assolata pianura del Reno, passando accanto ai frutteti e ai campi di asparagi di Opfingen prima di raggiungere l'Altrhein (vecchio canale del Reno) e le sue tranquille foreste golenali. Gli ultimi chilometri salgono sull'iconico Münsterberg — il neck vulcanico che corona Breisach — ricompensando i ciclisti con un panorama che spazia sul Reno, sul massiccio del Kaiserstuhl e oltre il confine, verso l'Alsazia francese e la fortezza a forma di stella di Neuf-Brisach, opera di Vauban. In cima, la cattedrale romanico-gotica di Santo Stefano domina il profilo della città, mentre più in basso attende la storica piazza del mercato.",
      "bestFor": "Ciclisti in cerca di una gita di un giorno tranquilla e in gran parte pianeggiante che unisce storia, cultura del vino e panorami sul Reno — ideale in e-bike",
      "highlights": [
        "Ciclabile della Dreisam in uscita da Freiburg — un avvio ombreggiato e senza auto attraverso i quartieri",
        "Campagna della pianura del Reno — frutteti, campi di asparagi e cieli aperti",
        "Altrhein (vecchio canale del Reno) — una tranquilla ansa con foresta ripariale e avifauna",
        "Punto panoramico del Münsterberg — panorama sul Reno, il Kaiserstuhl e i Vosgi",
        "Centro storico di Breisach — cattedrale di Santo Stefano, piazza del mercato e osterie del vino sul Reno"
      ],
      "externalLabel": "Itinerario su Komoot"
    }
  }
};

const AR: BikeToursPageText = {
  "metaTitle": "جولات الدراجات في Freiburg — أفضل 7 مسارات | Bike Haus",
  "metaDescription": "أفضل جولات الدراجات حول Freiburg: وادي Dreisam وKaiserstuhl وSchauinsland — مع المسافة والارتفاع والصعوبة. استأجر الدراجة المناسبة فورًا.",
  "heroTitle": "جولات الدراجات في Freiburg والمنطقة المحيطة بها",
  "heroSub": "من وادي Dreisam المنبسط إلى قمة Schauinsland: 7 مسارات منتقاة بعناية عبر الغابة السوداء وKaiserstuhl وسهل نهر الراين — لكل مستوى لياقة. الدراجة المناسبة للإيجار بانتظارك في متجرنا.",
  "badge1": "7 جولات",
  "badge2": "جميع مستويات الصعوبة",
  "badge3": "الغابة السوداء وKaiserstuhl",
  "introHeading": "Freiburg — واحدة من أجمل مناطق ركوب الدراجات في ألمانيا",
  "introText": "تقع Freiburg في موقع مثالي بين الغابة السوداء وKaiserstuhl وسهل نهر الراين — قلّما تقدّم مدينة هذا الكمّ من المسارات على بُعد خطوات من باب البيت. سواء كنت تبحث عن جولة عائلية مريحة بمحاذاة النهر، أو رحلة هادئة في ربوع الكروم، أو صعودًا جبليًا يستنفر العضلات، نقدّم لك هنا 7 من جولاتنا المفضّلة مع كل الأرقام الأساسية. لا تملك دراجة؟ في Bike Haus Freiburg يمكنك استئجار دراجات المدينة ودراجات الترحال والدراجات الكهربائية — الخوذة والقفل مشمولان، بأسعار يومية عادلة ودون موعد مسبق.",
  "labelDistance": "المسافة",
  "labelElevation": "الارتفاع",
  "labelDuration": "المدة",
  "labelBestFor": "الأنسب لـ",
  "labelRecommended": "الدراجة الموصى بها",
  "unitKm": "كم",
  "unitM": "م",
  "difficultyEasy": "سهل",
  "difficultyModerate": "متوسط",
  "difficultyHard": "صعب",
  "bikeCity": "دراجة المدينة",
  "bikeTrekking": "دراجة الترحال",
  "bikeEbike": "دراجة كهربائية",
  "bikeEmtb": "دراجة جبلية كهربائية",
  "bikeRoad": "دراجة طريق",
  "highlightsHeading": "أبرز المعالم",
  "rentThisBike": "استأجر الدراجة المناسبة",
  "tipsHeading": "نصائح عملية لجولتك بالدراجة",
  "guideLinkText": "اعثر على المزيد من المسارات والخرائط والنصائح في",
  "guideLinkLabel": "دليل ركوب الدراجات في Freiburg",
  "ctaHeading": "جاهز لجولتك؟ لدينا الدراجة المناسبة لها.",
  "ctaText": "دراجة مدينة لجولة Dreisam أو دراجة كهربائية لـ Kaiserstuhl — في Bike Haus Freiburg تستأجر الدراجة المناسبة تمامًا. الخوذة والقفل مشمولان، أسعار يومية عادلة، دون حاجة إلى موعد. احجز عبر الإنترنت أو مرّ علينا ببساطة في Heckerstraße 27.",
  "ctaButton": "استأجر دراجة الآن",
  "ctaSecondary": "شاهد جميع دراجات الإيجار",
  "tips": [
    {
      "title": "أفضل وقت للانطلاق",
      "text": "الفترة من مايو إلى أكتوبر مثالية. تتوهّج كروم Kaiserstuhl في الخريف، بينما يبقى وادي Dreisam ظليلًا ومنعشًا حتى في عزّ الصيف."
    },
    {
      "title": "ماذا تحضر معك",
      "text": "خوذة (مشمولة مع دراجاتنا المؤجَّرة)، ماء، واقٍ من الشمس، وبعض النقود لمتاجر المزارع وحانات النبيذ. احمل معك سترة خفيفة للجولات الجبلية."
    },
    {
      "title": "الانطلاق والوصول",
      "text": "تنطلق كثير من الجولات من محطة Freiburg الرئيسية أو مباشرةً من متجرنا في Heckerstraße 27. واستقلال القطار الإقليمي إلى وادي Dreisam أو إلى Kaiserstuhl يوفّر عليك الكثير من الصعود."
    },
    {
      "title": "دراجة كهربائية لمدى أطول",
      "text": "Kaiserstuhl أو Glottertal أو Schauinsland مع رياح مواتية؟ تتيح لك الدراجة الكهربائية المؤجَّرة خوض الجولات الطويلة براحة — بمدى يصل إلى 100 كم."
    }
  ],
  "routes": {
    "dreisamtal-radweg": {
      "name": "مسار وادي Dreisam للدراجات — من Freiburg إلى الغابة السوداء",
      "startPoint": "محطة Freiburg الرئيسية (Hauptbahnhof)",
      "durationText": "2.5–3.5 ساعة",
      "description": "بدءًا من محطة Freiburg الرئيسية، يتبع هذا المسار المنبسط بمحاذاة النهر مجرى Dreisam صعودًا عبر مروج تتراقص عليها أشعة الشمس ومزارع تقليدية من الغابة السوداء، وصولًا إلى Kirchzarten ثم إلى قريتَي Oberried وBuchenbach. بارتفاع إجمالي لا يكاد يتجاوز 370 مترًا موزّعة على 39 كيلومترًا، يبقى الانحدار لطيفًا بما يكفي للأطفال والراكبين الباحثين عن المتعة على حدٍّ سواء. وعلى الطريق، تبيع متاجر المزارع عسلًا وفاكهة من المنطقة، وتدعوك كنيسة الدير وحديقة الأعشاب في Oberried إلى استراحة قصيرة، فيما يشكّل مسبح Dreisambad المكشوف في Kirchzarten ختامًا صيفيًا مثاليًا قبل العودة نزولًا إلى Freiburg.",
      "bestFor": "العائلات وراكبي الدراجات للترفيه ومن يكتشفون الغابة السوداء لأول مرة",
      "highlights": [
        "مسار ضفة Dreisam من وسط مدينة Freiburg عبر Littenweiler",
        "قرية Himmelreich الصغيرة — محطة استراحة ساحرة بنُزُل تقليدي",
        "كنيسة الدير وحديقة الأعشاب في Oberried",
        "متاجر المزارع في Baldenwegerhof تبيع منتجات الغابة السوداء المحلية",
        "مسبح Dreisambad المكشوف في Kirchzarten لسباحة صيفية"
      ],
      "externalLabel": "المسار على Schwarzwald Tourismus"
    },
    "opfinger-see-mooswald-rieselfeld": {
      "name": "جولة بحيرة Opfinger See وغابة Mooswald",
      "startPoint": "Freiburg Rieselfeld (محطة الترام 5 أو موقف سيارات Mundenhof)",
      "durationText": "1.5–2.5 ساعة",
      "description": "تمرّ هذه الجولة المنبسطة الخالية من السيارات تقريبًا غرب Freiburg عبر الظلال الباردة لغابة Mooswald، إحدى أكبر الغابات المتّصلة في سهل نهر الراين الأعلى، قبل أن تطلّ على بحيرة Opfinger See — بحيرة متلألئة بمساحة 48 هكتارًا تحمل تصنيف الاتحاد الأوروبي لجودة المياه الممتازة، ومروج واسعة للاستجمام تحت الشمس مثالية لسباحة صيفية. ويسلك طريق العودة عبر Rieselfeld، محمية طبيعية كانت سابقًا حقول صرف وباتت اليوم تعجّ بالطيور النادرة، ويمرّ بحديقة حيوانات Mundenhof المجانية، ما يجعلها وجهة جانبية مثالية للعائلات. وبارتفاع إجمالي لا يتجاوز نحو 40 مترًا، فلا حاجة إلى أي أساس من اللياقة البدنية إطلاقًا.",
      "bestFor": "العائلات مع الأطفال والمبتدئين وكل من يبحث عن جولة نصف يوم مريحة مع سباحة في البحيرة",
      "highlights": [
        "غابة Mooswald — دروب ظليلة عبر إحدى أكبر غابات نهر الراين الأعلى",
        "بحيرة Waltershofener See — بحيرة غابات هادئة، رائعة لمراقبة الطيور",
        "بحيرة Opfinger See — بحيرة بجودة مياه ممتازة معتمدة من الاتحاد الأوروبي ومنطقة سباحة",
        "محمية Rieselfeld الطبيعية — موطن محمي لطيور الأراضي الرطبة النادرة",
        "Mundenhof — حديقة حيوانات وطبيعة بدخول مجاني"
      ],
      "externalLabel": "بحيرة Opfinger See على Komoot"
    },
    "tuniberg-vineyard-loop": {
      "name": "جولة كروم Tuniberg",
      "startPoint": "Freiburg-Munzingen",
      "durationText": "2.5–3.5 ساعة",
      "description": "يُعدّ Tuniberg، وهو تلّ جيري لطيف يرتفع إلى 312 مترًا غرب Freiburg، سرّ المنطقة الأفضل حفظًا لمحبّي الدراجات — أصغر وأهدأ من جاره البركاني Kaiserstuhl، لكنه لا يقلّ ثراءً بكروم أصناف البرغندي والدروب المحفوفة بالأزهار والمناظر الممتدّة. تربط هذه الجولة أحياء Freiburg في Munzingen وTiengen وOpfingen بقريتَي النبيذ Merdingen وGottenheim عبر دروب مُعلَّمة جيدًا ومرصوفة في معظمها. وفي الأمسيات الصافية، تمنحك مطلّات التل بانوراما شاسعة تمتدّ غربًا عبر سهل نهر الراين إلى جبال Vosges في الألزاس، وشرقًا إلى قمم الغابة السوداء — واحدة من أجمل جولات الغروب في منطقة Freiburg.",
      "bestFor": "العائلات وعشّاق النبيذ وراكبي الدراجات للترفيه ممن يستمتعون بالمناظر البانورامية",
      "highlights": [
        "كنيسة Erentrudiskapelle فوق Munzingen — كنيسة حجّ بإطلالات بانورامية على الألزاس",
        "مطلّ Tunibergkreuz — خطوط رؤية تطلّ على سهل الراين وKaiserstuhl وVosges والغابة السوداء",
        "حانات النبيذ في Opfingen — ثقافة Straußwirtschaft العريقة في Breisgau مع نبيذ المزارع",
        "كنيسة St. Remigius في Merdingen — تحفة من الباروك المتأخّر (1738–1741)",
        "درب نبيذ Burgunderpfad عبر Gottenheim وMerdingen — لوحات تعريفية بأصناف العنب"
      ],
      "externalLabel": "جولة Tuniberg على Schwarzwald Tourismus"
    },
    "kaiserstuhl-weinradweg": {
      "name": "جولة نبيذ Kaiserstuhl",
      "startPoint": "Breisach am Rhein (محطة القطار)",
      "durationText": "3–5 ساعة",
      "description": "Kaiserstuhl كتلة بركانية متراصّة ترتفع إلى 556 مترًا فوق سهل نهر الراين الأعلى شمال غرب Freiburg، تغطّيها كروم Pinot Noir وPinot Gris التي تُنتج بعضًا من أدفأ نبيذ ألمانيا وأغناه. تدور الجولة الدائرية عبر قرى نبيذ بلون العسل — Ihringen، وBurkheim ببوّابتها البلدية من القرون الوسطى، وقرى Vogtsburg — مارّةً بدروب اللوس الغائرة المميّزة التي حفرتها قرونٌ من التعرية عميقًا في المنحدرات. أما اللحظة المميّزة فهي ممرّ Texaspass، صعودٌ بطول 1.7 كم بمعدّل انحدار 7.5 %، حيث تكافئ منعطفاته الضيقة بين Oberbergen وKiechlinsbergen الراكبين بإطلالات بانورامية على تلال الكروم المدرّجة الممتدّة إلى نهر الراين وما وراءه من جبال Vosges.",
      "bestFor": "عشّاق النبيذ وراكبي الدراجات للترفيه الباحثين عن مناظر كروم متموّجة بحركة مرور خفيفة",
      "highlights": [
        "Texaspass — صعود بمستوى السباقات الاحترافية بطول 1.7 كم (بمعدّل 7.5 %) مع بانوراما الكروم",
        "Burkheim — قرية نبيذ من القرون الوسطى ببوّابتها البلدية الأصلية وحانات النبيذ",
        "Ihringen — البلدية الأكثر تشمّسًا في ألمانيا",
        "دروب اللوس الغائرة — ممرات قديمة منخفضة محفورة في المنحدرات الذهبية",
        "Vogtsburg / Oberbergen — قلب المخروط البركاني بإطلالات شاسعة"
      ],
      "externalLabel": "مسارات Kaiserstuhl على Outdooractive"
    },
    "glottertal-valley-loop": {
      "name": "جولة وادي Glottertal",
      "startPoint": "محطة Freiburg الرئيسية (Hauptbahnhof)",
      "durationText": "3–4 ساعة",
      "description": "تغادر هذه الجولة المُجزية Freiburg شمالًا عبر قرى سهل نهر الراين Gundelfingen وDenzlingen، قبل أن تنعطف شرقًا إلى وادي Glottertal الضيّق الكثيف الأشجار — وهو وادٍ جانبي في الغابة السوداء ذاع صيته عالميًا بفضل المسلسل الألماني الطويل Schwarzwaldklinik. الصعود بمحاذاة جدول Glotter ثابتٌ لكنه ليس قاسيًا أبدًا، إذ يكافئ الراكبين بالكروم والبيوت الريفية ذات الهياكل الخشبية وإحساس أصيل بعزلة الغابة السوداء. أما طريق العودة فينساب نحو Freiburg عبر مسار Dreisam المنبسط المظلّل بالأشجار — أحد أمتع المسارات النهرية في Baden-Württemberg.",
      "bestFor": "راكبي الدراجات للترفيه ومستخدمي الدراجات الكهربائية الباحثين عن وديان خلّابة في الغابة السوداء وعودة سهلة",
      "highlights": [
        "مبنى Schwarzwaldklinik في Glottertal — موقع تصوير أيقوني للمسلسل التلفزيوني الشهير",
        "وادي Glotterbach — مضيق غابات ضيّق بمروج وكروم",
        "Denzlingen وGundelfingen — قرى سهل الراين بمخابز محلية",
        "إطلالات بانورامية على كتلة Kandel (1,241 م) وأنت تصعد إلى الوادي",
        "مسار Dreisam للدراجات عند العودة — طريق نهري منبسط ظليل يقودك إلى المدينة"
      ],
      "externalLabel": "Glottertal على Outdooractive"
    },
    "schauinsland-climb-freiburg": {
      "name": "صعود قمة Schauinsland",
      "startPoint": "Freiburg، Johanneskirche / Günterstal",
      "durationText": "1.5–3 ساعة",
      "description": "طريق Schauinslandstraße — المفتوح للسير منذ عام 1896 — هو أشهر تحدٍّ لركوب الدراجات في Freiburg: 17.9 كم من الإسفلت الخالص ترتفع نحو 930 مترًا من الطرف الجنوبي للمدينة إلى قمّة جبل Freiburg المحلي على ارتفاع 1,284 م. تنساب الكيلومترات الستّة الأولى بلطف عبر ضاحية Günterstal الخضراء؛ وبعد Bohrer يُطلق الطريق سلسلة من المنعطفات الحادّة عبر صنوبر الغابة السوداء الكثيف، بمنحدرات تبلغ 11–12 % قبل أن يهدأ عبر التلّ المكشوف عند Holzschlägermatte (910 م)، حيث يظهر فجأةً سهل نهر الراين وجبال Vosges. وفي عطلات نهاية الأسبوع الصيفية تُغلق أجزاء من الطريق أمام السيارات، ما يجعل المقاربة الأخيرة نحو القمّة أكثر إمتاعًا.",
      "bestFor": "راكبي دراجات الطريق وراكبي الدراجات الجبلية الكهربائية الأقوياء الباحثين عن صعود كلاسيكي إلى القمّة",
      "highlights": [
        "قرية Günterstal — البوّابة الخضراء حيث يبدأ الصعود الجادّ",
        "مفترق Bohrer — بداية مقطع المنعطفات الشهير",
        "مرج Holzschlägermatte (910 م) — أول إطلالة بانورامية على سهل الراين وVosges",
        "قمّة Schauinsland (1,284 م) — محطة التلفريك وإطلالات تصل حتى جبال الألب",
        "Schauinslandkönig — سباق الصعود التاريخي ضدّ الزمن يجري على هذا الطريق كل يوليو"
      ],
      "externalLabel": "مخطّط الصعود على Quäldich"
    },
    "freiburg-breisach-rhein": {
      "name": "من Freiburg إلى Breisach am Rhein — سهل الراين والكروم",
      "startPoint": "محطة Freiburg الرئيسية (Hauptbahnhof)",
      "durationText": "2–3 ساعة",
      "description": "من محطة Freiburg الرئيسية ينساب المسار غربًا بمحاذاة مسار Dreisam للدراجات، ثم ينفتح على سهل نهر الراين الواسع المشمّس، مارًّا ببساتين الفاكهة وحقول الهليون في Opfingen قبل بلوغ Altrhein (مجرى الراين القديم) وغاباته الهادئة في السهل الفيضي. أما الكيلومترات الأخيرة فتصعد تلّ Münsterberg الأيقوني — السدّادة البركانية التي تتوّج Breisach — لتكافئ الراكبين ببانوراما شاسعة تطلّ على نهر الراين وكتلة Kaiserstuhl، وعبر الحدود إلى الألزاس الفرنسية وقلعة Neuf-Brisach النجمية على طراز Vauban. وعند القمّة، تهيمن كاتدرائية St. Stephan ذات الطراز الرومانسكي-القوطي على الأفق، فيما تنتظرك ساحة السوق التاريخية في الأسفل.",
      "bestFor": "راكبي الدراجات الباحثين عن رحلة يوم منبسطة ومريحة تجمع بين التاريخ وثقافة النبيذ ومناظر الراين — مثالية على دراجة كهربائية",
      "highlights": [
        "مسار Dreisam للدراجات خارج Freiburg — انطلاقة ظليلة خالية من السيارات عبر الضواحي",
        "أراضي سهل الراين الزراعية — بساتين فاكهة وحقول هليون وسماء مفتوحة",
        "Altrhein (مجرى الراين القديم) — مياه راكدة هادئة بغابات ضفّية وحياة الطيور",
        "مطلّ Münsterberg — بانوراما تطلّ على نهر الراين وKaiserstuhl وVosges",
        "بلدة Breisach القديمة — كاتدرائية St. Stephan وساحة السوق وحانات النبيذ بمحاذاة الراين"
      ],
      "externalLabel": "المسار على Komoot"
    }
  }
};

const RU: BikeToursPageText = {
  "metaTitle": "Велотуры Freiburg — 7 лучших маршрутов | Bike Haus",
  "metaDescription": "Лучшие велотуры вокруг Фрайбурга: долина Драйзам, Кайзерштуль, Шауинсланд и не только — дистанция, набор высоты и сложность. Возьмите подходящий велосипед напрокат.",
  "heroTitle": "Велотуры во Фрайбурге и его окрестностях",
  "heroSub": "От равнинной долины Драйзам до вершины Шауинсланд: 7 тщательно отобранных веломаршрутов через Шварцвальд, Кайзерштуль и Рейнскую равнину — для любого уровня подготовки. Подходящий прокатный велосипед уже ждёт вас в нашем магазине.",
  "badge1": "7 туров",
  "badge2": "Все уровни сложности",
  "badge3": "Шварцвальд и Кайзерштуль",
  "introHeading": "Фрайбург — один из лучших велорегионов Германии",
  "introText": "Фрайбург расположен идеально — между Шварцвальдом, Кайзерштулем и Рейнской равниной, и мало какой город предлагает столько маршрутов прямо за порогом. Хотите неспешную семейную петлю вдоль реки, прогулку по винодельческому краю или бодрый горный подъём — вот наши 7 любимых туров со всеми ключевыми цифрами. Нет велосипеда с собой? В Bike Haus Freiburg можно взять напрокат городские, треккинговые и электровелосипеды — шлем и замок в комплекте, по честным дневным тарифам и без предварительной записи.",
  "labelDistance": "Дистанция",
  "labelElevation": "Набор высоты",
  "labelDuration": "Продолжительность",
  "labelBestFor": "Лучше всего для",
  "labelRecommended": "Рекомендуемый велосипед",
  "unitKm": "км",
  "unitM": "м",
  "difficultyEasy": "Лёгкий",
  "difficultyModerate": "Средний",
  "difficultyHard": "Сложный",
  "bikeCity": "Городской велосипед",
  "bikeTrekking": "Треккинговый велосипед",
  "bikeEbike": "Электровелосипед",
  "bikeEmtb": "Электрический горный велосипед",
  "bikeRoad": "Шоссейный велосипед",
  "highlightsHeading": "Изюминки маршрута",
  "rentThisBike": "Взять подходящий велосипед",
  "tipsHeading": "Практические советы для вашего велотура",
  "guideLinkText": "Ещё больше маршрутов, карт и советов вы найдёте в нашем",
  "guideLinkLabel": "путеводителе по велопрогулкам во Фрайбурге",
  "ctaHeading": "Готовы к туру? У нас есть велосипед для него.",
  "ctaText": "Городской велосипед для петли вдоль Драйзам или электровелосипед для Кайзерштуля — в Bike Haus Freiburg вы возьмёте напрокат именно тот велосипед, что нужен. Шлем и замок в комплекте, честные дневные тарифы, запись не требуется. Бронируйте онлайн или просто заходите на Heckerstraße 27.",
  "ctaButton": "Взять велосипед напрокат",
  "ctaSecondary": "Смотреть все прокатные велосипеды",
  "tips": [
    {
      "title": "Лучшее время для поездки",
      "text": "Идеален период с мая по октябрь. Виноградники Кайзерштуля пылают красками осенью, а долина Драйзам остаётся тенистой и прохладной даже в разгар лета."
    },
    {
      "title": "Что взять с собой",
      "text": "Шлем (входит в наш прокат), воду, защиту от солнца и немного наличных для фермерских лавок и винных таверн. Для горных поездок прихватите лёгкую куртку."
    },
    {
      "title": "Старт и как добраться",
      "text": "Многие туры стартуют от главного вокзала Фрайбурга или прямо от нашего магазина на Heckerstraße 27. Региональный поезд в долину Драйзам или к Кайзерштулю избавит вас от части набора высоты."
    },
    {
      "title": "Электровелосипед для большего запаса хода",
      "text": "Кайзерштуль, Глоттерталь или Шауинсланд с попутным ветром? Прокатный электровелосипед позволит с комфортом одолеть длинные туры — запас хода до 100 км."
    }
  ],
  "routes": {
    "dreisamtal-radweg": {
      "name": "Веломаршрут по долине Драйзам — из Фрайбурга в Шварцвальд",
      "startPoint": "Главный вокзал Фрайбурга (Hauptbahnhof)",
      "durationText": "2,5–3,5 ч",
      "description": "Стартуя от главного вокзала Фрайбурга, этот равнинный маршрут вдоль реки следует вверх по течению Драйзам через залитые солнцем луга и традиционные шварцвальдские хутора — вплоть до Кирхцартена и дальше в деревни Оберрид и Бухенбах. Всего около 370 метров общего набора высоты на 39 километрах — уклон настолько мягкий, что подойдёт и детям, и любителям неспешной езды. По пути фермерские лавки предлагают местный мёд и фрукты, монастырская церковь и сад трав в Оберриде так и манят сделать короткую остановку, а открытый бассейн Dreisambad в Кирхцартене станет идеальным летним финалом перед возвращением вниз по течению во Фрайбург.",
      "bestFor": "Семьи, любители прогулок и те, кто впервые открывает для себя Шварцвальд",
      "highlights": [
        "Прибрежная тропа вдоль Драйзам из центра Фрайбурга через Литтенвайлер",
        "Хутор Химмельрайх — очаровательное место для отдыха с традиционным гастхаусом",
        "Монастырская церковь и сад трав в Оберриде",
        "Фермерские лавки в Бальденвегерхофе с местными продуктами Шварцвальда",
        "Открытый бассейн Dreisambad в Кирхцартене — окунуться в летнюю жару"
      ],
      "externalLabel": "Маршрут на Schwarzwald Tourismus"
    },
    "opfinger-see-mooswald-rieselfeld": {
      "name": "Петля вокруг озера Опфингер-Зе и леса Моосвальд",
      "startPoint": "Фрайбург, Ризельфельд (остановка трамвая 5 или парковка Mundenhof)",
      "durationText": "1,5–2,5 ч",
      "description": "Эта равнинная, почти без автомобилей петля проходит к западу от Фрайбурга через прохладную тень Моосвальда — одного из крупнейших цельных лесов Верхнерейнской равнины — и выводит к озеру Опфингер-Зе, сверкающему водоёму площадью 48 гектаров с отличным по нормам ЕС качеством воды и широкими лугами для загара, идеальными для летнего купания. Обратный путь вьётся через Ризельфельд — бывшие поля орошения, ныне природный заповедник, где кишат редкие птицы, — и проходит мимо зоопарка Mundenhof с бесплатным входом, что делает маршрут отличным выбором для семей. С общим набором высоты всего около 40 метров никакой особой подготовки не требуется.",
      "bestFor": "Семьи с детьми, новички и все, кто хочет неспешную поездку на полдня с купанием в озере",
      "highlights": [
        "Лес Моосвальд — тенистые тропы через один из крупнейших лесов Верхнего Рейна",
        "Озеро Вальтерсхофенер-Зе — тихое лесное озеро, отличное для наблюдения за птицами",
        "Опфингер-Зе — озеро с сертифицированным ЕС отличным качеством воды и зоной для купания",
        "Природный заповедник Ризельфельд — охраняемая среда обитания редких водно-болотных птиц",
        "Mundenhof — парк животных и природы с бесплатным входом"
      ],
      "externalLabel": "Опфингер-Зе на Komoot"
    },
    "tuniberg-vineyard-loop": {
      "name": "Виноградная петля Туниберг",
      "startPoint": "Фрайбург-Мунцинген",
      "durationText": "2,5–3,5 ч",
      "description": "Туниберг — пологая известняковая гряда высотой до 312 метров к западу от Фрайбурга — лучший секрет велосипедистов региона: меньше и тише своего вулканического соседа Кайзерштуля, но столь же богатый бургундскими сортами лозы, обрамлёнными цветами дорожками и далёкими видами. Эта петля соединяет фрайбургские районы Мунцинген, Тинген и Опфинген с винными деревнями Мердинген и Готтенхайм по хорошо размеченным, в основном асфальтированным тропам. В ясные вечера видовые точки гряды дарят широкую панораму — на запад через Рейнскую равнину к Вогезам в Эльзасе и на восток к вершинам Шварцвальда — это одна из лучших поездок региона Фрайбурга на закате.",
      "bestFor": "Семьи, ценители вина и любители прогулок, которым по душе панорамные виды",
      "highlights": [
        "Капелла Эрентрудискапелле над Мунцингеном — паломническая часовня с панорамой на Эльзас",
        "Видовая точка Tunibergkreuz — обзор Рейнской равнины, Кайзерштуля, Вогезов и Шварцвальда",
        "Винные таверны в Опфингене — классическая культура брайсгауских Straußwirtschaft с винами хозяйств",
        "Церковь Св. Ремигия в Мердингене — шедевр позднего барокко (1738–1741)",
        "Винная тропа Burgunderpfad через Готтенхайм и Мердинген — тематические таблички о сортах винограда"
      ],
      "externalLabel": "Тур по Тунибергу на Schwarzwald Tourismus"
    },
    "kaiserstuhl-weinradweg": {
      "name": "Винный тур по Кайзерштулю",
      "startPoint": "Брайзах-ам-Райн (вокзал)",
      "durationText": "3–5 ч",
      "description": "Кайзерштуль — компактный вулканический массив высотой до 556 метров, поднимающийся над Верхнерейнской равниной к северо-западу от Фрайбурга и укрытый виноградниками Шпетбургундера и Граубургундера, из которых рождаются одни из самых тёплых и насыщенных вин Германии. Кольцевой маршрут петляет через медово-золотистые винные деревни — Ирингена, Бурхайма с его средневековыми городскими воротами и хуторов Фогтсбурга — минуя характерные лёссовые овраги, глубоко вырезанные в склонах веками эрозии. Кульминация маршрута — Texaspass, подъём длиной 1,7 км со средним уклоном 7,5 %, чьи крутые повороты между Обербергеном и Кихлинсбергеном вознаграждают велосипедистов панорамой террасированных виноградниками холмов, уходящих к Рейну и далёким Вогезам.",
      "bestFor": "Ценителей вина и любителей прогулок, желающих холмистых виноградных пейзажей при минимуме трафика",
      "highlights": [
        "Texaspass — подъём профессионального уровня длиной 1,7 км (средний уклон 7,5 %) с виноградными панорамами",
        "Бурхайм — средневековая винная деревня с оригинальными городскими воротами и винными тавернами",
        "Ириген — самый солнечный населённый пункт Германии",
        "Лёссовые овраги — древние утопленные дороги, прорезанные в золотистых склонах",
        "Фогтсбург / Оберберген — сердце вулканического конуса с захватывающими видами"
      ],
      "externalLabel": "Маршруты Кайзерштуля на Outdooractive"
    },
    "glottertal-valley-loop": {
      "name": "Петля по долине Глоттерталь",
      "startPoint": "Главный вокзал Фрайбурга (Hauptbahnhof)",
      "durationText": "3–4 ч",
      "description": "Эта благодарная петля уводит из Фрайбурга на север через деревни Рейнской равнины Гундельфинген и Денцлинген, а затем сворачивает на восток в узкую лесистую долину Глоттерталь — боковую долину Шварцвальда, прославившуюся на весь мир благодаря долгоиграющему немецкому телесериалу «Шварцвальдская клиника». Подъём вдоль ручья Глоттер ровный, но никогда не изнуряющий, и вознаграждает виноградниками, фахверковыми усадьбами и настоящим ощущением шварцвальдского уединения. Обратный путь плавно возвращает во Фрайбург по равнинной, обрамлённой деревьями велодорожке вдоль Драйзам — одному из самых приятных прибрежных маршрутов Баден-Вюртемберга.",
      "bestFor": "Любителей прогулок и владельцев электровелосипедов, ищущих живописные долины Шварцвальда и мягкое возвращение",
      "highlights": [
        "Здание «Шварцвальдской клиники» в Глоттертале — культовое место съёмок легендарного телесериала",
        "Долина ручья Глоттербах — узкое лесистое ущелье с лугами и виноградниками",
        "Денцлинген и Гундельфинген — деревни Рейнской равнины с местными пекарнями",
        "Панорамные виды на массив Кандель (1241 м) во время подъёма в долину",
        "Велодорожка вдоль Драйзам на обратном пути — равнинный, тенистый прибрежный маршрут в город"
      ],
      "externalLabel": "Глоттерталь на Outdooractive"
    },
    "schauinsland-climb-freiburg": {
      "name": "Подъём на вершину Шауинсланд",
      "startPoint": "Фрайбург, Johanneskirche / Гюнтерсталь",
      "durationText": "1,5–3 ч",
      "description": "Дорога Schauinslandstraße — открытая для движения с 1896 года — самый легендарный велосипедный вызов Фрайбурга: 17,9 км чистого асфальта с набором почти 930 метров от южной окраины города до вершины высотой 1284 м — домашней горы Фрайбурга. Первые 6 км плавно катятся через зелёный пригород Гюнтерсталь; после Борера дорога обрушивает череду крутых серпантинов сквозь густой шварцвальдский ельник, где уклоны достигают 11–12 %, прежде чем смягчиться на открытой гряде у Хольцшлегерматте (910 м), где внезапно появляются Рейнская равнина и Вогезы. По выходным летом часть дороги закрывают для машин, и финальный подход к вершине становится ещё приятнее.",
      "bestFor": "Шоссейников и сильных райдеров на электро-MTB, жаждущих классического подъёма на вершину",
      "highlights": [
        "Деревня Гюнтерсталь — зелёные ворота, где начинается серьёзный подъём",
        "Развязка Борер — старт знаменитого серпантинного участка",
        "Луг Хольцшлегерматте (910 м) — первый панорамный вид на Рейнскую равнину и Вогезы",
        "Вершина Шауинсланд (1284 м) — станция канатной дороги и виды вплоть до Альп",
        "Schauinslandkönig — исторический горный тайм-триал проходит по этой дороге каждый июль"
      ],
      "externalLabel": "Профиль подъёма на Quäldich"
    },
    "freiburg-breisach-rhein": {
      "name": "Из Фрайбурга в Брайзах-ам-Райн — Рейнская равнина и виноградники",
      "startPoint": "Главный вокзал Фрайбурга (Hauptbahnhof)",
      "durationText": "2–3 ч",
      "description": "От главного вокзала Фрайбурга маршрут катится на запад по велодорожке вдоль Драйзам, а затем выходит на широкую, прогретую солнцем Рейнскую равнину, минуя фруктовые сады и спаржевые поля Опфингена, прежде чем достичь Альтрайна (старого русла Рейна) и его тихих пойменных лесов. Последние километры взбираются на легендарный Мюнстерберг — вулканическую пробку, венчающую Брайзах, — вознаграждая велосипедистов широкой панорамой на Рейн, массив Кайзерштуль и за границу — на французский Эльзас и звездообразную крепость Вобана Нёф-Бризак. На вершине романско-готический собор Св. Стефана царит над силуэтом города, а внизу ждёт исторический рыночная площадь.",
      "bestFor": "Велосипедистов, желающих неспешную, почти равнинную однодневную поездку с историей, винной культурой и рейнскими пейзажами — идеально на электровелосипеде",
      "highlights": [
        "Велодорожка вдоль Драйзам из Фрайбурга — тенистый старт без машин через пригороды",
        "Сельскохозяйственные угодья Рейнской равнины — фруктовые сады, спаржевые поля и открытое небо",
        "Альтрайн (старое русло Рейна) — тихая заводь с пойменным лесом и птицами",
        "Видовая точка Мюнстерберг — панорама на Рейн, Кайзерштуль и Вогезы",
        "Старый город Брайзах — собор Св. Стефана, рыночная площадь и винные таверны у Рейна"
      ],
      "externalLabel": "Маршрут на Komoot"
    }
  }
};

export const BIKE_TOURS_TEXT: Record<Language, BikeToursPageText> = {
  de: DE,
  en: EN,
  fr: FR,
  tr: TR,
  es: ES,
  it: IT,
  ar: AR,
  ru: RU,
};
