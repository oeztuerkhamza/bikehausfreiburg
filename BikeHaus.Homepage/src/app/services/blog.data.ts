import { Language } from './translation.service';

export interface BlogArticle {
  slug: string;
  coverImage: string;
  date: string;
  readingTime: number;
  category: string;
  tags: string[];
  relatedSlugs: string[];
  translations: Record<Language, BlogArticleTranslation>;
}

export interface BlogArticleTranslation {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  tldr: string;
  sections: BlogSection[];
}

export interface BlogSection {
  type: 'paragraph' | 'heading' | 'list' | 'tip' | 'cta';
  content?: string;
  items?: string[];
  link?: string;
  linkText?: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  // ─── Article 1: Gebrauchtes Fahrrad kaufen ───
  {
    slug: 'gebrauchtes-fahrrad-kaufen-tipps',
    coverImage: 'assets/blog/gebrauchtes-fahrrad.jpg',
    date: '2026-04-12',
    readingTime: 8,
    category: 'ratgeber',
    tags: ['gebrauchtes fahrrad', 'kaufen', 'tipps', 'checkliste'],
    relatedSlugs: ['welches-fahrrad-passt-zu-mir', 'e-bike-gebraucht-kaufen'],
    translations: {
      de: {
        title: 'Gebrauchtes Fahrrad kaufen — Worauf achten?',
        metaTitle:
          'Gebrauchtes Fahrrad kaufen — Tipps & Checkliste | Bike Haus Freiburg',
        metaDescription:
          'Gebrauchtes Fahrrad kaufen ohne Risiko. Erfahren Sie, worauf Sie bei Rahmen, Bremsen, Schaltung & Reifen achten müssen. Checkliste vom Fachhändler.',
        excerpt:
          'Ein gebrauchtes Fahrrad kann ein Schnäppchen sein — oder eine Enttäuschung. Mit unserer Checkliste kaufen Sie sicher.',
        tldr: 'Achten Sie auf Rahmen, Bremsen, Schaltung, Reifen und Lager. Kaufen Sie beim Fachhändler mit Garantie statt privat. Bei Bike Haus Freiburg gibt es geprüfte Gebrauchträder mit 3 Monaten Garantie.',
        sections: [
          {
            type: 'heading',
            content: 'Warum ein gebrauchtes Fahrrad kaufen?',
          },
          {
            type: 'paragraph',
            content:
              'Ein gebrauchtes Fahrrad ist nachhaltig, preiswert und sofort verfügbar. Bei einem seriösen Händler wie Bike Haus Freiburg bekommen Sie geprüfte Räder mit Garantie — das ist der größte Vorteil gegenüber Privatverkäufen auf Kleinanzeigen.',
          },
          {
            type: 'heading',
            content: 'Checkliste: Darauf sollten Sie achten',
          },
          {
            type: 'list',
            items: [
              'Rahmen: Auf Risse, Dellen und Rost prüfen. Ein verbogener Rahmen ist ein Ausschlusskriterium.',
              'Bremsen: Beide Bremsen müssen fest zupacken. Bremsbeläge dürfen nicht abgefahren sein.',
              'Schaltung: Alle Gänge durchschalten. Kette und Zahnkränze auf Verschleiß prüfen.',
              'Reifen: Profil und Seitenwände kontrollieren. Risse = sofort wechseln.',
              'Lager: Tretlager, Steuersatz und Naben dürfen kein Spiel haben.',
              'Licht: Dynamo oder Akku-Beleuchtung muss funktionieren (StVZO-Pflicht).',
              'Rahmennummer: Jedes legale Fahrrad hat eine eingestanzte Rahmennummer.',
            ],
          },
          {
            type: 'tip',
            content:
              'Bei Bike Haus Freiburg wird jedes Gebrauchtrad technisch geprüft und mit 3 Monaten Garantie verkauft. Sie können jedes Fahrrad vor Ort probefahren — kein Termin nötig.',
          },
          {
            type: 'heading',
            content: 'Gebraucht vs. Neu — Was lohnt sich mehr?',
          },
          {
            type: 'paragraph',
            content:
              'Für Alltagsfahrer und Pendler ist ein gebrauchtes Fahrrad oft die bessere Wahl: Sie sparen 30–60 % gegenüber dem Neupreis und bekommen ein hochwertiges Rad, das bereits "eingefahren" ist. Für sportliche Ansprüche oder E-Bikes lohnt sich ein Neukauf häufiger, da Akku- und Motorgarantie wichtig sind.',
          },
          {
            type: 'heading',
            content: 'Wo gebrauchte Fahrräder in Freiburg kaufen?',
          },
          {
            type: 'paragraph',
            content:
              'Bike Haus Freiburg in der Heckerstraße 27 bietet über 100 geprüfte neue und gebrauchte Fahrräder. Alle Räder haben Garantie und können vor Ort probegefahren werden. Wir sind Mo–Fr 10–18 Uhr und Sa 10–14 Uhr für Sie da.',
          },
          {
            type: 'cta',
            content: 'Jetzt Showroom entdecken',
            link: '/showroom',
            linkText: 'Zum Showroom',
          },
        ],
      },
      en: {
        title: 'Buying a Used Bike — What to Look For',
        metaTitle: 'Buying a Used Bike — Tips & Checklist | Bike Haus Freiburg',
        metaDescription:
          'Buy a used bike without risk. Learn what to check — frame, brakes, gears & tires. Expert checklist from your Freiburg bike shop.',
        excerpt:
          'A used bicycle can be a great deal — or a disappointment. Use our checklist to buy safely.',
        tldr: 'Check frame, brakes, gears, tires and bearings. Buy from a dealer with warranty instead of privately. At Bike Haus Freiburg you get inspected used bikes with a 3-month warranty.',
        sections: [
          {
            type: 'heading',
            content: 'Why buy a used bicycle?',
          },
          {
            type: 'paragraph',
            content:
              'A used bike is sustainable, affordable and available right away. At a trusted dealer like Bike Haus Freiburg you get inspected bikes with warranty — the biggest advantage over private sales.',
          },
          {
            type: 'heading',
            content: 'Checklist: What to look for',
          },
          {
            type: 'list',
            items: [
              'Frame: Check for cracks, dents and rust. A bent frame is a deal-breaker.',
              'Brakes: Both brakes must grip firmly. Worn brake pads need replacing.',
              'Gears: Shift through all gears. Check chain and sprockets for wear.',
              'Tires: Inspect tread and sidewalls. Cracks mean immediate replacement.',
              'Bearings: Bottom bracket, headset and hubs must have no play.',
              'Lights: Dynamo or battery lighting must work (legally required in Germany).',
              'Frame number: Every legal bike has a stamped frame number.',
            ],
          },
          {
            type: 'tip',
            content:
              'At Bike Haus Freiburg every used bike is technically inspected and sold with a 3-month warranty. Test ride any bike on site — no appointment needed.',
          },
          {
            type: 'cta',
            content: 'Explore our showroom',
            link: '/showroom',
            linkText: 'Visit Showroom',
          },
        ],
      },
      fr: {
        title: "Acheter un vélo d'occasion — À quoi faire attention ?",
        metaTitle: "Acheter un vélo d'occasion — Conseils | Bike Haus Freiburg",
        metaDescription:
          "Achetez un vélo d'occasion sans risque. Découvrez ce qu'il faut vérifier — cadre, freins, vitesses & pneus.",
        excerpt:
          "Un vélo d'occasion peut être une bonne affaire — ou une déception. Suivez notre checklist.",
        tldr: 'Vérifiez le cadre, les freins, les vitesses et les pneus. Achetez chez un professionnel avec garantie. Chez Bike Haus Freiburg : vélos contrôlés avec 3 mois de garantie.',
        sections: [
          {
            type: 'heading',
            content: "Pourquoi acheter un vélo d'occasion ?",
          },
          {
            type: 'paragraph',
            content:
              "Un vélo d'occasion est durable, abordable et disponible immédiatement. Chez Bike Haus Freiburg, chaque vélo est contrôlé et vendu avec garantie.",
          },
          {
            type: 'cta',
            content: 'Découvrir le showroom',
            link: '/showroom',
            linkText: 'Voir le Showroom',
          },
        ],
      },
      tr: {
        title: 'İkinci El Bisiklet Alırken Nelere Dikkat Etmeli?',
        metaTitle: 'İkinci El Bisiklet Alma Rehberi | Bike Haus Freiburg',
        metaDescription:
          'İkinci el bisiklet alırken nelere dikkat etmelisiniz? Kadro, fren, vites ve lastik kontrol listesi.',
        excerpt:
          'İkinci el bisiklet hem uygun fiyatlı hem sürdürülebilir olabilir — doğru kontrolle.',
        tldr: "Kadro, fren, vites, lastik ve yataklara dikkat edin. Garantili satıcıdan alın. Bike Haus Freiburg'da kontrollü bisikletler 3 ay garantiyle satılır.",
        sections: [
          {
            type: 'heading',
            content: 'Neden ikinci el bisiklet?',
          },
          {
            type: 'paragraph',
            content:
              "İkinci el bisiklet sürdürülebilir, uygun fiyatlı ve hemen kullanıma hazırdır. Bike Haus Freiburg'da her bisiklet teknik kontrolden geçer ve 3 ay garantiyle satılır.",
          },
          {
            type: 'cta',
            content: "Showroom'u keşfedin",
            link: '/showroom',
            linkText: "Showroom'a Git",
          },
        ],
      },
    },
  },

