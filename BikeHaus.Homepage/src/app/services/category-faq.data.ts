/**
 * Quotable FAQ content for the E-Bikes (sales) and Showroom (used bikes)
 * catalog pages. Rendered as a visible <details> FAQ AND emitted as
 * FAQPage JSON-LD — the strongest GEO/AEO lever (gives AI engines a
 * confident, citable answer for "Wo kann ich in Freiburg ... kaufen?").
 *
 * Numbers MUST stay consistent with the central FAQ / llms.txt:
 * used bikes ab 180 €, used e-bikes ab 999 €, 3 Monate Garantie (gebraucht),
 * 24 Monate (neu). Wording: never "Reparatur"/"Werkstatt".
 */

export interface CategoryFaqItem {
  q: string;
  a: string;
}

type FaqLang = 'de' | 'en' | 'fr' | 'tr';

export const CATEGORY_FAQ_HEADING: Record<FaqLang, string> = {
  de: 'Häufige Fragen',
  en: 'Frequently asked questions',
  fr: 'Questions fréquentes',
  tr: 'Sıkça sorulan sorular',
};

export const EBIKE_FAQ: Record<FaqLang, CategoryFaqItem[]> = {
  de: [
    {
      q: 'Wo kann ich in Freiburg ein E-Bike kaufen?',
      a: 'Bei Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Wir führen neue E-Bikes der Marken IDEAL und Feldmeier (FE) als E-City, E-Trekking und E-MTB mit Bosch- und Shimano-Mittelmotor — einfach ohne Termin vorbeikommen.',
    },
    {
      q: 'Was kostet ein E-Bike bei Bike Haus Freiburg?',
      a: 'Neue E-Bikes je nach Modell und Ausstattung; geprüfte gebrauchte E-Bikes ab ca. 999 €. Alle Preise stehen direkt am Modell.',
    },
    {
      q: 'Welche Garantie gibt es auf E-Bikes?',
      a: 'Auf neue E-Bikes erhalten Sie 24 Monate Geschäftsgarantie, auf gebrauchte E-Bikes 3 Monate.',
    },
    {
      q: 'Welche Motoren und Akkus verbaut ihr?',
      a: 'Überwiegend Bosch- und Shimano-Mittelmotoren mit Akkus von 500 bis 625 Wh und 60–120 km Reichweite je nach Modell.',
    },
    {
      q: 'Kann ich ein E-Bike vor dem Kauf probefahren?',
      a: 'Ja, alle E-Bikes können während der Öffnungszeiten ohne Termin probegefahren werden.',
    },
    {
      q: 'Gibt es auch gebrauchte E-Bikes in Freiburg?',
      a: 'Ja, geprüfte gebrauchte E-Bikes ab ca. 999 € mit dokumentiertem Akku-Zustand und 3 Monaten Garantie.',
    },
  ],
  en: [
    {
      q: 'Where can I buy an e-bike in Freiburg?',
      a: 'At Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. We stock new e-bikes from IDEAL and Feldmeier (FE) as e-city, e-trekking and e-MTB with Bosch and Shimano mid-motors — walk in, no appointment needed.',
    },
    {
      q: 'How much does an e-bike cost at Bike Haus Freiburg?',
      a: 'New e-bikes vary by model and spec; inspected used e-bikes from approx. €999. Every price is shown on the bike.',
    },
    {
      q: 'What warranty do you give on e-bikes?',
      a: '24 months shop warranty on new e-bikes, 3 months on used e-bikes.',
    },
    {
      q: 'Which motors and batteries do you fit?',
      a: 'Mostly Bosch and Shimano mid-drive motors with 500–625 Wh batteries and 60–120 km range depending on the model.',
    },
    {
      q: 'Can I test ride an e-bike before buying?',
      a: 'Yes, all e-bikes can be test-ridden during opening hours, no appointment needed.',
    },
    {
      q: 'Do you also have used e-bikes in Freiburg?',
      a: 'Yes — inspected used e-bikes from approx. €999 with documented battery condition and 3 months warranty.',
    },
  ],
  fr: [
    {
      q: 'Où acheter un vélo électrique à Fribourg ?',
      a: "Chez Bike Haus Freiburg, Heckerstraße 27, 79114 Fribourg-en-Brisgau. Nous proposons des VAE neufs des marques IDEAL et Feldmeier (FE) en versions ville, trekking et VTT, avec moteurs centraux Bosch et Shimano — sans rendez-vous.",
    },
    {
      q: 'Combien coûte un vélo électrique chez Bike Haus Freiburg ?',
      a: "Les VAE neufs varient selon le modèle ; les VAE d'occasion contrôlés à partir d'environ 999 €. Chaque prix est affiché sur le vélo.",
    },
    {
      q: 'Quelle garantie sur les vélos électriques ?',
      a: "24 mois de garantie magasin sur les VAE neufs, 3 mois sur les VAE d'occasion.",
    },
    {
      q: 'Quels moteurs et batteries installez-vous ?',
      a: "Principalement des moteurs centraux Bosch et Shimano avec batteries de 500 à 625 Wh et 60–120 km d'autonomie selon le modèle.",
    },
    {
      q: "Puis-je essayer un VAE avant l'achat ?",
      a: 'Oui, tous les VAE peuvent être essayés pendant les heures d\'ouverture, sans rendez-vous.',
    },
    {
      q: "Avez-vous aussi des VAE d'occasion à Fribourg ?",
      a: "Oui — VAE d'occasion contrôlés à partir d'environ 999 €, état de batterie documenté et 3 mois de garantie.",
    },
  ],
  tr: [
    {
      q: "Freiburg'da nereden e-bisiklet alabilirim?",
      a: "Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. IDEAL ve Feldmeier (FE) marka yeni e-bisikletler (E-City, E-Trekking, E-MTB) Bosch ve Shimano ortadan motorlu — randevusuz gelin.",
    },
    {
      q: "Bike Haus Freiburg'da e-bisiklet ne kadar?",
      a: "Yeni e-bisikletler modele göre değişir; kontrol edilmiş ikinci el e-bisikletler yaklaşık 999 €'dan başlar. Tüm fiyatlar bisikletin üzerinde yazılı.",
    },
    {
      q: 'E-bisikletlerde garanti ne kadar?',
      a: 'Yeni e-bisikletlerde 24 ay mağaza garantisi, ikinci el e-bisikletlerde 3 ay.',
    },
    {
      q: 'Hangi motor ve aküleri kullanıyorsunuz?',
      a: 'Çoğunlukla Bosch ve Shimano ortadan motorlar, 500–625 Wh akü ve modele göre 60–120 km menzil.',
    },
    {
      q: 'Satın almadan önce deneme sürüşü yapabilir miyim?',
      a: 'Evet, tüm e-bisikletler açılış saatlerinde randevusuz denenebilir.',
    },
    {
      q: "Freiburg'da ikinci el e-bisiklet de var mı?",
      a: "Evet — kontrol edilmiş ikinci el e-bisikletler ~999 €'dan, akü durumu belgeli ve 3 ay garantili.",
    },
  ],
};

