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
              'Mo, Di, Do: 11:00 – 17:30 Uhr',
              'Mittwoch: 14:00 – 17:30 Uhr',
              'Freitag: 11:00 – 13:00 & 15:00 – 18:00 Uhr',
              'Samstag: 11:30 – 17:00 Uhr',
              'Sonn- und feiertags geschlossen',
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

  // ─── Article 6: Kinderfahrrad Größe ───
  {
    slug: 'kinderfahrrad-groesse',
    coverImage: 'assets/blog/kinderfahrrad-groesse.jpg',
    date: '2026-04-12',
    readingTime: 7,
    category: 'ratgeber',
    tags: [
      'kinderfahrrad',
      'größe',
      'alter',
      'tabelle',
      'kinderfahrrad freiburg',
    ],
    relatedSlugs: [
      'welches-fahrrad-passt-zu-mir',
      'fahrrad-rahmengroesse-berechnen',
    ],
    translations: {
      de: {
        title: 'Kinderfahrrad Größe — Welche Größe für welches Alter?',
        metaTitle:
          'Kinderfahrrad Größe — Tabelle nach Alter & Körpergröße | Bike Haus Freiburg',
        metaDescription:
          'Welche Kinderfahrrad-Größe passt? Größentabelle nach Alter & Körpergröße ✓ 12 bis 26 Zoll ✓ Tipps vom Fachhändler aus Freiburg.',
        excerpt:
          'Die richtige Fahrradgröße ist entscheidend für Sicherheit und Spaß. Unsere Tabelle zeigt, welches Rad zu welchem Alter passt.',
        tldr: 'Kinderfahrräder gibt es von 12 bis 26 Zoll. Entscheidend ist die Körpergröße, nicht nur das Alter. Ab 95 cm → 12 Zoll, ab 105 cm → 16 Zoll, ab 120 cm → 20 Zoll, ab 135 cm → 24 Zoll, ab 140 cm → 26 Zoll. Bei Bike Haus Freiburg können Kinder Probe fahren.',
        sections: [
          {
            type: 'heading',
            content: 'Warum ist die richtige Fahrradgröße so wichtig?',
          },
          {
            type: 'paragraph',
            content:
              'Ein zu großes oder zu kleines Fahrrad ist nicht nur unbequem — es ist auch unsicher. Kinder, die nicht sicher mit den Füßen den Boden erreichen, können bei Gefahrensituationen nicht richtig reagieren. Gleichzeitig führt ein zu kleines Rad zu einer verkrampften Haltung und macht keinen Spaß.',
          },
          {
            type: 'heading',
            content: 'Größentabelle: Kinderfahrrad nach Körpergröße',
          },
          {
            type: 'list',
            items: [
              '12 Zoll: Körpergröße 95–105 cm (ca. 2–4 Jahre)',
              '14 Zoll: Körpergröße 100–110 cm (ca. 3–5 Jahre)',
              '16 Zoll: Körpergröße 105–120 cm (ca. 4–6 Jahre)',
              '18 Zoll: Körpergröße 110–125 cm (ca. 5–7 Jahre)',
              '20 Zoll: Körpergröße 120–135 cm (ca. 6–9 Jahre)',
              '24 Zoll: Körpergröße 135–145 cm (ca. 8–12 Jahre)',
              '26 Zoll: Körpergröße ab 140 cm (ca. 10–14 Jahre)',
            ],
          },
          {
            type: 'tip',
            content:
              'Tipp: Messen Sie die Innenbeinlänge Ihres Kindes (Schrittlänge). Das Kind sollte mit beiden Fußballen den Boden berühren, wenn es auf dem Sattel sitzt.',
          },
          {
            type: 'heading',
            content: 'Worauf beim Kinderfahrrad-Kauf achten?',
          },
          {
            type: 'list',
            items: [
              'Rücktrittbremse: Bis ca. 6 Jahre empfohlen, da kleinere Hände oft nicht genug Kraft für Handbremsen haben.',
              'Gewicht: Ein leichtes Rad lässt sich besser kontrollieren. Faustregel: max. 30–40 % des Körpergewichts.',
              'Stützräder: Von Experten nicht empfohlen — besser mit einem Laufrad starten.',
              'Beleuchtung: Ab Teilnahme am Straßenverkehr Pflicht nach StVZO.',
              'Schutzbleche & Kettenschutz: Schützen Kleidung und sorgen für Sicherheit.',
            ],
          },
          {
            type: 'heading',
            content: 'Kinderfahrräder bei Bike Haus Freiburg',
          },
          {
            type: 'paragraph',
            content:
              'Wir führen neue und gebrauchte Kinderfahrräder von 12 bis 26 Zoll. Jedes gebrauchte Rad wird geprüft und kommt mit 3 Monaten Garantie. Ihr Kind kann vor dem Kauf eine Probefahrt machen — so finden wir gemeinsam die perfekte Größe.',
          },
          {
            type: 'cta',
            content: 'Kinderfahrräder im Showroom ansehen',
            link: '/showroom',
            linkText: 'Zum Showroom',
          },
        ],
      },
      en: {
        title: "Children's Bike Size — Which Size for Which Age?",
        metaTitle:
          "Children's Bike Size Guide — Chart by Age & Height | Bike Haus Freiburg",
        metaDescription:
          "Which children's bike size fits? Size chart by age & height ✓ 12 to 26 inch ✓ Expert tips from Freiburg's bike shop.",
        excerpt:
          'The right bike size is crucial for safety and fun. Our chart shows which bike fits which age.',
        tldr: 'Children\'s bikes range from 12 to 26 inches. Body height matters more than age. From 95 cm → 12", 105 cm → 16", 120 cm → 20", 135 cm → 24", 140 cm → 26". Test rides available at Bike Haus Freiburg.',
        sections: [
          {
            type: 'heading',
            content: 'Why is the right bike size so important?',
          },
          {
            type: 'paragraph',
            content:
              "A bike that's too big or too small is not only uncomfortable — it's also unsafe. Children who can't safely touch the ground with their feet can't react properly in dangerous situations.",
          },
          {
            type: 'heading',
            content: "Size Chart: Children's Bikes by Height",
          },
          {
            type: 'list',
            items: [
              '12 inch: Height 95–105 cm (approx. 2–4 years)',
              '16 inch: Height 105–120 cm (approx. 4–6 years)',
              '20 inch: Height 120–135 cm (approx. 6–9 years)',
              '24 inch: Height 135–145 cm (approx. 8–12 years)',
              '26 inch: Height from 140 cm (approx. 10–14 years)',
            ],
          },
          {
            type: 'tip',
            content:
              "Tip: Measure your child's inseam length. The child should be able to touch the ground with both balls of their feet while sitting on the saddle.",
          },
          {
            type: 'cta',
            content: "Browse children's bikes in our showroom",
            link: '/showroom',
            linkText: 'To Showroom',
          },
        ],
      },
      fr: {
        title: 'Taille de vélo enfant — Quelle taille pour quel âge\u00a0?',
        metaTitle:
          'Taille vélo enfant — Tableau par âge & taille | Bike Haus Freiburg',
        metaDescription:
          'Quelle taille de vélo pour votre enfant? Tableau de tailles par âge et taille ✓ 12 à 26 pouces ✓ Conseils experts de Freiburg.',
        excerpt:
          'La bonne taille de vélo est essentielle pour la sécurité et le plaisir. Notre tableau montre quel vélo convient à quel âge.',
        tldr: 'Les vélos enfants vont de 12 à 26 pouces. La taille du corps est plus importante que l\'âge. Dès 95 cm → 12", 105 cm → 16", 120 cm → 20", 135 cm → 24". Essais chez Bike Haus Freiburg.',
        sections: [
          {
            type: 'heading',
            content: 'Pourquoi la bonne taille de vélo est-elle si importante?',
          },
          {
            type: 'paragraph',
            content:
              "Un vélo trop grand ou trop petit n'est pas seulement inconfortable — il est aussi dangereux. Les enfants qui ne peuvent pas toucher le sol ne peuvent pas réagir correctement en cas de danger.",
          },
          {
            type: 'cta',
            content: 'Voir les vélos enfants dans notre showroom',
            link: '/showroom',
            linkText: 'Vers le Showroom',
          },
        ],
      },
      tr: {
        title: 'Çocuk Bisikleti Beden — Hangi Yaş İçin Hangi Beden?',
        metaTitle:
          'Çocuk Bisikleti Beden Tablosu — Yaş & Boya Göre | Bike Haus Freiburg',
        metaDescription:
          "Çocuğunuza hangi bisiklet bedeni uyar? Yaş ve boya göre beden tablosu ✓ 12'den 26 inç'e ✓ Freiburg'dan uzman tavsiyeleri.",
        excerpt:
          'Doğru bisiklet bedeni güvenlik ve eğlence için çok önemli. Tablomuz hangi bisikletin hangi yaşa uyduğunu gösterir.',
        tldr: 'Çocuk bisikletleri 12\'den 26 inç\'e kadar. Boy uzunluğu yaştan daha önemli. 95 cm → 12", 105 cm → 16", 120 cm → 20", 135 cm → 24". Bike Haus Freiburg\'da deneme sürüşü yapılabilir.',
        sections: [
          {
            type: 'heading',
            content: 'Doğru bisiklet bedeni neden bu kadar önemli?',
          },
          {
            type: 'paragraph',
            content:
              'Çok büyük veya çok küçük bir bisiklet yalnızca rahatsız değil, aynı zamanda güvensizdir. Ayaklarıyla yere basamayan çocuklar tehlikeli durumlarda doğru tepki veremez.',
          },
          {
            type: 'cta',
            content: "Showroom'daki çocuk bisikletlerini görüntüle",
            link: '/showroom',
            linkText: "Showroom'a Git",
          },
        ],
      },
    },
  },

  // ─── Article 7: Fahrrad Inspektion — Kosten & Ablauf ───
  {
    slug: 'fahrrad-inspektion-kosten',
    coverImage: 'assets/blog/fahrrad-inspektion.jpg',
    date: '2026-04-12',
    readingTime: 6,
    category: 'ratgeber',
    tags: [
      'fahrrad inspektion',
      'wartung',
      'kosten',
      'reparatur',
      'fahrrad check',
    ],
    relatedSlugs: ['gebrauchtes-fahrrad-kaufen-tipps', 'fahrradladen-freiburg'],
    translations: {
      de: {
        title: 'Fahrrad Inspektion — Was wird gemacht & was kostet es?',
        metaTitle:
          'Fahrrad Inspektion — Kosten, Ablauf & Checkliste | Bike Haus Freiburg',
        metaDescription:
          'Was kostet eine Fahrrad Inspektion? Was wird geprüft? Ablauf, Kosten (30–80 €) und Checkliste ✓ Tipps vom Fahrradladen in Freiburg.',
        excerpt:
          'Eine regelmäßige Inspektion hält Ihr Fahrrad sicher und verhindert teure Reparaturen. Hier erfahren Sie, was geprüft wird und was es kostet.',
        tldr: 'Eine Fahrrad-Inspektion kostet je nach Umfang 30–80 €. Geprüft werden Bremsen, Schaltung, Reifen, Kette, Lager, Beleuchtung und Speichenspannung. Empfohlen: 1× pro Jahr oder alle 2.000 km.',
        sections: [
          {
            type: 'heading',
            content: 'Warum ist eine Fahrrad-Inspektion wichtig?',
          },
          {
            type: 'paragraph',
            content:
              'Verschleiß an Bremsen, Kette und Reifen passiert schleichend. Wer regelmäßig warten lässt, fährt sicher und vermeidet teure Folgeschäden. Eine Inspektion pro Jahr reicht für Gelegenheitsfahrer — Pendler sollten alle 6 Monate eine machen lassen.',
          },
          {
            type: 'heading',
            content: 'Was wird bei einer Fahrrad-Inspektion geprüft?',
          },
          {
            type: 'list',
            items: [
              'Bremsen: Bremsbeläge, Bremszüge, Bremsleistung prüfen und einstellen.',
              'Schaltung: Schaltzüge, Umwerfer und Schaltwerk justieren.',
              'Reifen: Profil, Zustand und Luftdruck kontrollieren.',
              'Kette: Kettenverschleiß messen. Ab 0,75 % Längung → Kette tauschen.',
              'Lager: Steuersatz, Tretlager und Naben auf Spiel prüfen.',
              'Beleuchtung: Vorder- und Rücklicht, Reflektoren (StVZO-Pflicht).',
              'Speichen: Spannung prüfen, Achter richten.',
              'Schrauben: Alle Verschraubungen auf festen Sitz kontrollieren.',
            ],
          },
          {
            type: 'heading',
            content: 'Was kostet eine Fahrrad-Inspektion?',
          },
          {
            type: 'list',
            items: [
              'Basis-Check (Bremsen + Schaltung + Luft): ca. 20–30 €',
              'Standard-Inspektion (alle Komponenten): ca. 40–60 €',
              'Große Inspektion (inkl. Reinigung + Nachfetten): ca. 60–80 €',
              'E-Bike Inspektion (+ Akku & Motor-Diagnose): ca. 70–100 €',
            ],
          },
          {
            type: 'tip',
            content:
              'Tipp: Bringen Sie Ihr Fahrrad im Frühling zur Inspektion — vor der Hauptsaison. So haben Werkstätten kürzere Wartezeiten und Ihr Rad ist rechtzeitig fit.',
          },
          {
            type: 'heading',
            content: 'DIY-Checkliste: Das können Sie selbst prüfen',
          },
          {
            type: 'list',
            items: [
              'Reifendruck: Mindestens 1× pro Monat prüfen (Angabe steht auf der Reifenflanke).',
              'Kette ölen: Alle 200–300 km mit speziellem Kettenöl schmieren.',
              'Bremsen testen: Vor jeder Fahrt kurz beide Bremsen prüfen.',
              'Licht prüfen: Vor jeder Abendfahrt Vorder- und Rücklicht testen.',
              'Schrauben: Lenker, Sattel und Achsen gelegentlich nachziehen.',
            ],
          },
          {
            type: 'cta',
            content:
              'Inspektion fällig? Kommen Sie bei Bike Haus Freiburg vorbei!',
            link: '/contact',
            linkText: 'Kontakt & Anfahrt',
          },
        ],
      },
      en: {
        title: 'Bike Inspection — What Gets Checked & What Does It Cost?',
        metaTitle:
          'Bike Inspection — Costs, Process & Checklist | Bike Haus Freiburg',
        metaDescription:
          'How much does a bike inspection cost? What gets checked? Process, costs (€30–80), and checklist ✓ Tips from a bike shop in Freiburg.',
        excerpt:
          'A regular inspection keeps your bike safe and prevents expensive repairs. Learn what gets checked and what it costs.',
        tldr: 'A bike inspection costs €30–80 depending on scope. Brakes, gears, tires, chain, bearings, lights and spoke tension are checked. Recommended: once a year or every 2,000 km.',
        sections: [
          {
            type: 'heading',
            content: 'Why is a bike inspection important?',
          },
          {
            type: 'paragraph',
            content:
              'Wear on brakes, chain and tires happens gradually. Regular maintenance keeps you safe and prevents expensive follow-up damage. One inspection per year is enough for occasional riders — commuters should have one every 6 months.',
          },
          {
            type: 'heading',
            content: 'What gets checked during a bike inspection?',
          },
          {
            type: 'list',
            items: [
              'Brakes: Check and adjust brake pads, cables, and performance.',
              'Gears: Adjust cables, derailleur, and shifting.',
              'Tires: Check tread, condition, and pressure.',
              'Chain: Measure chain wear. Replace at 0.75% stretch.',
              'Bearings: Check headset, bottom bracket, and hubs for play.',
              'Lights: Front and rear lights, reflectors.',
              'Spokes: Check tension, true wheels.',
            ],
          },
          {
            type: 'tip',
            content:
              'Tip: Bring your bike for inspection in spring — before peak season. Workshops have shorter wait times and your bike is ready in time.',
          },
          {
            type: 'cta',
            content: 'Need an inspection? Visit Bike Haus Freiburg!',
            link: '/contact',
            linkText: 'Contact & Directions',
          },
        ],
      },
      fr: {
        title:
          "Révision vélo — Qu'est-ce qui est vérifié et combien ça coûte\u00a0?",
        metaTitle:
          'Révision vélo — Coûts, déroulement & checklist | Bike Haus Freiburg',
        metaDescription:
          'Combien coûte une révision vélo? Que vérifie-t-on? Déroulement, coûts (30–80 €) et checklist ✓ Conseils du vélociste à Freiburg.',
        excerpt:
          'Une révision régulière garde votre vélo en sécurité et évite les réparations coûteuses.',
        tldr: 'Une révision vélo coûte entre 30 et 80 €. Freins, vitesses, pneus, chaîne, roulements et éclairage sont vérifiés. Recommandé : 1× par an.',
        sections: [
          {
            type: 'heading',
            content: 'Pourquoi une révision vélo est-elle importante\u00a0?',
          },
          {
            type: 'paragraph',
            content:
              "L'usure des freins, de la chaîne et des pneus se fait progressivement. Un entretien régulier vous garde en sécurité et évite des dommages coûteux.",
          },
          {
            type: 'cta',
            content: "Besoin d'une révision? Passez chez Bike Haus Freiburg!",
            link: '/contact',
            linkText: 'Contact & Itinéraire',
          },
        ],
      },
      tr: {
        title: 'Bisiklet Bakımı — Neler Kontrol Edilir & Ne Kadara Mal Olur?',
        metaTitle:
          'Bisiklet Bakımı — Maliyet, Süreç & Kontrol Listesi | Bike Haus Freiburg',
        metaDescription:
          'Bisiklet bakımı ne kadara mal olur? Neler kontrol edilir? Süreç, maliyetler (30–80 €) ve kontrol listesi ✓ Freiburg bisikletçisinden ipuçları.',
        excerpt:
          'Düzenli bakım bisikletinizi güvende tutar ve pahalı tamirleri önler.',
        tldr: "Bisiklet bakımı 30–80 € arası. Frenler, vitesler, lastikler, zincir, rulmanlar ve ışıklar kontrol edilir. Önerilen: yılda 1 kez veya 2.000 km'de bir.",
        sections: [
          {
            type: 'heading',
            content: 'Bisiklet bakımı neden bu kadar önemli?',
          },
          {
            type: 'paragraph',
            content:
              'Fren, zincir ve lastiklerdeki aşınma yavaş yavaş gerçekleşir. Düzenli bakım güvenliğinizi sağlar ve pahalı hasarları önler.',
          },
          {
            type: 'cta',
            content: "Bakım zamanı mı? Bike Haus Freiburg'a gelin!",
            link: '/contact',
            linkText: 'İletişim & Yol Tarifi',
          },
        ],
      },
    },
  },

  // ─── Article 8: Fahrrad für Pendler — Die besten Stadträder ───
  {
    slug: 'fahrrad-pendler-stadtraeder',
    coverImage: 'assets/blog/fahrrad-pendler.jpg',
    date: '2026-04-12',
    readingTime: 7,
    category: 'ratgeber',
    tags: [
      'pendler',
      'stadtrad',
      'cityrad',
      'fahrrad arbeit',
      'pendlerrad freiburg',
    ],
    relatedSlugs: ['welches-fahrrad-passt-zu-mir', 'e-bike-gebraucht-kaufen'],
    translations: {
      de: {
        title: 'Fahrrad für Pendler — Die besten Stadträder 2026',
        metaTitle:
          'Pendlerfahrrad — Die besten Stadträder & Tipps | Bike Haus Freiburg',
        metaDescription:
          'Das beste Fahrrad für Pendler: Citybike, Trekkingrad oder E-Bike? Vergleich, Tipps & Empfehlungen 2026 ✓ Vom Fahrradladen in Freiburg.',
        excerpt:
          'Wer täglich mit dem Rad zur Arbeit fährt, braucht ein zuverlässiges, bequemes und wartungsarmes Fahrrad. Wir zeigen die besten Optionen.',
        tldr: 'Für Pendler empfehlen wir Citybikes (Kurzstrecke bis 5 km), Trekkingräder (5–15 km) oder E-Bikes (ab 10 km oder Steigungen). Wichtig: Nabenschaltung, Nabendynamo, Schutzbleche, Gepäckträger. Bei Bike Haus Freiburg finden Sie geprüfte Pendlerräder ab 199 €.',
        sections: [
          {
            type: 'heading',
            content: 'Welches Fahrrad eignet sich zum Pendeln?',
          },
          {
            type: 'paragraph',
            content:
              'Das ideale Pendlerfahrrad ist zuverlässig, bequem und wartungsarm. Je nach Strecke, Gelände und persönlichen Vorlieben kommen unterschiedliche Radtypen in Frage:',
          },
          {
            type: 'heading',
            content: 'Citybike — Für kurze Strecken (bis 5 km)',
          },
          {
            type: 'paragraph',
            content:
              'Citybikes sind kompakt, leicht und perfekt für die Stadt. Vorteile: aufrechte Sitzposition, Nabenschaltung (wartungsarm), oft mit Licht und Schutzblechen. Ideal für flache Strecken innerhalb der Stadt.',
          },
          {
            type: 'heading',
            content: 'Trekkingrad — Der Allrounder (5–15 km)',
          },
          {
            type: 'paragraph',
            content:
              'Das Trekkingrad ist der beliebteste Pendlertyp: stabil, komfortabel, schnell. Es kommt mit Schutzblechen, Gepäckträger, Lichtanlage und ist ideal für mittlere Distanzen — auch auf Schotter oder Waldwegen.',
          },
          {
            type: 'heading',
            content: 'E-Bike — Für lange Strecken & Steigungen',
          },
          {
            type: 'paragraph',
            content:
              'Ab 10 km Pendelstrecke oder bei Steigungen lohnt sich ein E-Bike. Sie kommen entspannt und ohne zu schwitzen an. In Freiburg besonders beliebt: E-Trekkingräder mit Bosch- oder Shimano-Motor.',
          },
          {
            type: 'heading',
            content: 'Checkliste: Das muss ein gutes Pendlerrad haben',
          },
          {
            type: 'list',
            items: [
              'Nabenschaltung: Weniger Verschleiß, schaltet auch im Stand.',
              'Nabendynamo + LED-Licht: Immer helles Licht, ohne Akku-Stress.',
              'Schutzbleche: Pflicht bei Regen und nassem Untergrund.',
              'Gepäckträger: Für Taschen, Korb oder Kindersitz.',
              'Pannensichere Reifen: Z.B. Schwalbe Marathon Plus — spart Nerven.',
              'Kettenschutz oder Riemenantrieb: Schützt die Kleidung.',
              'Guter Sattel: Auf langen Strecken entscheidend für Komfort.',
            ],
          },
          {
            type: 'tip',
            content:
              'Tipp für Freiburg: Die Stadt hat über 420 km Radwege. Mit einem guten Pendlerrad sind die meisten Arbeitswege unter 20 Minuten. Nutzen Sie auch den Fahrradparkplatz am Hauptbahnhof für Bahn+Rad-Kombis.',
          },
          {
            type: 'heading',
            content: 'Pendlerräder bei Bike Haus Freiburg',
          },
          {
            type: 'paragraph',
            content:
              'In unserem Showroom finden Sie eine große Auswahl an neuen und gebrauchten Trekkingrädern, Citybikes und E-Bikes. Jedes gebrauchte Rad wird geprüft und hat 3 Monate Garantie. Lassen Sie sich beraten — wir finden das perfekte Pendlerrad für Ihren Arbeitsweg.',
          },
          {
            type: 'cta',
            content: 'Pendlerräder im Showroom ansehen',
            link: '/showroom',
            linkText: 'Zum Showroom',
          },
        ],
      },
      en: {
        title: 'Bikes for Commuters — The Best City Bikes 2026',
        metaTitle:
          'Commuter Bike — Best City Bikes & Tips | Bike Haus Freiburg',
        metaDescription:
          'The best bike for commuters: City bike, trekking bike or e-bike? Comparison, tips & recommendations 2026 ✓ From a bike shop in Freiburg.',
        excerpt:
          'If you ride to work every day, you need a reliable, comfortable and low-maintenance bike. We show you the best options.',
        tldr: 'For commuters we recommend: City bikes (short distances up to 5 km), trekking bikes (5–15 km), or e-bikes (10+ km or hills). Key features: internal gears, hub dynamo, fenders, rack. Tested commuter bikes from €199 at Bike Haus Freiburg.',
        sections: [
          {
            type: 'heading',
            content: 'Which bike is best for commuting?',
          },
          {
            type: 'paragraph',
            content:
              'The ideal commuter bike is reliable, comfortable, and low-maintenance. Depending on distance, terrain, and personal preferences, different bike types come into question.',
          },
          {
            type: 'heading',
            content: 'City Bike — For short distances (up to 5 km)',
          },
          {
            type: 'paragraph',
            content:
              'City bikes are compact, light and perfect for urban riding. Benefits: upright position, internal gears (low maintenance), often with lights and fenders.',
          },
          {
            type: 'heading',
            content: 'Trekking Bike — The all-rounder (5–15 km)',
          },
          {
            type: 'paragraph',
            content:
              'The trekking bike is the most popular commuter type: stable, comfortable, fast. Comes with fenders, rack, lights — ideal for medium distances.',
          },
          {
            type: 'heading',
            content: 'E-Bike — For long distances & hills',
          },
          {
            type: 'paragraph',
            content:
              'From 10 km commute distance or with hills, an e-bike is worth it. You arrive relaxed and without sweating.',
          },
          {
            type: 'cta',
            content: 'Browse commuter bikes in our showroom',
            link: '/showroom',
            linkText: 'To Showroom',
          },
        ],
      },
      fr: {
        title: 'Vélo pour pendulaires — Les meilleurs vélos de ville 2026',
        metaTitle:
          'Vélo pendulaire — Meilleurs vélos de ville & conseils | Bike Haus Freiburg',
        metaDescription:
          'Le meilleur vélo pour pendulaires: vélo de ville, VTC ou VAE? Comparaison, conseils & recommandations 2026 ✓ Du vélociste à Freiburg.',
        excerpt:
          "Si vous pédalez au travail tous les jours, vous avez besoin d'un vélo fiable, confortable et facile à entretenir.",
        tldr: "Pour les pendulaires: vélos de ville (jusqu'à 5 km), VTC (5–15 km) ou VAE (10+ km ou côtes). Important: moyeu à vitesses intégrées, dynamo moyeu, garde-boue, porte-bagages. Vélos testés à partir de 199 € chez Bike Haus Freiburg.",
        sections: [
          {
            type: 'heading',
            content: 'Quel vélo pour aller au travail?',
          },
          {
            type: 'paragraph',
            content:
              "Le vélo pendulaire idéal est fiable, confortable et nécessite peu d'entretien. Selon la distance et le terrain, différents types de vélos conviennent.",
          },
          {
            type: 'cta',
            content: 'Voir les vélos pendulaires dans notre showroom',
            link: '/showroom',
            linkText: 'Vers le Showroom',
          },
        ],
      },
      tr: {
        title: 'İşe Gidiş İçin Bisiklet — 2026 En İyi Şehir Bisikletleri',
        metaTitle:
          'İşe Gidiş Bisikleti — En İyi Şehir Bisikletleri & İpuçları | Bike Haus Freiburg',
        metaDescription:
          'İşe gitmek için en iyi bisiklet: Şehir bisikleti, trekking bisikleti veya e-bisiklet? Karşılaştırma, ipuçları & 2026 önerileri ✓ Freiburg bisikletçisinden.',
        excerpt:
          'Her gün bisikletle işe gidiyorsanız, güvenilir, rahat ve bakımı kolay bir bisiklete ihtiyacınız var.',
        tldr: "İşe gidişte önerilerimiz: Şehir bisikletleri (5 km'ye kadar), trekking bisikletleri (5–15 km) veya e-bisikletler (10+ km veya yokuşlar). Önemli: iç vites, jant dinamo, çamurluk, bagaj. Bike Haus Freiburg'da 199 €'dan itibaren test edilmiş bisikletler.",
        sections: [
          {
            type: 'heading',
            content: 'Hangi bisiklet işe gitmek için en uygun?',
          },
          {
            type: 'paragraph',
            content:
              'İdeal işe gidiş bisikleti güvenilir, rahat ve bakımı kolaydır. Mesafeye, araziye ve kişisel tercihlere göre farklı bisiklet türleri uygundur.',
          },
          {
            type: 'cta',
            content: "Showroom'daki işe gidiş bisikletlerini görüntüle",
            link: '/showroom',
            linkText: "Showroom'a Git",
          },
        ],
      },
    },
  },
];