  // ─── Article 2: Welches Fahrrad passt zu mir? ───
  {
    slug: 'welches-fahrrad-passt-zu-mir',
    coverImage: 'assets/blog/welches-fahrrad.jpg',
    date: '2026-04-12',
    readingTime: 10,
    category: 'ratgeber',
    tags: ['fahrradtyp', 'beratung', 'citybike', 'trekking', 'mountainbike'],
    relatedSlugs: [
      'fahrrad-rahmengroesse-berechnen',
      'gebrauchtes-fahrrad-kaufen-tipps',
    ],
    translations: {
      de: {
        title: 'Welches Fahrrad passt zu mir? — Der große Ratgeber',
        metaTitle:
          'Welches Fahrrad passt zu mir? Ratgeber 2026 | Bike Haus Freiburg',
        metaDescription:
          'Citybike, Trekkingrad, Mountainbike oder E-Bike? Finden Sie heraus, welcher Fahrradtyp zu Ihrem Fahrstil passt. Kostenlose Beratung in Freiburg.',
        excerpt:
          'City, Trekking, Mountain oder E-Bike? Wir helfen Ihnen, den richtigen Fahrradtyp für Ihren Alltag zu finden.',
        tldr: 'Kurze Stadtstrecken → Citybike. Pendeln → Trekkingrad. Lange Strecken → E-Bike. Sport & Gelände → Mountainbike. Kostenlose Beratung bei Bike Haus Freiburg.',
        sections: [
          {
            type: 'heading',
            content: 'Fahrradtypen im Überblick',
          },
          {
            type: 'paragraph',
            content:
              'Die Wahl des richtigen Fahrrads hängt von drei Faktoren ab: Wo fahren Sie? Wie weit fahren Sie? Und wie sportlich möchten Sie unterwegs sein? Hier ein Überblick über die wichtigsten Fahrradtypen.',
          },
          {
            type: 'heading',
            content: 'Citybike — Der Alltagsheld',
          },
          {
            type: 'paragraph',
            content:
              'Ideal für den täglichen Weg zur Arbeit, zum Einkaufen oder für kurze Strecken in der Stadt. Citybikes haben einen bequemen, aufrechten Sitz, Schutzbleche, Gepäckträger und Licht. In Freiburg die beliebteste Wahl für Pendler und Studenten.',
          },
          {
            type: 'heading',
            content: 'Trekkingrad — Der Allrounder',
          },
          {
            type: 'paragraph',
            content:
              'Das Trekkingrad vereint Komfort und Sportlichkeit. Perfekt für längere Touren, Radwege und leichtes Gelände. Mit Gepäckträger und Beleuchtung auch alltagstauglich. Die beste Wahl, wenn Sie ein Fahrrad für alles suchen.',
          },
          {
            type: 'heading',
            content: 'Mountainbike — Für Gelände & Sport',
          },
          {
            type: 'paragraph',
            content:
              'Breite Reifen, Federung und robuster Rahmen — Mountainbikes sind für Waldwege, Trails und sportliches Fahren gemacht. Im Schwarzwald rund um Freiburg gibt es unzählige Trails.',
          },
          {
            type: 'heading',
            content: 'E-Bike — Elektrisch unterstützt',
          },
          {
            type: 'paragraph',
            content:
              'Ein E-Bike (Pedelec) unterstützt Sie mit einem Elektromotor bis 25 km/h. Ideal für Pendler mit langen Strecken, Berge oder wenn Sie einfach entspannter ankommen möchten. In Freiburg mit seinen Steigungen besonders beliebt.',
          },
          {
            type: 'heading',
            content: 'Unsere Empfehlung',
          },
          {
            type: 'list',
            items: [
              'Kurze Stadtstrecken (< 5 km): Citybike oder Hollandrad',
              'Pendeln (5–15 km): Trekkingrad oder Citybike',
              'Lange Strecken (> 15 km): E-Bike oder Trekkingrad',
              'Sport & Gelände: Mountainbike',
              'Mit Kindern: Kindersitz-kompatibles Citybike oder Lastenrad',
            ],
          },
          {
            type: 'tip',
            content:
              'Unsicher? Kommen Sie einfach bei Bike Haus Freiburg vorbei. Wir beraten Sie kostenlos und Sie können verschiedene Räder probefahren. Heckerstraße 27, Mo–Fr 10–18 Uhr.',
          },
          {
            type: 'cta',
            content: 'Jetzt Fahrräder ansehen',
            link: '/showroom',
            linkText: 'Zum Showroom',
          },
        ],
      },
      en: {
        title: 'Which Bike is Right for Me? — Complete Guide',
        metaTitle:
          'Which Bike is Right for Me? Guide 2026 | Bike Haus Freiburg',
        metaDescription:
          'City bike, trekking, mountain or e-bike? Find out which type suits your riding style. Free advice in Freiburg.',
        excerpt:
          'City, trekking, mountain or e-bike? We help you find the right bike type.',
        tldr: 'Short city trips → city bike. Commuting → trekking bike. Long distances → e-bike. Sport & trails → mountain bike. Free advice at Bike Haus Freiburg.',
        sections: [
          {
            type: 'heading',
            content: 'Bike types at a glance',
          },
          {
            type: 'paragraph',
            content:
              'Choosing the right bike depends on three things: where you ride, how far, and how sporty you want to be.',
          },
          {
            type: 'cta',
            content: 'Browse our bikes',
            link: '/showroom',
            linkText: 'Visit Showroom',
          },
        ],
      },
      fr: {
        title: 'Quel vélo me convient ? — Guide complet',
        metaTitle: 'Quel vélo me convient ? Guide 2026 | Bike Haus Freiburg',
        metaDescription:
          'Vélo de ville, trekking, VTT ou VAE ? Trouvez le type de vélo adapté à votre style.',
        excerpt: 'Ville, trekking, VTT ou VAE ? Nous vous aidons à choisir.',
        tldr: 'Trajets courts → vélo de ville. Trajets quotidiens → trekking. Longues distances → VAE. Sport → VTT. Conseils gratuits chez Bike Haus Freiburg.',
        sections: [
          {
            type: 'heading',
            content: "Types de vélos en un coup d'œil",
          },
          {
            type: 'paragraph',
            content:
              'Le choix du bon vélo dépend de trois facteurs : où roulez-vous, quelle distance, et quel niveau sportif recherchez-vous.',
          },
          {
            type: 'cta',
            content: 'Voir nos vélos',
            link: '/showroom',
            linkText: 'Showroom',
          },
        ],
      },
      tr: {
        title: 'Bana Hangi Bisiklet Uygun? — Kapsamlı Rehber',
        metaTitle:
          'Bana Hangi Bisiklet Uygun? 2026 Rehberi | Bike Haus Freiburg',
        metaDescription:
          'Şehir, trekking, dağ veya elektrikli bisiklet? Sürüş tarzınıza uygun tipi bulun.',
        excerpt:
          'Şehir, trekking, dağ veya e-bisiklet? Size uygun tipi bulmanıza yardımcı olalım.',
        tldr: "Kısa şehir içi → şehir bisikleti. İşe gidiş → trekking. Uzun mesafe → e-bisiklet. Spor & arazi → dağ bisikleti. Bike Haus Freiburg'da ücretsiz danışmanlık.",
        sections: [
          {
            type: 'heading',
            content: 'Bisiklet tipleri bir bakışta',
          },
          {
            type: 'paragraph',
            content:
              'Doğru bisikleti seçmek üç faktöre bağlıdır: nerede sürüyorsunuz, ne kadar uzak, ne kadar sportif olmak istiyorsunuz.',
          },
          {
            type: 'cta',
            content: 'Bisikletlere göz atın',
            link: '/showroom',
            linkText: "Showroom'a Git",
          },
        ],
      },
    },
  },

