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
      'Fahrrad & E-Bike Service Freiburg — Inspektion, Wartung & Pflege | Bike Haus Freiburg',
    metaDescription:
      'Fahrrad Service in Freiburg ✓ Inspektion, Wartung, Bremsen & Schaltung einstellen, Reifenwechsel. Heckerstraße 27, Freiburg. Ohne Termin vorbeikommen.',
    heroTitle: 'Fahrrad Service in Freiburg',
    heroSub:
      'Inspektion, Wartung und Pflege für Fahrrad und E-Bike — bei Bike Haus Freiburg in der Heckerstraße 27.',
    badges: ['🔧 Inspektion & Wartung', '⚡ Fahrrad Check', '🕒 Ohne Termin'],
    introHeading: 'Service für Ihr Fahrrad',
    introText:
      'Damit Ihr Fahrrad sicher und zuverlässig läuft, bieten wir bei Bike Haus Freiburg einen umfassenden Fahrrad-Service: Wir prüfen, warten, stellen ein und pflegen Ihr Rad. Ob City-Bike, Trekkingrad, Mountainbike — bringen Sie Ihr Fahrrad einfach in der Heckerstraße 27 vorbei. Sie erhalten vorab eine transparente Einschätzung von Umfang und Kosten.',
    servicesHeading: 'Unsere Service-Leistungen',
    services: [
      'Inspektion & Sicherheits-Check (Bremsen, Licht, Reifen, Rahmen)',
      'E-Bike & Pedelec Service — Sicht- und Funktions-Check von Bremsen, Schaltung, Beleuchtung sowie Akku, Motor, Display & Verkabelung',
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
        q: 'Bietet ihr auch E-Bike Service in Freiburg an?',
        a: 'Ja. Wir übernehmen den Sicht- und Funktions-Check Ihres E-Bikes: Bremsen, Schaltung, Reifen und Beleuchtung sowie eine Sichtprüfung von Akku, Motor und Verkabelung. Für tiefergehende Motor- oder Akku-Diagnosen vermitteln wir an den Hersteller-Service.',
      },
      {
        q: 'Was kostet ein Fahrrad-Service?',
        a: 'Das hängt vom Umfang ab — Sie erhalten vorab immer eine transparente Einschätzung. Richtwerte: Basis-Check (Bremsen, Schaltung, Reifen, Licht) ca. 20–30 €, Standard-Inspektion ca. 40–60 €, große Inspektion ca. 60–180 €, E-Bike-Check inkl. Akku- & Motor-Sichtprüfung ca. 70–120 €.',
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
      'Bike & E-Bike Service Freiburg — Inspection, Maintenance & Tune-Up | Bike Haus Freiburg',
    metaDescription:
      'Bike service in Freiburg ✓ Inspection, maintenance, brake & gear adjustment, tyre changes. Heckerstraße 27, Freiburg. Walk in, no appointment needed.',
    heroTitle: 'Bike Service in Freiburg',
    heroSub:
      'Inspection, maintenance and care for bike and e-bike — at Bike Haus Freiburg, Heckerstraße 27.',
    badges: ['🔧 Inspection & tune-up', '🕒 No appointment'],
    introHeading: 'Service for your bike',
    introText:
      'To keep your bike safe and reliable, Bike Haus Freiburg offers a complete bike service: we check, maintain, adjust and care for your bike. City bike, trekking bike, mountain bike — just bring it to Heckerstraße 27. You always get a transparent estimate of scope and cost beforehand.',
    servicesHeading: 'Our service offering',
    services: [
      'Inspection & safety check (brakes, lights, tyres, frame)',
      'E-bike & pedelec service — visual & functional check of brakes, gears, lights as well as battery, motor, display & wiring',
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
        q: 'Do you also offer e-bike service in Freiburg?',
        a: 'Yes. We carry out the visual and functional check of your e-bike: brakes, gears, tyres and lights as well as a visual inspection of the battery, motor and wiring. For deeper motor or battery diagnostics we refer you to the manufacturer service.',
      },
      {
        q: 'How much does a bike service cost?',
        a: 'It depends on the scope — you always get a transparent estimate beforehand. Guideline prices: basic check (brakes, gears, tyres, lights) approx. €20–30, standard inspection approx. €40–60, major inspection approx. €60–180, e-bike check incl. visual battery & motor inspection approx. €70–120.',
      },
      {
        q: 'How long does the service take?',
        a: 'Smaller adjustments are often done on the spot. For more extensive maintenance we agree on a pick-up day.',
      },
      {
        q: 'Where can I find you?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Advice in German, English, French and Turkish.',
      },
    ],
    ctaHeading: 'Need a bike service in Freiburg?',
    ctaText:
      'Drop by without an appointment or message us on WhatsApp — we will take care of your bike.',
  },

  fr: {
    metaTitle:
      'Entretien vélo & vélo électrique Fribourg — Révision, maintenance & réglage | Bike Haus Freiburg',
    metaDescription:
      'Entretien vélo à Fribourg ✓ Révision, maintenance, réglage freins & vitesses, changement de pneus, contrôle. Heckerstraße 27, Fribourg. Sans rendez-vous.',
    heroTitle: 'Entretien vélo à Fribourg',
    heroSub:
      'Révision, maintenance et entretien de votre vélo et vélo électrique — chez Bike Haus Freiburg, Heckerstraße 27.',
    badges: ['🔧 Révision & réglage', '🕒 Sans rendez-vous'],
    introHeading: 'Service pour votre vélo',
    introText:
      'Pour que votre vélo reste sûr et fiable, Bike Haus Freiburg propose un service vélo complet : nous contrôlons, entretenons, réglons et soignons votre vélo. Vélo de ville, vélo de trekking, VTT — apportez-le simplement à la Heckerstraße 27. Vous recevez toujours au préalable une estimation transparente de l’étendue et du coût.',
    servicesHeading: 'Nos prestations de service',
    services: [
      'Révision & contrôle de sécurité (freins, éclairage, pneus, cadre)',
      'Service vélo électrique & pedelec — contrôle visuel et fonctionnel des freins, vitesses, éclairage ainsi que de la batterie, du moteur, de l’écran & du câblage',
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
        q: 'Proposez-vous aussi un service vélo électrique à Fribourg ?',
        a: 'Oui. Nous réalisons le contrôle visuel et fonctionnel de votre vélo électrique : freins, vitesses, pneus et éclairage ainsi qu’un contrôle visuel de la batterie, du moteur et du câblage. Pour des diagnostics plus approfondis du moteur ou de la batterie, nous vous orientons vers le service du fabricant.',
      },
      {
        q: 'Combien coûte un entretien vélo ?',
        a: 'Cela dépend de l’étendue — vous recevez toujours au préalable une estimation transparente. Indications : contrôle de base (freins, vitesses, pneus, éclairage) env. 20–30 €, inspection standard env. 40–60 €, grande inspection env. 60–180 €, contrôle vélo électrique incl. contrôle visuel de la batterie & du moteur env. 70–120 €.',
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
      'Bisiklet & E-Bike Servisi Freiburg — Bakım, Kontrol & Ayar | Bike Haus Freiburg',
    metaDescription:
      'Freiburg’da bisiklet servisi ✓ Bakım, kontrol, fren & vites ayarı, lastik değişimi. Heckerstraße 27, Freiburg. Randevusuz gelin.',
    heroTitle: 'Freiburg’da Bisiklet Servisi',
    heroSub:
      'Bisiklet ve e-bike için bakım, kontrol ve ayar — Bike Haus Freiburg, Heckerstraße 27.',
    badges: ['🔧 Bakım & ayar', '🕒 Randevusuz'],
    introHeading: 'Bisikletiniz için servis',
    introText:
      'Bisikletinizin güvenli ve sorunsuz çalışması için Bike Haus Freiburg kapsamlı bir bisiklet servisi sunar: kontrol eder, bakımını yapar, ayarlar ve bakımını üstleniriz. Şehir bisikleti, trekking, dağ bisikleti — bisikletinizi Heckerstraße 27’ye getirmeniz yeterli. Kapsam ve ücret konusunda önceden şeffaf bir bilgi alırsınız.',
    servicesHeading: 'Servis hizmetlerimiz',
    services: [
      'Kontrol & güvenlik bakımı (fren, ışık, lastik, kadro)',
      'E-Bike & Pedelec servisi — fren, vites, aydınlatma ile akü, motor, ekran & kabloların görsel ve işlevsel kontrolü',
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
        q: 'Freiburg’da e-bike servisi de veriyor musunuz?',
        a: 'Evet. E-bike’ınızın görsel ve işlevsel kontrolünü üstleniriz: fren, vites, lastik ve aydınlatma ile akü, motor ve kabloların görsel kontrolü. Daha kapsamlı motor veya akü teşhisleri için sizi üretici servisine yönlendiririz.',
      },
      {
        q: 'Bisiklet servisi ne kadar tutar?',
        a: 'Kapsama bağlıdır — başlamadan önce her zaman şeffaf bir bilgi alırsınız. Yaklaşık değerler: temel kontrol (fren, vites, lastik, ışık) yaklaşık 20–30 €, standart kontrol yaklaşık 40–60 €, büyük kontrol yaklaşık 60–180 €, akü & motor görsel kontrolü dahil e-bike kontrolü yaklaşık 70–120 €.',
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

  es: {
    metaTitle:
      'Servicio de bicicletas y e-bikes Friburgo — Revisión, mantenimiento y ajuste | Bike Haus Freiburg',
    metaDescription:
      'Servicio de bicicletas en Friburgo ✓ Revisión, mantenimiento, ajuste de frenos y cambios, sustitución de neumáticos. Heckerstraße 27. Sin cita previa.',
    heroTitle: 'Servicio de bicicletas en Friburgo',
    heroSub:
      'Revisión, mantenimiento y cuidado de tu bicicleta y e-bike — en Bike Haus Freiburg, Heckerstraße 27.',
    badges: [
      '🔧 Revisión y ajuste',
      '🕒 Sin cita previa',
    ],
    introHeading: 'Servicio para tu bicicleta',
    introText:
      'Para que tu bicicleta sea segura y fiable, Bike Haus Freiburg ofrece un servicio de bicicletas completo: revisamos, mantenemos, ajustamos y cuidamos tu bicicleta. Bicicleta de ciudad, de trekking, de montaña — solo tienes que traerla a la Heckerstraße 27. Siempre recibes de antemano una estimación transparente del alcance y el coste.',
    servicesHeading: 'Nuestros servicios',
    services: [
      'Revisión y control de seguridad (frenos, luces, neumáticos, cuadro)',
      'Servicio de e-bike y pedelec — control visual y funcional de frenos, cambios, iluminación, así como batería, motor, pantalla y cableado',
      'Control y ajuste de frenos',
      'Control y ajuste de cambios',
      'Cambio de neumáticos y cámaras, control de presión',
      'Cadena, transmisión y piezas móviles limpiadas y engrasadas',
      'Control de luces y sistema eléctrico',
      'Preparación y limpieza de la bicicleta antes de la venta',
    ],
    processHeading: 'Cómo funciona el servicio',
    processSteps: [
      'Pásate — trae tu bicicleta a la Heckerstraße 27, sin cita previa.',
      'Control y estimación — revisamos tu bicicleta y comentamos el alcance del servicio.',
      'Precio transparente — sabes de antemano qué se hará y cuánto cuesta.',
      'Recógela — tu bicicleta está ajustada, revisada y lista para rodar.',
    ],
    faqHeading: 'Preguntas frecuentes sobre el servicio de bicicletas',
    faq: [
      {
        q: '¿Necesito cita para el servicio?',
        a: 'No. Durante el horario de apertura puedes venir con tu bicicleta a la Heckerstraße 27 en Friburgo. Para trabajos más grandes acordamos juntos un día de recogida.',
      },
      {
        q: '¿Ofrecéis también servicio de e-bike en Friburgo?',
        a: 'Sí. Realizamos el control visual y funcional de tu e-bike: frenos, cambios, neumáticos e iluminación, así como una inspección visual de la batería, el motor y el cableado. Para diagnósticos más profundos del motor o la batería te derivamos al servicio del fabricante.',
      },
      {
        q: '¿Cuánto cuesta un servicio de bicicleta?',
        a: 'Depende del alcance — siempre recibes de antemano una estimación transparente. Valores orientativos: control básico (frenos, cambios, neumáticos, luces) aprox. 20–30 €, inspección estándar aprox. 40–60 €, gran inspección aprox. 60–180 €, control de e-bike incl. inspección visual de batería y motor aprox. 70–120 €.',
      },
      {
        q: '¿Cuánto dura el servicio?',
        a: 'Los ajustes pequeños suelen hacerse en el momento. Para un mantenimiento más amplio acordamos un día de recogida.',
      },
      {
        q: '¿Dónde os encuentro?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Asesoramiento en alemán, inglés, francés y turco.',
      },
    ],
    ctaHeading: '¿Necesitas un servicio de bicicleta en Friburgo?',
    ctaText:
      'Pásate sin cita o escríbenos por WhatsApp — nos ocupamos de tu bicicleta.',
  },

  it: {
    metaTitle:
      'Assistenza bici & e-bike Friburgo — Revisione, manutenzione e regolazione | Bike Haus Freiburg',
    metaDescription:
      'Assistenza bici a Friburgo ✓ Revisione, manutenzione, regolazione freni e cambio, sostituzione pneumatici. Heckerstraße 27. Senza appuntamento.',
    heroTitle: 'Assistenza bici a Friburgo',
    heroSub:
      'Revisione, manutenzione e cura della tua bici e e-bike — da Bike Haus Freiburg, Heckerstraße 27.',
    badges: [
      '🔧 Revisione e regolazione',
      '🕒 Senza appuntamento',
    ],
    introHeading: 'Assistenza per la tua bici',
    introText:
      'Per mantenere la tua bici sicura e affidabile, Bike Haus Freiburg offre un servizio bici completo: controlliamo, manuteniamo, regoliamo e curiamo la tua bicicletta. City bike, trekking, mountain bike — basta portarla in Heckerstraße 27. Ricevi sempre in anticipo una stima trasparente di entità e costo.',
    servicesHeading: 'I nostri servizi',
    services: [
      'Revisione e controllo di sicurezza (freni, luci, pneumatici, telaio)',
      'Servizio e-bike e pedelec — controllo visivo e funzionale di freni, cambio, illuminazione nonché batteria, motore, display e cablaggio',
      'Controllo e regolazione dei freni',
      'Controllo e regolazione del cambio',
      'Sostituzione di pneumatici e camere d’aria, controllo pressione',
      'Catena, trasmissione e parti mobili pulite e lubrificate',
      'Controllo luci e impianto elettrico',
      'Preparazione e pulizia della bici prima della vendita',
    ],
    processHeading: 'Come funziona il servizio',
    processSteps: [
      'Passa da noi — porta la tua bici in Heckerstraße 27, senza appuntamento.',
      'Controllo e stima — esaminiamo la tua bici e discutiamo l’entità del servizio.',
      'Prezzo trasparente — sai in anticipo cosa verrà fatto e quanto costa.',
      'Ritiro — la tua bici è regolata, revisionata e pronta da usare.',
    ],
    faqHeading: 'Domande frequenti sull’assistenza bici',
    faq: [
      {
        q: 'Serve un appuntamento per il servizio?',
        a: 'No. Durante gli orari di apertura puoi venire con la tua bici in Heckerstraße 27 a Friburgo. Per lavori più impegnativi concordiamo insieme un giorno di ritiro.',
      },
      {
        q: 'Offrite anche assistenza e-bike a Friburgo?',
        a: 'Sì. Eseguiamo il controllo visivo e funzionale della tua e-bike: freni, cambio, pneumatici e illuminazione, oltre a un controllo visivo di batteria, motore e cablaggio. Per diagnosi più approfondite del motore o della batteria ti indirizziamo al servizio del produttore.',
      },
      {
        q: 'Quanto costa un servizio bici?',
        a: 'Dipende dall’entità — ricevi sempre in anticipo una stima trasparente. Valori indicativi: controllo base (freni, cambio, pneumatici, luci) circa 20–30 €, ispezione standard circa 40–60 €, grande ispezione circa 60–180 €, controllo e-bike incl. controllo visivo di batteria e motore circa 70–120 €.',
      },
      {
        q: 'Quanto dura il servizio?',
        a: 'Le piccole regolazioni spesso si fanno sul posto. Per una manutenzione più ampia concordiamo un giorno di ritiro.',
      },
      {
        q: 'Dove vi trovo?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Consulenza in tedesco, inglese, francese e turco.',
      },
    ],
    ctaHeading: 'Hai bisogno di assistenza bici a Friburgo?',
    ctaText:
      'Passa senza appuntamento o scrivici su WhatsApp — pensiamo noi alla tua bici.',
  },

  ar: {
    metaTitle:
      'خدمة الدراجات والدراجات الكهربائية في فرايبورغ — فحص وصيانة وضبط | Bike Haus Freiburg',
    metaDescription:
      'خدمة الدراجات في فرايبورغ ✓ فحص وصيانة وضبط الفرامل والتروس وتغيير الإطارات. Heckerstraße 27. بدون موعد مسبق.',
    heroTitle: 'خدمة الدراجات في فرايبورغ',
    heroSub:
      'فحص وصيانة وعناية بدراجتك ودراجتك الكهربائية — لدى Bike Haus Freiburg، Heckerstraße 27.',
    badges: ['🔧 فحص وضبط', '🕒 بدون موعد'],
    introHeading: 'خدمة لدراجتك',
    introText:
      'كي تبقى دراجتك آمنة وموثوقة، يقدّم Bike Haus Freiburg خدمة شاملة للدراجات: نفحص ونصون ونضبط ونعتني بدراجتك. دراجة مدينة أو تريكنغ أو جبلية — يكفي أن تحضرها إلى Heckerstraße 27. تحصل دائمًا مسبقًا على تقدير شفّاف للنطاق والتكلفة.',
    servicesHeading: 'خدماتنا',
    services: [
      'فحص وفحص سلامة (الفرامل، الإضاءة، الإطارات، الهيكل)',
      'خدمة الدراجات الكهربائية والبيدلك — فحص بصري ووظيفي للفرامل والتروس والإضاءة بالإضافة إلى البطارية والمحرك والشاشة والأسلاك',
      'فحص وضبط الفرامل',
      'فحص وضبط التروس',
      'تغيير الإطارات والأنابيب الداخلية وفحص الضغط',
      'تنظيف وتزييت السلسلة ونظام النقل والأجزاء المتحركة',
      'فحص الإضاءة والنظام الكهربائي',
      'تجهيز وتنظيف الدراجة قبل البيع',
    ],
    processHeading: 'كيف تتم الخدمة',
    processSteps: [
      'مرّ علينا — أحضر دراجتك إلى Heckerstraße 27 بدون موعد.',
      'فحص وتقدير — نفحص دراجتك ونناقش نطاق الخدمة.',
      'سعر شفّاف — تعرف مسبقًا ما الذي سيُنجز وكم سيكلّف.',
      'الاستلام — دراجتك مضبوطة ومُصانة وجاهزة للانطلاق.',
    ],
    faqHeading: 'أسئلة شائعة حول خدمة الدراجات',
    faq: [
      {
        q: 'هل أحتاج إلى موعد للخدمة؟',
        a: 'لا. خلال ساعات العمل يمكنك ببساطة المرور بدراجتك إلى Heckerstraße 27 في فرايبورغ. وللأعمال الأكبر نتفق معًا على يوم للاستلام.',
      },
      {
        q: 'هل تقدّمون أيضًا خدمة الدراجات الكهربائية في فرايبورغ؟',
        a: 'نعم. نتولى الفحص البصري والوظيفي لدراجتك الكهربائية: الفرامل والتروس والإطارات والإضاءة بالإضافة إلى فحص بصري للبطارية والمحرك والأسلاك. ولإجراء تشخيصات أعمق للمحرك أو البطارية نحيلك إلى خدمة الشركة المصنّعة.',
      },
      {
        q: 'كم تكلفة خدمة الدراجة؟',
        a: 'تعتمد على النطاق — تحصل دائمًا مسبقًا على تقدير شفّاف. قيم استرشادية: فحص أساسي (الفرامل، التروس، الإطارات، الإضاءة) نحو 20–30 €، فحص قياسي نحو 40–60 €، فحص كبير نحو 60–180 €، فحص الدراجة الكهربائية شامل الفحص البصري للبطارية والمحرك نحو 70–120 €.',
      },
      {
        q: 'كم تستغرق الخدمة؟',
        a: 'الضبط البسيط غالبًا ما يتم في الحال. وللصيانة الأوسع نتفق على يوم للاستلام.',
      },
      {
        q: 'أين أجدكم؟',
        a: 'Bike Haus Freiburg، Heckerstraße 27، 79114 Freiburg im Breisgau. استشارة بالألمانية والإنجليزية والفرنسية والتركية.',
      },
    ],
    ctaHeading: 'هل تحتاج إلى خدمة دراجة في فرايبورغ؟',
    ctaText: 'مرّ علينا بدون موعد أو راسلنا عبر واتساب — سنعتني بدراجتك.',
  },

  ru: {
    metaTitle:
      'Сервис велосипедов и электровелосипедов Фрайбург — диагностика, обслуживание и настройка | Bike Haus Freiburg',
    metaDescription:
      'Сервис велосипедов во Фрайбурге ✓ диагностика, обслуживание, настройка тормозов и переключателей, замена шин. Heckerstraße 27. Без записи.',
    heroTitle: 'Сервис велосипедов во Фрайбурге',
    heroSub:
      'Диагностика, обслуживание и уход за вашим велосипедом и электровелосипедом — в Bike Haus Freiburg, Heckerstraße 27.',
    badges: [
      '🔧 Диагностика и настройка',
      '🕒 Без записи',
    ],
    introHeading: 'Сервис для вашего велосипеда',
    introText:
      'Чтобы ваш велосипед был безопасным и надёжным, Bike Haus Freiburg предлагает полный сервис: мы проверяем, обслуживаем, настраиваем и ухаживаем за вашим велосипедом. Городской, трекинговый, горный — просто привезите его на Heckerstraße 27. Вы всегда заранее получаете прозрачную оценку объёма и стоимости.',
    servicesHeading: 'Наши услуги',
    services: [
      'Диагностика и проверка безопасности (тормоза, свет, шины, рама)',
      'Сервис электровелосипедов и педелеков — визуальная и функциональная проверка тормозов, переключателей, освещения, а также аккумулятора, мотора, дисплея и проводки',
      'Проверка и настройка тормозов',
      'Проверка и настройка переключателей',
      'Замена шин и камер, проверка давления',
      'Чистка и смазка цепи, трансмиссии и подвижных частей',
      'Проверка света и электрики',
      'Подготовка и чистка велосипеда перед продажей',
    ],
    processHeading: 'Как проходит сервис',
    processSteps: [
      'Заходите — привезите велосипед на Heckerstraße 27, без записи.',
      'Проверка и оценка — мы осматриваем велосипед и обсуждаем объём работ.',
      'Прозрачная цена — вы заранее знаете, что будет сделано и сколько это стоит.',
      'Забирайте — велосипед настроен, обслужен и готов к поездке.',
    ],
    faqHeading: 'Частые вопросы о сервисе велосипедов',
    faq: [
      {
        q: 'Нужна ли запись на сервис?',
        a: 'Нет. В часы работы вы можете просто приехать с велосипедом на Heckerstraße 27 во Фрайбурге. Для крупных работ мы вместе договариваемся о дне выдачи.',
      },
      {
        q: 'Делаете ли вы также сервис электровелосипедов во Фрайбурге?',
        a: 'Да. Мы проводим визуальную и функциональную проверку вашего электровелосипеда: тормоза, переключатели, шины и освещение, а также визуальный осмотр аккумулятора, мотора и проводки. Для более глубокой диагностики мотора или аккумулятора мы направляем вас в сервис производителя.',
      },
      {
        q: 'Сколько стоит сервис велосипеда?',
        a: 'Зависит от объёма — вы всегда заранее получаете прозрачную оценку. Ориентиры: базовая проверка (тормоза, переключатели, шины, свет) около 20–30 €, стандартная диагностика около 40–60 €, большая диагностика около 60–180 €, проверка электровелосипеда вкл. визуальный осмотр аккумулятора и мотора около 70–120 €.',
      },
      {
        q: 'Сколько длится сервис?',
        a: 'Небольшие настройки часто делаем сразу. Для более объёмного обслуживания договариваемся о дне выдачи.',
      },
      {
        q: 'Где вас найти?',
        a: 'Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau. Консультация на немецком, английском, французском и турецком.',
      },
    ],
    ctaHeading: 'Нужен сервис велосипеда во Фрайбурге?',
    ctaText:
      'Заходите без записи или напишите нам в WhatsApp — мы позаботимся о вашем велосипеде.',
  },
};
