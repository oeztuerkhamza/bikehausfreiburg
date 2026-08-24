export type RentalCategoryId = 'ebike' | 'trekking' | 'kinder';

export interface RentalCategoryFaqItem {
  q: string;
  a: string;
}

export interface RentalCategoryFeature {
  title: string;
  text: string;
}

export interface RentalCategoryContent {
  metaTitle: string;
  metaDescription: string;
  breadcrumbLabel: string;
  heroTitle: string;
  heroSub: string;
  heroBadges: string[];
  introHeading: string;
  introText: string[];
  featuresHeading: string;
  features: RentalCategoryFeature[];
  whyHeading: string;
  whyItems: string[];
  pricingHeading: string;
  pricingText: string;
  pricingItems: string[];
  faqHeading: string;
  faq: RentalCategoryFaqItem[];
  ctaHeading: string;
  ctaText: string;
  ctaButton: string;
  secondaryCtaButton: string;
}

export interface RentalCategory {
  id: RentalCategoryId;
  slugs: Record<'de' | 'en' | 'fr', string>;
  translations: Record<'de' | 'en' | 'fr', RentalCategoryContent>;
}

export const RENTAL_CATEGORIES: RentalCategory[] = [
  {
    id: 'ebike',
    slugs: {
      de: 'e-bike-mieten-freiburg',
      en: 'rent-e-bike-freiburg',
      fr: 'louer-velo-electrique-fribourg',
    },
    translations: {
      de: {
        metaTitle: 'E-Bike mieten Freiburg | Pedelec-Verleih ab 19 €/Tag',
        metaDescription:
          'E-Bike mieten in Freiburg ✓ Pedelecs mit 80+ km Reichweite ✓ Bosch & Shimano Motoren ✓ Helm & Schloss inklusive ✓ Sofort verfügbar bei Bike Haus Freiburg.',
        breadcrumbLabel: 'E-Bike mieten',
        heroTitle: 'E-Bike mieten in Freiburg',
        heroSub:
          'Entdecke Freiburg, das Dreisamtal und den Schwarzwald ohne Schweiß. Pedelecs mit kraftvollen Bosch- oder Shimano-Motoren, langer Akkulaufzeit und voller Garantie – direkt bei uns abholen.',
        heroBadges: [
          '🔋 80+ km Reichweite',
          '⚡ Bosch & Shimano',
          '🪖 Helm & Schloss inkl.',
        ],
        introHeading: 'Dein Pedelec für Freiburg und den Schwarzwald',
        introText: [
          'Mit einem gemieteten E-Bike erlebst du Freiburg und Umgebung auf eine völlig neue Weise. Egal ob du den Kandelberg erklimmen, eine entspannte Tour durchs Dreisamtal machen oder einfach bequem zur Arbeit pendeln willst – unsere Pedelecs übernehmen die schweren Anstiege für dich.',
          'Bike Haus Freiburg verleiht ausschließlich gepflegte, regelmäßig gewartete E-Bikes namhafter Marken. Jedes Rad ist vor der Übergabe komplett durchgecheckt: Bremsen, Schaltung, Beleuchtung und Akku-Zustand. So bist du sicher unterwegs – auch auf längeren Touren in den Schwarzwald.',
        ],
        featuresHeading: 'Was unsere E-Bikes auszeichnet',
        features: [
          {
            title: 'Starke Mittelmotoren',
            text: 'Bosch Performance Line oder Shimano Steps – kraftvoll an Steigungen, leise auf der Straße.',
          },
          {
            title: 'Lange Reichweite',
            text: 'Akkus mit 500–625 Wh schaffen 60 bis 120 km je nach Gelände und Unterstützungsstufe.',
          },
          {
            title: 'Hochwertige Komponenten',
            text: 'Hydraulische Scheibenbremsen, präzise Schaltung und stabile Rahmen für jede Tour.',
          },
          {
            title: 'Volle Ausstattung',
            text: 'Licht, Schutzbleche, Gepäckträger und Ständer – alles dabei, was du brauchst.',
          },
        ],
        whyHeading: 'Warum E-Bike bei Bike Haus mieten?',
        whyItems: [
          'Fachgerechte Einweisung in Motor, Akku und Bedienung',
          'Helm in deiner Größe und sicheres Schloss inklusive',
          'Pannensets und Ersatzakku-Option auf Anfrage',
          'Flexible Mietzeiten – Stunden, Tage oder ganze Wochen',
          'Faire Preise: ab 19 € pro Tag, je länger desto günstiger',
          'Persönliche Beratung zu den schönsten E-Bike-Routen rund um Freiburg',
        ],
        pricingHeading: 'Preise E-Bike-Verleih',
        pricingText:
          'Individuelle Tagespreise je Modell. Helm und Schloss sind immer inklusive – keine versteckten Kosten.',
        pricingItems: [
          '1 Tag: ab 19 €',
          '3 Tage: ab 45 € (15 €/Tag)',
          '7 Tage: ab 100 € (≈ 14 €/Tag)',
          'Ab 8. Tag: nur 15 €/Tag',
        ],
        faqHeading: 'Häufige Fragen zum E-Bike-Verleih',
        faq: [
          {
            q: 'Brauche ich einen Führerschein für ein Miet-E-Bike?',
            a: 'Nein. Unsere Pedelecs unterstützen bis 25 km/h und sind führerscheinfrei – ab 14 Jahren erlaubt, ein Helm wird empfohlen und ist bei uns inklusive.',
          },
          {
            q: 'Wie weit komme ich mit einer Akkuladung?',
            a: 'Je nach Modell, Gewicht und Unterstützungsstufe zwischen 60 und 120 Kilometern. Für längere Touren empfehlen wir ein Ersatzakku oder eine Routenplanung mit Ladestopp.',
          },
          {
            q: 'Was kostet ein E-Bike pro Tag?',
            a: 'Die Tagespreise beginnen bei 19 €. Ab dem 8. Tag zahlst du nur noch 15 € pro Tag – ideal für längere Aufenthalte.',
          },
          {
            q: 'Welche Rahmengrößen habt ihr verfügbar?',
            a: 'Wir bieten Rahmen in S, M, L und XL für Körpergrößen von ca. 155 bis 195 cm. Eine Probefahrt vor Ort ist immer möglich.',
          },
          {
            q: 'Kann ich das E-Bike auch am Wochenende abholen?',
            a: 'Ja, Samstag von 11:00 bis 17:00 Uhr. Sonntag ist geschlossen; für Feiertage und Sondertermine vereinbare bitte vorher per WhatsApp einen Termin.',
          },
        ],
        ctaHeading: 'Bereit für deine E-Bike-Tour?',
        ctaText:
          'Wähle dein Wunschmodell und Datum auf der Hauptseite oder schreib uns kurz per WhatsApp – wir reservieren dein E-Bike für dich.',
        ctaButton: 'E-Bike jetzt reservieren',
        secondaryCtaButton: 'Alle Mietfahrräder ansehen',
      },
      en: {
        metaTitle: 'Rent an E-Bike in Freiburg | Pedelec Rental from €19/day',
        metaDescription:
          'Rent an e-bike in Freiburg ✓ Pedelecs with 80+ km range ✓ Bosch & Shimano motors ✓ Helmet & lock included ✓ Same-day pickup at Bike Haus Freiburg.',
        breadcrumbLabel: 'Rent an E-Bike',
        heroTitle: 'Rent an E-Bike in Freiburg',
        heroSub:
          'Discover Freiburg, the Dreisam Valley and the Black Forest without breaking a sweat. Pedelecs with powerful Bosch or Shimano motors, long battery life and full warranty — pick up directly from us.',
        heroBadges: [
          '🔋 80+ km range',
          '⚡ Bosch & Shimano',
          '🪖 Helmet & lock incl.',
        ],
        introHeading: 'Your pedelec for Freiburg and the Black Forest',
        introText: [
          'A rental e-bike lets you experience Freiburg and its surroundings in a whole new way. Whether you want to climb the Kandel, take a relaxed ride through the Dreisam Valley or simply commute comfortably to work — our pedelecs take the steep climbs out of your day.',
          'Bike Haus Freiburg only rents out well-maintained, regularly serviced e-bikes from leading brands. Every bike is fully checked before handover: brakes, gears, lights and battery health. So you can ride safely — even on longer Black Forest tours.',
        ],
        featuresHeading: 'What makes our e-bikes special',
        features: [
          {
            title: 'Powerful mid-drives',
            text: 'Bosch Performance Line or Shimano Steps — strong on climbs, quiet on the road.',
          },
          {
            title: 'Long range',
            text: 'Batteries between 500 and 625 Wh deliver 60 to 120 km depending on terrain and assist level.',
          },
          {
            title: 'Premium components',
            text: 'Hydraulic disc brakes, precise shifting and stable frames built for every tour.',
          },
          {
            title: 'Fully equipped',
            text: 'Lights, mudguards, rear rack and kickstand — everything you need is included.',
          },
        ],
        whyHeading: 'Why rent your e-bike at Bike Haus?',
        whyItems: [
          'Personal briefing on motor, battery and controls',
          'Helmet in your size and a secure lock — always included',
          'Puncture kits and spare-battery option on request',
          'Flexible rental periods — hours, days or full weeks',
          'Fair prices: from €19 per day, cheaper the longer you stay',
          'Personal advice on the best e-bike routes around Freiburg',
        ],
        pricingHeading: 'E-bike rental prices',
        pricingText:
          'Daily prices vary by model. Helmet and lock are always included — no hidden fees.',
        pricingItems: [
          '1 day: from €19',
          '3 days: from €45 (€15/day)',
          '7 days: from €100 (≈ €14/day)',
          'From day 8: only €15/day',
        ],
        faqHeading: 'FAQ about e-bike rental',
        faq: [
          {
            q: 'Do I need a licence to rent an e-bike?',
            a: 'No. Our pedelecs are speed-limited to 25 km/h and require no licence — allowed from age 14, a helmet is recommended and always included.',
          },
          {
            q: 'How far can I ride on a single charge?',
            a: 'Depending on the model, weight and assist level, between 60 and 120 km. For longer tours we recommend a spare battery or planning a charging stop.',
          },
          {
            q: 'How much does an e-bike cost per day?',
            a: 'Daily prices start at €19. From day 8 onwards you only pay €15 per day — ideal for longer stays.',
          },
          {
            q: 'What frame sizes do you have?',
            a: 'We offer S, M, L and XL frames for riders between approximately 155 and 195 cm. A test ride at the shop is always possible.',
          },
          {
            q: 'Can I pick up the e-bike on weekends?',
            a: 'Yes, Saturdays from 11:00 to 17:00. For Sunday/holiday pickups please arrange via WhatsApp in advance.',
          },
        ],
        ctaHeading: 'Ready for your e-bike tour?',
        ctaText:
          'Pick your model and dates on the main page or message us on WhatsApp — we will reserve your e-bike for you.',
        ctaButton: 'Reserve your e-bike',
        secondaryCtaButton: 'View all rental bikes',
      },
      fr: {
        metaTitle: 'Louer un vélo électrique Fribourg | VAE dès 19 €/jour',
        metaDescription:
          "Louer un vélo électrique à Fribourg ✓ VAE avec 80+ km d'autonomie ✓ Moteurs Bosch & Shimano ✓ Casque & antivol inclus ✓ Disponible le jour même chez Bike Haus.",
        breadcrumbLabel: 'Louer un vélo électrique',
        heroTitle: 'Louer un vélo électrique à Fribourg',
        heroSub:
          'Découvrez Fribourg, la vallée de la Dreisam et la Forêt-Noire sans transpirer. VAE équipés de moteurs Bosch ou Shimano puissants, longue autonomie et garantie complète — à retirer directement chez nous.',
        heroBadges: [
          "🔋 80+ km d'autonomie",
          '⚡ Bosch & Shimano',
          '🪖 Casque & antivol inclus',
        ],
        introHeading: 'Votre VAE pour Fribourg et la Forêt-Noire',
        introText: [
          'Avec un vélo électrique en location, vous découvrez Fribourg et ses environs sous un nouveau jour. Que vous souhaitiez monter au Kandel, faire une sortie tranquille dans la vallée de la Dreisam ou simplement aller au travail confortablement — nos VAE effacent les côtes les plus dures.',
          'Bike Haus Freiburg ne loue que des vélos électriques entretenus régulièrement, de marques reconnues. Chaque vélo est entièrement vérifié avant la remise : freins, transmission, éclairage et état de la batterie. Vous roulez en toute sécurité, même lors de longues sorties en Forêt-Noire.',
        ],
        featuresHeading: 'Ce qui distingue nos VAE',
        features: [
          {
            title: 'Moteurs centraux puissants',
            text: 'Bosch Performance Line ou Shimano Steps — puissants en côte, silencieux sur la route.',
          },
          {
            title: 'Grande autonomie',
            text: "Batteries de 500 à 625 Wh : 60 à 120 km selon le terrain et le niveau d'assistance.",
          },
          {
            title: 'Composants haut de gamme',
            text: 'Freins à disque hydrauliques, transmission précise et cadres stables, conçus pour toutes les sorties.',
          },
          {
            title: 'Entièrement équipé',
            text: 'Éclairage, garde-boue, porte-bagages et béquille — tout y est.',
          },
        ],
        whyHeading: 'Pourquoi louer votre VAE chez Bike Haus ?',
        whyItems: [
          'Briefing personnalisé sur le moteur, la batterie et les commandes',
          'Casque à votre taille et antivol sécurisé — toujours inclus',
          'Kit anti-crevaison et option batterie de rechange sur demande',
          'Durées flexibles — heures, jours ou semaines entières',
          'Tarifs équitables : dès 19 € par jour, dégressifs sur la durée',
          'Conseils personnalisés sur les meilleurs itinéraires VAE autour de Fribourg',
        ],
        pricingHeading: 'Tarifs de location VAE',
        pricingText:
          'Prix journaliers variables selon le modèle. Casque et antivol toujours inclus — pas de frais cachés.',
        pricingItems: [
          '1 jour : dès 19 €',
          '3 jours : dès 45 € (15 €/jour)',
          '7 jours : dès 100 € (≈ 14 €/jour)',
          'À partir du 8e jour : seulement 15 €/jour',
        ],
        faqHeading: 'Questions fréquentes – location VAE',
        faq: [
          {
            q: 'Faut-il un permis pour louer un VAE ?',
            a: 'Non. Nos VAE sont bridés à 25 km/h et ne nécessitent pas de permis — autorisés dès 14 ans, casque recommandé et toujours inclus.',
          },
          {
            q: 'Quelle autonomie sur une charge ?',
            a: "Selon le modèle, le poids et le niveau d'assistance, entre 60 et 120 km. Pour les longues sorties, nous recommandons une batterie de rechange ou un arrêt de recharge prévu.",
          },
          {
            q: 'Combien coûte un VAE par jour ?',
            a: 'Les tarifs journaliers démarrent à 19 €. À partir du 8e jour, vous ne payez plus que 15 € par jour — idéal pour les longs séjours.',
          },
          {
            q: 'Quelles tailles de cadre proposez-vous ?',
            a: 'Nous proposons des cadres S, M, L et XL pour des personnes mesurant environ 155 à 195 cm. Un essai en magasin est toujours possible.',
          },
          {
            q: 'Puis-je récupérer le VAE le week-end ?',
            a: 'Oui, le samedi de 11h30 à 17h00. Pour les retraits le dimanche ou jours fériés, contactez-nous au préalable sur WhatsApp.',
          },
        ],
        ctaHeading: 'Prêt pour votre sortie en VAE ?',
        ctaText:
          'Choisissez votre modèle et vos dates sur la page principale ou écrivez-nous sur WhatsApp — nous réservons votre VAE.',
        ctaButton: 'Réserver mon VAE',
        secondaryCtaButton: 'Voir tous les vélos de location',
      },
    },
  },
  {
    id: 'trekking',
    slugs: {
      de: 'trekkingrad-mieten-freiburg',
      en: 'rent-trekking-bike-freiburg',
      fr: 'louer-velo-trekking-fribourg',
    },
    translations: {
      de: {
        metaTitle: 'Trekkingrad mieten Freiburg | Tourenrad ab 15 €/Tag',
        metaDescription:
          'Trekkingrad mieten in Freiburg ✓ Komfortable Tourenräder für Schwarzwald & Dreisamtal ✓ Gepäckträger, Licht & Schloss inklusive ✓ Bei Bike Haus reservieren.',
        breadcrumbLabel: 'Trekkingrad mieten',
        heroTitle: 'Trekkingrad mieten in Freiburg',
        heroSub:
          'Das ideale Rad für mehrtägige Touren, Pendelstrecken und Ausflüge in den Schwarzwald. Bequeme Sitzposition, robuste Komponenten und vollständige Reiseausstattung – direkt bei Bike Haus Freiburg.',
        heroBadges: [
          '🎒 Gepäckträger inkl.',
          '💡 Licht & Reflektoren',
          '🪖 Helm & Schloss inkl.',
        ],
        introHeading: 'Dein Begleiter für Schwarzwald und Dreisamtal',
        introText: [
          'Trekkingräder verbinden Komfort, Robustheit und Ausstattung – perfekt für längere Touren, mehrtägige Reisen und tägliches Pendeln in Freiburg. Egal ob du das Münstertal erkunden, am Dreisamradweg entlang radeln oder zur Universität fahren möchtest: unsere Trekkingräder bieten dir die richtige Mischung aus Effizienz und Bequemlichkeit.',
          'Alle Räder kommen mit Gepäckträger, hellem LED-Licht, Schutzblechen und Ständer. Bei Bike Haus Freiburg findest du klassische Damen- und Herrenrahmen in allen gängigen Größen, mit feiner Kettenschaltung oder wartungsarmer Nabenschaltung.',
        ],
        featuresHeading: 'Was unsere Trekkingräder ausmacht',
        features: [
          {
            title: 'Aufrechte Sitzposition',
            text: 'Komfortabler Lenker und ergonomische Sättel – auch auf langen Strecken bequem.',
          },
          {
            title: 'Komplette Tourenausstattung',
            text: 'Gepäckträger, Schutzbleche, LED-Licht, Reflektoren und Ständer serienmäßig.',
          },
          {
            title: 'Robuste Komponenten',
            text: '24- oder 27-Gang-Schaltung, hydraulische oder mechanische Felgenbremsen, pannensichere Reifen.',
          },
          {
            title: 'Größen für alle',
            text: 'Damen- und Herrenrahmen in S, M, L und XL – auch Mixte-Modelle für leichteres Aufsteigen.',
          },
        ],
        whyHeading: 'Warum Trekkingrad bei Bike Haus mieten?',
        whyItems: [
          'Tagesgenaue Preise – auch nur für einen Tag mietbar',
          'Helm in deiner Größe und stabiles Schloss inklusive',
          'Karten-Tipps zu Schwarzwald-, Kaiserstuhl- und Dreisam-Touren',
          'Pannenset auf Anfrage',
          'Familienrabatte für 2+ Räder',
          'Direkt am Stadtrand – ideal für die ersten Schwarzwald-Kilometer',
        ],
        pricingHeading: 'Preise Trekkingrad-Verleih',
        pricingText:
          'Individuelle Tagespreise je Modell. Helm und Schloss sind immer inklusive – Mehrtagesrabatte automatisch.',
        pricingItems: [
          '1 Tag: ab 15 €',
          '3 Tage: ab 40 € (≈ 13 €/Tag)',
          '7 Tage: ab 80 € (≈ 11 €/Tag)',
          'Ab 8. Tag: nur 10 €/Tag',
        ],
        faqHeading: 'Häufige Fragen zum Trekkingrad-Verleih',
        faq: [
          {
            q: 'Eignet sich ein Trekkingrad für den Schwarzwald?',
            a: 'Ja, für moderate Anstiege und Schotterwege ideal. Für steile Berge wie den Schauinsland empfehlen wir eher ein E-Bike.',
          },
          {
            q: 'Kann ich Gepäck transportieren?',
            a: 'Alle unsere Trekkingräder haben einen stabilen Gepäckträger. Fahrradtaschen können wir auf Anfrage gegen Aufpreis mitvermieten.',
          },
          {
            q: 'Was kostet ein Trekkingrad pro Tag?',
            a: 'Die Preise beginnen bei 15 € pro Tag. Bei längerer Miete sinkt der Tagessatz, ab dem 8. Tag zahlst du nur 10 €.',
          },
          {
            q: 'Welche Rahmengrößen habt ihr?',
            a: 'Wir führen S (155–168 cm), M (168–178 cm), L (178–188 cm) und XL (188–195 cm) – sowohl Damen- als auch Herrenrahmen.',
          },
          {
            q: 'Kann ich mehrere Räder gleichzeitig mieten?',
            a: 'Ja, für Familien und Gruppen kein Problem. Schreib uns vorher per WhatsApp, damit wir Verfügbarkeit und passende Größen prüfen.',
          },
        ],
        ctaHeading: 'Bereit für deine Trekking-Tour?',
        ctaText:
          'Reserviere dein Wunschmodell direkt online oder schreib uns auf WhatsApp – wir halten dein Rad für dich bereit.',
        ctaButton: 'Trekkingrad jetzt reservieren',
        secondaryCtaButton: 'Alle Mietfahrräder ansehen',
      },
      en: {
        metaTitle:
          'Rent a Trekking Bike in Freiburg | Touring Bike from €15/day',
        metaDescription:
          'Rent a trekking bike in Freiburg ✓ Comfortable touring bikes for the Black Forest & Dreisam Valley ✓ Rack, lights & lock included ✓ Reserve at Bike Haus.',
        breadcrumbLabel: 'Rent a Trekking Bike',
        heroTitle: 'Rent a Trekking Bike in Freiburg',
        heroSub:
          'The ideal bike for multi-day tours, commuting and Black Forest excursions. Comfortable riding position, robust components and full touring equipment — directly from Bike Haus Freiburg.',
        heroBadges: [
          '🎒 Rack included',
          '💡 Lights & reflectors',
          '🪖 Helmet & lock incl.',
        ],
        introHeading: 'Your companion for the Black Forest and Dreisam Valley',
        introText: [
          'Trekking bikes combine comfort, durability and equipment — perfect for longer tours, multi-day trips and daily commuting in Freiburg. Whether you want to explore Münstertal, ride along the Dreisam cycle path or get to university, our trekking bikes offer the right mix of efficiency and comfort.',
          "Every bike comes with rear rack, bright LED lights, mudguards and kickstand. At Bike Haus Freiburg you will find classic men's and women's frames in all common sizes, with either fine derailleur or low-maintenance hub gears.",
        ],
        featuresHeading: 'What makes our trekking bikes special',
        features: [
          {
            title: 'Upright riding position',
            text: 'Comfortable handlebars and ergonomic saddles — comfortable even on long rides.',
          },
          {
            title: 'Full touring equipment',
            text: 'Rear rack, mudguards, LED lights, reflectors and kickstand as standard.',
          },
          {
            title: 'Robust components',
            text: '24 or 27-gear shifting, hydraulic or mechanical rim brakes, puncture-resistant tyres.',
          },
          {
            title: 'Sizes for everyone',
            text: "Men's and women's frames in S, M, L and XL — also mixte models for easier mounting.",
          },
        ],
        whyHeading: 'Why rent your trekking bike at Bike Haus?',
        whyItems: [
          'Daily pricing — even one-day rentals possible',
          'Helmet in your size and sturdy lock included',
          'Map tips for Black Forest, Kaiserstuhl and Dreisam routes',
          'Puncture kit or roadside repair service on request',
          'Family discounts for 2+ bikes',
          'Located at the edge of town — perfect for the first Black Forest kilometres',
        ],
        pricingHeading: 'Trekking bike rental prices',
        pricingText:
          'Daily prices vary by model. Helmet and lock are always included — multi-day discounts apply automatically.',
        pricingItems: [
          '1 day: from €15',
          '3 days: from €40 (≈ €13/day)',
          '7 days: from €80 (≈ €11/day)',
          'From day 8: only €10/day',
        ],
        faqHeading: 'FAQ about trekking bike rental',
        faq: [
          {
            q: 'Is a trekking bike suitable for the Black Forest?',
            a: 'Yes, ideal for moderate climbs and gravel paths. For steep mountains like the Schauinsland we recommend an e-bike instead.',
          },
          {
            q: 'Can I carry luggage?',
            a: 'All our trekking bikes come with a sturdy rear rack. Panniers can be added on request for a small extra fee.',
          },
          {
            q: 'How much does a trekking bike cost per day?',
            a: 'Prices start from €15 per day. The daily rate drops with longer rentals — from day 8 onwards you pay only €10.',
          },
          {
            q: 'What frame sizes do you offer?',
            a: "We stock S (155–168 cm), M (168–178 cm), L (178–188 cm) and XL (188–195 cm) — in both men's and women's frames.",
          },
          {
            q: 'Can I rent multiple bikes at once?',
            a: 'Yes, no problem for families and groups. Message us on WhatsApp first so we can confirm availability and matching sizes.',
          },
        ],
        ctaHeading: 'Ready for your trekking tour?',
        ctaText:
          'Reserve your preferred model online or message us on WhatsApp — we will hold your bike for you.',
        ctaButton: 'Reserve a trekking bike',
        secondaryCtaButton: 'View all rental bikes',
      },
      fr: {
        metaTitle:
          'Louer un vélo de trekking Fribourg | Vélo touring dès 15 €/jour',
        metaDescription:
          'Louer un vélo de trekking à Fribourg ✓ Vélos confortables pour la Forêt-Noire & la vallée de la Dreisam ✓ Porte-bagages, éclairage & antivol inclus ✓ Bike Haus.',
        breadcrumbLabel: 'Louer un vélo de trekking',
        heroTitle: 'Louer un vélo de trekking à Fribourg',
        heroSub:
          'Le vélo idéal pour les sorties de plusieurs jours, les trajets domicile-travail et les escapades en Forêt-Noire. Position confortable, composants robustes et équipement complet — chez Bike Haus Freiburg.',
        heroBadges: [
          '🎒 Porte-bagages inclus',
          '💡 Éclairage & réflecteurs',
          '🪖 Casque & antivol inclus',
        ],
        introHeading: 'Votre compagnon pour la Forêt-Noire et la Dreisam',
        introText: [
          "Les vélos de trekking allient confort, robustesse et équipement — parfaits pour les longues sorties, les voyages de plusieurs jours et les trajets quotidiens à Fribourg. Que vous souhaitiez explorer le Münstertal, longer la piste cyclable de la Dreisam ou rejoindre l'université, nos vélos offrent le bon équilibre entre efficacité et confort.",
          'Chaque vélo est livré avec porte-bagages arrière, éclairage LED puissant, garde-boue et béquille. Chez Bike Haus Freiburg vous trouverez des cadres homme et femme classiques dans toutes les tailles courantes, avec dérailleur précis ou moyeu à vitesses intégrées.',
        ],
        featuresHeading: 'Ce qui distingue nos vélos de trekking',
        features: [
          {
            title: 'Position de conduite droite',
            text: 'Cintre confortable et selle ergonomique — agréable même sur de longues distances.',
          },
          {
            title: 'Équipement de voyage complet',
            text: 'Porte-bagages, garde-boue, éclairage LED, réflecteurs et béquille de série.',
          },
          {
            title: 'Composants robustes',
            text: 'Transmission 24 ou 27 vitesses, freins hydrauliques ou mécaniques, pneus résistants aux crevaisons.',
          },
          {
            title: 'Tailles pour tous',
            text: 'Cadres homme et femme en S, M, L et XL — modèles mixte également pour un enjambement facile.',
          },
        ],
        whyHeading: 'Pourquoi louer votre vélo de trekking chez Bike Haus ?',
        whyItems: [
          'Tarification journalière — location à la journée possible',
          'Casque à votre taille et antivol robuste inclus',
          "Conseils d'itinéraires Forêt-Noire, Kaiserstuhl et Dreisam",
          'Kit anti-crevaison ou dépannage sur demande',
          'Tarifs famille pour 2 vélos ou plus',
          'Situé en lisière de ville — parfait pour les premiers kilomètres en Forêt-Noire',
        ],
        pricingHeading: 'Tarifs location vélo de trekking',
        pricingText:
          'Prix journaliers selon le modèle. Casque et antivol toujours inclus — remises plusieurs jours automatiques.',
        pricingItems: [
          '1 jour : dès 15 €',
          '3 jours : dès 40 € (≈ 13 €/jour)',
          '7 jours : dès 80 € (≈ 11 €/jour)',
          'À partir du 8e jour : seulement 10 €/jour',
        ],
        faqHeading: 'Questions fréquentes – location vélo de trekking',
        faq: [
          {
            q: 'Un vélo de trekking convient-il à la Forêt-Noire ?',
            a: 'Oui, idéal pour les montées modérées et les chemins gravillonnés. Pour les montagnes raides comme le Schauinsland, nous recommandons plutôt un VAE.',
          },
          {
            q: 'Puis-je transporter des bagages ?',
            a: "Tous nos vélos de trekking sont équipés d'un porte-bagages robuste. Des sacoches peuvent être ajoutées sur demande moyennant un petit supplément.",
          },
          {
            q: 'Combien coûte un vélo de trekking par jour ?',
            a: 'Les tarifs démarrent à 15 € par jour. Plus la durée est longue, plus le tarif baisse — dès le 8e jour, seulement 10 €.',
          },
          {
            q: 'Quelles tailles de cadre proposez-vous ?',
            a: 'Nous proposons S (155–168 cm), M (168–178 cm), L (178–188 cm) et XL (188–195 cm) — cadres homme et femme.',
          },
          {
            q: 'Puis-je louer plusieurs vélos en même temps ?',
            a: "Oui, sans souci pour les familles et les groupes. Écrivez-nous d'abord sur WhatsApp pour confirmer la disponibilité et les tailles.",
          },
        ],
        ctaHeading: 'Prêt pour votre sortie trekking ?',
        ctaText:
          'Réservez votre modèle en ligne ou écrivez-nous sur WhatsApp — nous gardons votre vélo prêt pour vous.',
        ctaButton: 'Réserver un vélo de trekking',
        secondaryCtaButton: 'Voir tous les vélos de location',
      },
    },
  },
  {
    id: 'kinder',
    slugs: {
      de: 'kinderfahrrad-mieten-freiburg',
      en: 'rent-kids-bike-freiburg',
      fr: 'louer-velo-enfant-fribourg',
    },
    translations: {
      de: {
        metaTitle: 'Kinderfahrrad mieten Freiburg | Familienverleih ab 10 €/Tag',
        metaDescription:
          'Kinderfahrrad mieten in Freiburg ✓ Sichere Räder von 16" bis 26" ✓ Helm in Kindergrößen inklusive ✓ Familienrabatte ✓ Bike Haus Freiburg in Heckerstraße.',
        breadcrumbLabel: 'Kinderfahrrad mieten',
        heroTitle: 'Kinderfahrrad mieten in Freiburg',
        heroSub:
          'Sichere, geprüfte Kinderräder von 16" bis 26" für jedes Alter. Helm in Kindergrößen inklusive, familienfreundliche Preise und Beratung von erfahrenen Eltern – bei Bike Haus Freiburg.',
        heroBadges: [
          '👶 16" bis 26"',
          '🪖 Kinderhelm inkl.',
          '👨‍👩‍👧 Familienrabatt',
        ],
        introHeading: 'Sichere Räder für kleine und große Kinder',
        introText: [
          'Eltern wissen: ein Kinderfahrrad nur für einen Familienurlaub zu kaufen ist teuer und unpraktisch. Mit unserem Kinder-Verleih in Freiburg mietest du genau das richtige Rad für die richtige Größe – ohne Investition, ohne Lagerung zu Hause.',
          'Wir führen Kinderräder von 16" (ab ca. 4 Jahre) bis 26" (Jugendräder). Alle Räder sind technisch geprüft, mit funktionierenden Bremsen, sicherem Lenker und passendem Sattel. Auch Lichter und Reflektoren sind serienmäßig – damit dein Kind auch im Stadtverkehr sicher unterwegs ist.',
        ],
        featuresHeading: 'Was unsere Kinderräder bieten',
        features: [
          {
            title: 'Größen 16" bis 26"',
            text: 'Vom Anfängerrad bis zum Jugendrad – passend für Kinder ab ca. 4 Jahren bis Teenager.',
          },
          {
            title: 'Sicherheitsausstattung',
            text: 'Funktionierende Bremsen (Rücktritt oder V-Brake), helle Reflektoren, Klingel und Licht.',
          },
          {
            title: 'Kinderhelm inklusive',
            text: 'Helme in Größen XS bis M, anpassbar und mit Sicherheitsverschluss.',
          },
          {
            title: 'Robust und gepflegt',
            text: 'Jedes Rad wird vor jeder Vermietung komplett durchgecheckt.',
          },
        ],
        whyHeading: 'Warum Kinderfahrrad bei Bike Haus mieten?',
        whyItems: [
          'Faire Tagespreise ab 10 € – günstiger als ein Neukauf für den Urlaub',
          'Helm in Kindergrößen kostenlos dabei',
          'Familienrabatt bei 2 oder mehr Rädern (Erwachsene + Kinder)',
          'Beratung zu passender Rahmengröße – wir messen dein Kind direkt im Laden',
          'Empfehlungen für kinderfreundliche Routen rund um Freiburg',
          'Stützräder und Kinderanhänger auf Anfrage verfügbar',
        ],
        pricingHeading: 'Preise Kinderfahrrad-Verleih',
        pricingText:
          'Familienfreundliche Tagespreise. Helm in Kindergröße immer inklusive – Familienrabatt bei mehreren Rädern.',
        pricingItems: [
          '1 Tag: ab 10 €',
          '3 Tage: ab 24 € (8 €/Tag)',
          '7 Tage: ab 56 € (8 €/Tag)',
          'Ab 8. Tag: nur 8 €/Tag',
        ],
        faqHeading: 'Häufige Fragen zum Kinderfahrrad-Verleih',
        faq: [
          {
            q: 'Ab welchem Alter habt ihr Kinderräder?',
            a: 'Wir haben Räder ab 16" (ca. 4–6 Jahre, 100–115 cm Körpergröße) bis 26" Jugendräder. Komm gerne vorbei, wir messen dein Kind direkt aus.',
          },
          {
            q: 'Ist ein Kinderhelm inklusive?',
            a: 'Ja, immer. Wir haben Kinderhelme in den Größen XS bis M, alle mit weichem Innenfutter und Sicherheitsverschluss.',
          },
          {
            q: 'Habt ihr Stützräder oder Anhänger?',
            a: 'Stützräder können auf Wunsch montiert werden. Kinderanhänger und Trail-Gator (Anhänger-Stange) sind auf Anfrage gegen Aufpreis verfügbar.',
          },
          {
            q: 'Gibt es einen Familienrabatt?',
            a: 'Ja. Bei 2 oder mehr Rädern (Mix aus Erwachsenen und Kindern) gewähren wir je nach Mietdauer einen Rabatt – frag uns einfach vor der Reservierung.',
          },
          {
            q: 'Welche Routen eignen sich für Kinder rund um Freiburg?',
            a: 'Wir empfehlen den Dreisamradweg, die Strecke nach Kirchzarten oder den Mooswald. Alles flach und gut beschildert. Detaillierte Tipps geben wir gerne bei der Übergabe.',
          },
        ],
        ctaHeading: 'Bereit für die Familien-Tour?',
        ctaText:
          'Reserviere die Räder online oder schreib uns auf WhatsApp – wir empfehlen die passende Größe und halten alles für euch bereit.',
        ctaButton: 'Familienräder reservieren',
        secondaryCtaButton: 'Alle Mietfahrräder ansehen',
      },
      en: {
        metaTitle: 'Rent Kids Bikes in Freiburg | Family Rental from €10/day',
        metaDescription:
          'Rent kids bikes in Freiburg ✓ Safe bikes from 16" to 26" ✓ Kids helmet included ✓ Family discounts ✓ Bike Haus Freiburg on Heckerstraße.',
        breadcrumbLabel: 'Rent a Kids Bike',
        heroTitle: 'Rent a Kids Bike in Freiburg',
        heroSub:
          'Safe, inspected kids bikes from 16" to 26" for every age. Children\'s helmets included, family-friendly prices and advice from experienced parents — at Bike Haus Freiburg.',
        heroBadges: [
          '👶 16" to 26"',
          '🪖 Kids helmet incl.',
          '👨‍👩‍👧 Family discount',
        ],
        introHeading: 'Safe bikes for small and bigger kids',
        introText: [
          "Parents know it: buying a kids' bike just for a family holiday is expensive and impractical. With our kids' rental in Freiburg you get exactly the right bike in the right size — no investment, no storage at home afterwards.",
          'We stock kids\' bikes from 16" (from approx. age 4) up to 26" (junior bikes). Every bike is technically checked, with working brakes, safe handlebars and a fitting saddle. Lights and reflectors are also standard — so your child is safe even in city traffic.',
        ],
        featuresHeading: 'What our kids bikes offer',
        features: [
          {
            title: 'Sizes 16" to 26"',
            text: 'From beginner bikes to junior bikes — fitting children from approx. age 4 to teenagers.',
          },
          {
            title: 'Safety equipment',
            text: 'Working brakes (coaster or V-brake), bright reflectors, bell and lights.',
          },
          {
            title: 'Kids helmet included',
            text: 'Helmets in sizes XS to M, adjustable and with safety closure.',
          },
          {
            title: 'Robust and well-maintained',
            text: 'Every bike is fully checked before each rental.',
          },
        ],
        whyHeading: 'Why rent kids bikes at Bike Haus?',
        whyItems: [
          'Fair daily prices from €10 — cheaper than buying for a holiday',
          'Kids helmet included for free',
          'Family discount for 2 or more bikes (adult + kids combo)',
          'Sizing advice — we measure your child directly in the shop',
          'Recommendations for kid-friendly routes around Freiburg',
          'Training wheels and child trailers available on request',
        ],
        pricingHeading: 'Kids bike rental prices',
        pricingText:
          'Family-friendly daily prices. Kids helmet always included — family discount for multiple bikes.',
        pricingItems: [
          '1 day: from €10',
          '3 days: from €24 (€8/day)',
          '7 days: from €56 (€8/day)',
          'From day 8: only €8/day',
        ],
        faqHeading: 'FAQ about kids bike rental',
        faq: [
          {
            q: 'From what age do you have kids bikes?',
            a: 'We have bikes from 16" (around age 4–6, height 100–115 cm) up to 26" junior bikes. Drop by — we will measure your child for the right fit.',
          },
          {
            q: 'Is a kids helmet included?',
            a: "Yes, always. We have children's helmets in sizes XS to M, all with soft padding and safety closure.",
          },
          {
            q: 'Do you have training wheels or trailers?',
            a: 'Training wheels can be fitted on request. Child trailers and trail-gator (tow bar) are available on request for a small extra fee.',
          },
          {
            q: 'Is there a family discount?',
            a: 'Yes. For 2 or more bikes (adult + kids combo) we offer a discount depending on rental duration — just ask before reserving.',
          },
          {
            q: 'Which routes are suitable for kids around Freiburg?',
            a: 'We recommend the Dreisam cycle path, the route to Kirchzarten or Mooswald. All flat and well-signposted. We are happy to share detailed tips at handover.',
          },
        ],
        ctaHeading: 'Ready for the family tour?',
        ctaText:
          'Reserve the bikes online or message us on WhatsApp — we will recommend the right size and have everything ready for you.',
        ctaButton: 'Reserve family bikes',
        secondaryCtaButton: 'View all rental bikes',
      },
      fr: {
        metaTitle:
          'Louer un vélo enfant Fribourg | Location famille dès 10 €/jour',
        metaDescription:
          'Louer un vélo enfant à Fribourg ✓ Vélos sécurisés de 16" à 26" ✓ Casque enfant inclus ✓ Tarifs famille ✓ Bike Haus Freiburg, Heckerstraße.',
        breadcrumbLabel: 'Louer un vélo enfant',
        heroTitle: 'Louer un vélo enfant à Fribourg',
        heroSub:
          'Vélos enfants sécurisés et vérifiés de 16" à 26" pour tous les âges. Casque enfant inclus, tarifs famille et conseils de parents expérimentés — chez Bike Haus Freiburg.',
        heroBadges: [
          '👶 16" à 26"',
          '🪖 Casque enfant inclus',
          '👨‍👩‍👧 Tarif famille',
        ],
        introHeading: 'Vélos sécurisés pour petits et grands enfants',
        introText: [
          "Les parents le savent : acheter un vélo d'enfant juste pour des vacances en famille coûte cher et n'est pas pratique. Avec notre location enfants à Fribourg, vous obtenez exactement le bon vélo à la bonne taille — sans investissement et sans stockage à la maison.",
          'Nous proposons des vélos enfants de 16" (à partir d\'environ 4 ans) jusqu\'à 26" (vélos juniors). Chaque vélo est techniquement vérifié, avec freins en état, guidon sécurisé et selle adaptée. Éclairage et réflecteurs sont également de série — pour que votre enfant roule en sécurité même en ville.',
        ],
        featuresHeading: 'Ce que proposent nos vélos enfants',
        features: [
          {
            title: 'Tailles 16" à 26"',
            text: "Du vélo débutant au vélo junior — adapté aux enfants d'environ 4 ans aux adolescents.",
          },
          {
            title: 'Équipement de sécurité',
            text: 'Freins fonctionnels (rétropédalage ou V-brake), réflecteurs lumineux, sonnette et éclairage.',
          },
          {
            title: 'Casque enfant inclus',
            text: 'Casques en tailles XS à M, ajustables et avec fermeture de sécurité.',
          },
          {
            title: 'Robustes et entretenus',
            text: 'Chaque vélo est entièrement vérifié avant chaque location.',
          },
        ],
        whyHeading: 'Pourquoi louer un vélo enfant chez Bike Haus ?',
        whyItems: [
          "Tarifs journaliers équitables dès 10 € — moins cher qu'un achat pour les vacances",
          'Casque enfant inclus gratuitement',
          'Tarif famille pour 2 vélos ou plus (adulte + enfant)',
          'Conseils de taille — nous mesurons votre enfant directement au magasin',
          "Recommandations d'itinéraires adaptés aux enfants autour de Fribourg",
          'Roulettes et remorques enfant disponibles sur demande',
        ],
        pricingHeading: 'Tarifs location vélo enfant',
        pricingText:
          'Tarifs journaliers familiaux. Casque enfant toujours inclus — tarif famille pour plusieurs vélos.',
        pricingItems: [
          '1 jour : dès 10 €',
          '3 jours : dès 24 € (8 €/jour)',
          '7 jours : dès 56 € (8 €/jour)',
          'À partir du 8e jour : seulement 8 €/jour',
        ],
        faqHeading: 'Questions fréquentes – location vélo enfant',
        faq: [
          {
            q: 'À partir de quel âge avez-vous des vélos enfants ?',
            a: 'Nous avons des vélos à partir de 16" (environ 4–6 ans, taille 100–115 cm) jusqu\'à des vélos juniors 26". Passez nous voir, nous mesurons votre enfant pour la bonne taille.',
          },
          {
            q: 'Un casque enfant est-il inclus ?',
            a: 'Oui, toujours. Nous avons des casques enfants en tailles XS à M, tous avec rembourrage doux et fermeture de sécurité.',
          },
          {
            q: 'Avez-vous des roulettes ou des remorques ?',
            a: 'Des roulettes peuvent être montées sur demande. Remorques enfant et trail-gator (barre de traction) disponibles sur demande contre un petit supplément.',
          },
          {
            q: 'Y a-t-il un tarif famille ?',
            a: 'Oui. Pour 2 vélos ou plus (combinaison adulte + enfant), nous appliquons une remise selon la durée — demandez-nous avant la réservation.',
          },
          {
            q: 'Quels itinéraires conviennent aux enfants autour de Fribourg ?',
            a: 'Nous recommandons la piste cyclable de la Dreisam, la route vers Kirchzarten ou le Mooswald. Tout est plat et bien balisé. Nous donnons des conseils détaillés à la remise.',
          },
        ],
        ctaHeading: 'Prêt pour la sortie en famille ?',
        ctaText:
          'Réservez les vélos en ligne ou écrivez-nous sur WhatsApp — nous vous recommandons la bonne taille et tenons tout prêt pour vous.',
        ctaButton: 'Réserver les vélos famille',
        secondaryCtaButton: 'Voir tous les vélos de location',
      },
    },
  },
];

export function findCategoryBySlug(
  slug: string,
): { category: RentalCategory; lang: 'de' | 'en' | 'fr' } | null {
  for (const category of RENTAL_CATEGORIES) {
    for (const lang of ['de', 'en', 'fr'] as const) {
      if (category.slugs[lang] === slug) {
        return { category, lang };
      }
    }
  }
  return null;
}

export function getCategoryById(
  id: RentalCategoryId,
): RentalCategory | undefined {
  return RENTAL_CATEGORIES.find((c) => c.id === id);
}