  // ─── Article 3: Fahrrad Rahmengröße berechnen ───
  {
    slug: 'fahrrad-rahmengroesse-berechnen',
    coverImage: 'assets/blog/rahmengroesse.jpg',
    date: '2026-04-12',
    readingTime: 6,
    category: 'ratgeber',
    tags: ['rahmengröße', 'berechnen', 'tabelle', 'schrittlänge'],
    relatedSlugs: [
      'welches-fahrrad-passt-zu-mir',
      'gebrauchtes-fahrrad-kaufen-tipps',
    ],
    translations: {
      de: {
        title: 'Fahrrad Rahmengröße berechnen — Tabelle & Anleitung',
        metaTitle:
          'Fahrrad Rahmengröße berechnen — Tabelle 2026 | Bike Haus Freiburg',
        metaDescription:
          'Fahrrad Rahmengröße berechnen: Schrittlänge messen, Formel anwenden, richtige Größe finden. Mit Tabelle für City, Trekking, MTB & E-Bike.',
        excerpt:
          'Die richtige Rahmengröße ist entscheidend für Komfort und Sicherheit. So berechnen Sie Ihre optimale Rahmenhöhe.',
        tldr: 'Schrittlänge messen und mit dem Faktor multiplizieren: City/Trekking ×0,66, MTB ×0,574, Rennrad ×0,665. Zwischen zwei Größen? Sportlich → kleiner, komfortabel → größer.',
        sections: [
          {
            type: 'heading',
            content: 'Warum die richtige Rahmengröße wichtig ist',
          },
          {
            type: 'paragraph',
            content:
              'Ein zu großer oder zu kleiner Rahmen führt zu Rücken-, Knie- und Nackenschmerzen. Die richtige Rahmengröße sorgt für eine ergonomische Sitzposition und mehr Spaß beim Fahren.',
          },
          {
            type: 'heading',
            content: 'Schritt 1: Schrittlänge messen',
          },
          {
            type: 'paragraph',
            content:
              'Stellen Sie sich barfuß mit dem Rücken an eine Wand. Klemmen Sie ein Buch waagerecht zwischen Ihre Beine (wie ein Sattel). Messen Sie den Abstand vom Boden bis zur Oberkante des Buches — das ist Ihre Schrittlänge in cm.',
          },
          {
            type: 'heading',
            content: 'Schritt 2: Rahmengröße berechnen',
          },
          {
            type: 'list',
            items: [
              'Citybike / Hollandrad: Schrittlänge × 0,66 = Rahmenhöhe (cm)',
              'Trekkingrad: Schrittlänge × 0,66 = Rahmenhöhe (cm)',
              'Mountainbike: Schrittlänge × 0,574 = Rahmenhöhe (cm)',
              'Rennrad: Schrittlänge × 0,665 = Rahmenhöhe (cm)',
              'E-Bike: Schrittlänge × 0,66 = Rahmenhöhe (cm)',
            ],
          },
          {
            type: 'heading',
            content: 'Rahmengröße Tabelle (Übersicht)',
          },
          {
            type: 'list',
            items: [
              'Körpergröße 155–165 cm → Rahmenhöhe 42–47 cm (City/Trekking)',
              'Körpergröße 165–175 cm → Rahmenhöhe 47–52 cm (City/Trekking)',
              'Körpergröße 175–185 cm → Rahmenhöhe 52–56 cm (City/Trekking)',
              'Körpergröße 185–195 cm → Rahmenhöhe 56–61 cm (City/Trekking)',
              'Körpergröße 195+ cm → Rahmenhöhe 61+ cm (City/Trekking)',
            ],
          },
          {
            type: 'tip',
            content:
              'Zwischen zwei Größen? Wählen Sie die kleinere Größe, wenn Sie sportlich fahren, und die größere für komfortables Fahren. Bei Bike Haus Freiburg beraten wir Sie gerne persönlich.',
          },
          {
            type: 'cta',
            content: 'Persönliche Beratung',
            link: '/contact',
            linkText: 'Kontakt aufnehmen',
          },
        ],
      },
      en: {
        title: 'Calculate Bike Frame Size — Table & Guide',
        metaTitle:
          'Bike Frame Size Calculator — Table 2026 | Bike Haus Freiburg',
        metaDescription:
          'Calculate your bike frame size: measure inseam, apply formula, find the right size. Tables for city, trekking, MTB & e-bike.',
        excerpt:
          'The right frame size is key to comfort and safety. Here is how to calculate yours.',
        tldr: 'Measure inseam and multiply: City/Trekking ×0.66, MTB ×0.574, Road ×0.665. Between sizes? Sporty → smaller, comfortable → larger.',
        sections: [
          {
            type: 'heading',
            content: 'Why frame size matters',
          },
          {
            type: 'paragraph',
            content:
              'An incorrectly sized frame causes back, knee and neck pain. The right size means ergonomic posture and more fun riding.',
          },
          {
            type: 'cta',
            content: 'Get personal advice',
            link: '/contact',
            linkText: 'Contact Us',
          },
        ],
      },
      fr: {
        title: 'Calculer la taille du cadre — Tableau & Guide',
        metaTitle:
          'Calculer la taille du cadre vélo — Tableau 2026 | Bike Haus Freiburg',
        metaDescription:
          'Calculez votre taille de cadre : mesurez votre entrejambe, appliquez la formule.',
        excerpt:
          'La bonne taille de cadre est la clé du confort. Voici comment la calculer.',
        tldr: 'Mesurez votre entrejambe et multipliez : Ville/Trekking ×0,66, VTT ×0,574, Route ×0,665. Entre deux tailles ? Sportif → plus petit, confort → plus grand.',
        sections: [
          {
            type: 'heading',
            content: 'Pourquoi la taille du cadre est importante',
          },
          {
            type: 'paragraph',
            content:
              'Un cadre mal dimensionné provoque des douleurs au dos, aux genoux et au cou.',
          },
          {
            type: 'cta',
            content: 'Conseils personnalisés',
            link: '/contact',
            linkText: 'Contactez-nous',
          },
        ],
      },
      tr: {
        title: 'Bisiklet Kadro Boyu Hesaplama — Tablo & Rehber',
        metaTitle: 'Bisiklet Kadro Boyu Hesaplama | Bike Haus Freiburg',
        metaDescription:
          'Bisiklet kadro boyunuzu hesaplayın: bacak içi ölçümü, formül ve tablo.',
        excerpt: 'Doğru kadro boyu konfor ve güvenlik için çok önemlidir.',
        tldr: 'Bacak içi ölçüsünü çarpın: Şehir/Trekking ×0,66, MTB ×0,574, Yol ×0,665. İki beden arasındaysanız: sportif → küçük, konforlu → büyük.',
        sections: [
          {
            type: 'heading',
            content: 'Kadro boyu neden önemli?',
          },
          {
            type: 'paragraph',
            content:
              'Yanlış boyutta kadro sırt, diz ve boyun ağrılarına neden olur.',
          },
          {
            type: 'cta',
            content: 'Kişisel danışmanlık',
            link: '/contact',
            linkText: 'İletişim',
          },
        ],
      },
    },
  },

