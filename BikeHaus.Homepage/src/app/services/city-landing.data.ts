import { Language } from './translation.service';

type CityLandingTranslationMap = Record<
  'de' | 'en' | 'fr' | 'tr',
  CityLandingTranslation
> &
  Partial<Record<Language, CityLandingTranslation>>;

export interface CityLandingTranslation {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSub: string;
  introHeading: string;
  introText: string;
  whyHeading: string;
  whyItems: string[];
  offerHeading: string;
  offerItems: string[];
  ctaHeading: string;
  ctaText: string;
  directions: string;
}

export interface CityLanding {
  slug: string;
  cityName: string;
  distanceKm: number;
  driveMinutes: number;
  translations: CityLandingTranslationMap;
}

export const CITY_LANDINGS: CityLanding[] = [
  {
    slug: 'fahrrad-emmendingen',
    cityName: 'Emmendingen',
    distanceKm: 16,
    driveMinutes: 20,
    translations: {
      de: {
        metaTitle:
          'Fahrrad Emmendingen — Fahrräder kaufen bei Bike Haus Freiburg',
        metaDescription:
          'Fahrrad kaufen in Emmendingen? Bike Haus Freiburg ist nur 16 km entfernt. Über 100 neue & gebrauchte Fahrräder, E-Bikes mit Garantie. Probefahrt ohne Termin.',
        heroTitle: 'Fahrrad kaufen in Emmendingen?',
        heroSub:
          'Bike Haus Freiburg — Ihr Fahrradladen nur 16 km von Emmendingen entfernt.',
        introHeading: 'Fahrräder für Emmendingen bei Bike Haus Freiburg',
        introText:
          'Sie suchen ein Fahrrad in Emmendingen? Bike Haus Freiburg in der Heckerstraße 27, Freiburg, ist nur 20 Minuten mit dem Auto entfernt. Bei uns finden Sie über 100 neue und gebrauchte Fahrräder — Citybikes, Trekkingräder, Mountainbikes, E-Bikes und Kinderfahrräder. Jedes Gebrauchtrad ist technisch geprüft und wird mit 3 Monaten Garantie verkauft.',
        whyHeading: 'Warum Bike Haus Freiburg für Emmendinger?',
        whyItems: [
          'Nur 16 km / 20 Minuten über die B3 oder L187',
          'Über 100 Fahrräder vorrätig — keine Wartezeit, keine Bestellung',
          'Geprüfte Gebrauchträder mit 3 Monaten Garantie',
          'Neue Fahrräder mit 24 Monaten Garantie',
          'Probefahrt vor Ort — ohne Termin',
          'Faire Preise — deutlich günstiger als viele Emmendinger Händler',
          'Beratung auf Deutsch, Englisch, Französisch und Türkisch',
        ],
        offerHeading: 'Unser Angebot',
        offerItems: [
          'Citybikes ab ca. 180 € (gebraucht) / ab 350 € (neu)',
          'Trekkingräder für Pendler und Freizeit',
          'E-Bikes ab ca. 999 € (gebraucht) — Akku-Zustand dokumentiert',
          'Mountainbikes für Trails im Schwarzwald',
          'Kinderfahrräder in allen Größen',
          'Fahrradzubehör: Schlösser, Helme, Beleuchtung, Körbe',
        ],
        ctaHeading: 'Jetzt vorbeikommen!',
        ctaText:
          'Besuchen Sie uns in der Heckerstraße 27, 79114 Freiburg. Geöffnet Mo–Sa 13:00–17:00 Uhr, So geschlossen. Oder schreiben Sie uns auf WhatsApp: +49 155 6630 0011.',
        directions:
          'Von Emmendingen über die B3 Richtung Freiburg. In Freiburg auf die Heckerstraße abbiegen. Kostenlose Parkplätze vorhanden.',
      },
      en: {
        metaTitle: 'Bicycle Emmendingen — Buy bikes at Bike Haus Freiburg',
        metaDescription:
          'Buy a bike in Emmendingen? Bike Haus Freiburg is only 16 km away. Over 100 new & used bicycles, e-bikes with warranty. Test ride without appointment.',
        heroTitle: 'Buy a bicycle in Emmendingen?',
        heroSub:
          'Bike Haus Freiburg — your bike shop only 16 km from Emmendingen.',
        introHeading: 'Bicycles for Emmendingen at Bike Haus Freiburg',
        introText:
          "Looking for a bike in Emmendingen? Bike Haus Freiburg at Heckerstraße 27, Freiburg, is only a 20-minute drive away. We have over 100 new and used bicycles — city bikes, trekking bikes, mountain bikes, e-bikes and children's bikes. Every used bike is technically inspected and comes with a 3-month warranty.",
        whyHeading: 'Why Bike Haus Freiburg for Emmendingen residents?',
        whyItems: [
          'Only 16 km / 20 minutes via the B3 or L187',
          'Over 100 bikes in stock — no waiting, no ordering',
          'Inspected used bikes with 3-month warranty',
          'New bicycles with 24-month warranty',
          'Test ride on site — no appointment needed',
          'Fair prices — significantly cheaper than many Emmendingen dealers',
          'Advice in German, English, French and Turkish',
        ],
        offerHeading: 'Our Range',
        offerItems: [
          'City bikes from approx. €180 (used) / from €350 (new)',
          'Trekking bikes for commuters and leisure',
          'E-bikes from approx. €800 (used) — battery condition documented',
          'Mountain bikes for Black Forest trails',
          "Children's bikes in all sizes",
          'Bike accessories: locks, helmets, lights, baskets',
        ],
        ctaHeading: 'Visit us now!',
        ctaText:
          'Visit us at Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. Or message us on WhatsApp: +49 155 6630 0011.',
        directions:
          'From Emmendingen via the B3 towards Freiburg. Turn onto Heckerstraße in Freiburg. Free parking available.',
      },
      fr: {
        metaTitle:
          'Vélo Emmendingen — Acheter des vélos chez Bike Haus Freiburg',
        metaDescription:
          "Acheter un vélo à Emmendingen? Bike Haus Freiburg n'est qu'à 16 km. Plus de 100 vélos neufs et d'occasion, vélos électriques avec garantie.",
        heroTitle: 'Acheter un vélo à Emmendingen?',
        heroSub:
          "Bike Haus Freiburg — votre magasin de vélos à seulement 16 km d'Emmendingen.",
        introHeading: 'Vélos pour Emmendingen chez Bike Haus Freiburg',
        introText:
          "Vous cherchez un vélo à Emmendingen? Bike Haus Freiburg, Heckerstraße 27, Freiburg, n'est qu'à 20 minutes en voiture. Nous proposons plus de 100 vélos neufs et d'occasion — vélos de ville, VTC, VTT, vélos électriques et vélos pour enfants. Chaque vélo d'occasion est contrôlé techniquement et vendu avec 3 mois de garantie.",
        whyHeading:
          "Pourquoi Bike Haus Freiburg pour les habitants d'Emmendingen?",
        whyItems: [
          'Seulement 16 km / 20 minutes via la B3 ou L187',
          'Plus de 100 vélos en stock — sans attente',
          "Vélos d'occasion contrôlés avec 3 mois de garantie",
          'Vélos neufs avec 24 mois de garantie',
          'Essai sur place — sans rendez-vous',
          "Prix justes — nettement moins cher que beaucoup de revendeurs d'Emmendingen",
          'Conseils en allemand, anglais, français et turc',
        ],
        offerHeading: 'Notre offre',
        offerItems: [
          "Vélos de ville à partir d'env. 180 € (occasion) / 350 € (neuf)",
          'VTC pour les trajets et les loisirs',
          "Vélos électriques à partir d'env. 999 € (occasion) — état de la batterie documenté",
          'VTT pour les sentiers de la Forêt-Noire',
          'Vélos pour enfants dans toutes les tailles',
          'Accessoires vélo: antivols, casques, éclairage, paniers',
        ],
        ctaHeading: 'Venez nous voir!',
        ctaText:
          'Rendez-nous visite au Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. Ou écrivez-nous sur WhatsApp: +49 155 6630 0011.',
        directions:
          'Depuis Emmendingen via la B3 direction Freiburg. Tournez dans la Heckerstraße à Freiburg. Parking gratuit disponible.',
      },
      tr: {
        metaTitle: "Bisiklet Emmendingen — Bike Haus Freiburg'da bisiklet alın",
        metaDescription:
          "Emmendingen'de bisiklet mi arıyorsunuz? Bike Haus Freiburg sadece 16 km uzaklıkta. 100'den fazla yeni ve ikinci el bisiklet, e-bisiklet, garantili.",
        heroTitle: "Emmendingen'de bisiklet mi arıyorsunuz?",
        heroSub:
          "Bike Haus Freiburg — Emmendingen'den sadece 16 km uzaklıkta bisiklet mağazanız.",
        introHeading: 'Emmendingen için bisikletler — Bike Haus Freiburg',
        introText:
          "Emmendingen'de bisiklet mi arıyorsunuz? Bike Haus Freiburg, Heckerstraße 27, Freiburg, arabayla sadece 20 dakika uzaklıkta. 100'den fazla yeni ve ikinci el bisiklet — şehir bisikletleri, trekking bisikletleri, dağ bisikletleri, e-bisikletler ve çocuk bisikletleri. Her ikinci el bisiklet teknik olarak kontrol edilmiş ve 3 ay garantili.",
        whyHeading: "Emmendingen'liler neden Bike Haus'u tercih etmeli?",
        whyItems: [
          'Sadece 16 km / 20 dakika B3 veya L187 üzerinden',
          "Stokta 100'den fazla bisiklet — bekleme yok",
          'Kontrol edilmiş ikinci el bisikletler, 3 ay garantili',
          'Yeni bisikletler 24 ay garantili',
          'Yerinde test sürüşü — randevusuz',
          'Uygun fiyatlar — birçok Emmendingen satıcısından çok daha ucuz',
          'Almanca, İngilizce, Fransızca ve Türkçe danışmanlık',
        ],
        offerHeading: 'Ürün Yelpazemiz',
        offerItems: [
          "Şehir bisikletleri yaklaşık 180 €'dan (ikinci el) / 350 €'dan (yeni)",
          'İşe gidip gelme ve boş zaman için trekking bisikletleri',
          "E-bisikletler yaklaşık 999 €'dan (ikinci el) — akü durumu belgelenmiş",
          'Schwarzwald parkurları için dağ bisikletleri',
          'Tüm bedenlerde çocuk bisikletleri',
          'Bisiklet aksesuarları: kilitler, kasklar, aydınlatma, sepetler',
        ],
        ctaHeading: 'Hemen gelin!',
        ctaText:
          "Heckerstraße 27, 79114 Freiburg adresine gelin. Açılış saatleri: Pzt–Cmt 13:00–17:00, Paz kapalı. Ya da WhatsApp'tan yazın: +49 155 6630 0011.",
        directions:
          "Emmendingen'den B3 üzerinden Freiburg yönüne gidin. Freiburg'da Heckerstraße'ye dönün. Ücretsiz park yeri mevcut.",
      },
    },
  },
  {
    slug: 'fahrrad-bad-krozingen',
    cityName: 'Bad Krozingen',
    distanceKm: 18,
    driveMinutes: 22,
    translations: {
      de: {
        metaTitle:
          'Fahrrad Bad Krozingen — Fahrräder kaufen bei Bike Haus Freiburg',
        metaDescription:
          'Fahrrad kaufen in Bad Krozingen? Bike Haus Freiburg: Nur 18 km entfernt. 100+ neue & gebrauchte Fahrräder, E-Bikes, Garantie, Probefahrt.',
        heroTitle: 'Fahrrad kaufen in Bad Krozingen?',
        heroSub:
          'Bike Haus Freiburg — nur 18 km von Bad Krozingen. Über 100 Fahrräder mit Garantie.',
        introHeading: 'Fahrräder für Bad Krozingen bei Bike Haus Freiburg',
        introText:
          'Bad Krozingen und Umgebung suchen ein gutes Fahrrad? Bike Haus Freiburg bietet Ihnen über 100 neue und gebrauchte Fahrräder — nur 22 Minuten Fahrt über die B3. Ob Citybike für den Alltag, E-Bike für die Hügel im Markgräflerland oder Trekkingrad für längere Touren — wir haben das passende Rad.',
        whyHeading: 'Warum von Bad Krozingen zu uns kommen?',
        whyItems: [
          'Nur 18 km / 22 Minuten über die B3',
          'Über 100 Fahrräder sofort verfügbar',
          'Geprüfte Gebrauchträder mit 3 Monaten Garantie',
          'E-Bikes mit dokumentiertem Akku-Zustand',
          'Kostenlose Probefahrt — ohne Termin',
          'Faire, transparente Preise',
        ],
        offerHeading: 'Unser Angebot',
        offerItems: [
          'Citybikes und Hollandräder für den Alltag',
          'E-Bikes für die Hügel im Markgräflerland',
          'Trekkingräder für den Dreisamtal-Radweg',
          'Kinderfahrräder in allen Größen',
          'Gebrauchte Fahrräder ab ca. 180 €',
        ],
        ctaHeading: 'Besuchen Sie uns!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Mo–Sa 13:00–17:00 Uhr, So geschlossen. WhatsApp: +49 155 6630 0011.',
        directions:
          'Von Bad Krozingen über die B3 Richtung Freiburg-Süd. Dauer: ca. 22 Minuten. Kostenlose Parkplätze vor dem Geschäft.',
      },
      en: {
        metaTitle: 'Bicycle Bad Krozingen — Buy bikes at Bike Haus Freiburg',
        metaDescription:
          'Buy a bike in Bad Krozingen? Bike Haus Freiburg: Only 18 km away. 100+ new & used bicycles, e-bikes, warranty, test rides.',
        heroTitle: 'Buy a bicycle in Bad Krozingen?',
        heroSub:
          'Bike Haus Freiburg — only 18 km from Bad Krozingen. Over 100 bikes with warranty.',
        introHeading: 'Bicycles for Bad Krozingen at Bike Haus Freiburg',
        introText:
          'Looking for a good bike in Bad Krozingen and the surrounding area? Bike Haus Freiburg offers over 100 new and used bicycles — just a 22-minute drive via the B3. Whether a city bike for everyday use, an e-bike for the Markgräflerland hills, or a trekking bike for longer tours — we have the right bike for you.',
        whyHeading: 'Why come from Bad Krozingen to us?',
        whyItems: [
          'Only 18 km / 22 minutes via the B3',
          'Over 100 bikes immediately available',
          'Inspected used bikes with 3-month warranty',
          'E-bikes with documented battery condition',
          'Free test ride — no appointment needed',
          'Fair, transparent prices',
        ],
        offerHeading: 'Our Range',
        offerItems: [
          'City bikes and Dutch bikes for everyday use',
          'E-bikes for the Markgräflerland hills',
          'Trekking bikes for the Dreisamtal cycle path',
          "Children's bikes in all sizes",
          'Used bicycles from approx. €180',
        ],
        ctaHeading: 'Visit us!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. WhatsApp: +49 155 6630 0011.',
        directions:
          'From Bad Krozingen via the B3 towards Freiburg-Süd. Duration: approx. 22 minutes. Free parking in front of the shop.',
      },
      fr: {
        metaTitle:
          'Vélo Bad Krozingen — Acheter des vélos chez Bike Haus Freiburg',
        metaDescription:
          "Acheter un vélo à Bad Krozingen? Bike Haus Freiburg: seulement 18 km. 100+ vélos neufs et d'occasion, vélos électriques, garantie.",
        heroTitle: 'Acheter un vélo à Bad Krozingen?',
        heroSub:
          'Bike Haus Freiburg — à seulement 18 km de Bad Krozingen. Plus de 100 vélos avec garantie.',
        introHeading: 'Vélos pour Bad Krozingen chez Bike Haus Freiburg',
        introText:
          "Vous cherchez un bon vélo à Bad Krozingen et ses environs? Bike Haus Freiburg vous propose plus de 100 vélos neufs et d'occasion — à seulement 22 minutes en voiture via la B3. Vélo de ville, vélo électrique pour les collines du Markgräflerland ou VTC pour les longues randonnées — nous avons le vélo qu'il vous faut.",
        whyHeading: 'Pourquoi venir de Bad Krozingen chez nous?',
        whyItems: [
          'Seulement 18 km / 22 minutes via la B3',
          'Plus de 100 vélos immédiatement disponibles',
          "Vélos d'occasion contrôlés avec 3 mois de garantie",
          'Vélos électriques avec état de batterie documenté',
          'Essai gratuit — sans rendez-vous',
          'Prix justes et transparents',
        ],
        offerHeading: 'Notre offre',
        offerItems: [
          'Vélos de ville et hollandais pour le quotidien',
          'Vélos électriques pour les collines du Markgräflerland',
          'VTC pour la piste cyclable du Dreisamtal',
          'Vélos pour enfants dans toutes les tailles',
          "Vélos d'occasion à partir d'env. 180 €",
        ],
        ctaHeading: 'Venez nous voir!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. WhatsApp: +49 155 6630 0011.',
        directions:
          'Depuis Bad Krozingen via la B3 direction Freiburg-Süd. Durée: env. 22 minutes. Parking gratuit devant le magasin.',
      },
      tr: {
        metaTitle:
          "Bisiklet Bad Krozingen — Bike Haus Freiburg'da bisiklet alın",
        metaDescription:
          "Bad Krozingen'de bisiklet mi arıyorsunuz? Bike Haus Freiburg sadece 18 km uzaklıkta. 100+ yeni ve ikinci el bisiklet, garantili.",
        heroTitle: "Bad Krozingen'de bisiklet mi arıyorsunuz?",
        heroSub:
          "Bike Haus Freiburg — Bad Krozingen'den sadece 18 km. 100'den fazla garantili bisiklet.",
        introHeading: 'Bad Krozingen için bisikletler — Bike Haus Freiburg',
        introText:
          "Bad Krozingen ve çevresinde iyi bir bisiklet mi arıyorsunuz? Bike Haus Freiburg, B3 üzerinden sadece 22 dakika uzaklıkta, 100'den fazla yeni ve ikinci el bisiklet sunuyor. Günlük kullanım için şehir bisikleti, Markgräflerland tepeleri için e-bisiklet veya uzun turlar için trekking bisikleti — sizin için doğru bisiklete sahibiz.",
        whyHeading: "Bad Krozingen'den neden bize gelmeli?",
        whyItems: [
          'Sadece 18 km / 22 dakika B3 üzerinden',
          "Stokta 100'den fazla bisiklet",
          'Kontrol edilmiş ikinci el bisikletler, 3 ay garantili',
          'Akü durumu belgelenmiş e-bisikletler',
          'Ücretsiz test sürüşü — randevusuz',
          'Adil, şeffaf fiyatlar',
        ],
        offerHeading: 'Ürün Yelpazemiz',
        offerItems: [
          'Günlük kullanım için şehir ve Hollanda bisikletleri',
          'Markgräflerland tepeleri için e-bisikletler',
          'Dreisamtal bisiklet yolu için trekking bisikletleri',
          'Tüm bedenlerde çocuk bisikletleri',
          "İkinci el bisikletler yaklaşık 180 €'dan",
        ],
        ctaHeading: 'Bizi ziyaret edin!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Pzt–Cmt 13:00–17:00, Paz kapalı. WhatsApp: +49 155 6630 0011.',
        directions:
          "Bad Krozingen'den B3 üzerinden Freiburg-Süd yönüne. Süre: yaklaşık 22 dakika. Mağaza önünde ücretsiz park yeri.",
      },
    },
  },
  {
    slug: 'fahrrad-breisach',
    cityName: 'Breisach am Rhein',
    distanceKm: 25,
    driveMinutes: 28,
    translations: {
      de: {
        metaTitle: 'Fahrrad Breisach — Fahrräder kaufen bei Bike Haus Freiburg',
        metaDescription:
          'Fahrrad kaufen in Breisach? Bike Haus Freiburg: 25 km entfernt, 100+ Fahrräder, E-Bikes, Garantie, Probefahrt ohne Termin.',
        heroTitle: 'Fahrrad kaufen in Breisach?',
        heroSub:
          'Bike Haus Freiburg — die große Auswahl nur 25 km von Breisach entfernt.',
        introHeading: 'Fahrräder für Breisach bei Bike Haus Freiburg',
        introText:
          'In Breisach am Rhein und Umgebung gibt es wenige spezialisierte Fahrradhändler. Bike Haus Freiburg bietet Ihnen die Auswahl, die Sie verdienen: über 100 neue und gebrauchte Fahrräder mit Garantie, nur 28 Minuten entfernt.',
        whyHeading: 'Warum die kurze Fahrt lohnt',
        whyItems: [
          'Nur 25 km / 28 Minuten über die B31',
          'Größte Auswahl in der Region — über 100 Fahrräder',
          'Gebrauchträder mit Garantie',
          'E-Bikes mit geprüftem Akku',
          'Probefahrt ohne Termin',
          'Parkplätze direkt vor dem Geschäft',
        ],
        offerHeading: 'Das erwartet Sie',
        offerItems: [
          'Citybikes für den Alltag in Breisach und Umgebung',
          'Trekkingräder für den Rhein-Radweg',
          'E-Bikes für die Fahrten zwischen Breisach und Freiburg',
          'Mountainbikes für den Kaiserstuhl',
          'Kinderfahrräder für den Schulweg',
        ],
        ctaHeading: 'Kommen Sie vorbei!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Mo–Sa 13:00–17:00 Uhr, So geschlossen. WhatsApp: +49 155 6630 0011.',
        directions:
          'Von Breisach über die B31 Richtung Freiburg. In ca. 28 Minuten bei uns. Parkplätze vorhanden.',
      },
      en: {
        metaTitle: 'Bicycle Breisach — Buy bikes at Bike Haus Freiburg',
        metaDescription:
          'Buy a bike in Breisach? Bike Haus Freiburg: 25 km away, 100+ bicycles, e-bikes, warranty, test ride without appointment.',
        heroTitle: 'Buy a bicycle in Breisach?',
        heroSub:
          'Bike Haus Freiburg — the big selection only 25 km from Breisach.',
        introHeading: 'Bicycles for Breisach at Bike Haus Freiburg',
        introText:
          'There are few specialized bicycle dealers in Breisach am Rhein and the surrounding area. Bike Haus Freiburg offers you the selection you deserve: over 100 new and used bicycles with warranty, only 28 minutes away.',
        whyHeading: 'Why the short drive is worth it',
        whyItems: [
          'Only 25 km / 28 minutes via the B31',
          'Largest selection in the region — over 100 bicycles',
          'Used bikes with warranty',
          'E-bikes with inspected battery',
          'Test ride without appointment',
          'Parking directly in front of the shop',
        ],
        offerHeading: 'What awaits you',
        offerItems: [
          'City bikes for everyday use in Breisach and surroundings',
          'Trekking bikes for the Rhine cycle path',
          'E-bikes for trips between Breisach and Freiburg',
          'Mountain bikes for the Kaiserstuhl',
          "Children's bikes for the school commute",
        ],
        ctaHeading: 'Come visit us!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. WhatsApp: +49 155 6630 0011.',
        directions:
          'From Breisach via the B31 towards Freiburg. About 28 minutes to reach us. Parking available.',
      },
      fr: {
        metaTitle: 'Vélo Breisach — Acheter des vélos chez Bike Haus Freiburg',
        metaDescription:
          'Acheter un vélo à Breisach? Bike Haus Freiburg: 25 km, 100+ vélos, vélos électriques, garantie, essai sans rendez-vous.',
        heroTitle: 'Acheter un vélo à Breisach?',
        heroSub:
          'Bike Haus Freiburg — le grand choix à seulement 25 km de Breisach.',
        introHeading: 'Vélos pour Breisach chez Bike Haus Freiburg',
        introText:
          "Il y a peu de marchands de vélos spécialisés à Breisach am Rhein et ses environs. Bike Haus Freiburg vous offre le choix que vous méritez: plus de 100 vélos neufs et d'occasion avec garantie, à seulement 28 minutes.",
        whyHeading: 'Pourquoi le court trajet en vaut la peine',
        whyItems: [
          'Seulement 25 km / 28 minutes via la B31',
          'Plus grand choix de la région — plus de 100 vélos',
          "Vélos d'occasion avec garantie",
          'Vélos électriques avec batterie contrôlée',
          'Essai sans rendez-vous',
          'Parking directement devant le magasin',
        ],
        offerHeading: 'Ce qui vous attend',
        offerItems: [
          'Vélos de ville pour le quotidien à Breisach et environs',
          'VTC pour la piste cyclable du Rhin',
          'Vélos électriques pour les trajets entre Breisach et Freiburg',
          'VTT pour le Kaiserstuhl',
          'Vélos pour enfants pour le trajet scolaire',
        ],
        ctaHeading: 'Venez nous voir!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. WhatsApp: +49 155 6630 0011.',
        directions:
          'Depuis Breisach via la B31 direction Freiburg. En env. 28 minutes chez nous. Parking disponible.',
      },
      tr: {
        metaTitle: "Bisiklet Breisach — Bike Haus Freiburg'da bisiklet alın",
        metaDescription:
          "Breisach'da bisiklet mi arıyorsunuz? Bike Haus Freiburg: 25 km uzaklıkta, 100+ bisiklet, garantili, randevusuz test sürüşü.",
        heroTitle: "Breisach'da bisiklet mi arıyorsunuz?",
        heroSub:
          "Bike Haus Freiburg — Breisach'dan sadece 25 km uzaklıkta geniş seçenek.",
        introHeading: 'Breisach için bisikletler — Bike Haus Freiburg',
        introText:
          "Breisach am Rhein ve çevresinde uzmanlaşmış bisiklet satıcıları çok az. Bike Haus Freiburg size hak ettiğiniz seçeneği sunuyor: garantili 100'den fazla yeni ve ikinci el bisiklet, sadece 28 dakika uzaklıkta.",
        whyHeading: 'Kısa yolculuk neden buna değer',
        whyItems: [
          'Sadece 25 km / 28 dakika B31 üzerinden',
          "Bölgenin en büyük seçimi — 100'den fazla bisiklet",
          'Garantili ikinci el bisikletler',
          'Kontrol edilmiş akülü e-bisikletler',
          'Randevusuz test sürüşü',
          'Mağaza önünde park yeri',
        ],
        offerHeading: 'Sizi neler bekliyor',
        offerItems: [
          'Breisach ve çevresinde günlük kullanım için şehir bisikletleri',
          'Ren bisiklet yolu için trekking bisikletleri',
          'Breisach-Freiburg arası yolculuklar için e-bisikletler',
          'Kaiserstuhl için dağ bisikletleri',
          'Okul yolu için çocuk bisikletleri',
        ],
        ctaHeading: 'Bize uğrayın!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Pzt–Cmt 13:00–17:00, Paz kapalı. WhatsApp: +49 155 6630 0011.',
        directions:
          "Breisach'dan B31 üzerinden Freiburg yönüne. Yaklaşık 28 dakikada bizde. Park yeri mevcut.",
      },
    },
  },
  {
    slug: 'fahrrad-gundelfingen',
    cityName: 'Gundelfingen',
    distanceKm: 8,
    driveMinutes: 12,
    translations: {
      de: {
        metaTitle:
          'Fahrrad Gundelfingen — Fahrräder kaufen bei Bike Haus Freiburg',
        metaDescription:
          'Fahrrad kaufen in Gundelfingen? Bike Haus Freiburg: Nur 8 km entfernt! 100+ neue & gebrauchte Fahrräder, E-Bikes, Garantie.',
        heroTitle: 'Fahrrad kaufen in Gundelfingen?',
        heroSub:
          'Bike Haus Freiburg — Ihr Nachbar-Fahrradladen, nur 8 km entfernt.',
        introHeading: 'Fahrräder für Gundelfingen bei Bike Haus Freiburg',
        introText:
          'Gundelfingen liegt direkt nördlich von Freiburg — und Bike Haus Freiburg ist nur 12 Minuten mit dem Auto oder 25 Minuten mit dem Fahrrad entfernt. Perfekt für eine Probefahrt! Wir bieten über 100 neue und gebrauchte Fahrräder mit Garantie.',
        whyHeading: 'Warum Bike Haus für Gundelfinger?',
        whyItems: [
          'Nur 8 km / 12 Minuten mit dem Auto',
          'Auch mit dem Fahrrad (25 min) oder Straßenbahn erreichbar',
          'Über 100 Fahrräder zum Probefahren',
          'Gebrauchträder mit 3 Monaten Garantie',
          'Faire Preise',
        ],
        offerHeading: 'Unser Sortiment',
        offerItems: [
          'Citybikes für den Pendelweg nach Freiburg',
          'E-Bikes für entspanntes Pendeln',
          'Trekkingräder für Freizeittouren im Dreisamtal',
          'Kinderfahrräder für alle Altersgruppen',
          'Gebrauchte Fahrräder ab ca. 180 €',
        ],
        ctaHeading: 'Jetzt vorbeikommen!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Mo–Sa 13:00–17:00 Uhr, So geschlossen. WhatsApp: +49 155 6630 0011.',
        directions:
          'Von Gundelfingen über die Freiburger Landstraße Richtung Freiburg-Haslach. Nur 12 Minuten.',
      },
      en: {
        metaTitle: 'Bicycle Gundelfingen — Buy bikes at Bike Haus Freiburg',
        metaDescription:
          'Buy a bike in Gundelfingen? Bike Haus Freiburg: Only 8 km away! 100+ new & used bicycles, e-bikes, warranty.',
        heroTitle: 'Buy a bicycle in Gundelfingen?',
        heroSub:
          'Bike Haus Freiburg — your neighbourhood bike shop, only 8 km away.',
        introHeading: 'Bicycles for Gundelfingen at Bike Haus Freiburg',
        introText:
          'Gundelfingen is located just north of Freiburg — and Bike Haus Freiburg is only a 12-minute drive or 25-minute bike ride away. Perfect for a test ride! We offer over 100 new and used bicycles with warranty.',
        whyHeading: 'Why Bike Haus for Gundelfingen residents?',
        whyItems: [
          'Only 8 km / 12 minutes by car',
          'Also reachable by bike (25 min) or tram',
          'Over 100 bikes to test ride',
          'Used bikes with 3-month warranty',
          'Fair prices',
        ],
        offerHeading: 'Our Selection',
        offerItems: [
          'City bikes for commuting to Freiburg',
          'E-bikes for relaxed commuting',
          'Trekking bikes for leisure tours in the Dreisamtal',
          "Children's bikes for all age groups",
          'Used bicycles from approx. €180',
        ],
        ctaHeading: 'Visit us now!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. WhatsApp: +49 155 6630 0011.',
        directions:
          'From Gundelfingen via Freiburger Landstraße towards Freiburg-Haslach. Only 12 minutes.',
      },
      fr: {
        metaTitle:
          'Vélo Gundelfingen — Acheter des vélos chez Bike Haus Freiburg',
        metaDescription:
          "Acheter un vélo à Gundelfingen? Bike Haus Freiburg: seulement 8 km! 100+ vélos neufs et d'occasion, vélos électriques, garantie.",
        heroTitle: 'Acheter un vélo à Gundelfingen?',
        heroSub:
          'Bike Haus Freiburg — votre magasin de vélos voisin, à seulement 8 km.',
        introHeading: 'Vélos pour Gundelfingen chez Bike Haus Freiburg',
        introText:
          "Gundelfingen est situé juste au nord de Freiburg — et Bike Haus Freiburg n'est qu'à 12 minutes en voiture ou 25 minutes à vélo. Parfait pour un essai! Nous proposons plus de 100 vélos neufs et d'occasion avec garantie.",
        whyHeading: 'Pourquoi Bike Haus pour les habitants de Gundelfingen?',
        whyItems: [
          'Seulement 8 km / 12 minutes en voiture',
          'Aussi accessible en vélo (25 min) ou en tramway',
          'Plus de 100 vélos à essayer',
          "Vélos d'occasion avec 3 mois de garantie",
          'Prix justes',
        ],
        offerHeading: 'Notre sélection',
        offerItems: [
          'Vélos de ville pour les trajets vers Freiburg',
          'Vélos électriques pour un trajet détendu',
          'VTC pour les randonnées dans le Dreisamtal',
          'Vélos pour enfants pour tous les âges',
          "Vélos d'occasion à partir d'env. 180 €",
        ],
        ctaHeading: 'Venez nous voir!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. WhatsApp: +49 155 6630 0011.',
        directions:
          'Depuis Gundelfingen via Freiburger Landstraße direction Freiburg-Haslach. Seulement 12 minutes.',
      },
      tr: {
        metaTitle:
          "Bisiklet Gundelfingen — Bike Haus Freiburg'da bisiklet alın",
        metaDescription:
          "Gundelfingen'de bisiklet mi arıyorsunuz? Bike Haus Freiburg sadece 8 km uzaklıkta! 100+ yeni ve ikinci el bisiklet, garantili.",
        heroTitle: "Gundelfingen'de bisiklet mi arıyorsunuz?",
        heroSub:
          'Bike Haus Freiburg — komşu bisiklet mağazanız, sadece 8 km uzaklıkta.',
        introHeading: 'Gundelfingen için bisikletler — Bike Haus Freiburg',
        introText:
          "Gundelfingen, Freiburg'un hemen kuzeyinde yer alıyor — ve Bike Haus Freiburg arabayla sadece 12 dakika veya bisikletle 25 dakika uzaklıkta. Test sürüşü için mükemmel! Garantili 100'den fazla yeni ve ikinci el bisiklet sunuyoruz.",
        whyHeading: "Gundelfingen'liler neden Bike Haus'u tercih etmeli?",
        whyItems: [
          'Sadece 8 km / 12 dakika arabayla',
          'Bisikletle (25 dk) veya tramvayla da ulaşılabilir',
          "Test sürüşü yapılabilecek 100'den fazla bisiklet",
          '3 ay garantili ikinci el bisikletler',
          'Uygun fiyatlar',
        ],
        offerHeading: 'Ürün Seçimimiz',
        offerItems: [
          "Freiburg'a gidiş-geliş için şehir bisikletleri",
          'Rahat ulaşım için e-bisikletler',
          "Dreisamtal'da boş zaman turları için trekking bisikletleri",
          'Tüm yaş grupları için çocuk bisikletleri',
          "İkinci el bisikletler yaklaşık 180 €'dan",
        ],
        ctaHeading: 'Hemen gelin!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Pzt–Cmt 13:00–17:00, Paz kapalı. WhatsApp: +49 155 6630 0011.',
        directions:
          "Gundelfingen'den Freiburger Landstraße üzerinden Freiburg-Haslach yönüne. Sadece 12 dakika.",
      },
    },
  },
  {
    slug: 'fahrrad-march',
    cityName: 'March',
    distanceKm: 10,
    driveMinutes: 15,
    translations: {
      de: {
        metaTitle: 'Fahrrad March — Fahrräder kaufen bei Bike Haus Freiburg',
        metaDescription:
          'Fahrrad kaufen in March? Bike Haus Freiburg: 10 km entfernt, 100+ Fahrräder, E-Bikes, Garantie, Probefahrt.',
        heroTitle: 'Fahrrad kaufen in March?',
        heroSub:
          'Bike Haus Freiburg — nur 10 km von March entfernt. Große Auswahl, faire Preise.',
        introHeading: 'Fahrräder für March bei Bike Haus Freiburg',
        introText:
          'March (Hugstetten, Neuershausen, Holzhausen) liegt westlich von Freiburg. Bike Haus Freiburg ist in nur 15 Minuten erreichbar und bietet Ihnen die größte Fahrradauswahl der Region — über 100 neue und gebrauchte Fahrräder mit Garantie.',
        whyHeading: 'Warum zu uns kommen?',
        whyItems: [
          'Nur 10 km / 15 Minuten mit dem Auto',
          'Über 100 Fahrräder sofort verfügbar',
          'Geprüfte Gebrauchträder mit Garantie',
          'E-Bikes mit dokumentiertem Akku-Zustand',
          'Probefahrt ohne Termin',
        ],
        offerHeading: 'Unser Angebot',
        offerItems: [
          'Citybikes für den Alltag',
          'E-Bikes für die Strecke March – Freiburg',
          'Trekkingräder für Touren im Breisgau',
          'Kinderfahrräder',
          'Gebrauchte Fahrräder ab ca. 180 €',
        ],
        ctaHeading: 'Besuchen Sie uns!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Mo–Sa 13:00–17:00 Uhr, So geschlossen. WhatsApp: +49 155 6630 0011.',
        directions:
          'Von March über Hugstetten/Umkirch direkt nach Freiburg-Haslach. Nur 15 Minuten.',
      },
      en: {
        metaTitle: 'Bicycle March — Buy bikes at Bike Haus Freiburg',
        metaDescription:
          'Buy a bike in March? Bike Haus Freiburg: 10 km away, 100+ bicycles, e-bikes, warranty, test rides.',
        heroTitle: 'Buy a bicycle in March?',
        heroSub:
          'Bike Haus Freiburg — only 10 km from March. Large selection, fair prices.',
        introHeading: 'Bicycles for March at Bike Haus Freiburg',
        introText:
          'March (Hugstetten, Neuershausen, Holzhausen) is located west of Freiburg. Bike Haus Freiburg is reachable in just 15 minutes and offers you the largest bicycle selection in the region — over 100 new and used bicycles with warranty.',
        whyHeading: 'Why come to us?',
        whyItems: [
          'Only 10 km / 15 minutes by car',
          'Over 100 bikes immediately available',
          'Inspected used bikes with warranty',
          'E-bikes with documented battery condition',
          'Test ride without appointment',
        ],
        offerHeading: 'Our Range',
        offerItems: [
          'City bikes for everyday use',
          'E-bikes for the March – Freiburg route',
          'Trekking bikes for tours in the Breisgau',
          "Children's bikes",
          'Used bicycles from approx. €180',
        ],
        ctaHeading: 'Visit us!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. WhatsApp: +49 155 6630 0011.',
        directions:
          'From March via Hugstetten/Umkirch directly to Freiburg-Haslach. Only 15 minutes.',
      },
      fr: {
        metaTitle: 'Vélo March — Acheter des vélos chez Bike Haus Freiburg',
        metaDescription:
          'Acheter un vélo à March? Bike Haus Freiburg: 10 km, 100+ vélos, vélos électriques, garantie, essai.',
        heroTitle: 'Acheter un vélo à March?',
        heroSub:
          'Bike Haus Freiburg — à seulement 10 km de March. Grand choix, prix justes.',
        introHeading: 'Vélos pour March chez Bike Haus Freiburg',
        introText:
          "March (Hugstetten, Neuershausen, Holzhausen) est situé à l'ouest de Freiburg. Bike Haus Freiburg est accessible en seulement 15 minutes et vous offre le plus grand choix de vélos de la région — plus de 100 vélos neufs et d'occasion avec garantie.",
        whyHeading: 'Pourquoi venir chez nous?',
        whyItems: [
          'Seulement 10 km / 15 minutes en voiture',
          'Plus de 100 vélos immédiatement disponibles',
          "Vélos d'occasion contrôlés avec garantie",
          'Vélos électriques avec état de batterie documenté',
          'Essai sans rendez-vous',
        ],
        offerHeading: 'Notre offre',
        offerItems: [
          'Vélos de ville pour le quotidien',
          'Vélos électriques pour le trajet March – Freiburg',
          'VTC pour les randonnées dans le Breisgau',
          'Vélos pour enfants',
          "Vélos d'occasion à partir d'env. 180 €",
        ],
        ctaHeading: 'Venez nous voir!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. WhatsApp: +49 155 6630 0011.',
        directions:
          'Depuis March via Hugstetten/Umkirch directement vers Freiburg-Haslach. Seulement 15 minutes.',
      },
      tr: {
        metaTitle: "Bisiklet March — Bike Haus Freiburg'da bisiklet alın",
        metaDescription:
          "March'da bisiklet mi arıyorsunuz? Bike Haus Freiburg: 10 km uzaklıkta, 100+ bisiklet, garantili.",
        heroTitle: "March'da bisiklet mi arıyorsunuz?",
        heroSub:
          "Bike Haus Freiburg — March'dan sadece 10 km. Geniş seçenek, uygun fiyatlar.",
        introHeading: 'March için bisikletler — Bike Haus Freiburg',
        introText:
          "March (Hugstetten, Neuershausen, Holzhausen) Freiburg'un batısında yer alıyor. Bike Haus Freiburg sadece 15 dakikada ulaşılabilir ve bölgenin en büyük bisiklet seçimini sunuyor — garantili 100'den fazla yeni ve ikinci el bisiklet.",
        whyHeading: 'Neden bize gelmelisiniz?',
        whyItems: [
          'Sadece 10 km / 15 dakika arabayla',
          "Stokta 100'den fazla bisiklet",
          'Garantili kontrol edilmiş ikinci el bisikletler',
          'Akü durumu belgelenmiş e-bisikletler',
          'Randevusuz test sürüşü',
        ],
        offerHeading: 'Ürün Yelpazemiz',
        offerItems: [
          'Günlük kullanım için şehir bisikletleri',
          'March – Freiburg güzergahı için e-bisikletler',
          "Breisgau'da turlar için trekking bisikletleri",
          'Çocuk bisikletleri',
          "İkinci el bisikletler yaklaşık 180 €'dan",
        ],
        ctaHeading: 'Bizi ziyaret edin!',
        ctaText:
          'Heckerstraße 27, 79114 Freiburg. Pzt–Cmt 13:00–17:00, Paz kapalı. WhatsApp: +49 155 6630 0011.',
        directions:
          "March'dan Hugstetten/Umkirch üzerinden doğrudan Freiburg-Haslach'a. Sadece 15 dakika.",
      },
    },
  },
  {
    slug: 'fahrrad-wiehre',
    cityName: 'Wiehre',
    distanceKm: 3,
    driveMinutes: 8,
    translations: {
      de: {
        metaTitle:
          'Fahrrad Wiehre — Fahrräder, E-Bikes & Service | Bike Haus Freiburg',
        metaDescription:
          'Fahrrad in der Wiehre? Bike Haus Freiburg ist nur 3 km entfernt: gebrauchte Fahrräder, E-Bikes kaufen, gebrauchte E-Bikes, Fahrrad mieten & Service/Wartung. Probefahrt ohne Termin.',
        heroTitle: 'Fahrrad & E-Bike für die Wiehre',
        heroSub:
          'Bike Haus Freiburg — nur 3 km von der Wiehre, gleich über die Dreisam in Haslach.',
        introHeading: 'Ihr Fahrradladen für die Wiehre',
        introText:
          'Die Wiehre ist Freiburgs entspanntes Wohnviertel zwischen Dreisam und Lorettoberg — flach am Fluss, ruhig in den Villenstraßen. Bike Haus Freiburg liegt nur einen kurzen Sprung über die Dreisam in der Heckerstraße 27 (Haslach), rund 10 Minuten mit dem Rad über den Dreisam-Radweg. Bei uns finden Sie geprüfte gebrauchte Fahrräder, neue und gebrauchte E-Bikes sowie Räder zum Mieten — und wir kümmern uns um Service, Wartung und Inspektion Ihres Rads.',
        whyHeading: 'Warum die Wiehre zu uns kommt',
        whyItems: [
          'Nur 3 km — über den Dreisam-Radweg in ca. 10 Minuten mit dem Rad',
          'Auch mit der Straßenbahn (Linie 1/2) schnell Richtung Haslach',
          'Geprüfte Gebrauchträder mit 3 Monaten Garantie',
          'E-Bikes neu & gebraucht — Akku-Zustand dokumentiert',
          'Probefahrt entlang der Dreisam — ohne Termin',
          'Service, Wartung & Inspektion für Ihr vorhandenes Rad',
        ],
        offerHeading: 'Unser Angebot für die Wiehre',
        offerItems: [
          'Gebrauchte Fahrräder ab ca. 180 € — technisch geprüft',
          'E-Bikes kaufen — Citybike, Trekking & Tiefeinsteiger',
          'Gebrauchte E-Bikes mit dokumentiertem Akku-Zustand',
          'E-Bikes & Fahrräder mieten — flexibel für Touren am Lorettoberg',
          'Fahrrad-Service, Wartung, Einstellung & Pflege',
        ],
        ctaHeading: 'Schauen Sie vorbei!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Mo–Sa 13:00–17:00 Uhr, So geschlossen. WhatsApp: +49 155 6630 0011.',
        directions:
          'Von der Wiehre über die Dreisam Richtung Haslach. Mit dem Rad über den Dreisam-Radweg in ca. 10 Minuten, mit dem Auto in ca. 8 Minuten. Kostenlose Parkplätze vorhanden.',
      },
      en: {
        metaTitle:
          'Bicycle Wiehre — Bikes, e-bikes & service | Bike Haus Freiburg',
        metaDescription:
          'Bike in Wiehre? Bike Haus Freiburg is only 3 km away: used bicycles, buy e-bikes, used e-bikes, bike rental & service/maintenance. Test ride without appointment.',
        heroTitle: 'Bikes & e-bikes for Wiehre',
        heroSub:
          'Bike Haus Freiburg — only 3 km from Wiehre, just across the Dreisam in Haslach.',
        introHeading: 'Your bike shop for Wiehre',
        introText:
          'Wiehre is Freiburg’s relaxed residential district between the Dreisam river and the Lorettoberg — flat along the water, quiet in its villa streets. Bike Haus Freiburg is just a short hop across the Dreisam at Heckerstraße 27 (Haslach), about a 10-minute ride along the Dreisam cycle path. We offer inspected used bicycles, new and used e-bikes, and bikes for rent — plus service, maintenance and inspection for your existing bike.',
        whyHeading: 'Why Wiehre comes to us',
        whyItems: [
          'Only 3 km — about 10 minutes by bike along the Dreisam cycle path',
          'Also quickly reachable by tram (line 1/2) towards Haslach',
          'Inspected used bikes with 3-month warranty',
          'E-bikes new & used — battery condition documented',
          'Test ride along the Dreisam — no appointment needed',
          'Service, maintenance & inspection for your existing bike',
        ],
        offerHeading: 'Our range for Wiehre',
        offerItems: [
          'Used bicycles from approx. €180 — technically inspected',
          'Buy e-bikes — city, trekking & step-through models',
          'Used e-bikes with documented battery condition',
          'Rent e-bikes & bicycles — flexible for tours up the Lorettoberg',
          'Bike service, maintenance, adjustment & care',
        ],
        ctaHeading: 'Drop by!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. WhatsApp: +49 155 6630 0011.',
        directions:
          'From Wiehre across the Dreisam towards Haslach. About 10 minutes by bike along the Dreisam cycle path, about 8 minutes by car. Free parking available.',
      },
      fr: {
        metaTitle:
          'Vélo Wiehre — Vélos, vélos électriques & entretien | Bike Haus Freiburg',
        metaDescription:
          "Un vélo à la Wiehre? Bike Haus Freiburg n'est qu'à 3 km: vélos d'occasion, achat de vélos électriques, vélos électriques d'occasion, location & entretien. Essai sans rendez-vous.",
        heroTitle: 'Vélos & vélos électriques pour la Wiehre',
        heroSub:
          "Bike Haus Freiburg — à seulement 3 km de la Wiehre, juste de l'autre côté de la Dreisam, à Haslach.",
        introHeading: 'Votre magasin de vélos pour la Wiehre',
        introText:
          "La Wiehre est le quartier résidentiel paisible de Freiburg, entre la rivière Dreisam et le Lorettoberg — plat le long de l'eau, tranquille dans ses rues de villas. Bike Haus Freiburg se trouve juste de l'autre côté de la Dreisam, Heckerstraße 27 (Haslach), à environ 10 minutes à vélo par la piste cyclable de la Dreisam. Nous proposons des vélos d'occasion contrôlés, des vélos électriques neufs et d'occasion, ainsi que des vélos à louer — et nous assurons l'entretien, la maintenance et l'inspection de votre vélo.",
        whyHeading: 'Pourquoi la Wiehre vient chez nous',
        whyItems: [
          'Seulement 3 km — environ 10 minutes à vélo par la piste de la Dreisam',
          'Aussi accessible rapidement en tramway (ligne 1/2) vers Haslach',
          "Vélos d'occasion contrôlés avec 3 mois de garantie",
          "Vélos électriques neufs & d'occasion — état de la batterie documenté",
          'Essai le long de la Dreisam — sans rendez-vous',
          'Entretien, maintenance & inspection de votre vélo actuel',
        ],
        offerHeading: 'Notre offre pour la Wiehre',
        offerItems: [
          "Vélos d'occasion à partir d'env. 180 € — contrôlés techniquement",
          'Achat de vélos électriques — ville, randonnée & cadre bas',
          "Vélos électriques d'occasion avec état de batterie documenté",
          'Location de vélos électriques & vélos — flexible pour les sorties au Lorettoberg',
          'Entretien, maintenance, réglage & soin du vélo',
        ],
        ctaHeading: 'Passez nous voir!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. WhatsApp: +49 155 6630 0011.',
        directions:
          "Depuis la Wiehre, traversez la Dreisam en direction de Haslach. Environ 10 minutes à vélo par la piste cyclable de la Dreisam, env. 8 minutes en voiture. Parking gratuit disponible.",
      },
      tr: {
        metaTitle:
          "Bisiklet Wiehre — Bisiklet, e-bisiklet & servis | Bike Haus Freiburg",
        metaDescription:
          "Wiehre'de bisiklet mi? Bike Haus Freiburg sadece 3 km uzaklıkta: ikinci el bisiklet, e-bisiklet satışı, ikinci el e-bisiklet, kiralama & servis/bakım. Randevusuz test sürüşü.",
        heroTitle: "Wiehre için bisiklet & e-bisiklet",
        heroSub:
          "Bike Haus Freiburg — Wiehre'den sadece 3 km, Dreisam'ın hemen karşısında Haslach'ta.",
        introHeading: 'Wiehre için bisiklet mağazanız',
        introText:
          "Wiehre, Freiburg'un Dreisam nehri ile Lorettoberg arasındaki sakin yaşam mahallesidir — nehir boyunca düz, villa sokaklarında sessiz. Bike Haus Freiburg, Dreisam'ın hemen karşısında Heckerstraße 27'de (Haslach), Dreisam bisiklet yolu üzerinden bisikletle yaklaşık 10 dakika uzaklıkta. Kontrol edilmiş ikinci el bisikletler, yeni ve ikinci el e-bisikletler ve kiralık bisikletler sunuyoruz — ayrıca bisikletinizin servis, bakım ve kontrolünü de üstleniyoruz.",
        whyHeading: "Wiehre neden bize geliyor",
        whyItems: [
          'Sadece 3 km — Dreisam bisiklet yolundan bisikletle yaklaşık 10 dakika',
          "Tramvayla da (1/2 hattı) Haslach yönünde hızlıca ulaşılabilir",
          'Kontrol edilmiş ikinci el bisikletler, 3 ay garantili',
          'Yeni & ikinci el e-bisikletler — akü durumu belgelenmiş',
          'Dreisam boyunca test sürüşü — randevusuz',
          'Mevcut bisikletiniz için servis, bakım & kontrol',
        ],
        offerHeading: 'Wiehre için sunduklarımız',
        offerItems: [
          "İkinci el bisikletler yaklaşık 180 €'dan — teknik olarak kontrol edilmiş",
          'E-bisiklet satışı — şehir, trekking & alçak çerçeve modeller',
          'Akü durumu belgelenmiş ikinci el e-bisikletler',
          'E-bisiklet & bisiklet kiralama — Lorettoberg turları için esnek',
          'Bisiklet servisi, bakımı, ayarı & bakımı',
        ],
        ctaHeading: 'Bize uğrayın!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Pzt–Cmt 13:00–17:00, Paz kapalı. WhatsApp: +49 155 6630 0011.',
        directions:
          "Wiehre'den Dreisam'ı geçerek Haslach yönüne. Dreisam bisiklet yolundan bisikletle yaklaşık 10 dakika, arabayla yaklaşık 8 dakika. Ücretsiz park yeri mevcut.",
      },
    },
  },
  {
    slug: 'fahrrad-herdern',
    cityName: 'Herdern',
    distanceKm: 5,
    driveMinutes: 12,
    translations: {
      de: {
        metaTitle:
          'Fahrrad Herdern — Fahrräder, E-Bikes & Service | Bike Haus Freiburg',
        metaDescription:
          'Fahrrad in Herdern? Bike Haus Freiburg, nur 5 km entfernt: gebrauchte Fahrräder, E-Bikes kaufen, gebrauchte E-Bikes, Fahrrad mieten & Service/Wartung. Probefahrt ohne Termin.',
        heroTitle: 'Fahrrad & E-Bike für Herdern',
        heroSub:
          'Bike Haus Freiburg — nur 5 km von Herdern, ideal für die Fahrt vom Hang in die Stadt.',
        introHeading: 'Ihr Fahrradladen für Herdern',
        introText:
          'Herdern liegt am sonnigen Nordhang über Freiburg — von den Uni-Instituten und der Ludwigskirche hinauf zu den ruhigen Wohnlagen am Hang. Wer hier wohnt, kennt die Steigungen: für den Weg in die Stadt und wieder hinauf ist ein gut eingestelltes Rad oder ein E-Bike Gold wert. Bike Haus Freiburg in der Heckerstraße 27 (Haslach) ist rund 5 km entfernt und bietet gebrauchte Fahrräder, neue und gebrauchte E-Bikes, Mieträder sowie Service, Wartung und Inspektion.',
        whyHeading: 'Warum Herdern zu uns kommt',
        whyItems: [
          'Nur 5 km / ca. 12 Minuten mit dem Auto, gut mit dem Rad erreichbar',
          'E-Bikes — perfekt für den Herdern-Hang und den Weg zur Uni',
          'Geprüfte Gebrauchträder mit 3 Monaten Garantie',
          'Gebrauchte E-Bikes mit dokumentiertem Akku-Zustand',
          'Probefahrt ohne Termin — testen Sie die Unterstützung am Anstieg',
          'Service, Wartung & Einstellung für Schaltung und Bremsen',
        ],
        offerHeading: 'Unser Angebot für Herdern',
        offerItems: [
          'Gebrauchte Fahrräder ab ca. 180 € — technisch geprüft',
          'E-Bikes kaufen — starke Motoren für den Nordhang',
          'Gebrauchte E-Bikes mit dokumentiertem Akku-Zustand',
          'E-Bikes & Fahrräder mieten — auch für Gäste der Uni',
          'Fahrrad-Service, Wartung, Einstellung & Pflege',
        ],
        ctaHeading: 'Schauen Sie vorbei!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Mo–Sa 13:00–17:00 Uhr, So geschlossen. WhatsApp: +49 155 6630 0011.',
        directions:
          'Von Herdern durch die Innenstadt Richtung Freiburg-Haslach. Mit dem Auto in ca. 12 Minuten. Kostenlose Parkplätze vor dem Geschäft.',
      },
      en: {
        metaTitle:
          'Bicycle Herdern — Bikes, e-bikes & service | Bike Haus Freiburg',
        metaDescription:
          'Bike in Herdern? Bike Haus Freiburg, only 5 km away: used bicycles, buy e-bikes, used e-bikes, bike rental & service/maintenance. Test ride without appointment.',
        heroTitle: 'Bikes & e-bikes for Herdern',
        heroSub:
          'Bike Haus Freiburg — only 5 km from Herdern, ideal for the ride from the hillside into town.',
        introHeading: 'Your bike shop for Herdern',
        introText:
          'Herdern sits on the sunny northern slope above Freiburg — from the university institutes and the Ludwigskirche up to the quiet residential streets on the hill. Anyone living here knows the climbs: for the trip into town and back up again, a well-tuned bike or an e-bike is worth its weight in gold. Bike Haus Freiburg at Heckerstraße 27 (Haslach) is about 5 km away and offers used bicycles, new and used e-bikes, rental bikes, plus service, maintenance and inspection.',
        whyHeading: 'Why Herdern comes to us',
        whyItems: [
          'Only 5 km / about 12 minutes by car, easily reachable by bike',
          'E-bikes — perfect for the Herdern slope and the ride to the university',
          'Inspected used bikes with 3-month warranty',
          'Used e-bikes with documented battery condition',
          'Test ride without appointment — try the assist on the climb',
          'Service, maintenance & adjustment for gears and brakes',
        ],
        offerHeading: 'Our range for Herdern',
        offerItems: [
          'Used bicycles from approx. €180 — technically inspected',
          'Buy e-bikes — strong motors for the northern slope',
          'Used e-bikes with documented battery condition',
          'Rent e-bikes & bicycles — also for university visitors',
          'Bike service, maintenance, adjustment & care',
        ],
        ctaHeading: 'Drop by!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. WhatsApp: +49 155 6630 0011.',
        directions:
          'From Herdern through the city centre towards Freiburg-Haslach. About 12 minutes by car. Free parking in front of the shop.',
      },
      fr: {
        metaTitle:
          'Vélo Herdern — Vélos, vélos électriques & entretien | Bike Haus Freiburg',
        metaDescription:
          "Un vélo à Herdern? Bike Haus Freiburg, à seulement 5 km: vélos d'occasion, achat de vélos électriques, vélos électriques d'occasion, location & entretien. Essai sans rendez-vous.",
        heroTitle: 'Vélos & vélos électriques pour Herdern',
        heroSub:
          "Bike Haus Freiburg — à seulement 5 km de Herdern, idéal pour descendre de la colline vers la ville.",
        introHeading: 'Votre magasin de vélos pour Herdern',
        introText:
          "Herdern s'étend sur le versant nord ensoleillé au-dessus de Freiburg — des instituts universitaires et de la Ludwigskirche jusqu'aux rues résidentielles tranquilles de la colline. Ceux qui habitent ici connaissent les montées: pour aller en ville et remonter, un vélo bien réglé ou un vélo électrique vaut de l'or. Bike Haus Freiburg, Heckerstraße 27 (Haslach), est à environ 5 km et propose des vélos d'occasion, des vélos électriques neufs et d'occasion, des vélos en location, ainsi que l'entretien, la maintenance et l'inspection.",
        whyHeading: 'Pourquoi Herdern vient chez nous',
        whyItems: [
          'Seulement 5 km / env. 12 minutes en voiture, facile à vélo',
          "Vélos électriques — parfaits pour la pente de Herdern et le trajet vers l'université",
          "Vélos d'occasion contrôlés avec 3 mois de garantie",
          "Vélos électriques d'occasion avec état de batterie documenté",
          "Essai sans rendez-vous — testez l'assistance dans la montée",
          'Entretien, maintenance & réglage des vitesses et des freins',
        ],
        offerHeading: 'Notre offre pour Herdern',
        offerItems: [
          "Vélos d'occasion à partir d'env. 180 € — contrôlés techniquement",
          'Achat de vélos électriques — moteurs puissants pour le versant nord',
          "Vélos électriques d'occasion avec état de batterie documenté",
          "Location de vélos électriques & vélos — aussi pour les visiteurs de l'université",
          'Entretien, maintenance, réglage & soin du vélo',
        ],
        ctaHeading: 'Passez nous voir!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. WhatsApp: +49 155 6630 0011.',
        directions:
          "Depuis Herdern, traversez le centre-ville en direction de Freiburg-Haslach. Env. 12 minutes en voiture. Parking gratuit devant le magasin.",
      },
      tr: {
        metaTitle:
          "Bisiklet Herdern — Bisiklet, e-bisiklet & servis | Bike Haus Freiburg",
        metaDescription:
          "Herdern'de bisiklet mi? Bike Haus Freiburg sadece 5 km uzaklıkta: ikinci el bisiklet, e-bisiklet satışı, ikinci el e-bisiklet, kiralama & servis/bakım. Randevusuz test sürüşü.",
        heroTitle: "Herdern için bisiklet & e-bisiklet",
        heroSub:
          "Bike Haus Freiburg — Herdern'den sadece 5 km, yamaçtan şehre iniş için ideal.",
        introHeading: 'Herdern için bisiklet mağazanız',
        introText:
          "Herdern, Freiburg'un üzerindeki güneşli kuzey yamacında yer alır — üniversite enstitülerinden ve Ludwigskirche'den yamaçtaki sessiz yerleşim sokaklarına kadar. Burada yaşayan herkes yokuşları bilir: şehre inip tekrar yukarı çıkmak için iyi ayarlanmış bir bisiklet ya da bir e-bisiklet altın değerindedir. Heckerstraße 27'deki (Haslach) Bike Haus Freiburg yaklaşık 5 km uzaklıkta ve ikinci el bisikletler, yeni ve ikinci el e-bisikletler, kiralık bisikletler ile servis, bakım ve kontrol sunuyor.",
        whyHeading: "Herdern neden bize geliyor",
        whyItems: [
          'Sadece 5 km / arabayla yaklaşık 12 dakika, bisikletle kolayca ulaşılabilir',
          "E-bisikletler — Herdern yamacı ve üniversiteye gidiş için mükemmel",
          'Kontrol edilmiş ikinci el bisikletler, 3 ay garantili',
          'Akü durumu belgelenmiş ikinci el e-bisikletler',
          'Randevusuz test sürüşü — yokuşta desteği deneyin',
          'Vites ve frenler için servis, bakım & ayar',
        ],
        offerHeading: 'Herdern için sunduklarımız',
        offerItems: [
          "İkinci el bisikletler yaklaşık 180 €'dan — teknik olarak kontrol edilmiş",
          'E-bisiklet satışı — kuzey yamaç için güçlü motorlar',
          'Akü durumu belgelenmiş ikinci el e-bisikletler',
          'E-bisiklet & bisiklet kiralama — üniversite misafirleri için de',
          'Bisiklet servisi, bakımı, ayarı & bakımı',
        ],
        ctaHeading: 'Bize uğrayın!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Pzt–Cmt 13:00–17:00, Paz kapalı. WhatsApp: +49 155 6630 0011.',
        directions:
          "Herdern'den şehir merkezi üzerinden Freiburg-Haslach yönüne. Arabayla yaklaşık 12 dakika. Mağaza önünde ücretsiz park yeri.",
      },
    },
  },
  {
    slug: 'fahrrad-stuehlinger',
    cityName: 'Stühlinger',
    distanceKm: 3,
    driveMinutes: 9,
    translations: {
      de: {
        metaTitle:
          'Fahrrad Stühlinger — Fahrräder, E-Bikes & Service | Bike Haus Freiburg',
        metaDescription:
          'Fahrrad im Stühlinger? Bike Haus Freiburg ist nur 3 km entfernt: gebrauchte Fahrräder, E-Bikes kaufen, gebrauchte E-Bikes, Fahrrad mieten & Service/Wartung. Probefahrt ohne Termin.',
        heroTitle: 'Fahrrad & E-Bike für den Stühlinger',
        heroSub:
          'Bike Haus Freiburg — nur 3 km vom Stühlinger, kurze Fahrt vom Hauptbahnhof nach Haslach.',
        introHeading: 'Ihr Fahrradladen für den Stühlinger',
        introText:
          'Der Stühlinger ist Freiburgs lebendiges Viertel rund um den Hauptbahnhof und die Stühlinger Kirche — viele Studierende, viele Pendler, viel Radverkehr. Wer hier wohnt, fährt fast alles mit dem Rad. Bike Haus Freiburg in der Heckerstraße 27 (Haslach) ist nur rund 3 km entfernt, in ca. 10 Minuten mit dem Rad. Bei uns gibt es günstige gebrauchte Fahrräder, neue und gebrauchte E-Bikes, Räder zum Mieten sowie Service, Wartung und Inspektion.',
        whyHeading: 'Warum der Stühlinger zu uns kommt',
        whyItems: [
          'Nur 3 km — in ca. 10 Minuten mit dem Rad, vorbei am Hauptbahnhof',
          'Günstige Gebrauchträder — ideal fürs studentische Budget',
          'Geprüfte Gebrauchträder mit 3 Monaten Garantie',
          'E-Bikes neu & gebraucht — Akku-Zustand dokumentiert',
          'Probefahrt ohne Termin',
          'Service, Wartung & Inspektion für Ihr Alltagsrad',
        ],
        offerHeading: 'Unser Angebot für den Stühlinger',
        offerItems: [
          'Gebrauchte Fahrräder ab ca. 180 € — perfekt fürs Pendeln',
          'E-Bikes kaufen — für den Weg zur Uni und in die Stadt',
          'Gebrauchte E-Bikes mit dokumentiertem Akku-Zustand',
          'E-Bikes & Fahrräder mieten — flexibel für Besuch und Pendler',
          'Fahrrad-Service, Wartung, Einstellung & Pflege',
        ],
        ctaHeading: 'Schauen Sie vorbei!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Mo–Sa 13:00–17:00 Uhr, So geschlossen. WhatsApp: +49 155 6630 0011.',
        directions:
          'Vom Stühlinger über den Hauptbahnhof Richtung Freiburg-Haslach. Mit dem Rad in ca. 10 Minuten, mit dem Auto in ca. 9 Minuten. Kostenlose Parkplätze vorhanden.',
      },
      en: {
        metaTitle:
          'Bicycle Stühlinger — Bikes, e-bikes & service | Bike Haus Freiburg',
        metaDescription:
          'Bike in Stühlinger? Bike Haus Freiburg is only 3 km away: used bicycles, buy e-bikes, used e-bikes, bike rental & service/maintenance. Test ride without appointment.',
        heroTitle: 'Bikes & e-bikes for Stühlinger',
        heroSub:
          'Bike Haus Freiburg — only 3 km from Stühlinger, a short ride from the main station to Haslach.',
        introHeading: 'Your bike shop for Stühlinger',
        introText:
          'Stühlinger is Freiburg’s lively district around the main station and the Stühlinger church — lots of students, lots of commuters, lots of cycling. People who live here do almost everything by bike. Bike Haus Freiburg at Heckerstraße 27 (Haslach) is only about 3 km away, roughly a 10-minute ride. We stock affordable used bicycles, new and used e-bikes, bikes for rent, plus service, maintenance and inspection.',
        whyHeading: 'Why Stühlinger comes to us',
        whyItems: [
          'Only 3 km — about 10 minutes by bike, past the main station',
          'Affordable used bikes — ideal for a student budget',
          'Inspected used bikes with 3-month warranty',
          'E-bikes new & used — battery condition documented',
          'Test ride without appointment',
          'Service, maintenance & inspection for your everyday bike',
        ],
        offerHeading: 'Our range for Stühlinger',
        offerItems: [
          'Used bicycles from approx. €180 — perfect for commuting',
          'Buy e-bikes — for the ride to the university and into town',
          'Used e-bikes with documented battery condition',
          'Rent e-bikes & bicycles — flexible for visitors and commuters',
          'Bike service, maintenance, adjustment & care',
        ],
        ctaHeading: 'Drop by!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Open Mon–Sat 13:00–17:00, Sun closed. WhatsApp: +49 155 6630 0011.',
        directions:
          'From Stühlinger past the main station towards Freiburg-Haslach. About 10 minutes by bike, about 9 minutes by car. Free parking available.',
      },
      fr: {
        metaTitle:
          'Vélo Stühlinger — Vélos, vélos électriques & entretien | Bike Haus Freiburg',
        metaDescription:
          "Un vélo au Stühlinger? Bike Haus Freiburg n'est qu'à 3 km: vélos d'occasion, achat de vélos électriques, vélos électriques d'occasion, location & entretien. Essai sans rendez-vous.",
        heroTitle: 'Vélos & vélos électriques pour le Stühlinger',
        heroSub:
          "Bike Haus Freiburg — à seulement 3 km du Stühlinger, un court trajet de la gare centrale à Haslach.",
        introHeading: 'Votre magasin de vélos pour le Stühlinger',
        introText:
          "Le Stühlinger est le quartier animé de Freiburg autour de la gare centrale et de l'église du Stühlinger — beaucoup d'étudiants, beaucoup de pendulaires, beaucoup de cyclistes. Ceux qui y vivent font presque tout à vélo. Bike Haus Freiburg, Heckerstraße 27 (Haslach), n'est qu'à environ 3 km, soit environ 10 minutes à vélo. Nous proposons des vélos d'occasion abordables, des vélos électriques neufs et d'occasion, des vélos en location, ainsi que l'entretien, la maintenance et l'inspection.",
        whyHeading: 'Pourquoi le Stühlinger vient chez nous',
        whyItems: [
          'Seulement 3 km — env. 10 minutes à vélo, en passant par la gare',
          "Vélos d'occasion abordables — idéals pour un budget étudiant",
          "Vélos d'occasion contrôlés avec 3 mois de garantie",
          "Vélos électriques neufs & d'occasion — état de la batterie documenté",
          'Essai sans rendez-vous',
          'Entretien, maintenance & inspection de votre vélo du quotidien',
        ],
        offerHeading: 'Notre offre pour le Stühlinger',
        offerItems: [
          "Vélos d'occasion à partir d'env. 180 € — parfaits pour les trajets",
          "Achat de vélos électriques — pour le trajet vers l'université et la ville",
          "Vélos électriques d'occasion avec état de batterie documenté",
          'Location de vélos électriques & vélos — flexible pour visiteurs et pendulaires',
          'Entretien, maintenance, réglage & soin du vélo',
        ],
        ctaHeading: 'Passez nous voir!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Ouvert lun/mar/jeu 11h–18h, ven 11h–13h + 15h–18h, sam 11h30–17h. WhatsApp: +49 155 6630 0011.',
        directions:
          "Depuis le Stühlinger, passez par la gare centrale en direction de Freiburg-Haslach. Env. 10 minutes à vélo, env. 9 minutes en voiture. Parking gratuit disponible.",
      },
      tr: {
        metaTitle:
          "Bisiklet Stühlinger — Bisiklet, e-bisiklet & servis | Bike Haus Freiburg",
        metaDescription:
          "Stühlinger'de bisiklet mi? Bike Haus Freiburg sadece 3 km uzaklıkta: ikinci el bisiklet, e-bisiklet satışı, ikinci el e-bisiklet, kiralama & servis/bakım. Randevusuz test sürüşü.",
        heroTitle: "Stühlinger için bisiklet & e-bisiklet",
        heroSub:
          "Bike Haus Freiburg — Stühlinger'den sadece 3 km, ana gardan Haslach'a kısa bir sürüş.",
        introHeading: 'Stühlinger için bisiklet mağazanız',
        introText:
          "Stühlinger, Freiburg'un ana gar ve Stühlinger Kilisesi çevresindeki hareketli mahallesidir — çok sayıda öğrenci, çok sayıda işe gidip gelen, yoğun bisiklet trafiği. Burada yaşayanlar neredeyse her şeyi bisikletle yapar. Heckerstraße 27'deki (Haslach) Bike Haus Freiburg sadece yaklaşık 3 km uzaklıkta, bisikletle yaklaşık 10 dakika. Uygun fiyatlı ikinci el bisikletler, yeni ve ikinci el e-bisikletler, kiralık bisikletler ile servis, bakım ve kontrol sunuyoruz.",
        whyHeading: "Stühlinger neden bize geliyor",
        whyItems: [
          'Sadece 3 km — ana garın yanından bisikletle yaklaşık 10 dakika',
          "Uygun fiyatlı ikinci el bisikletler — öğrenci bütçesi için ideal",
          'Kontrol edilmiş ikinci el bisikletler, 3 ay garantili',
          'Yeni & ikinci el e-bisikletler — akü durumu belgelenmiş',
          'Randevusuz test sürüşü',
          'Günlük bisikletiniz için servis, bakım & kontrol',
        ],
        offerHeading: 'Stühlinger için sunduklarımız',
        offerItems: [
          "İkinci el bisikletler yaklaşık 180 €'dan — gidiş-geliş için mükemmel",
          'E-bisiklet satışı — üniversiteye ve şehre gidiş için',
          'Akü durumu belgelenmiş ikinci el e-bisikletler',
          'E-bisiklet & bisiklet kiralama — ziyaretçi ve pendüler için esnek',
          'Bisiklet servisi, bakımı, ayarı & bakımı',
        ],
        ctaHeading: 'Bize uğrayın!',
        ctaText:
          'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Pzt–Cmt 13:00–17:00, Paz kapalı. WhatsApp: +49 155 6630 0011.',
        directions:
          "Stühlinger'den ana gar üzerinden Freiburg-Haslach yönüne. Bisikletle yaklaşık 10 dakika, arabayla yaklaşık 9 dakika. Ücretsiz park yeri mevcut.",
      },
    },
  },
];
