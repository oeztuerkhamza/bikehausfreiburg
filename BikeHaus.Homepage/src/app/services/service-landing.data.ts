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
      'Inspektion, Wartung und Pflege für Ihr Fahrrad  — bei Bike Haus Freiburg in der Heckerstraße 27.',
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
        a: 'Die Kosten hängen vom Umfang ab. Sie erhalten vor Beginn immer eine transparente Einschätzung, sodass es keine Überraschungen gibt.',
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
        q: 'How much does a bike service cost?',
        a: 'It depends on the scope. You always get a transparent estimate before we start, so there are no surprises.',
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
      'Entretien vélo Fribourg — Révision, maintenance & réglage | Bike Haus Freiburg',
    metaDescription:
      'Entretien vélo à Fribourg ✓ Révision, maintenance, réglage freins & vitesses, changement de pneus, contrôle. Heckerstraße 27, Fribourg. Sans rendez-vous.',
    heroTitle: 'Entretien vélo à Fribourg',
    heroSub:
      'Révision, maintenance et entretien de votre vélo  — chez Bike Haus Freiburg, Heckerstraße 27.',
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
        a: 'Cela dépend de l’étendue. Vous recevez toujours une estimation transparente avant de commencer, sans surprise.',
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
        a: 'Ücret kapsama bağlıdır. Başlamadan önce her zaman şeffaf bir bilgi alırsınız; sürpriz olmaz.',
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
      'Servicio de bicicletas Friburgo — Revisión, mantenimiento y ajuste | Bike Haus Freiburg',
    metaDescription:
      'Servicio de bicicletas en Friburgo ✓ Revisión, mantenimiento, ajuste de frenos y cambios, sustitución de neumáticos. Heckerstraße 27. Sin cita previa.',
    heroTitle: 'Servicio de bicicletas en Friburgo',
    heroSub:
      'Revisión, mantenimiento y cuidado de tu bicicleta — en Bike Haus Freiburg, Heckerstraße 27.',
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
        q: '¿Cuánto cuesta un servicio de bicicleta?',
        a: 'Depende del alcance. Siempre recibes una estimación transparente antes de empezar, sin sorpresas.',
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
      'Assistenza bici Friburgo — Revisione, manutenzione e regolazione | Bike Haus Freiburg',
    metaDescription:
      'Assistenza bici a Friburgo ✓ Revisione, manutenzione, regolazione freni e cambio, sostituzione pneumatici. Heckerstraße 27. Senza appuntamento.',
    heroTitle: 'Assistenza bici a Friburgo',
    heroSub:
      'Revisione, manutenzione e cura della tua bici — da Bike Haus Freiburg, Heckerstraße 27.',
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
        q: 'Quanto costa un servizio bici?',
        a: 'Dipende dall’entità. Ricevi sempre una stima trasparente prima di iniziare, senza sorprese.',
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
      'خدمة الدراجات في فرايبورغ — فحص وصيانة وضبط | Bike Haus Freiburg',
    metaDescription:
      'خدمة الدراجات في فرايبورغ ✓ فحص وصيانة وضبط الفرامل والتروس وتغيير الإطارات. Heckerstraße 27. بدون موعد مسبق.',
    heroTitle: 'خدمة الدراجات في فرايبورغ',
    heroSub:
      'فحص وصيانة وعناية بدراجتك — لدى Bike Haus Freiburg، Heckerstraße 27.',
    badges: ['🔧 فحص وضبط', '🕒 بدون موعد'],
    introHeading: 'خدمة لدراجتك',
    introText:
      'كي تبقى دراجتك آمنة وموثوقة، يقدّم Bike Haus Freiburg خدمة شاملة للدراجات: نفحص ونصون ونضبط ونعتني بدراجتك. دراجة مدينة أو تريكنغ أو جبلية — يكفي أن تحضرها إلى Heckerstraße 27. تحصل دائمًا مسبقًا على تقدير شفّاف للنطاق والتكلفة.',
    servicesHeading: 'خدماتنا',
    services: [
      'فحص وفحص سلامة (الفرامل، الإضاءة، الإطارات، الهيكل)',
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
        q: 'كم تكلفة خدمة الدراجة؟',
        a: 'تعتمد على النطاق. تحصل دائمًا على تقدير شفّاف قبل البدء دون مفاجآت.',
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
      'Сервис велосипедов Фрайбург — диагностика, обслуживание и настройка | Bike Haus Freiburg',
    metaDescription:
      'Сервис велосипедов во Фрайбурге ✓ диагностика, обслуживание, настройка тормозов и переключателей, замена шин. Heckerstraße 27. Без записи.',
    heroTitle: 'Сервис велосипедов во Фрайбурге',
    heroSub:
      'Диагностика, обслуживание и уход за вашим велосипедом — в Bike Haus Freiburg, Heckerstraße 27.',
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
        q: 'Сколько стоит сервис велосипеда?',
        a: 'Зависит от объёма. Вы всегда получаете прозрачную оценку до начала работ, без сюрпризов.',
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