  // ─── Article 4: E-Bike gebraucht kaufen ───
  {
    slug: 'e-bike-gebraucht-kaufen',
    coverImage: 'assets/blog/ebike-gebraucht.jpg',
    date: '2026-04-12',
    readingTime: 7,
    category: 'ratgeber',
    tags: ['e-bike', 'gebraucht', 'akku', 'motor', 'garantie'],
    relatedSlugs: [
      'gebrauchtes-fahrrad-kaufen-tipps',
      'welches-fahrrad-passt-zu-mir',
    ],
    translations: {
      de: {
        title: 'E-Bike gebraucht kaufen — Akku, Motor, Garantie',
        metaTitle:
          'E-Bike gebraucht kaufen — Worauf achten? | Bike Haus Freiburg',
        metaDescription:
          'Gebrauchtes E-Bike kaufen: Akku-Zustand, Motor-Check, Garantie. Was Sie beim Kauf eines gebrauchten Pedelecs wissen müssen.',
        excerpt:
          'Ein gebrauchtes E-Bike kann über 1.000 € sparen. Worauf Sie bei Akku, Motor und Garantie achten sollten.',
        tldr: 'Ein gutes gebrauchtes E-Bike kostet 800–1.500 € (50 % Ersparnis). Achten Sie auf Akku-Restkapazität (mind. 70 %), Ladezyklen und Motor-Zustand. Bei Bike Haus Freiburg: geprüfte E-Bikes mit dokumentiertem Akku-Zustand.',
        sections: [
          {
            type: 'heading',
            content: 'Lohnt sich ein gebrauchtes E-Bike?',
          },
          {
            type: 'paragraph',
            content:
              'Neue E-Bikes kosten oft 2.000–5.000 €. Ein gutes gebrauchtes E-Bike bekommen Sie ab 800–1.500 € — das bedeutet eine Ersparnis von 50 % und mehr. Wichtig ist, dass Akku und Motor in gutem Zustand sind.',
          },
          {
            type: 'heading',
            content: 'Akku-Check: Das Herzstück des E-Bikes',
          },
          {
            type: 'list',
            items: [
              'Akku-Kapazität: Neue Akkus haben 400–750 Wh. Ein guter gebrauchter Akku hat mindestens 70 % Restkapazität.',
              'Ladezyklen: Ein E-Bike-Akku hält ca. 500–1.000 Ladezyklen. Fragen Sie nach der Anzahl.',
              'Alter: Akkus altern auch ohne Nutzung. Ab 4–5 Jahren nimmt die Kapazität merklich ab.',
              'Optischer Zustand: Keine Dellen, keine Korrosion an den Kontakten.',
              'Reichweite testen: Probefahrt mit vollem Akku — mindestens 40 km sollten drin sein.',
            ],
          },
          {
            type: 'heading',
            content: 'Motor-Check',
          },
          {
            type: 'paragraph',
            content:
              'Achten Sie während der Probefahrt auf: gleichmäßige Unterstützung ohne Ruckeln, sauberes Ein- und Abschalten bei 25 km/h, keine ungewöhnlichen Geräusche. Marken wie Bosch, Shimano und Brose gelten als besonders langlebig.',
          },
          {
            type: 'tip',
            content:
              'Bei Bike Haus Freiburg werden alle gebrauchten E-Bikes technisch geprüft und der Akku-Zustand dokumentiert. So kaufen Sie ohne böse Überraschungen.',
          },
          {
            type: 'cta',
            content: 'E-Bikes im Showroom',
            link: '/showroom',
            linkText: 'E-Bikes ansehen',
          },
        ],
      },
      en: {
        title: 'Buying a Used E-Bike — Battery, Motor, Warranty',
        metaTitle: 'Buying a Used E-Bike — What to Check | Bike Haus Freiburg',
        metaDescription:
          'Used e-bike buying guide: battery health, motor check, warranty. What you need to know before buying a used pedelec.',
        excerpt:
          'A used e-bike can save over €1,000. What to check regarding battery, motor and warranty.',
        tldr: 'A good used e-bike costs €800–1,500 (50% savings). Check battery capacity (min. 70%), charge cycles and motor condition. At Bike Haus Freiburg: inspected e-bikes with documented battery health.',
        sections: [
          {
            type: 'heading',
            content: 'Is a used e-bike worth it?',
          },
          {
            type: 'paragraph',
            content:
              'New e-bikes cost €2,000–5,000. A good used e-bike starts at €800–1,500 — saving 50% or more.',
          },
          {
            type: 'cta',
            content: 'View e-bikes',
            link: '/showroom',
            linkText: 'Visit Showroom',
          },
        ],
      },
      fr: {
        title: "Acheter un VAE d'occasion — Batterie, Moteur, Garantie",
        metaTitle: "VAE d'occasion — Que vérifier ? | Bike Haus Freiburg",
        metaDescription:
          "Guide d'achat VAE d'occasion : état de la batterie, vérification du moteur, garantie.",
        excerpt: "Un VAE d'occasion permet d'économiser plus de 1 000 €.",
        tldr: "Un bon VAE d'occasion coûte 800–1 500 € (50 % d'économie). Vérifiez la capacité batterie (min. 70 %), les cycles de charge et le moteur.",
        sections: [
          {
            type: 'heading',
            content: "Un VAE d'occasion, ça vaut le coup ?",
          },
          {
            type: 'paragraph',
            content:
              "Les VAE neufs coûtent entre 2 000 et 5 000 €. Un bon VAE d'occasion commence à 800–1 500 €.",
          },
          {
            type: 'cta',
            content: 'Voir les VAE',
            link: '/showroom',
            linkText: 'Showroom',
          },
        ],
      },
      tr: {
        title: 'İkinci El E-Bisiklet Alma Rehberi — Akü, Motor, Garanti',
        metaTitle:
          'İkinci El E-Bisiklet Alırken Nelere Dikkat Etmeli? | Bike Haus Freiburg',
        metaDescription:
          'İkinci el e-bisiklet alırken akü durumu, motor kontrolü ve garanti hakkında bilmeniz gerekenler.',
        excerpt:
          "İkinci el e-bisiklet 1.000 €'dan fazla tasarruf sağlayabilir.",
        tldr: 'İyi bir ikinci el e-bisiklet 800–1.500 € (% 50 tasarruf). Akü kapasitesi (min. %70), şarj döngüsü ve motor durumuna dikkat edin.',
        sections: [
          {
            type: 'heading',
            content: 'İkinci el e-bisiklet alınır mı?',
          },
          {
            type: 'paragraph',
            content:
              "Yeni e-bisikletler 2.000–5.000 € arası. İyi bir ikinci el e-bisiklet 800–1.500 €'dan başlar.",
          },
          {
            type: 'cta',
            content: 'E-bisikletlere göz at',
            link: '/showroom',
            linkText: "Showroom'a Git",
          },
        ],
      },
    },
  },