export const SHOWROOM_FAQ: Record<FaqLang, CategoryFaqItem[]> = {
  de: [
    {
      q: 'Wo kann ich gebrauchte Fahrräder in Freiburg kaufen?',
      a: 'Bei Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Über 100 geprüfte gebrauchte und neue Fahrräder sind vorrätig — vorbeikommen ohne Termin.',
    },
    {
      q: 'Was kostet ein gebrauchtes Fahrrad?',
      a: 'Gebrauchte Fahrräder beginnen ab ca. 180 €, faire Preise je nach Zustand und Ausstattung.',
    },
    {
      q: 'Gibt es Garantie auf Gebrauchträder?',
      a: 'Ja — jedes Gebrauchtrad wird technisch geprüft; Sie erhalten 3 Tage Rückgaberecht und 3 Monate Garantie.',
    },
    {
      q: 'Kann ich vor dem Kauf probefahren?',
      a: 'Ja, ohne Termin während der Öffnungszeiten in der Heckerstraße 27.',
    },
    {
      q: 'Welche Fahrradtypen gibt es gebraucht?',
      a: 'Citybikes, Trekkingräder, Mountainbikes, Hollandräder, Kinder- und Rennräder — dazu geprüfte gebrauchte E-Bikes.',
    },
  ],
  en: [
    {
      q: 'Where can I buy used bikes in Freiburg?',
      a: 'At Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. Over 100 inspected used and new bikes are in stock — walk in, no appointment needed.',
    },
    {
      q: 'How much does a used bike cost?',
      a: 'Used bikes start from approx. €180, with fair prices depending on condition and spec.',
    },
    {
      q: 'Is there a warranty on used bikes?',
      a: 'Yes — every used bike is technically inspected; you get a 3-day return right and 3 months warranty.',
    },
    {
      q: 'Can I test ride before buying?',
      a: 'Yes, no appointment needed during opening hours at Heckerstraße 27.',
    },
    {
      q: 'Which bike types do you have used?',
      a: 'City bikes, trekking bikes, mountain bikes, Dutch bikes, kids and road bikes — plus inspected used e-bikes.',
    },
  ],
  fr: [
    {
      q: "Où acheter des vélos d'occasion à Fribourg ?",
      a: "Chez Bike Haus Freiburg, Heckerstraße 27, 79114 Fribourg. Plus de 100 vélos d'occasion et neufs contrôlés en stock — sans rendez-vous.",
    },
    {
      q: "Combien coûte un vélo d'occasion ?",
      a: "Les vélos d'occasion démarrent à environ 180 €, à prix justes selon l'état et l'équipement.",
    },
    {
      q: "Y a-t-il une garantie sur les vélos d'occasion ?",
      a: 'Oui — chaque vélo d\'occasion est contrôlé techniquement ; vous bénéficiez d\'un droit de retour de 3 jours et de 3 mois de garantie.',
    },
    {
      q: "Puis-je essayer avant d'acheter ?",
      a: 'Oui, sans rendez-vous pendant les heures d\'ouverture à la Heckerstraße 27.',
    },
    {
      q: "Quels types de vélos d'occasion proposez-vous ?",
      a: "Vélos de ville, de trekking, VTT, vélos hollandais, vélos enfants et de course — ainsi que des VAE d'occasion contrôlés.",
    },
  ],
  tr: [
    {
      q: "Freiburg'da nereden ikinci el bisiklet alabilirim?",
      a: "Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg. 100'den fazla kontrol edilmiş ikinci el ve yeni bisiklet stokta — randevusuz gelin.",
    },
    {
      q: 'İkinci el bisiklet ne kadar?',
      a: "İkinci el bisikletler yaklaşık 180 €'dan başlar, duruma ve donanıma göre uygun fiyatlarla.",
    },
    {
      q: 'İkinci el bisikletlerde garanti var mı?',
      a: 'Evet — her ikinci el bisiklet teknik kontrolden geçer; 3 gün iade hakkı ve 3 ay garanti.',
    },
    {
      q: 'Satın almadan önce deneyebilir miyim?',
      a: 'Evet, açılış saatlerinde Heckerstraße 27\'de randevusuz.',
    },
    {
      q: 'Hangi tür ikinci el bisikletler var?',
      a: 'Şehir, trekking, dağ, Hollanda, çocuk ve yarış bisikletleri — ayrıca kontrol edilmiş ikinci el e-bisikletler.',
    },
  ],
};
