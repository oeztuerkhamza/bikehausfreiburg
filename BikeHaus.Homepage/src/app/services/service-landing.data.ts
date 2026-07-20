import { Language } from './translation.service';

/**
 * Content for the bike-SERVICE landing page (`/:lang/service`,
 * EN: `/en/bike-service`, FR: `/fr/entretien-velo`).
 *
 * IMPORTANT wording rule: this is positioned as **Service / Wartung /
 * Inspektion / Einstellung / Pflege / Check** — NOT "Reparatur" or
 * "Werkstatt". The shop owner has no Handwerks-Ausbildung, so we
 * deliberately avoid terms that imply a regulated repair craft.
 */

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceTranslation {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSub: string;
  badges: string[];
  introHeading: string;
  introText: string;
  servicesHeading: string;
  services: string[];
  processHeading: string;
  processSteps: string[];
  faqHeading: string;
  faq: ServiceFaq[];
  ctaHeading: string;
  ctaText: string;
}

export type ServiceTranslationMap = Record<
  'de' | 'en' | 'fr' | 'tr',
  ServiceTranslation
> &
  Partial<Record<Language, ServiceTranslation>>;

export const SERVICE_CONTENT: ServiceTranslationMap = {
  de: {
    metaTitle:
      'Fahrrad Service Freiburg — Inspektion, Wartung & Pflege | Bike Haus Freiburg',
    metaDescription:
      'Fahrrad Service in Freiburg ✓ Inspektion, Wartung, Bremsen & Schaltung einstellen, Reifenwechsel. Heckerstraße 27, Freiburg. Ohne Termin vorbeikommen.',
    heroTitle: 'Fahrrad Service in Freiburg',
    heroSub:
      'Inspektion, Wartung und Pflege für Fahrrad — bei Bike Haus Freiburg in der Heckerstraße 27.',
    badges: ['🔧 Inspektion & Wartung', '⚡ Fahrrad Check', '🕒 Ohne Termin'],
    introHeading: 'Service für Ihr Fahrrad',
    introText:
      'Damit Ihr Fahrrad sicher und zuverlässig läuft, bieten wir bei Bike Haus Freiburg einen umfassenden Fahrrad-Service: Wir prüfen, warten, stellen ein und pflegen Ihr Rad. Ob City-Bike, Trekkingrad, Mountainbike — bringen Sie Ihr Fahrrad einfach in der Heckerstraße 27 vorbei. Sie erhalten vorab eine transparente Einschätzung von Umfang und Kosten.',
    servicesHeading: 'Unsere Service-Leistungen',
    services: [
      'Inspektion & Sicherheits-Check (Bremsen, Licht, Reifen, Rahmen)',
      'Bremsen prüfen und einstellen',
      'Schaltung prüfen und einstellen',
      'Reifen und Schläuche wechseln, Luftdruck prüfen',
      'Kette, Antrieb & bewegliche Teile reinigen und ölen',
      'Licht prüfen',
      'Fahrrad-Aufbereitung & Reinigung vor dem Verkauf',
    ],
    processHeading: 'So läuft der Service ab',
    processSteps: [
      'Vorbeikommen — bringen Sie Ihr Fahrrad in die Heckerstraße 27, ganz ohne Termin.',
      'Check & Einschätzung — wir schauen uns Ihr Rad an und besprechen den Service-Umfang.',
      'Transparenter Preis — Sie erfahren vorab, was gemacht wird und was es kostet.',
      'Abholen — Ihr Fahrrad ist eingestellt, gewartet und einsatzbereit.',
    ],
    faqHeading: 'Häufige Fragen zum Fahrrad-Service',
    faq: [
      {
        q: 'Brauche ich einen Termin für den Service?',
        a: 'Nein. Sie können während der Öffnungszeiten einfach mit Ihrem Fahrrad in der Heckerstraße 27 in Freiburg vorbeikommen. Bei größerem Umfang vereinbaren wir gemeinsam einen Abholtermin.',
      },
      {
        q: 'Was kostet ein Fahrrad-Service?',
        a: 'Das hängt vom Umfang ab — Sie erhalten vorab immer eine transparente Einschätzung. Richtwerte: Basis-Check (Bremsen, Schaltung, Reifen) ca. 20–30 €, Standard-Inspektion ca. 40–60 €, große Inspektion ca. 60–180€',
      },
      {
        q: 'Wie lange dauert der Service?',
        a: 'Kleinere Einstellungen erledigen wir oft direkt vor Ort. Für umfangreichere Wartung vereinbaren wir einen Abholtag.',
      },
      {
        q: 'Wo finde ich euch?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Beratung auf Deutsch, Englisch, Französisch und Türkisch.',
      },
    ],
    ctaHeading: 'Fahrrad-Service in Freiburg gefällig?',
    ctaText:
      'Kommen Sie ohne Termin vorbei oder schreiben Sie uns per WhatsApp — wir kümmern uns um Ihr Fahrrad.',
  },

  en: {
    metaTitle:
      'Bike Service Freiburg — Inspection, Maintenance & Tune-Up | Bike Haus Freiburg',
    metaDescription:
      'Bike service in Freiburg ✓ Inspection, maintenance, brake & gear adjustment, tyre changes. Heckerstraße 27, Freiburg. Walk in, no appointment needed.',
    heroTitle: 'Bike Service in Freiburg',
    heroSub:
      'Inspection, maintenance and care for your bike — at Bike Haus Freiburg, Heckerstraße 27.',
    badges: ['🔧 Inspection & tune-up', '🕒 No appointment'],
    introHeading: 'Service for your bike',
    introText:
      'To keep your bike safe and reliable, Bike Haus Freiburg offers a complete bike service: we check, maintain, adjust and care for your bike. City bike, trekking bike, mountain bike — just bring it to Heckerstraße 27. You always get a transparent estimate of scope and cost beforehand.',
    servicesHeading: 'Our service offering',
    services: [
      'Inspection & safety check (brakes, lights, tyres, frame)',
      'Brake check and adjustment',
      'Gear check and adjustment',
      'Tyre and tube changes, pressure check',
      'Chain, drivetrain & moving parts cleaned and oiled',
      'Lights & electrics check',
      'Bike preparation & cleaning before sale',
    ],
    processHeading: 'How the service works',
    processSteps: [
      'Drop by — bring your bike to Heckerstraße 27, no appointment needed.',
      'Check & estimate — we look at your bike and discuss the scope of service.',
      'Transparent price — you know in advance what will be done and what it costs.',
      'Pick up — your bike is adjusted, serviced and ready to ride.',
    ],
    faqHeading: 'Frequently asked questions about bike service',
    faq: [
      {
        q: 'Do I need an appointment for the service?',
        a: 'No. During opening hours you can simply walk in with your bike at Heckerstraße 27 in Freiburg. For larger jobs we agree on a pick-up day together.',
      },
      {
        q: 'How long does the service take?',
        a: 'Smaller adjustments are often done on the spot. For more extensive maintenance we agree on a pick-up day.',
      },
      {
        q: 'Where can I find you?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Advice in German, English, and Turkish.',
      },
    ],
    ctaHeading: 'Need a bike service in Freiburg?',
    ctaText:
      'Drop by without an appointment or message us on WhatsApp — we will take care of your bike.',
  },

  fr: {
    metaTitle:
      'Entretien vélo Fribourg — Révision, maintenance & réglage | Bike Haus Freiburg',
    metaDescription:
      'Entretien vélo à Fribourg ✓ Révision, maintenance, réglage freins & vitesses, changement de pneus, contrôle. Heckerstraße 27, Fribourg. Sans rendez-vous.',
    heroTitle: 'Entretien vélo à Fribourg',
    heroSub:
      'Révision, maintenance et entretien de votre vélo — chez Bike Haus Freiburg, Heckerstraße 27.',
    badges: ['🔧 Révision & réglage', '🕒 Sans rendez-vous'],
    introHeading: 'Service pour votre vélo',
    introText:
      'Pour que votre vélo reste sûr et fiable, Bike Haus Freiburg propose un service vélo complet : nous contrôlons, entretenons, réglons et soignons votre vélo. Vélo de ville, vélo de trekking, VTT — apportez-le simplement à la Heckerstraße 27. Vous recevez toujours au préalable une estimation transparente de l’étendue et du coût.',
    servicesHeading: 'Nos prestations de service',
    services: [
      'Révision & contrôle de sécurité (freins, éclairage, pneus, cadre)',
      'Contrôle et réglage des freins',
      'Contrôle et réglage des vitesses',
      'Changement de pneus et chambres à air, contrôle de la pression',
      'Chaîne, transmission & pièces mobiles nettoyées et huilées',
      'Contrôle de l’éclairage & de l’électrique',
      'Préparation & nettoyage du vélo avant la vente',
    ],
    processHeading: 'Comment se déroule le service',
    processSteps: [
      'Passez nous voir — apportez votre vélo à la Heckerstraße 27, sans rendez-vous.',
      'Contrôle & estimation — nous examinons votre vélo et discutons de l’étendue du service.',
      'Prix transparent — vous savez à l’avance ce qui sera fait et ce que cela coûte.',
      'Récupération — votre vélo est réglé, entretenu et prêt à rouler.',
    ],
    faqHeading: 'Questions fréquentes sur l’entretien vélo',
    faq: [
      {
        q: 'Ai-je besoin d’un rendez-vous pour le service ?',
        a: 'Non. Pendant les heures d’ouverture, vous pouvez simplement venir avec votre vélo à la Heckerstraße 27 à Fribourg. Pour les travaux plus importants, nous convenons ensemble d’un jour de récupération.',
      },
      {
        q: 'Combien coûte un entretien vélo ?',
        a: 'Cela dépend de l’étendue — vous recevez toujours au préalable une estimation transparente. Indications : contrôle de base (freins, vitesses, pneus, éclairage) env. 20–30 €, inspection standard env. 40–60 €, grande inspection env. 60–180 €.',
      },
      {
        q: 'Combien de temps dure le service ?',
        a: 'Les petits réglages sont souvent faits sur place. Pour une maintenance plus complète, nous convenons d’un jour de récupération.',
      },
      {
        q: 'Où vous trouver ?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Conseil en allemand, anglais, français et turc.',
      },
    ],
    ctaHeading: 'Besoin d’un entretien vélo à Fribourg ?',
    ctaText:
      'Passez sans rendez-vous ou écrivez-nous sur WhatsApp — nous nous occupons de votre vélo.',
  },

  tr: {
    metaTitle:
      'Bisiklet Servisi Freiburg — Bakım, Kontrol & Ayar | Bike Haus Freiburg',
    metaDescription:
      'Freiburg’da bisiklet servisi ✓ Bakım, kontrol, fren & vites ayarı, lastik değişimi. Heckerstraße 27, Freiburg. Randevusuz gelin.',
    heroTitle: 'Freiburg’da Bisiklet Servisi',
    heroSub:
      'Bisikletiniz için bakım, kontrol ve ayar — Bike Haus Freiburg, Heckerstraße 27.',
    badges: ['🔧 Bakım & ayar', '🕒 Randevusuz'],
    introHeading: 'Bisikletiniz için servis',
    introText:
      'Bisikletinizin güvenli ve sorunsuz çalışması için Bike Haus Freiburg kapsamlı bir bisiklet servisi sunar: kontrol eder, bakımını yapar, ayarlar ve bakımını üstleniriz. Şehir bisikleti, trekking, dağ bisikleti — bisikletinizi Heckerstraße 27’ye getirmeniz yeterli. Kapsam ve ücret konusunda önceden şeffaf bir bilgi alırsınız.',
    servicesHeading: 'Servis hizmetlerimiz',
    services: [
      'Kontrol & güvenlik bakımı (fren, ışık, lastik, kadro)',
      'Fren kontrolü ve ayarı',
      'Vites kontrolü ve ayarı',
      'Lastik ve iç lastik değişimi, basınç kontrolü',
      'Zincir, aktarma & hareketli parçaların temizliği ve yağlanması',
      'Işık & elektrik kontrolü',
      'Satış öncesi bisiklet hazırlığı & temizliği',
    ],
    processHeading: 'Servis nasıl işliyor',
    processSteps: [
      'Uğrayın — bisikletinizi randevusuz Heckerstraße 27’ye getirin.',
      'Kontrol & değerlendirme — bisikletinize bakar, servis kapsamını konuşuruz.',
      'Şeffaf fiyat — ne yapılacağını ve ne kadar olacağını önceden bilirsiniz.',
      'Teslim alın — bisikletiniz ayarlanmış, bakımı yapılmış ve hazır.',
    ],
    faqHeading: 'Bisiklet servisi hakkında sık sorulan sorular',
    faq: [
      {
        q: 'Servis için randevu gerekiyor mu?',
        a: 'Hayır. Açılış saatleri içinde bisikletinizle Freiburg, Heckerstraße 27’ye uğrayabilirsiniz. Kapsamlı işlerde birlikte bir teslim günü belirleriz.',
      },
      {
        q: 'Bisiklet servisi ne kadar tutar?',
        a: 'Kapsama bağlıdır — başlamadan önce her zaman şeffaf bir bilgi alırsınız. Yaklaşık değerler: temel kontrol (fren, vites, lastik, ışık) yaklaşık 20–30 €, standart kontrol yaklaşık 40–60 €, büyük kontrol yaklaşık 60–180 €.',
      },
      {
        q: 'Servis ne kadar sürer?',
        a: 'Küçük ayarları çoğunlukla anında yaparız. Kapsamlı bakım için bir teslim günü belirleriz.',
      },
      {
        q: 'Sizi nerede bulabilirim?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Almanca, İngilizce, Fransızca ve Türkçe hizmet.',
      },
    ],
    ctaHeading: 'Freiburg’da bisiklet servisi mi lazım?',
    ctaText:
      'Randevusuz uğrayın ya da WhatsApp’tan yazın — bisikletinizle biz ilgilenelim.',
  },
};