  // ─── Article 5: Fahrradladen Freiburg ───
  {
    slug: 'fahrradladen-freiburg',
    coverImage: 'assets/blog/fahrradladen-freiburg.jpg',
    date: '2026-04-12',
    readingTime: 5,
    category: 'lokal',
    tags: [
      'fahrradladen',
      'freiburg',
      'fahrradgeschäft',
      'fahrradhändler',
      'bike shop',
    ],
    relatedSlugs: [
      'gebrauchtes-fahrrad-kaufen-tipps',
      'welches-fahrrad-passt-zu-mir',
    ],
    translations: {
      de: {
        title: 'Fahrradladen Freiburg — Bike Haus Freiburg',
        metaTitle:
          'Fahrradladen Freiburg — Ihr Fahrradgeschäft | Bike Haus Freiburg',
        metaDescription:
          'Fahrradladen in Freiburg gesucht? Bike Haus Freiburg: Über 100 neue & gebrauchte Fahrräder, E-Bikes, Garantie, Probefahrt. Heckerstraße 27.',
        excerpt:
          'Ihr Fahrradladen in Freiburg: Bike Haus Freiburg bietet über 100 neue und gebrauchte Fahrräder mit Garantie.',
        tldr: 'Bike Haus Freiburg: Heckerstraße 27, 79114 Freiburg. Über 100 neue & gebrauchte Fahrräder, E-Bikes, Garantie. Mo–Fr 10–18, Sa 10–14 Uhr. WhatsApp: +49 155 6630 0011.',
        sections: [
          {
            type: 'heading',
            content: 'Bike Haus Freiburg — Ihr Fahrradhändler in Freiburg',
          },
          {
            type: 'paragraph',
            content:
              'Bike Haus Freiburg ist ein Fahrradgeschäft in der Heckerstraße 27, 79114 Freiburg im Breisgau. Wir bieten neue und gebrauchte Fahrräder — darunter Citybikes, Trekkingräder, Mountainbikes, E-Bikes, Kinderfahrräder und Hollandräder.',
          },
          {
            type: 'heading',
            content: 'Warum Bike Haus Freiburg?',
          },
          {
            type: 'list',
            items: [
              'Über 100 Fahrräder vorrätig — keine Wartezeit',
              'Geprüfte Gebrauchträder mit 3 Monaten Garantie',
              'Neue Fahrräder mit 24 Monaten Garantie',
              'Probefahrt vor Ort — kein Termin nötig',
              'Faire, transparente Preise',
              'Beratung auf Deutsch, Englisch und Türkisch',
              'Zentral gelegen — auch erreichbar aus Emmendingen, Bad Krozingen, Breisach',
            ],
          },
          {
            type: 'heading',
            content: 'Öffnungszeiten & Kontakt',
          },
          {
            type: 'list',
            items: [
              'Montag – Freitag: 10:00 – 18:00 Uhr',
              'Samstag: 10:00 – 14:00 Uhr',
              'Sonntag: geschlossen',
              'WhatsApp: +49 155 6630 0011',
              'E-Mail: bikehausfreiburg@gmail.com',
            ],
          },
          {
            type: 'heading',
            content: 'So finden Sie uns',
          },
          {
            type: 'paragraph',
            content:
              'Bike Haus Freiburg befindet sich in der Heckerstraße 27, im Stadtteil Haslach. Gut erreichbar mit dem Auto (Parkplätze vorhanden) oder mit der Straßenbahn. Aus Emmendingen, Bad Krozingen, Breisach, March und Gundelfingen sind wir in 15–25 Minuten erreichbar.',
          },
          {
            type: 'cta',
            content: 'Besuchen Sie uns',
            link: '/contact',
            linkText: 'Anfahrt & Kontakt',
          },
        ],
      },
      en: {
        title: 'Bike Shop Freiburg — Bike Haus Freiburg',
        metaTitle: 'Bike Shop Freiburg — Your Bike Store | Bike Haus Freiburg',
        metaDescription:
          'Looking for a bike shop in Freiburg? Bike Haus Freiburg: 100+ new & used bikes, e-bikes, warranty, test rides.',
        excerpt:
          'Your bike shop in Freiburg: Over 100 new and used bikes with warranty.',
        tldr: 'Bike Haus Freiburg: Heckerstraße 27, 79114 Freiburg. 100+ new & used bikes, e-bikes, warranty. Mon–Fri 10–18, Sat 10–14. WhatsApp: +49 155 6630 0011.',
        sections: [
          {
            type: 'heading',
            content: 'Bike Haus Freiburg — Your bike dealer in Freiburg',
          },
          {
            type: 'paragraph',
            content:
              'Bike Haus Freiburg is a bike shop at Heckerstraße 27, 79114 Freiburg. We offer new and used bikes with warranty.',
          },
          {
            type: 'cta',
            content: 'Visit us',
            link: '/contact',
            linkText: 'Directions & Contact',
          },
        ],
      },
      fr: {
        title: 'Magasin de vélos Freiburg — Bike Haus Freiburg',
        metaTitle: 'Magasin de vélos Freiburg | Bike Haus Freiburg',
        metaDescription:
          'Vous cherchez un magasin de vélos à Freiburg ? Bike Haus Freiburg : plus de 100 vélos neufs et occasion.',
        excerpt:
          'Votre magasin de vélos à Freiburg : plus de 100 vélos avec garantie.',
        tldr: 'Bike Haus Freiburg : Heckerstraße 27, 79114 Freiburg. Plus de 100 vélos neufs et occasion, VAE, garantie. Lun–Ven 10–18, Sam 10–14.',
        sections: [
          {
            type: 'heading',
            content: 'Bike Haus Freiburg — Votre vélociste à Freiburg',
          },
          {
            type: 'paragraph',
            content:
              'Bike Haus Freiburg est un magasin de vélos à la Heckerstraße 27, 79114 Freiburg.',
          },
          {
            type: 'cta',
            content: 'Rendez-nous visite',
            link: '/contact',
            linkText: 'Itinéraire & Contact',
          },
        ],
      },
      tr: {
        title: 'Freiburg Bisikletçi — Bike Haus Freiburg',
        metaTitle: 'Freiburg Bisiklet Dükkanı | Bike Haus Freiburg',
        metaDescription:
          "Freiburg'da bisiklet dükkanı arıyorsunuz? Bike Haus Freiburg: 100+ yeni ve ikinci el bisiklet, garanti, deneme sürüşü.",
        excerpt:
          "Freiburg'daki bisiklet dükkanınız: Garantili 100+ yeni ve ikinci el bisiklet.",
        tldr: 'Bike Haus Freiburg: Heckerstraße 27, 79114 Freiburg. 100+ yeni ve ikinci el bisiklet, e-bisiklet, garanti. Pzt–Cum 10–18, Cmt 10–14. WhatsApp: +49 155 6630 0011.',
        sections: [
          {
            type: 'heading',
            content: "Bike Haus Freiburg — Freiburg'daki bisiklet mağazanız",
          },
          {
            type: 'paragraph',
            content:
              'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg adresinde bulunan bir bisiklet mağazasıdır.',
          },
          {
            type: 'cta',
            content: 'Bizi ziyaret edin',
            link: '/contact',
            linkText: 'Yol Tarifi & İletişim',
          },
        ],
      },
    },
  },
];
