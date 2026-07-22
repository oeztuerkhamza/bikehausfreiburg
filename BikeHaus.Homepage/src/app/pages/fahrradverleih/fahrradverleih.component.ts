import {
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import {
  Language,
  TranslationService,
} from '../../services/translation.service';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  LOCALE_BY_LANGUAGE,
  OG_LOCALE_BY_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getRentalSlug,
  isSupportedLanguage,
} from '../../services/language-config';
import { ApiService } from '../../services/api.service';
import { AREA_SERVED } from '../../services/area-served.data';
import {
  PublicRentalBicycle,
  RentalBookingCreate,
  RentalReviewPublic,
  RentalReviewCreate,
} from '../../models/models';
import { environment } from '../../../environments/environment';
import {
  calculateRentalPrice,
  getConfiguredRentalPriceLines,
} from '../../utils/rental-pricing';
import { EXTENDED_RENTAL_PAGE_COPY } from './rental-page-copy-extended';
import { getRentalBookingPath } from '../../services/language-config';
import { RENTAL_CATEGORIES } from './rental-category-content';

type RentalLangOption = { code: Language; label: string };

type RentalPricingCardContent = {
  className: string;
  topBadge?: string;
  topBadgeClass?: string;
  label: string;
  duration: string;
  price: string;
  perDay: string;
  features: string[];
  cta: string;
  whatsapp: string;
};

type RentalExtraItemContent = {
  duration: string;
  price: string;
  day: string;
  cta: string;
};

type RentalInfoItemContent = {
  title: string;
  text: string;
};

type RentalFaqItem = {
  question: string;
  answers: string[];
};

type RentalFaqContent = {
  sectionLabel: string;
  sectionTitle: string;
  items: RentalFaqItem[];
};

const BOOKING_LANGUAGE_OPTIONS: RentalLangOption[] = SUPPORTED_LANGUAGES.map(
  (code) => ({ code, label: LANGUAGE_LABELS[code] }),
);

const RENTAL_FAQ_CONTENT: Partial<Record<Language, RentalFaqContent>> = {
  de: {
    sectionLabel: 'FAQ',
    sectionTitle: 'Häufige Fragen zum Fahrradverleih',
    items: [
      {
        question: 'Welche Fahrräder kann ich in Freiburg mieten?',
        answers: [
          'Citybikes',
          'Mountainbikes (MTB)',
          'Kinderfahrräder',
          'E-Bikes (Heckmotor & Mittelmotor)',
          'Rennräder & Gravelbikes',
        ],
      },
      {
        question: 'Wie funktioniert Abholung & Rückgabe?',
        answers: [
          'Abholung Mo-Fr ab 10:00 Uhr, Sa ab 11:00 Uhr',
          'Rückgabe bis spätestens 18:00 Uhr',
          'Sonn- und Feiertage geschlossen',
        ],
      },
      {
        question: 'Was ist im Mietpreis inklusive?',
        answers: ['Schloss', 'Korb', 'Helm'],
      },
      {
        question: 'Wie hoch ist die Kaution?',
        answers: [
          'Normale Fahrräder & einfache E-Bikes: 100 EUR',
          'Mittelmotor E-Bikes: 200 EUR',
          'Kaution nur in bar',
        ],
      },
      {
        question: 'Welche Zahlungsmöglichkeiten gibt es?',
        answers: ['Miete: Bar oder Karte', 'Kaution: nur bar'],
      },
      {
        question: 'Was passiert bei Diebstahl oder Schäden?',
        answers: [
          'Fahrrad immer abschließen',
          'Der Mieter haftet laut Vertrag',
          'Reparaturkosten trägt der Mieter',
          'Kaution wird in solchen Fällen nicht zurückerstattet',
        ],
      },
      {
        question: 'Ist eine Reservierung möglich?',
        answers: [
          'Reservierung möglich und empfohlen',
          'Kostenlose Stornierung bis 1 Tag vorher',
        ],
      },
      {
        question: 'Weitere Informationen zum Fahrradverleih',
        answers: [
          'Mietdauer kann verlängert werden',
          'Fahrradwechsel bei falscher Größe möglich',
          'Eigener Helm & Schloss können genutzt werden',
          'Mietfahrrad kann später gekauft werden',
        ],
      },
      {
        question: 'Welche Kindergrößen sind verfügbar?',
        answers: ['Kinderfahrräder in 20", 24", 26", 27,5" und 29" verfügbar'],
      },
      {
        question: 'Was kostet eine verspätete Rückgabe?',
        answers: [
          'Ist das Fahrrad am Folgetag verfügbar, kann die Miete nach Absprache verlängert werden — pro zusätzlichem Tag berechnen wir den regulären Tagespreis.',
        ],
      },
    ],
  },
  en: {
    sectionLabel: 'FAQ',
    sectionTitle: 'Frequently Asked Questions — Bike Rental Freiburg',
    items: [
      {
        question: 'Which bikes can I rent in Freiburg?',
        answers: [
          'City bikes',
          'Mountain bikes (MTB)',
          'Kids bikes',
          'E-bikes (rear motor & mid-drive)',
          'Road bikes & gravel bikes',
        ],
      },
      {
        question: 'How does pickup & return work for the bike rental?',
        answers: [
          'Pickup Mon-Fri from 10:00, Sat from 11:00',
          'Return no later than 18:00',
          'Closed on Sundays and public holidays',
        ],
      },
      {
        question: 'What is included in the bike rental price?',
        answers: ['Lock', 'Basket', 'Helmet'],
      },
      {
        question: 'How much is the deposit for renting a bike in Freiburg?',
        answers: [
          'Regular bikes & basic e-bikes: EUR 300',
          'Mid-drive e-bikes: EUR 700',
          'Deposit in cash only',
        ],
      },
      {
        question: 'How can I pay for my bike rental?',
        answers: ['Rental fee: cash or card', 'Deposit: cash only'],
      },
      {
        question: 'What happens if the rental bike is stolen or damaged?',
        answers: [
          'Always lock the bike',
          'Renter is liable according to contract',
          'Repair costs are paid by the renter',
          'Deposit is not refunded in such cases',
        ],
      },
      {
        question: 'How do I reserve a rental bike in Freiburg?',
        answers: [
          'Reservation is possible and recommended',
          'Free cancellation up to 1 day before',
        ],
      },
      {
        question: 'Can I extend my bike rental period?',
        answers: [
          'Rental period can be extended',
          'Bike exchange possible if size is wrong',
          'Own helmet and lock can be used',
          'Rental bike can be purchased later',
        ],
      },
      {
        question: "Are kids' bikes available to rent in Freiburg?",
        answers: ['Models in 20", 24", 26", 27.5" and 29" are available'],
      },
      {
        question: 'What is the fee for a late bike return?',
        answers: [
          'If the bike is available the next day, you can extend the rental by letting us know — each additional day is charged at the regular daily rate.',
        ],
      },
    ],
  },
  fr: {
    sectionLabel: 'FAQ',
    sectionTitle: 'Questions frequentes',
    items: [
      {
        question: 'Quels velos puis-je louer ?',
        answers: [
          'Velos de ville',
          'VTT (MTB)',
          'Velos enfants',
          'Velos electriques (moteur arriere & moteur central)',
          'Velos de route & gravel',
        ],
      },
      {
        question: 'Retrait & retour',
        answers: [
          'Retrait lun-ven a partir de 10h00, sam a partir de 11h00',
          'Retour au plus tard a 18h00',
          'Ferme les dimanches et jours feries',
        ],
      },
      {
        question: 'Inclus dans le prix de location',
        answers: ['Antivol', 'Panier', 'Casque'],
      },
      {
        question: 'Depot de garantie',
        answers: [
          'Velos classiques & e-bikes simples : 100 EUR',
          'E-bikes moteur central : 200 EUR',
          'Depot uniquement en especes',
        ],
      },
      {
        question: 'Moyens de paiement',
        answers: ['Location : especes ou carte', 'Depot : especes uniquement'],
      },
      {
        question: 'En cas de vol ou de dommages',
        answers: [
          'Toujours verrouiller le velo',
          'Le locataire est responsable selon le contrat',
          'Les frais de reparation sont a la charge du locataire',
          'Le depot n est pas rembourse dans ces cas',
        ],
      },
      {
        question: 'Reservation & annulation',
        answers: [
          'Reservation possible et recommandee',
          'Annulation gratuite jusqu a 1 jour avant',
        ],
      },
      {
        question: 'Informations supplementaires',
        answers: [
          'La duree de location peut etre prolongee',
          'Changement de velo possible en cas de mauvaise taille',
          'Casque et antivol personnels autorises',
          'Le velo loue peut etre achete plus tard',
        ],
      },
      {
        question: 'Velos enfants disponibles ?',
        answers: ['Modeles disponibles en 20", 24", 26", 27,5" et 29"'],
      },
      {
        question: 'Retour en retard',
        answers: [
          'Si le velo est disponible le lendemain, la location peut etre prolongee en nous prevenant — chaque jour supplementaire est facture au tarif journalier normal.',
        ],
      },
    ],
  },
  tr: {
    sectionLabel: 'SSS',
    sectionTitle: 'Sikca Sorulan Sorular',
    items: [
      {
        question: 'Hangi bisikletleri kiralayabilirim?',
        answers: [
          'Sehir bisikletleri',
          'Dag bisikletleri (MTB)',
          'Cocuk bisikletleri',
          'E-bisikletler (arka motor & orta motor)',
          'Yol bisikletleri ve gravel bisikletler',
        ],
      },
      {
        question: 'Teslim alma ve iade',
        answers: [
          'Teslim alma hafta ici 10:00, cumartesi 11:00 dan itibaren',
          'Iade en gec 18:00 e kadar',
          'Pazar ve resmi tatillerde kapali',
        ],
      },
      {
        question: 'Kiralama fiyatina dahil olanlar',
        answers: ['Kilit', 'Sepet', 'Kask'],
      },
      {
        question: 'Depozito',
        answers: [
          'Normal bisikletler ve temel e-bisikletler: 100 EUR',
          'Orta motor e-bisikletler: 200 EUR',
          'Depozito sadece nakit',
        ],
      },
      {
        question: 'Odeme yontemleri',
        answers: ['Kira: nakit veya kart', 'Depozito: sadece nakit'],
      },
      {
        question: 'Hirsizlik veya hasar durumunda',
        answers: [
          'Bisikleti her zaman kilitleyin',
          'Kiraci sozlesmeye gore sorumludur',
          'Onarim masraflari kiraciya aittir',
          'Bu durumlarda depozito iade edilmez',
        ],
      },
      {
        question: 'Rezervasyon ve iptal',
        answers: [
          'Rezervasyon mumkun ve tavsiye edilir',
          '1 gun oncesine kadar ucretsiz iptal',
        ],
      },
      {
        question: 'Ek bilgiler',
        answers: [
          'Kiralama suresi uzatilabilir',
          'Yanlis beden durumunda bisiklet degisimi mumkun',
          'Kendi kask ve kilidinizi kullanabilirsiniz',
          'Kiralik bisiklet daha sonra satin alinabilir',
        ],
      },
      {
        question: 'Cocuk bisikletleri mevcut mu?',
        answers: ['20", 24", 26", 27,5" ve 29" modeller mevcuttur'],
      },
      {
        question: 'Gec iade',
        answers: [
          'Bisiklet ertesi gun musaitse bize haber vererek kiralamayi uzatabilirsiniz — her ek gun icin normal gunluk ucret alinir.',
        ],
      },
    ],
  },
  es: {
    sectionLabel: 'FAQ',
    sectionTitle: 'Preguntas frecuentes',
    items: [
      {
        question: 'Que bicicletas puedo alquilar?',
        answers: [
          'Bicicletas urbanas',
          'Mountain bikes (MTB)',
          'Bicicletas infantiles',
          'E-bikes (motor trasero y motor central)',
          'Bicicletas de carretera y gravel',
        ],
      },
      {
        question: 'Recogida y devolucion',
        answers: [
          'Recogida lun-vie a partir de las 10:00, sab a partir de las 11:00',
          'Devolucion como maximo a las 18:00',
          'Cerrado domingos y festivos',
        ],
      },
      {
        question: 'Incluido en el precio de alquiler',
        answers: ['Candado', 'Cesta', 'Casco'],
      },
      {
        question: 'Deposito',
        answers: [
          'Bicis normales y e-bikes basicas: 100 EUR',
          'E-bikes de motor central: 200 EUR',
          'Deposito solo en efectivo',
        ],
      },
      {
        question: 'Formas de pago',
        answers: ['Alquiler: efectivo o tarjeta', 'Deposito: solo efectivo'],
      },
      {
        question: 'En caso de robo o danos',
        answers: [
          'Cierre siempre la bicicleta',
          'El cliente responde segun contrato',
          'Los costes de reparacion los paga el cliente',
          'El deposito no se devuelve en estos casos',
        ],
      },
      {
        question: 'Reserva y cancelacion',
        answers: [
          'La reserva es posible y recomendada',
          'Cancelacion gratuita hasta 1 dia antes',
        ],
      },
      {
        question: 'Informacion adicional',
        answers: [
          'La duracion del alquiler se puede ampliar',
          'Cambio de bici posible si la talla no encaja',
          'Puede usar su propio casco y candado',
          'La bici de alquiler puede comprarse despues',
        ],
      },
      {
        question: 'Hay bicicletas infantiles disponibles?',
        answers: ['Modelos disponibles en 20", 24", 26", 27,5" y 29"'],
      },
      {
        question: 'Devolucion tardia',
        answers: [
          'Si la bicicleta esta disponible al dia siguiente, puede prolongar el alquiler avisandonos — cada dia adicional se cobra a la tarifa diaria normal.',
        ],
      },
    ],
  },
  it: {
    sectionLabel: 'FAQ',
    sectionTitle: 'Domande frequenti',
    items: [
      {
        question: 'Quali biciclette posso noleggiare?',
        answers: [
          'City bike',
          'Mountain bike (MTB)',
          'Biciclette per bambini',
          'E-bike (motore posteriore e motore centrale)',
          'Bici da corsa e gravel',
        ],
      },
      {
        question: 'Ritiro e riconsegna',
        answers: [
          'Ritiro lun-ven dalle 10:00, sab dalle 11:00',
          'Riconsegna entro le 18:00',
          'Chiuso domeniche e festivi',
        ],
      },
      {
        question: 'Incluso nel prezzo di noleggio',
        answers: ['Lucchetto', 'Cestino', 'Casco'],
      },
      {
        question: 'Cauzione',
        answers: [
          'Bici normali ed e-bike base: 100 EUR',
          'E-bike con motore centrale: 200 EUR',
          'Cauzione solo in contanti',
        ],
      },
      {
        question: 'Metodi di pagamento',
        answers: ['Noleggio: contanti o carta', 'Cauzione: solo contanti'],
      },
      {
        question: 'In caso di furto o danni',
        answers: [
          'Chiudere sempre la bici',
          'Il noleggiante e responsabile secondo contratto',
          'I costi di riparazione sono a carico del noleggiante',
          'La cauzione non viene rimborsata in questi casi',
        ],
      },
      {
        question: 'Prenotazione e cancellazione',
        answers: [
          'Prenotazione possibile e consigliata',
          'Cancellazione gratuita fino a 1 giorno prima',
        ],
      },
      {
        question: 'Ulteriori informazioni',
        answers: [
          'La durata del noleggio puo essere estesa',
          'Cambio bici possibile in caso di taglia errata',
          'E possibile usare casco e lucchetto propri',
          'La bici a noleggio puo essere acquistata successivamente',
        ],
      },
      {
        question: 'Biciclette per bambini disponibili?',
        answers: ['Modelli disponibili: 20", 24", 26", 27,5" e 29"'],
      },
      {
        question: 'Riconsegna in ritardo',
        answers: [
          'Se la bici è disponibile il giorno successivo, puoi prolungare il noleggio avvisandoci — ogni giorno aggiuntivo viene addebitato alla normale tariffa giornaliera.',
        ],
      },
    ],
  },
  ar: {
    sectionLabel: 'FAQ',
    sectionTitle: 'الاسئلة الشائعة',
    items: [
      {
        question: 'ما انواع الدراجات المتاحة للايجار؟',
        answers: [
          'دراجات مدينة',
          'دراجات جبلية (MTB)',
          'دراجات اطفال',
          'دراجات كهربائية (محرك خلفي ومحرك وسطي)',
          'دراجات طريق وغرavel',
        ],
      },
      {
        question: 'الاستلام والاعادة',
        answers: [
          'الاستلام من الإثنين إلى الجمعة من الساعة 10:00 والسبت من الساعة 11:00',
          'الاعادة بحد اقصى الساعة 18:00',
          'مغلق ايام الاحد والعطل الرسمية',
        ],
      },
      {
        question: 'المشمول في سعر الايجار',
        answers: ['قفل', 'سلة', 'خوذة'],
      },
      {
        question: 'التامين النقدي',
        answers: [
          'الدراجات العادية والكهربائية البسيطة: 300 يورو',
          'الدراجات الكهربائية بمحرك وسطي: 700 يورو',
          'التامين نقدا فقط',
        ],
      },
      {
        question: 'طرق الدفع',
        answers: ['الايجار: نقدا او بطاقة', 'التامين: نقدا فقط'],
      },
      {
        question: 'في حالة السرقة او الاضرار',
        answers: [
          'يجب قفل الدراجة دائما',
          'المستاجر مسؤول حسب العقد',
          'تكاليف الاصلاح يتحملها المستاجر',
          'لا يتم ارجاع التامين في هذه الحالات',
        ],
      },
      {
        question: 'الحجز والالغاء',
        answers: ['الحجز ممكن وموصى به', 'الغاء مجاني حتى قبل يوم واحد'],
      },
      {
        question: 'معلومات اضافية',
        answers: [
          'يمكن تمديد مدة الايجار',
          'يمكن تبديل الدراجة اذا كان المقاس غير مناسب',
          'يمكن استخدام خوذة وقفل خاصين بك',
          'يمكن شراء الدراجة المستاجرة لاحقا',
        ],
      },
      {
        question: 'هل تتوفر دراجات للاطفال؟',
        answers: ['موديلات متوفرة بمقاسات 20 و24 و26 و27.5 و29 بوصة'],
      },
      {
        question: 'الاعادة المتاخرة',
        answers: [
          'اذا كانت الدراجة متاحة في اليوم التالي يمكن تمديد الايجار بعد ابلاغنا — يحتسب كل يوم اضافي بسعر اليوم العادي',
        ],
      },
    ],
  },
  ru: {
    sectionLabel: 'FAQ',
    sectionTitle: 'Часто задаваемые вопросы',
    items: [
      {
        question: 'Какие велосипеды можно арендовать?',
        answers: [
          'Городские велосипеды',
          'Горные велосипеды (MTB)',
          'Детские велосипеды',
          'Электровелосипеды (задний и средний мотор)',
          'Шоссейные и гравийные велосипеды',
        ],
      },
      {
        question: 'Получение и возврат',
        answers: [
          'Получение пн-пт с 10:00, сб с 11:00',
          'Возврат не позднее 18:00',
          'По воскресеньям и праздникам закрыто',
        ],
      },
      {
        question: 'Что включено в стоимость аренды',
        answers: ['Замок', 'Корзина', 'Шлем'],
      },
      {
        question: 'Залог',
        answers: [
          'Обычные велосипеды и простые e-bike: 100 EUR',
          'E-bike со средним мотором: 200 EUR',
          'Залог только наличными',
        ],
      },
      {
        question: 'Способы оплаты',
        answers: ['Аренда: наличные или карта', 'Залог: только наличные'],
      },
      {
        question: 'В случае кражи или повреждений',
        answers: [
          'Всегда запирайте велосипед',
          'Арендатор несет ответственность по договору',
          'Расходы на ремонт оплачивает арендатор',
          'Залог в таких случаях не возвращается',
        ],
      },
      {
        question: 'Бронирование и отмена',
        answers: [
          'Бронирование возможно и рекомендуется',
          'Бесплатная отмена за 1 день',
        ],
      },
      {
        question: 'Дополнительная информация',
        answers: [
          'Срок аренды можно продлить',
          'Возможна замена велосипеда при неверном размере',
          'Можно использовать свой шлем и замок',
          'Арендованный велосипед можно позже выкупить',
        ],
      },
      {
        question: 'Есть ли детские велосипеды?',
        answers: ['Доступны модели 20", 24", 26", 27,5" и 29"'],
      },
      {
        question: 'Поздний возврат',
        answers: [
          'Если велосипед свободен на следующий день, аренду можно продлить, предупредив нас — каждый дополнительный день оплачивается по обычному дневному тарифу.',
        ],
      },
    ],
  },
};

type RentalPageCopy = {
  serviceHighlightsAria: string;
  heroChip: string;
  heroAccent: string;
  heroDescription: string;
  heroFeatures: string[];
  heroPriceCard: {
    badge: string;
    duration: string;
    price: string;
    perDay: string;
    vs: string;
    features: string[];
  };
  signatureLabel: string;
  signatureText: string;
  signatureStats: Array<{ value: string; label: string }>;
  pricingCards: RentalPricingCardContent[];
  pricingExtras: RentalExtraItemContent[];
  pricingInfo: RentalInfoItemContent[];
  bikePriceFrom: string;
  extraDayShort: string;
  zoomImageAriaLabel: string;
  lightboxAriaLabel: string;
  lightboxCloseAriaLabel: string;
  lightboxPrevAriaLabel: string;
  lightboxNextAriaLabel: string;
  reviewStarAriaSuffix: string;
  bikeFactLabels: {
    type: string;
    category: string;
    frame: string;
    tire: string;
    color: string;
    tireUnit: string;
  };
  extraDayPriceLabel: string;
  successEmailPrefix: string;
  successEmailSuffix: string;
  weekdays: string[];
  emailLabel: string;
  placeholders: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
  };
  bookingLanguages: RentalLangOption[];
  whatsappTitle: string;
  bookingErrors: {
    busyRange: string;
    choosePeriod: string;
    invalidEnd: string;
    fullName: string;
    validEmail: string;
    generic: string;
  };
  addBikeLabel: string;
  priceSummaryLabel: string;
  totalRentalLabel: string;
  totalKautionLabel: string;
  kautionInfoNotice: string;
  kautionSuccessReminder: string;
};

const RENTAL_PAGE_COPY: Partial<Record<Language, RentalPageCopy>> = {
  de: {
    serviceHighlightsAria: 'Service Highlights',
    heroChip: 'Fahrradverleih Freiburg',
    heroAccent: 'ab 8 €',
    heroDescription:
      '1 bis 7 Tage individuell je Fahrrad kalkuliert, ab Tag 8 mit festem Zusatzpreis. Direkt bei uns in Freiburg abholen.',
    heroFeatures: [
      'Schloss inklusive',
      'Helm kostenlos',
      'Sofort verfugbar',
      '100 EUR Kaution (bar)',
    ],
    heroPriceCard: {
      badge: 'Individuelle Preislogik',
      duration: '1-7 Tage',
      price: 'pro Fahrrad separat',
      perDay: 'manuell im Admin gepflegt',
      vs: 'ab Tag 8 automatisch mit Zusatzpreis',
      features: ['✔ Schloss', '✔ Helm', '✔ Sofort'],
    },
    signatureLabel: 'Urban Rental System',
    signatureText:
      'Entwickelt wie ein modernes Performance-Studio: schnelle Reservierung, klare Preise und direkte Abholung ohne Reibung.',
    signatureStats: [
      { value: '1-7 Tage', label: 'individuell pro Fahrrad' },
      { value: 'Helm + Schloss', label: 'Immer im Setup enthalten' },
    ],
    pricingCards: [
      {
        className: 'pcard-popular',
        topBadge: '🔥 Beliebt',
        label: 'Flexibel',
        duration: '1 bis 7 Tage',
        price: 'Individuelle Tagespreise',
        perDay: 'je Fahrrad separat gepflegt',
        features: ['Schloss inklusive', 'Helm kostenlos', 'Sofort verfugbar'],
        cta: 'Fahrrad auswahlen & jetzt reservieren',
        whatsapp: 'WhatsApp',
      },
      {
        className: 'pcard-best',
        topBadge: 'Individuelle Verlangerung',
        topBadgeClass: 'pcard-best-badge',
        label: 'Ab Tag 8',
        duration: '7-Tage-Basis + Aufschlag',
        price: 'pro Fahrrad konfiguriert',
        perDay: 'jeder weitere Tag mit festem Zusatzpreis',
        features: ['Schloss inklusive', 'Helm kostenlos', 'Sofort verfugbar'],
        cta: 'Fahrrad auswahlen & jetzt reservieren',
        whatsapp: 'WhatsApp',
      },
      {
        className: '',
        label: 'Verlangerung',
        duration: 'ab Tag 8',
        price: '7-Tage-Preis + Zusatz',
        perDay: 'fixer Aufschlag je weiterem Tag',
        features: ['Schloss inklusive', 'Helm kostenlos', 'Sofort verfugbar'],
        cta: 'Fahrrad auswahlen & jetzt reservieren',
        whatsapp: 'WhatsApp',
      },
    ],
    pricingExtras: [
      {
        duration: 'Tag 1-3',
        price: 'direkt am Fahrrad sichtbar',
        day: 'ohne versteckte Pauschale',
        cta: 'Buchen',
      },
      {
        duration: 'Tag 4-7',
        price: 'ebenfalls separat pflegbar',
        day: 'ideal fur Wochenmiete',
        cta: 'Buchen',
      },
      {
        duration: 'ab Tag 8',
        price: '7-Tage-Preis + Zusatz',
        day: 'pro weiterem Tag',
        cta: 'Buchen',
      },
    ],
    pricingInfo: [
      { title: 'Kaution', text: '100 EUR bar, wird bei Ruckgabe erstattet' },
      {
        title: 'Immer dabei',
        text: 'Schloss & Helm kostenlos - ohne Aufpreis',
      },
      {
        title: 'Offnungszeiten',
        text: 'Mo, Di, Mi, Do 13-17 · Fr 11-13 & 15-18 · Sa 11:30-17 · So geschlossen',
      },
    ],
    bikePriceFrom: 'ab',
    extraDayShort: '+1T',
    zoomImageAriaLabel: 'Bild vergrosern',
    lightboxAriaLabel: 'Bild vergrosert',
    lightboxCloseAriaLabel: 'Schliesen',
    lightboxPrevAriaLabel: 'Vorheriges Bild',
    lightboxNextAriaLabel: 'Nachstes Bild',
    reviewStarAriaSuffix: 'Sterne',
    bikeFactLabels: {
      type: 'Typ',
      category: 'Kategorie',
      frame: 'Rahmenhöhe',
      tire: 'Reifengröße',
      color: 'Farbe',
      tireUnit: 'Zoll',
    },
    extraDayPriceLabel: 'Ab Tag 8 je weiterer Tag',
    successEmailPrefix: 'Eine Bestatigung wurde an',
    successEmailSuffix: 'gesendet.',
    weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    emailLabel: 'E-Mail',
    placeholders: {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '+49 ...',
      notes: 'Besondere Wunsche, Fragen...',
    },
    bookingLanguages: BOOKING_LANGUAGE_OPTIONS,
    whatsappTitle: 'WhatsApp',
    bookingErrors: {
      busyRange:
        'Dieser Zeitraum enthalt bereits gebuchte Tage. Bitte wahlen Sie einen anderen Zeitraum.',
      choosePeriod: 'Bitte wahlen Sie einen Zeitraum aus.',
      invalidEnd: 'Das Enddatum darf nicht vor dem Startdatum liegen.',
      fullName: 'Bitte geben Sie Ihren vollstandigen Namen ein.',
      validEmail: 'Bitte geben Sie eine gultige E-Mail-Adresse ein.',
      generic: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    },
    addBikeLabel: 'Fahrrad hinzufugen',
    priceSummaryLabel: 'Preisübersicht',
    totalRentalLabel: 'Gesamtmiete',
    totalKautionLabel: 'Gesamtkaution',
    kautionInfoNotice:
      'Bitte beachten: Für jedes Fahrrad wird eine Kaution fällig. Die Kaution ist am Abholtag in bar mitzubringen und wird bei Rückgabe vollständig erstattet.',
    kautionSuccessReminder:
      'Bitte bringen Sie die Kaution am Abholtag in bar mit.',
  },
  en: {
    serviceHighlightsAria: 'Service highlights',
    heroChip: 'Bike Rental Freiburg',
    heroAccent: 'from €12',
    heroDescription:
      'Days 1 to 7 are priced individually per bike, from day 8 onward a fixed extra-day surcharge applies. Pick up directly at our Freiburg shop.',
    heroFeatures: [
      'Lock included',
      'Helmet free of charge',
      'Available immediately',
      'EUR 300 deposit (cash)',
    ],
    heroPriceCard: {
      badge: 'Individual pricing logic',
      duration: '1-7 days',
      price: 'configured per bike',
      perDay: 'managed manually in admin',
      vs: 'from day 8 with fixed surcharge',
      features: ['✔ Lock', '✔ Helmet', '✔ Instant'],
    },
    signatureLabel: 'Urban Rental System',
    signatureText:
      'Designed like a modern performance studio: fast reservation, clear pricing and frictionless pick-up.',
    signatureStats: [
      { value: '1-7 days', label: 'individual per bike' },
      { value: 'Helmet + Lock', label: 'Always included' },
    ],
    pricingCards: [
      {
        className: 'pcard-popular',
        topBadge: '🔥 Popular',
        label: 'Flexible',
        duration: '1 to 7 days',
        price: 'Individual daily pricing',
        perDay: 'configured separately per bike',
        features: ['Lock included', 'Helmet included', 'Available immediately'],
        cta: 'Choose bike & reserve now',
        whatsapp: 'WhatsApp',
      },
      {
        className: 'pcard-best',
        topBadge: 'Individual extension',
        topBadgeClass: 'pcard-best-badge',
        label: 'From day 8',
        duration: '7-day base + surcharge',
        price: 'configured per bike',
        perDay: 'each extra day adds a fixed surcharge',
        features: ['Lock included', 'Helmet included', 'Available immediately'],
        cta: 'Choose bike & reserve now',
        whatsapp: 'WhatsApp',
      },
      {
        className: '',
        label: 'Extension',
        duration: 'from day 8',
        price: '7-day price + add-on',
        perDay: 'fixed surcharge for each extra day',
        features: ['Lock included', 'Helmet included', 'Available immediately'],
        cta: 'Choose bike & reserve now',
        whatsapp: 'WhatsApp',
      },
    ],
    pricingExtras: [
      {
        duration: 'Days 1-3',
        price: 'shown directly on the bike',
        day: 'no hidden flat fees',
        cta: 'Book',
      },
      {
        duration: 'Days 4-7',
        price: 'also configurable separately',
        day: 'ideal for weekly rentals',
        cta: 'Book',
      },
      {
        duration: 'From day 8',
        price: '7-day price + surcharge',
        day: 'per additional day',
        cta: 'Book',
      },
    ],
    pricingInfo: [
      { title: 'Deposit', text: 'EUR 300 cash, refunded on return' },
      {
        title: 'Included',
        text: 'Lock & helmet included at no extra charge',
      },
      {
        title: 'Opening hours',
        text: 'Mon, Tue, Wed, Thu 13-17 · Fri 11-13 & 15-18 · Sat 11:30-17 · Sun closed',
      },
    ],
    bikePriceFrom: 'from',
    extraDayShort: '+1d',
    zoomImageAriaLabel: 'Zoom image',
    lightboxAriaLabel: 'Image enlarged',
    lightboxCloseAriaLabel: 'Close',
    lightboxPrevAriaLabel: 'Previous image',
    lightboxNextAriaLabel: 'Next image',
    reviewStarAriaSuffix: 'stars',
    bikeFactLabels: {
      type: 'Type',
      category: 'Category',
      frame: 'Frame height',
      tire: 'Tire size',
      color: 'Color',
      tireUnit: 'inch',
    },
    extraDayPriceLabel: 'From day 8 per extra day',
    successEmailPrefix: 'A confirmation was sent to',
    successEmailSuffix: '.',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    emailLabel: 'Email',
    placeholders: {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '+49 ...',
      notes: 'Special requests, questions...',
    },
    bookingLanguages: BOOKING_LANGUAGE_OPTIONS,
    whatsappTitle: 'WhatsApp',
    bookingErrors: {
      busyRange:
        'This period already contains booked days. Please choose another period.',
      choosePeriod: 'Please choose a rental period.',
      invalidEnd: 'The end date must not be before the start date.',
      fullName: 'Please enter your full name.',
      validEmail: 'Please enter a valid email address.',
      generic: 'An error occurred. Please try again.',
    },
    addBikeLabel: 'Add bike',
    priceSummaryLabel: 'Price overview',
    totalRentalLabel: 'Total rental',
    totalKautionLabel: 'Total deposit',
    kautionInfoNotice:
      'Please note: A deposit is required for each bike. Please bring the deposit in cash on the pick-up day — it will be fully refunded upon return.',
    kautionSuccessReminder:
      'Please bring the deposit in cash on the pick-up day.',
  },
  fr: {
    serviceHighlightsAria: 'Points forts du service',
    heroChip: 'Location de velo Freiburg',
    heroAccent: 'a partir de 8 €',
    heroDescription:
      'Les jours 1 a 7 sont calcules individuellement pour chaque velo, puis un supplement fixe s applique a partir du 8e jour. Retrait direct dans notre magasin a Freiburg.',
    heroFeatures: [
      'Antivol inclus',
      'Casque gratuit',
      'Disponible immediatement',
      'Depot de 100 EUR (especes)',
    ],
    heroPriceCard: {
      badge: 'Logique tarifaire individuelle',
      duration: '1-7 jours',
      price: 'par velo separement',
      perDay: 'gere manuellement dans l admin',
      vs: 'a partir du 8e jour avec supplement fixe',
      features: ['✔ Antivol', '✔ Casque', '✔ Immediat'],
    },
    signatureLabel: 'Systeme de location urbain',
    signatureText:
      'Concu comme un studio de performance moderne : reservation rapide, prix clairs et retrait sans friction.',
    signatureStats: [
      { value: '1-7 jours', label: 'individuel par velo' },
      { value: 'Casque + antivol', label: 'Toujours inclus' },
    ],
    pricingCards: [
      {
        className: 'pcard-popular',
        topBadge: '🔥 Populaire',
        label: 'Flexible',
        duration: '1 a 7 jours',
        price: 'Tarifs journaliers individuels',
        perDay: 'configures separement par velo',
        features: [
          'Antivol inclus',
          'Casque inclus',
          'Disponible immediatement',
        ],
        cta: 'Choisir un velo et reserver',
        whatsapp: 'WhatsApp',
      },
      {
        className: 'pcard-best',
        topBadge: 'Prolongation individuelle',
        topBadgeClass: 'pcard-best-badge',
        label: 'A partir du 8e jour',
        duration: 'Base 7 jours + supplement',
        price: 'configure par velo',
        perDay: 'chaque jour supplementaire ajoute un supplement fixe',
        features: [
          'Antivol inclus',
          'Casque inclus',
          'Disponible immediatement',
        ],
        cta: 'Choisir un velo et reserver',
        whatsapp: 'WhatsApp',
      },
      {
        className: '',
        label: 'Prolongation',
        duration: 'a partir du 8e jour',
        price: 'Prix 7 jours + supplement',
        perDay: 'supplement fixe par jour additionnel',
        features: [
          'Antivol inclus',
          'Casque inclus',
          'Disponible immediatement',
        ],
        cta: 'Choisir un velo et reserver',
        whatsapp: 'WhatsApp',
      },
    ],
    pricingExtras: [
      {
        duration: 'Jours 1-3',
        price: 'visible directement sur le velo',
        day: 'sans forfait cache',
        cta: 'Reserver',
      },
      {
        duration: 'Jours 4-7',
        price: 'egalement parametrable separement',
        day: 'ideal pour une semaine',
        cta: 'Reserver',
      },
      {
        duration: 'A partir du 8e jour',
        price: 'Prix 7 jours + supplement',
        day: 'par jour supplementaire',
        cta: 'Reserver',
      },
    ],
    pricingInfo: [
      { title: 'Depot', text: '100 EUR en especes, rembourse au retour' },
      {
        title: 'Toujours inclus',
        text: 'Antivol et casque inclus sans supplement',
      },
      {
        title: 'Horaires',
        text: 'Lun, Mar, Jeu 11-17:30 · Mer 14-17:30 · Ven 11-13 & 15-18 · Sam 11:30-17',
      },
    ],
    bikePriceFrom: 'a partir de',
    extraDayShort: '+1j',
    zoomImageAriaLabel: 'Agrandir l image',
    lightboxAriaLabel: 'Image agrandie',
    lightboxCloseAriaLabel: 'Fermer',
    lightboxPrevAriaLabel: 'Image precedente',
    lightboxNextAriaLabel: 'Image suivante',
    reviewStarAriaSuffix: 'etoiles',
    bikeFactLabels: {
      type: 'Type',
      category: 'Categorie',
      frame: 'Hauteur de cadre',
      tire: 'Taille des pneus',
      color: 'Couleur',
      tireUnit: 'pouces',
    },
    extraDayPriceLabel: 'A partir du 8e jour par jour supplementaire',
    successEmailPrefix: 'Une confirmation a ete envoyee a',
    successEmailSuffix: '.',
    weekdays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
    emailLabel: 'E-mail',
    placeholders: {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '+49 ...',
      notes: 'Demandes speciales, questions...',
    },
    bookingLanguages: BOOKING_LANGUAGE_OPTIONS,
    whatsappTitle: 'WhatsApp',
    bookingErrors: {
      busyRange:
        'Cette periode contient deja des jours reserves. Veuillez choisir une autre periode.',
      choosePeriod: 'Veuillez choisir une periode de location.',
      invalidEnd:
        'La date de fin ne peut pas etre anterieure a la date de debut.',
      fullName: 'Veuillez saisir votre nom complet.',
      validEmail: 'Veuillez saisir une adresse e-mail valide.',
      generic: 'Une erreur est survenue. Veuillez reessayer.',
    },
    addBikeLabel: 'Ajouter un velo',
    priceSummaryLabel: 'Apercu des prix',
    totalRentalLabel: 'Location totale',
    totalKautionLabel: 'Depot total',
    kautionInfoNotice:
      'Attention : un dépôt est exigé pour chaque vélo. Veuillez apporter le dépôt en espèces le jour du retrait — il vous sera intégralement remboursé à la restitution.',
    kautionSuccessReminder:
      'Veuillez apporter le dépôt en espèces le jour du retrait.',
  },
  tr: {
    serviceHighlightsAria: 'Servis öne çıkanlar',
    heroChip: 'Freiburg Bisiklet Kiralama',
    heroAccent: '8 € ile başlayan fiyatlarla',
    heroDescription:
      '1 ile 7 gün arası fiyat her bisiklet için ayrı hesaplanır, 8. günden itibaren sabit ek gün ücreti uygulanır. Teslim almayı doğrudan Freiburg mağazamızdan yapabilirsiniz.',
    heroFeatures: [
      'Kilit dahil',
      'Kask ücretsiz',
      'Hemen mevcut',
      '100 EUR depozito (nakit)',
    ],
    heroPriceCard: {
      badge: 'Bireysel fiyat mantığı',
      duration: '1-7 gün',
      price: 'bisiklet bazında ayrı',
      perDay: 'yönetim panelinden manuel girilir',
      vs: '8. günden sonra sabit ek ücret',
      features: ['✔ Kilit', '✔ Kask', '✔ Hazır'],
    },
    signatureLabel: 'Şehir içi kiralama sistemi',
    signatureText:
      'Modern bir performans stüdyosu gibi tasarlandı: hızlı rezervasyon, net fiyatlar ve sorunsuz teslim alma.',
    signatureStats: [
      { value: '1-7 gün', label: 'bisiklet bazında bireysel' },
      { value: 'Kask + kilit', label: 'Her zaman dahil' },
    ],
    pricingCards: [
      {
        className: 'pcard-popular',
        topBadge: '🔥 Popüler',
        label: 'Esnek',
        duration: '1 ila 7 gün',
        price: 'Bireysel günlük fiyatlar',
        perDay: 'her bisiklet için ayrı tanımlanır',
        features: ['Kilit dahil', 'Kask dahil', 'Hemen mevcut'],
        cta: 'Bisiklet seç ve hemen rezerve et',
        whatsapp: 'WhatsApp',
      },
      {
        className: 'pcard-best',
        topBadge: 'Bireysel uzatma',
        topBadgeClass: 'pcard-best-badge',
        label: '8. günden itibaren',
        duration: '7 gün taban + ek ücret',
        price: 'bisiklet bazında ayarlanır',
        perDay: 'her ek gün için sabit ek ücret',
        features: ['Kilit dahil', 'Kask dahil', 'Hemen mevcut'],
        cta: 'Bisiklet seç ve hemen rezerve et',
        whatsapp: 'WhatsApp',
      },
      {
        className: '',
        label: 'Uzatma',
        duration: '8. günden itibaren',
        price: '7 günlük fiyat + ek',
        perDay: 'her ek gün için sabit ücret',
        features: ['Kilit dahil', 'Kask dahil', 'Hemen mevcut'],
        cta: 'Bisiklet seç ve hemen rezerve et',
        whatsapp: 'WhatsApp',
      },
    ],
    pricingExtras: [
      {
        duration: 'Gün 1-3',
        price: 'doğrudan bisiklet üzerinde görünür',
        day: 'gizli sabit ücret yok',
        cta: 'Rezerve et',
      },
      {
        duration: 'Gün 4-7',
        price: 'ayrı ayrı düzenlenebilir',
        day: 'haftalık kiralama için ideal',
        cta: 'Rezerve et',
      },
      {
        duration: '8. günden itibaren',
        price: '7 günlük fiyat + ek',
        day: 'her ek gün için',
        cta: 'Rezerve et',
      },
    ],
    pricingInfo: [
      { title: 'Depozito', text: '100 EUR nakit, iade sırasında geri verilir' },
      {
        title: 'Dahil olanlar',
        text: 'Kilit ve kask ekstra ücret olmadan dahildir',
      },
      {
        title: 'Çalışma saatleri',
        text: 'Pzt, Sal, Per 11-17:30 · Çar 14-17:30 · Cum 11-13 & 15-18 · Cmt 11:30-17',
      },
    ],
    bikePriceFrom: 'başlayan',
    extraDayShort: '+1G',
    zoomImageAriaLabel: 'Görseli büyüt',
    lightboxAriaLabel: 'Büyütülmüş görsel',
    lightboxCloseAriaLabel: 'Kapat',
    lightboxPrevAriaLabel: 'Önceki görsel',
    lightboxNextAriaLabel: 'Sonraki görsel',
    reviewStarAriaSuffix: 'yıldız',
    bikeFactLabels: {
      type: 'Tip',
      category: 'Kategori',
      frame: 'Kadro yüksekliği',
      tire: 'Lastik boyutu',
      color: 'Renk',
      tireUnit: 'inç',
    },
    extraDayPriceLabel: '8. günden sonra her ek gün',
    successEmailPrefix: 'Bir onay e-postası şu adrese gönderildi',
    successEmailSuffix: '.',
    weekdays: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    emailLabel: 'E-posta',
    placeholders: {
      firstName: 'Ali',
      lastName: 'Yılmaz',
      email: 'ali@example.com',
      phone: '+49 ...',
      notes: 'Özel istekleriniz, sorularınız...',
    },
    bookingLanguages: BOOKING_LANGUAGE_OPTIONS,
    whatsappTitle: 'WhatsApp',
    bookingErrors: {
      busyRange:
        'Bu tarih aralığında zaten rezerve edilmiş günler var. Lütfen farklı bir aralık seçin.',
      choosePeriod: 'Lütfen bir kiralama aralığı seçin.',
      invalidEnd: 'Bitiş tarihi başlangıç tarihinden önce olamaz.',
      fullName: 'Lütfen ad ve soyadınızı girin.',
      validEmail: 'Lütfen geçerli bir e-posta adresi girin.',
      generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    },
    addBikeLabel: 'Bisiklet ekle',
    priceSummaryLabel: 'Fiyat özeti',
    totalRentalLabel: 'Toplam kiralama',
    totalKautionLabel: 'Toplam depozito',
    kautionInfoNotice:
      'Lütfen dikkat: Her bisiklet için depozito alınmaktadır. Depozitoyu teslim alma günü nakit olarak yanınızda getirmenizi rica ederiz — iade sırasında tamamen iade edilecektir.',
    kautionSuccessReminder:
      'Lütfen depozitoyu teslim alma günü nakit olarak yanınızda getirin.',
  },
  ...EXTENDED_RENTAL_PAGE_COPY,
};

interface BikeSlot {
  slotId: number;
  bike: PublicRentalBicycle;
  busyPeriods: { start: Date; end: Date; type: string }[];
  busyPeriodsLoading: boolean;
  calculatedPrice: number | null;
  rahmennummer: string;
  farbe: string;
  kaution: number | null;
  imageIndex: number;
}

@Component({
  selector: 'app-fahrradverleih',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="rental-page">
      <!-- ═══ HERO BANNER ═══ -->
      <header class="rental-hero">
        <div class="rental-hero-bg" aria-hidden="true">
          <div class="rental-hero-radial"></div>
          <div class="rental-hero-grain"></div>
        </div>
        <div class="container rental-hero-inner">
          <div class="rental-hero-left">
            <span class="rental-hero-chip">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6l-4 8h6l-2 3.5" />
                <path d="M5.5 17.5L9 9h3" />
              </svg>
              {{ pageCopy().heroChip }}
            </span>
            <h1 class="rental-hero-h1">
              {{ t().rentalHeroTitle }}<br /><span class="rental-hero-accent">{{
                pageCopy().heroAccent
              }}</span>
            </h1>
            <p class="rental-hero-sub">
              {{ pageCopy().heroDescription }}
            </p>
            <div class="rental-hero-features">
              <span
                class="rfeat"
                *ngFor="let feature of pageCopy().heroFeatures"
                ><svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" /></svg
                >{{ feature }}</span
              >
            </div>
            <div class="rental-hero-ctas">
              <a [routerLink]="bookingPath()" class="hero-cta-scroll">
                {{ t().rentalHeroScrollCta }}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                [routerLink]="['/' + lang(), rentalCatalogSlug()]"
                class="hero-cta-scroll"
              >
                {{ t().viewAll }} ({{ t().rentalCatalogLabel }}) →
              </a>
              <a
                href="https://wa.me/4915566300011"
                target="_blank"
                rel="noopener noreferrer"
                class="hero-cta-wa"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
                  />
                </svg>
                {{ t().rentalHeroWaCta }}
              </a>
            </div>
          </div>
          <!-- <div class="rental-hero-right">
            <div class="rental-hero-price-card">
              <div class="rhpc-badge">{{ pageCopy().heroPriceCard.badge }}</div>
              <div class="rhpc-duration">
                {{ pageCopy().heroPriceCard.duration }}
              </div>
              <div class="rhpc-price">{{ pageCopy().heroPriceCard.price }}</div>

              <div class="rhpc-vs">{{ pageCopy().heroPriceCard.vs }}</div>
              <div class="rhpc-features">
                <span
                  *ngFor="let feature of pageCopy().heroPriceCard.features"
                  >{{ feature }}</span
                >
              </div>
            </div>
          </div> -->
        </div>
      </header>

      <div class="container rental-body">
        <!-- <section
          class="rental-signature-band"
          [attr.aria-label]="pageCopy().serviceHighlightsAria"
        >
          <div class="signature-editorial">
            <span class="section-label">{{ pageCopy().signatureLabel }}</span>
            <p>{{ pageCopy().signatureText }}</p>
          </div>
          <div class="signature-stat-grid">
            <article
              class="signature-stat-card"
              *ngFor="let stat of pageCopy().signatureStats"
            >
              <span class="signature-stat-value">{{ stat.value }}</span>
              <span class="signature-stat-label">{{ stat.label }}</span>
            </article>
          </div>
        </section> -->

        <!-- Legacy Seat-Map hidden: booking now uses step-by-step flow -->
        <section class="bikes-section" id="fahrrad-waehlen" *ngIf="false">
          <div class="section-header">
            <span class="section-label">{{
              t().bikeRentalAvailableLabel
            }}</span>
            <h2 class="bikes-title">{{ t().bikeRentalAvailableTitle }}</h2>
            <p class="bikes-subtitle">
              {{ t().rentalBikesSub }}
            </p>
          </div>

          <!-- Loading -->
          <div class="seat-map" *ngIf="bikesLoading()">
            <div class="seat-skeleton" *ngFor="let i of [1, 2, 3, 4]"></div>
          </div>

          <!-- Empty -->
          <div
            class="bikes-empty"
            *ngIf="!bikesLoading() && bikes().length === 0"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path
                d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"
              />
            </svg>
            <p>{{ t().bikeRentalNoBikes }}</p>
          </div>

          <!-- Seat cards -->
          <div class="seat-map" *ngIf="!bikesLoading() && bikes().length > 0">
            <div
              class="seat-card"
              *ngFor="let bike of bikes()"
              [class.seat-selected]="isSelectedBike(bike.id)"
              (click)="toggleBike(bike)"
            >
              <div class="seat-img-wrap">
                <img
                  *ngIf="bike.images.length > 0"
                  [src]="getImageUrl(bike.images[0].filePath)"
                  [alt]="bike.marke + ' ' + bike.modell"
                  loading="lazy"
                />
                <div
                  class="seat-img-placeholder"
                  *ngIf="bike.images.length === 0"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path
                      d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3"
                    />
                  </svg>
                </div>
                <span class="seat-type-badge" *ngIf="bike.fahrradtyp">{{
                  bike.fahrradtyp
                }}</span>
              </div>
              <div class="seat-info">
                <div class="seat-name">{{ bike.marke }} {{ bike.modell }}</div>
                <div class="seat-specs">
                  <span *ngIf="bike.rahmengroesse" class="spec-row">
                    <span class="spec-label">{{
                      pageCopy().bikeFactLabels.frame
                    }}</span>
                    {{ bike.rahmengroesse }} cm
                  </span>
                  <span *ngIf="bike.reifengroesse" class="spec-row">
                    <span class="spec-label">{{
                      pageCopy().bikeFactLabels.tire
                    }}</span>
                    {{ bike.reifengroesse }}
                    {{ pageCopy().bikeFactLabels.tireUnit }}
                  </span>
                  <span *ngIf="bike.farbe" class="spec-row">
                    <span class="spec-label">{{
                      pageCopy().bikeFactLabels.color
                    }}</span>
                    {{ bike.farbe }}
                  </span>
                </div>
                <div class="seat-price-from" *ngIf="getMinPrice(bike) as minP">
                  {{ pageCopy().bikePriceFrom }} {{ minP | number: '1.0-0' }} €
                </div>
                <div
                  class="seat-price-list"
                  *ngIf="getPriceLines(bike).length > 0"
                >
                  <span
                    class="seat-price-pill"
                    *ngFor="let item of getPriceLines(bike)"
                  >
                    {{ item.shortLabel }} {{ item.price | number: '1.0-0' }}€
                  </span>
                  <span
                    class="seat-price-pill seat-price-pill-accent"
                    *ngIf="bike.preise.additionalDayAfter7 != null"
                  >
                    {{ pageCopy().extraDayShort }}
                    {{ bike.preise.additionalDayAfter7 | number: '1.0-0' }}€
                  </span>
                </div>
              </div>
              <div class="seat-check-mark" *ngIf="isSelectedBike(bike.id)">
                <span class="seat-slot-num">{{ getSlotNumber(bike.id) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- FAQ -->
        <section class="rental-faq-section" aria-labelledby="rental-faq-title">
          <div class="section-header">
            <span class="section-label">{{ rentalFaq().sectionLabel }}</span>
            <h2 class="bikes-title" id="rental-faq-title">
              {{ rentalFaq().sectionTitle }}
            </h2>
          </div>

          <div class="rental-faq-grid">
            <article
              class="rental-faq-card"
              *ngFor="let item of rentalFaq().items"
            >
              <h3>{{ item.question }}</h3>
              <ul>
                <li *ngFor="let answer of item.answers">{{ answer }}</li>
              </ul>
            </article>
          </div>
        </section>

        <!-- Internal Links -->
        <section class="rental-links-section">
          <h2 class="rental-links-title">{{ t().rentalLinksTitle }}</h2>
          <ul class="rental-links-list">
            <li *ngFor="let sub of rentalSubCategories()">
              <a [routerLink]="sub.url">{{ sub.label }}</a>
            </li>
            <li>
              <a [routerLink]="['/' + lang() + '/' + rentalCatalogSlug()]">
                {{ t().rentalLinkCatalog }}
              </a>
            </li>
            <li>
              <a [routerLink]="['/' + lang() + '/' + rentalGuideSlug()]">
                {{ t().rentalLinkGuide }}
              </a>
            </li>
            <li>
              <a [routerLink]="['/' + lang() + '/' + toursSlug()]">
                {{ t().bikeToursNav }}
              </a>
            </li>
            <li>
              <a [routerLink]="['/' + lang() + '/faq']">
                {{ t().rentalLinkFaq }}
              </a>
            </li>
          </ul>
        </section>

        <!-- Booking CTA → dedicated booking page (flow no longer embedded here) -->
        <section class="booking-panel booking-cta-section" id="booking-panel">
          <div class="booking-cta-inner">
            <div class="booking-cta-icon" aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M9 16l2 2 4-4" />
              </svg>
            </div>
            <h2 class="booking-cta-title">
              {{
                t().rentalSteps?.bookingCtaTitle ?? 'Jetzt Fahrrad reservieren'
              }}
            </h2>
            <p class="booking-cta-text">
              {{
                t().rentalSteps?.bookingCtaText ??
                  'In 4 einfachen Schritten: Termin wählen, Fahrrad aussuchen, Daten eintragen – fertig.'
              }}
            </p>
            <a [routerLink]="bookingPath()" class="booking-cta-btn">
              {{ t().rentalHeroScrollCta }}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>

        <!-- Note -->
        <section class="note-banner">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong>{{ t().bikeRentalNoteTitle }}</strong>
            <p>{{ t().bikeRentalNoteText }}</p>
          </div>
        </section>

        <!-- WhatsApp Contact -->
        <section class="whatsapp-section">
          <a
            [href]="getWhatsappLink()"
            target="_blank"
            rel="noopener"
            class="whatsapp-card"
          >
            <div class="wa-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
            </div>
            <div class="wa-content">
              <h3>{{ pageCopy().whatsappTitle }}</h3>
              <p>+49 155 6630 0011</p>
              <span class="wa-hint">{{ t().contactWhatsappHint }}</span>
            </div>
            <svg
              class="wa-arrow"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </section>

        <!-- Customer Reviews -->
        <section class="reviews-section" id="reviews">
          <div class="reviews-header">
            <span class="section-chip">★ {{ t().rentalReviewsTitle }}</span>
            <h2 class="reviews-title">{{ t().rentalReviewsSubtitle }}</h2>
          </div>

          <!-- Reviews list -->
          <div *ngIf="reviewsLoading()" class="reviews-loading">
            <div class="reviews-spinner"></div>
          </div>

          <div
            *ngIf="
              !reviewsLoading() &&
              reviews().length === 0 &&
              !reviewFormSuccess()
            "
            class="reviews-empty"
          >
            {{ t().rentalReviewsNoReviews }}
          </div>

          <div
            class="reviews-grid"
            *ngIf="!reviewsLoading() && reviews().length > 0"
          >
            <div class="review-card" *ngFor="let r of reviews()">
              <div class="rc-top">
                <div class="rc-avatar">{{ r.ad.charAt(0).toUpperCase() }}</div>
                <div class="rc-meta">
                  <div class="rc-name">{{ r.ad }}</div>
                  <div class="rc-stars">
                    <span
                      *ngFor="let s of starsArr(r.sterne)"
                      class="rstar filled"
                      >★</span
                    >
                    <span
                      *ngFor="let s of emptyStarsArr(r.sterne)"
                      class="rstar empty"
                      >★</span
                    >
                  </div>
                </div>
                <div class="rc-date">
                  {{ r.createdAt | date: 'dd.MM.yyyy' }}
                </div>
              </div>
              <p class="rc-text">{{ r.yorum }}</p>
            </div>
          </div>

          <!-- Write a review form -->
          <div class="review-form-wrap">
            <h3 class="review-form-title">{{ t().rentalReviewsFormTitle }}</h3>

            <div *ngIf="reviewFormSuccess()" class="review-form-success">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ t().rentalReviewsFormSuccess }}
            </div>

            <form
              *ngIf="!reviewFormSuccess()"
              class="review-form"
              (ngSubmit)="submitReview()"
            >
              <div class="rform-row">
                <div class="rform-field">
                  <label>{{ t().rentalReviewsFormName }} *</label>
                  <input
                    type="text"
                    [(ngModel)]="reviewForm.ad"
                    name="rvAd"
                    placeholder="{{ t().rentalReviewsFormName }}"
                  />
                </div>
                <div class="rform-field">
                  <label>{{ t().rentalReviewsFormEmail }}</label>
                  <input
                    type="email"
                    [(ngModel)]="reviewForm.email"
                    name="rvEmail"
                    placeholder="{{ t().rentalReviewsFormEmail }}"
                  />
                </div>
              </div>

              <div class="rform-field">
                <label>{{ t().rentalReviewsFormStars }}</label>
                <div class="star-picker">
                  <button
                    type="button"
                    *ngFor="let n of [1, 2, 3, 4, 5]"
                    class="star-btn"
                    [class.selected]="reviewForm.sterne >= n"
                    (click)="reviewForm.sterne = n"
                    [attr.aria-label]="
                      n + ' ' + pageCopy().reviewStarAriaSuffix
                    "
                  >
                    ★
                  </button>
                </div>
              </div>

              <div class="rform-field">
                <label>{{ t().rentalReviewsFormComment }} *</label>
                <textarea
                  [(ngModel)]="reviewForm.yorum"
                  name="rvYorum"
                  rows="4"
                  placeholder="{{ t().rentalReviewsFormComment }}"
                ></textarea>
              </div>

              <div *ngIf="reviewFormError()" class="review-form-error">
                {{ reviewFormError() }}
              </div>

              <button
                type="submit"
                class="rform-submit"
                [disabled]="reviewFormSending()"
              >
                <div *ngIf="reviewFormSending()" class="submit-spinner"></div>
                {{
                  reviewFormSending()
                    ? t().rentalReviewsFormSending
                    : t().rentalReviewsFormSubmit
                }}
              </button>
            </form>
          </div>
        </section>

        <!-- Back -->
        <section class="rental-cta">
          <a [routerLink]="['/' + lang()]" class="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {{ t().home }}
          </a>
        </section>
      </div>

      <!-- Lightbox / Image zoom overlay -->
      <div
        class="lightbox"
        *ngIf="lightboxOpen() && getLightboxSlot()"
        (click)="closeLightbox()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="pageCopy().lightboxAriaLabel"
      >
        <button
          type="button"
          class="lightbox-close"
          (click)="closeLightbox(); $event.stopPropagation()"
          [attr.aria-label]="pageCopy().lightboxCloseAriaLabel"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <button
          type="button"
          class="lightbox-nav lightbox-prev"
          *ngIf="getLightboxSlot()!.bike.images.length > 1"
          (click)="lightboxPrev(); $event.stopPropagation()"
          [attr.aria-label]="pageCopy().lightboxPrevAriaLabel"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div class="lightbox-stage" (click)="$event.stopPropagation()">
          <img
            *ngIf="getSlotImagePath(getLightboxSlot()!) as p"
            [src]="getImageUrl(p)"
            [alt]="
              getLightboxSlot()!.bike.marke +
              ' ' +
              getLightboxSlot()!.bike.modell
            "
            [class.zoomed]="lightboxZoomed()"
            (click)="toggleLightboxZoom()"
            draggable="false"
          />
        </div>

        <button
          type="button"
          class="lightbox-nav lightbox-next"
          *ngIf="getLightboxSlot()!.bike.images.length > 1"
          (click)="lightboxNext(); $event.stopPropagation()"
          [attr.aria-label]="pageCopy().lightboxNextAriaLabel"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <div
          class="lightbox-counter"
          *ngIf="getLightboxSlot()!.bike.images.length > 1"
        >
          {{ getLightboxSlot()!.imageIndex + 1 }} /
          {{ getLightboxSlot()!.bike.images.length }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rental-page {
        --rental-display-font:
          'Bahnschrift', 'Aptos Display', 'Segoe UI Variable Display',
          'Trebuchet MS', sans-serif;
        position: relative;
        background:
          radial-gradient(
            circle at top left,
            rgba(255, 87, 34, 0.12),
            transparent 28%
          ),
          radial-gradient(
            circle at 85% 18%,
            rgba(255, 184, 0, 0.08),
            transparent 22%
          ),
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.01),
            rgba(255, 255, 255, 0)
          );
        font-family: var(--font-family);
      }

      .rental-page::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 72px 72px;
        mask-image: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.35),
          transparent 78%
        );
        pointer-events: none;
        opacity: 0.16;
      }

      .rental-body,
      .rental-hero-inner {
        position: relative;
        z-index: 1;
      }

      .section-label {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.7);
      }

      .section-label::before {
        content: '';
        width: 24px;
        height: 1px;
        background: linear-gradient(90deg, var(--color-accent), transparent);
      }

      .pricing-title,
      .bikes-title,
      .bp-bike-name,
      .bp-success h3,
      .rental-hero-h1,
      .pcard-duration,
      .rhpc-price {
        font-family: var(--rental-display-font);
      }

      /* ═══ RENTAL HERO ═══ */
      .rental-hero {
        position: relative;
        background: var(--color-bg);
        overflow: hidden;
        padding: 6rem 0 4rem;
        border-bottom: 1px solid var(--color-border);
      }
      .rental-hero-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .rental-hero-radial {
        position: absolute;
        top: -200px;
        left: -100px;
        width: 700px;
        height: 700px;
        background: radial-gradient(
          ellipse,
          rgba(255, 87, 34, 0.12) 0%,
          transparent 65%
        );
      }
      .rental-hero-grain {
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        opacity: 0.5;
      }
      .rental-hero-inner {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 3.5rem;
        align-items: center;
      }
      .rental-hero-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.85rem;
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.2);
        border-radius: 3rem;
        color: var(--color-accent);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 1.25rem;
      }
      .rental-hero-h1 {
        font-size: clamp(2rem, 5vw, 3.2rem);
        font-weight: 900;
        color: var(--color-text);
        line-height: 0.96;
        letter-spacing: -0.05em;
        margin: 0 0 1rem;
        max-width: 8ch;
      }
      .rental-hero-accent {
        color: var(--color-accent);
        text-shadow: 0 0 28px rgba(255, 87, 34, 0.16);
      }
      .rental-hero-sub {
        font-size: 1.02rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.8;
        margin: 0 0 1.75rem;
        max-width: 580px;
      }
      .rental-hero-features {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        margin-bottom: 2rem;
      }
      .rfeat {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.84rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        padding: 0.48rem 0.78rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 999px;
        backdrop-filter: blur(10px);
      }
      .rfeat svg {
        color: #22c55e;
        flex-shrink: 0;
      }
      .rental-hero-ctas {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }
      .hero-cta-scroll {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        background: linear-gradient(135deg, #ff5722, #e64a19);
        color: #fff;
        font-size: 0.95rem;
        font-weight: 700;
        padding: 0.95rem 1.55rem;
        border-radius: 3rem;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition:
          opacity 0.2s,
          transform 0.2s;
        box-shadow: 0 18px 40px rgba(255, 87, 34, 0.28);
      }
      .hero-cta-scroll:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .hero-cta-wa {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.62);
        text-decoration: none;
        transition:
          color 0.2s,
          gap 0.2s;
      }
      .hero-cta-wa:hover {
        color: #fff;
        gap: 0.6rem;
      }
      /* Hero right card */
      .rental-hero-right {
        position: relative;
      }
      .rental-hero-price-card {
        background: linear-gradient(
          135deg,
          rgba(255, 87, 34, 0.14) 0%,
          rgba(255, 152, 0, 0.08) 100%
        );
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 28px;
        padding: 2.25rem 1.9rem;
        text-align: center;
        position: relative;
        overflow: hidden;
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.26),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(18px);
      }
      .rental-hero-price-card::before {
        content: '';
        position: absolute;
        top: -60px;
        right: -60px;
        width: 200px;
        height: 200px;
        background: radial-gradient(
          circle,
          rgba(255, 87, 34, 0.15) 0%,
          transparent 65%
        );
        pointer-events: none;
      }
      .rhpc-badge {
        display: inline-block;
        background: linear-gradient(90deg, #ff8a00, var(--color-accent));
        color: #fff;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.38rem 0.9rem;
        border-radius: 3rem;
        margin-bottom: 1.25rem;
      }
      .rhpc-duration {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-secondary);
        margin-bottom: 0.25rem;
      }
      .rhpc-price {
        font-size: 3.5rem;
        font-weight: 900;
        color: var(--color-accent);
        line-height: 1;
        letter-spacing: -0.04em;
        margin-bottom: 0.25rem;
      }
      .rhpc-per-day {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.2rem;
      }
      .rhpc-vs {
        font-size: 0.78rem;
        color: var(--color-text-secondary);
        text-decoration: line-through;
        margin-bottom: 1rem;
      }
      .rhpc-features {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.75rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: #22c55e;
      }

      .rental-signature-band {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
        gap: 1.25rem;
        margin: -1.2rem 0 2.75rem;
        align-items: stretch;
        padding: 1.15rem;
        border-radius: 30px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background:
          linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.055),
            rgba(255, 255, 255, 0.01)
          ),
          rgba(15, 23, 42, 0.28);
        box-shadow:
          0 18px 44px rgba(0, 0, 0, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(18px) saturate(125%);
        -webkit-backdrop-filter: blur(18px) saturate(125%);
      }

      .rental-signature-band::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          circle at top left,
          rgba(255, 255, 255, 0.08),
          transparent 34%
        );
        pointer-events: none;
      }

      .signature-editorial,
      .signature-stat-card {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background:
          linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.065),
            rgba(255, 255, 255, 0.015)
          ),
          rgba(30, 41, 59, 0.58);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .signature-editorial {
        padding: 1.5rem 1.5rem 1.45rem;
      }

      .signature-editorial p {
        margin: 1rem 0 0;
        font-size: 0.95rem;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.72);
        max-width: 44ch;
      }

      .signature-stat-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.25rem;
      }

      .signature-stat-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 132px;
        padding: 1.35rem 1.2rem;
      }

      .signature-stat-card::before,
      .pricing-section::before,
      .bikes-section::before,
      .booking-panel::before,
      .whatsapp-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.08),
          transparent 40%
        );
        pointer-events: none;
      }

      .signature-stat-value {
        font-family: var(--rental-display-font);
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #fff;
      }

      .signature-stat-label {
        font-size: 0.78rem;
        line-height: 1.55;
        color: rgba(255, 255, 255, 0.64);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      /* ═══ PRICING SECTION ═══ */
      .pricing-section {
        position: relative;
        padding: 2rem 1.5rem 2rem;
        margin-bottom: 2rem;
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.16);
      }
      .pricing-header {
        text-align: center;
        margin-bottom: 2.5rem;
      }
      .pricing-title {
        font-size: clamp(1.5rem, 3vw, 2rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0.5rem 0 0.5rem;
        letter-spacing: -0.02em;
      }
      .pricing-sub {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.62);
        margin: 0;
      }
      /* Main 3 price cards */
      .pricing-main-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
        margin-bottom: 1.25rem;
      }
      .pcard {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 2.1rem 1.55rem 1.5rem;
        border-radius: 22px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.018)
          ),
          var(--color-surface);
        position: relative;
        transition:
          border-color 0.2s,
          transform 0.2s,
          box-shadow 0.2s;
        overflow: visible;
      }
      .pcard:hover {
        border-color: rgba(255, 255, 255, 0.22);
        transform: translateY(-4px);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
      }
      .pcard-popular {
        border-color: var(--color-accent);
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 87, 34, 0.05) 100%
        );
      }
      .pcard-best {
        border-color: #f59e0b;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(245, 158, 11, 0.08) 100%
        );
      }
      .pcard-top-badge {
        position: absolute;
        top: -13px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-accent);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        padding: 0.22rem 0.7rem;
        border-radius: 3rem;
        white-space: nowrap;
      }
      .pcard-best-badge {
        background: #d97706;
      }
      .pcard-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.55);
        margin-top: 0.5rem;
      }
      .pcard-duration {
        font-size: 2rem;
        font-weight: 900;
        color: var(--color-text);
        line-height: 1;
        letter-spacing: -0.02em;
      }
      .pcard-popular .pcard-duration,
      .pcard-popular .pcard-price {
        color: var(--color-accent);
      }
      .pcard-best .pcard-duration,
      .pcard-best .pcard-price {
        color: #d97706;
      }
      .pcard-price {
        font-size: 2.8rem;
        font-weight: 900;
        color: var(--color-text);
        line-height: 1;
        letter-spacing: -0.03em;
      }
      .pcard-per-day {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.62);
        font-weight: 600;
      }
      .pcard-features {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        flex: 1;
      }
      .pcard-features li {
        font-size: 0.82rem;
        color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .pcard-features li::before {
        content: '✔';
        color: #22c55e;
        font-size: 0.72rem;
        flex-shrink: 0;
      }
      .pcard-cta-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        background: linear-gradient(135deg, #ff5722, #e64a19);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 700;
        padding: 0.75rem 1rem;
        border-radius: 2rem;
        border: none;
        cursor: pointer;
        width: 100%;
        text-decoration: none;
        transition:
          opacity 0.2s,
          transform 0.2s;
        box-shadow: 0 6px 20px rgba(255, 87, 34, 0.25);
      }
      .pcard-cta-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .pcard-cta-wa {
        display: block;
        text-align: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.45);
        text-decoration: none;
        padding: 0.35rem 0;
        transition: color 0.2s;
      }
      .pcard-cta-wa:hover {
        color: #25d366;
      }
      /* Extra compact price row */
      .pricing-extra-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .pextra-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.025);
        overflow: hidden;
      }
      .pextra-dur {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text);
        min-width: 70px;
      }
      .pextra-price {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-accent);
      }
      .pextra-day {
        font-size: 0.72rem;
        color: var(--color-text-secondary);
        flex: 1;
      }
      .pextra-cta {
        font-size: 0.75rem;
        font-weight: 700;
        color: #fff;
        text-decoration: none;
        white-space: nowrap;
        padding: 0.3rem 0.7rem;
        border-radius: 2rem;
        background: linear-gradient(135deg, #ff5722, #e64a19);
        border: none;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .pextra-cta:hover {
        opacity: 0.85;
      }
      /* Info bar */
      .pricing-info-bar {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
      }
      .pinfo-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .pinfo-item svg {
        color: var(--color-accent);
        flex-shrink: 0;
        margin-top: 2px;
      }
      .pinfo-item strong {
        display: block;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.2rem;
      }
      .pinfo-item span {
        font-size: 0.78rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      .rental-body {
        padding-top: 0;
        padding-bottom: 4rem;
      }

      .bike-img-count {
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        backdrop-filter: blur(4px);
      }

      /* ── Note Banner ── */
      .note-banner {
        position: relative;
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1.35rem 1.5rem;
        background: linear-gradient(
          90deg,
          rgba(255, 87, 34, 0.09),
          rgba(255, 255, 255, 0.03)
        );
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 4px solid var(--color-accent);
        border-radius: 18px;
        margin-bottom: 3rem;
        overflow: hidden;
      }

      .note-banner svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--color-accent);
      }

      .note-banner strong {
        font-family: var(--rental-display-font);
        display: block;
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text);
        margin-bottom: 0.25rem;
      }

      .note-banner p {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.65;
        margin: 0;
      }

      /* ── Internal Links ── */
      .rental-links-section {
        padding: 1.5rem 0;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        margin-bottom: 1rem;
      }

      .rental-links-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-secondary, #6b7280);
        margin-bottom: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .rental-links-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1.5rem;
        list-style: none;
        padding: 0;
        margin: 0;

        a {
          color: var(--accent, #2563eb);
          text-decoration: none;
          font-size: 0.95rem;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      /* ── WhatsApp Card ── */
      .whatsapp-section {
        margin-bottom: 2rem;
      }

      .whatsapp-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1.6rem 1.9rem;
        background: linear-gradient(
          135deg,
          rgba(37, 211, 102, 0.08),
          rgba(255, 255, 255, 0.03)
        );
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
        text-decoration: none;
        transition:
          border-color 0.3s,
          transform 0.3s,
          box-shadow 0.3s;
        overflow: hidden;
      }

      .whatsapp-card:hover {
        border-color: #25d366;
        transform: translateY(-3px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
      }

      .wa-icon {
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: rgba(37, 211, 102, 0.12);
        color: #25d366;
        flex-shrink: 0;
      }

      .wa-content {
        flex: 1;
      }

      .wa-content h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.15rem;
      }

      .wa-content p {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 0.25rem;
      }

      .wa-hint {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }

      .wa-arrow {
        color: var(--color-text-muted);
        flex-shrink: 0;
        transition: transform 0.2s;
      }

      .whatsapp-card:hover .wa-arrow {
        transform: translateX(3px);
        color: #25d366;
      }

      /* ── Available Bikes ── */
      .bikes-section {
        position: relative;
        margin-bottom: 3rem;
        padding: 2rem 1.5rem;
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.035),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.14);
        overflow: hidden;
      }

      .rental-faq-section {
        position: relative;
        margin-bottom: 3rem;
        padding: 2rem 1.5rem;
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.035),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.14);
        overflow: hidden;
      }

      .rental-faq-grid {
        margin-top: 1.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }

      .rental-faq-card {
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1rem 1rem 0.9rem;
      }

      .rental-faq-card h3 {
        margin: 0 0 0.6rem;
        font-size: 0.95rem;
        line-height: 1.35;
        color: var(--color-text);
      }

      .rental-faq-card ul {
        margin: 0;
        padding-left: 1.1rem;
        display: grid;
        gap: 0.35rem;
      }

      .rental-faq-card li {
        color: var(--color-text-secondary);
        font-size: 0.84rem;
        line-height: 1.45;
      }

      .bikes-title {
        font-size: clamp(1.25rem, 3vw, 1.6rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0.5rem 0 1.5rem;
        letter-spacing: -0.02em;
      }

      .bikes-loading {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .bike-skeleton {
        height: 340px;
        border-radius: 16px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-border) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .bikes-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 3rem 2rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        color: var(--color-text-secondary);
        text-align: center;
      }

      .bikes-empty svg {
        opacity: 0.4;
      }

      /* ── Seat Map (Airline-style bike selector) ── */
      .bikes-subtitle {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0.5rem 0 0;
      }

      .seat-map {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
        gap: 1.1rem;
        margin-top: 1.75rem;
      }

      .seat-skeleton {
        height: 120px;
        border-radius: 14px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          rgba(255, 255, 255, 0.04) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        border: 1px solid var(--color-border);
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .seat-card {
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.018)
          ),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        overflow: hidden;
        cursor: pointer;
        transition:
          border-color 0.2s,
          transform 0.2s,
          box-shadow 0.2s;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .seat-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-5px);
        box-shadow: 0 20px 38px rgba(0, 0, 0, 0.22);
      }
      .seat-card.seat-selected {
        border-color: var(--color-accent);
        box-shadow:
          0 0 0 3px rgba(255, 87, 34, 0.2),
          0 20px 38px rgba(0, 0, 0, 0.22);
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 87, 34, 0.08) 100%
        );
      }

      .seat-card::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 3px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--color-accent),
          transparent
        );
        opacity: 0;
        transition: opacity 0.2s;
      }

      .seat-card:hover::after,
      .seat-card.seat-selected::after {
        opacity: 1;
      }

      .seat-img-wrap {
        position: relative;
        height: 156px;
        overflow: hidden;
        background: var(--color-bg);
        flex-shrink: 0;
      }
      .seat-img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }
      .seat-card:hover .seat-img-wrap img {
        transform: scale(1.05);
      }
      .seat-img-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
        opacity: 0.3;
      }
      .seat-type-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 0.34rem 0.72rem;
        background: rgba(7, 10, 15, 0.72);
        color: #fff;
        border-radius: 999px;
        font-size: 0.66rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        backdrop-filter: blur(8px);
      }

      .seat-info {
        padding: 1rem 1rem 1.05rem;
        flex: 1;
      }
      .seat-name {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.2rem;
      }
      .seat-specs {
        font-size: 0.78rem;
        color: rgba(255, 255, 255, 0.58);
        margin-bottom: 0.6rem;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .spec-row {
        display: flex;
        align-items: baseline;
        gap: 0.3rem;
      }
      .spec-label {
        color: rgba(255, 255, 255, 0.35);
        font-size: 0.72rem;
        min-width: 6rem;
      }
      .seat-price-from {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--color-accent);
        padding: 0.3rem 0.58rem;
        border-radius: 999px;
        background: rgba(255, 87, 34, 0.09);
        width: fit-content;
      }

      .seat-check-mark {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--color-accent);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(255, 87, 34, 0.4);
      }

      /* ── Inline Booking Panel ── */
      .booking-panel {
        position: relative;
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 28px;
        margin-bottom: 3rem;
        overflow: hidden;
        animation: slideDown 0.3s ease;
        scroll-margin-top: 80px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── Booking CTA card (flow moved to dedicated page) ── */
      .booking-cta-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.85rem;
        padding: 2.5rem 1.5rem;
      }

      .booking-cta-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        background: rgba(255, 87, 34, 0.16);
        color: var(--color-accent, #ff5722);
      }

      .booking-cta-title {
        font-family: var(--rental-display-font);
        font-size: 1.6rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
      }

      .booking-cta-text {
        color: rgba(245, 248, 255, 0.72);
        max-width: 480px;
        margin: 0;
      }

      .booking-cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.95rem 1.9rem;
        border-radius: 999px;
        background: var(--color-accent, #ff5722);
        color: #fff;
        font-weight: 700;
        font-size: 1.05rem;
        text-decoration: none;
        box-shadow: 0 10px 30px rgba(255, 87, 34, 0.4);
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }

      .booking-cta-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 36px rgba(255, 87, 34, 0.5);
      }

      /* ── Compact booking panel ── */
      .bp-compact {
        display: flex;
        flex-direction: column;
      }

      .bp-kaution-notice {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 0.85rem 1.25rem;
        margin: 1rem 1.5rem 0;
        border-radius: 10px;
        background: rgba(234, 179, 8, 0.08);
        border: 1px solid rgba(234, 179, 8, 0.28);
        color: #d97706;
        font-size: 0.85rem;
        line-height: 1.55;
      }
      .bp-kaution-notice svg {
        flex-shrink: 0;
        margin-top: 1px;
        color: #d97706;
      }
      .bp-kaution-notice span {
        color: var(--color-text);
      }

      .bp-kaution-reminder {
        width: 100%;
        max-width: 420px;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(234, 179, 8, 0.4);
        background: rgba(234, 179, 8, 0.07);
      }
      .bp-kaution-reminder-amount {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0.7rem 1rem;
        background: rgba(234, 179, 8, 0.18);
        color: #ca8a04;
        font-size: 1.05rem;
        border-bottom: 1px solid rgba(234, 179, 8, 0.25);
      }
      .bp-kaution-reminder-amount svg {
        color: #ca8a04;
      }
      .bp-kaution-reminder p {
        margin: 0;
        padding: 0.6rem 1rem;
        font-size: 0.82rem;
        color: var(--color-text-secondary);
        text-align: center;
        line-height: 1.5;
      }

      .bp-chips-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 87, 34, 0.06);
      }

      .bp-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px 6px 6px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        min-width: 0;
        max-width: 260px;
      }

      .bp-chip-thumb {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .bp-chip-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .bp-chip-thumb svg {
        opacity: 0.4;
      }

      .bp-chip-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .bp-chip-name {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bp-chip-meta {
        font-size: 0.72rem;
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .bp-chip-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s;
        padding: 0;
      }
      .bp-chip-remove:hover {
        background: rgba(255, 87, 34, 0.25);
        color: var(--color-accent);
      }

      .bp-chip-add {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px dashed rgba(255, 255, 255, 0.2);
        background: transparent;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        align-self: center;
      }
      .bp-chip-add:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      .bp-cal-section {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bp-price-summary {
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bp-summary-days {
        color: var(--color-text-secondary);
        font-weight: 400;
      }

      .bp-summary-kaution {
        color: var(--color-text-secondary);
        font-size: 0.82rem;
      }

      /* Legacy bp-bike-bar kept for lightbox slot usage */
      .bp-bike-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 1.1rem 1.5rem;
      }

      .bp-bike-overview {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 1.2rem;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bp-gallery-main {
        width: 100%;
        aspect-ratio: 4 / 3;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--color-border);
        background: var(--color-bg);
        position: relative;
        padding: 0;
        cursor: zoom-in;
        display: block;
      }

      .bp-gallery-main img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }

      .bp-gallery-main:hover img {
        transform: scale(1.03);
      }

      .bp-zoom-hint {
        position: absolute;
        right: 8px;
        bottom: 8px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        border-radius: 8px;
        backdrop-filter: blur(6px);
        opacity: 0.85;
        pointer-events: none;
      }

      /* Lightbox */
      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: lightbox-fade 0.2s ease;
      }

      @keyframes lightbox-fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .lightbox-stage {
        flex: 1;
        max-width: min(1400px, 100%);
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        touch-action: pinch-zoom;
      }

      .lightbox-stage img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        cursor: zoom-in;
        user-select: none;
        transition: transform 0.25s ease;
        transform-origin: center center;
      }

      .lightbox-stage img.zoomed {
        cursor: zoom-out;
        transform: scale(2);
        max-width: none;
        max-height: none;
      }

      .lightbox-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: background 0.2s;
        z-index: 1;
      }

      .lightbox-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .lightbox-nav {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        cursor: pointer;
        backdrop-filter: blur(8px);
        flex-shrink: 0;
        transition: background 0.2s;
        margin: 0 0.5rem;
      }

      .lightbox-nav:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .lightbox-counter {
        position: absolute;
        bottom: 1.25rem;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 500;
        background: rgba(0, 0, 0, 0.5);
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        backdrop-filter: blur(8px);
      }

      @media (max-width: 640px) {
        .lightbox-nav {
          width: 40px;
          height: 40px;
          margin: 0 0.25rem;
        }
        .lightbox-close {
          top: 0.5rem;
          right: 0.5rem;
        }
      }

      .bp-gallery-thumbs {
        margin-top: 0.6rem;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.45rem;
      }

      .bp-thumb-btn {
        border: 1.5px solid var(--color-border);
        border-radius: 8px;
        overflow: hidden;
        padding: 0;
        background: var(--color-bg);
        cursor: pointer;
        transition: border-color 0.2s;
      }

      .bp-thumb-btn img {
        width: 100%;
        height: 58px;
        object-fit: cover;
        display: block;
      }

      .bp-thumb-btn.active,
      .bp-thumb-btn:hover {
        border-color: var(--color-accent);
      }

      .bp-bike-info-panel {
        min-width: 0;
      }

      .bp-bike-info-panel h4 {
        margin: 0 0 0.65rem;
        font-size: 0.9rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-text);
      }

      .bp-bike-facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .bp-fact {
        padding: 0.35rem 0.6rem;
        border-radius: 999px;
        background: rgba(255, 87, 34, 0.09);
        border: 1px solid rgba(255, 87, 34, 0.18);
        color: var(--color-text);
        font-size: 0.75rem;
        font-weight: 600;
      }

      .bp-bike-description {
        margin: 0.75rem 0 0;
        color: var(--color-text-secondary);
        line-height: 1.6;
        font-size: 0.85rem;
      }

      .bp-price-grid {
        margin-top: 0.85rem;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.45rem;
      }

      .bp-price-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.68rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.025);
        font-size: 0.78rem;
        color: rgba(255, 255, 255, 0.62);
      }

      .bp-price-item strong {
        color: var(--color-text);
        font-size: 0.8rem;
      }

      .bp-success {
        padding: 3rem 2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .bp-success-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bp-success h3 {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--color-text);
      }
      .bp-success p {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.7;
        max-width: 420px;
      }
      .bp-booking-nr {
        padding: 8px 20px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.2);
        font-size: 0.88rem;
        color: var(--color-text);
      }
      .bp-booking-nrs {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        max-width: 420px;
      }

      /* ── Multi-slot styles ── */
      .bike-slot-section {
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .bike-slot-section:last-of-type {
        border-bottom: none;
      }
      .bp-slot-num {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--color-accent);
        color: #fff;
        font-size: 0.78rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .slot-divider {
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 87, 34, 0.3),
          transparent
        );
        margin: 0 1.5rem;
      }
      .bp-body-single {
        padding: 0 1.5rem 1.5rem;
      }
      .bp-kaution-info {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 0.75rem;
        padding: 7px 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.82rem;
        color: var(--color-text-secondary);
      }
      .bp-kaution-info strong {
        color: var(--color-text);
      }
      .bp-kaution-info svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }
      .bp-add-bike-row {
        display: flex;
        justify-content: center;
        padding: 1.25rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }
      .btn-add-bike {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0.7rem 1.4rem;
        border-radius: 999px;
        border: 1.5px dashed rgba(255, 87, 34, 0.5);
        background: rgba(255, 87, 34, 0.06);
        color: var(--color-accent);
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-add-bike:hover {
        border-color: var(--color-accent);
        background: rgba(255, 87, 34, 0.12);
      }
      .bp-total-summary {
        padding: 1.25rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .bp-summary-rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 0.75rem;
      }
      .bp-summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        font-size: 0.88rem;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        flex-wrap: wrap;
      }
      .bp-summary-bike {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--color-text);
        font-weight: 600;
      }
      .bp-summary-num {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--color-accent);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .bp-summary-price {
        color: var(--color-text-secondary);
        font-size: 0.84rem;
        white-space: nowrap;
      }
      .bp-grand-total {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        margin-top: 0.85rem;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(255, 87, 34, 0.07);
        border: 1px solid rgba(255, 87, 34, 0.2);
        font-size: 0.9rem;
        color: var(--color-text-secondary);
      }
      .bp-grand-total strong {
        color: var(--color-text);
      }
      .bp-form-section {
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }
      .seat-slot-num {
        font-size: 0.78rem;
        font-weight: 800;
        color: #fff;
        line-height: 1;
      }

      .bp-new-btn {
        padding: 11px 28px;
        border-radius: 10px;
        background: var(--color-accent);
        color: #fff;
        border: none;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.9rem;
        transition: opacity 0.15s;
      }
      .bp-new-btn:hover {
        opacity: 0.88;
      }

      .bp-body {
        display: grid;
        grid-template-columns: 340px 1fr;
        gap: 0;
      }

      .bp-cal-col {
        padding: 1.5rem;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bp-form-col {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .bp-col-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 1rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-text);
      }
      .bp-col-title svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }

      .bp-cal-loading {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 2rem;
        color: var(--color-text-secondary);
        font-size: 0.88rem;
        justify-content: center;
      }
      .bp-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
      }

      .bp-note {
        font-size: 0.78rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: auto 0 0;
      }

      .modal-form {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .modal-title {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .form-row:has(.form-field--grow) {
        grid-template-columns: 3fr 1fr;
      }
      .form-row:has(.form-field--narrow:first-child) {
        grid-template-columns: 1fr 3fr;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .form-field label {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.54);
      }
      .form-field input,
      .form-field textarea,
      .form-field select {
        padding: 0.85rem 0.95rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        background: rgba(7, 10, 15, 0.5);
        color: var(--color-text);
        font-size: 0.9rem;
        transition:
          border-color 0.2s,
          box-shadow 0.2s,
          background 0.2s;
        resize: vertical;
      }
      .form-field input:focus,
      .form-field textarea:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
      }

      .price-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(255, 87, 34, 0.08);
        border: 1px solid rgba(255, 87, 34, 0.2);
        font-size: 0.88rem;
        color: var(--color-text);
      }
      .price-preview svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }
      .price-preview strong {
        color: var(--color-accent);
        font-size: 1rem;
        margin-left: auto;
      }
      .price-preview.warn {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.2);
      }
      .price-preview.warn svg {
        color: #f59e0b;
      }

      .lang-toggle {
        display: flex;
        gap: 8px;
      }
      .lang-toggle button {
        padding: 0.65rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.09);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.68);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
      }
      .lang-toggle button.active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: #fff;
      }

      .form-error {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        font-size: 0.85rem;
        color: #ef4444;
      }

      .btn-submit {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 0.95rem;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--color-accent), #ff8a00);
        color: #fff;
        border: none;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition:
          opacity 0.2s,
          transform 0.2s,
          box-shadow 0.2s;
        margin-top: 4px;
        box-shadow: 0 18px 34px rgba(255, 87, 34, 0.22);
      }
      .btn-submit:hover:not(:disabled) {
        opacity: 0.88;
        transform: translateY(-1px);
      }
      .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .submit-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Booking Calendar ── */
      .booking-calendar {
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        overflow: hidden;
        background: rgba(7, 10, 15, 0.42);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        max-width: 300px;
        width: 100%;
      }

      .bc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.4rem 0.55rem;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bc-month-title {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--color-text);
        text-transform: capitalize;
      }

      .bc-nav {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: 2px 4px;
        border-radius: 4px;
        display: flex;
        transition: all 0.15s;
      }
      .bc-nav:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-text);
      }

      .bc-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 3px 5px 1px;
      }
      .bc-weekdays span {
        text-align: center;
        font-size: 0.52rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-text-secondary);
        padding: 2px 0;
      }

      .bc-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 2px 5px 5px;
        gap: 1px;
      }

      .bc-cell {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        font-size: 0.62rem;
        font-weight: 500;
        color: var(--color-text);
        transition: all 0.12s;
        position: relative;
        user-select: none;
      }

      .bc-empty {
        pointer-events: none;
      }
      .bc-clickable {
        cursor: pointer;
      }
      .bc-clickable:hover:not(.bc-start):not(.bc-end) {
        background: rgba(255, 255, 255, 0.08);
      }

      .bc-past {
        opacity: 0.28;
        pointer-events: none;
      }

      .bc-busy {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        cursor: not-allowed;
      }

      .bc-pending {
        background: rgba(236, 72, 153, 0.18);
        color: #f9a8d4;
        cursor: not-allowed;
      }

      .bc-closed {
        background: rgba(148, 163, 184, 0.12);
        color: var(--color-text-secondary, #94a3b8);
        cursor: not-allowed;
        font-style: italic;
      }
      .bc-closed-tip {
        background: #64748b !important;
      }
      .bc-closed-tip::after {
        border-top-color: #64748b !important;
      }

      .bc-today::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--color-accent);
      }

      .bc-start,
      .bc-end {
        background: var(--color-accent) !important;
        color: #fff !important;
        font-weight: 700;
      }

      .bc-range {
        background: rgba(255, 87, 34, 0.18);
        border-radius: 0;
      }

      .bc-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        padding: 6px 14px 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .bc-legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.7rem;
        color: var(--color-text-secondary);
      }

      .bc-leg-dot {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        flex-shrink: 0;
      }
      .bc-leg-busy {
        background: rgba(239, 68, 68, 0.4);
      }
      .bc-leg-pending {
        background: rgba(236, 72, 153, 0.5);
      }
      .bc-leg-closed {
        background: rgba(148, 163, 184, 0.5);
      }
      .bc-leg-sel {
        background: var(--color-accent);
      }

      .bc-info {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        background: rgba(255, 87, 34, 0.08);
        border-top: 1px solid rgba(255, 87, 34, 0.2);
        font-size: 0.82rem;
        color: var(--color-text);
      }
      .bc-info svg {
        color: var(--color-accent);
        flex-shrink: 0;
      }

      .bc-busy-tip {
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: #f87171;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 7px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 10;
      }
      .bc-cell.bc-busy:hover .bc-busy-tip {
        opacity: 1;
      }

      @media (max-width: 900px) {
        .bp-bike-overview {
          grid-template-columns: 1fr;
        }

        .bp-body {
          grid-template-columns: 1fr;
        }
        .bp-cal-col {
          border-right: none;
          border-bottom: 1px solid var(--color-border);
        }
      }

      @media (max-width: 600px) {
        .seat-map {
          grid-template-columns: repeat(2, 1fr);
        }
        .form-row {
          grid-template-columns: 1fr;
        }

        .bp-price-grid {
          grid-template-columns: 1fr;
        }

        .bp-gallery-thumbs {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .bp-bike-bar {
          padding: 0.75rem 1rem;
        }
        .bp-cal-col,
        .bp-form-col {
          padding: 1rem;
        }
        .booking-panel {
          border-radius: 14px;
        }
      }

      /* ── CTA ── */
      /* ── Customer Reviews ── */
      .reviews-section {
        margin-top: 3rem;
        padding: 2.5rem 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .reviews-header {
        text-align: center;
        margin-bottom: 2rem;
      }
      .reviews-header .section-chip {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-accent);
        background: rgba(var(--color-accent-rgb, 99, 102, 241), 0.12);
        border-radius: 50px;
        padding: 4px 14px;
        margin-bottom: 0.75rem;
      }
      .reviews-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text);
        margin: 0;
      }
      .reviews-loading {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }
      .reviews-spinner {
        width: 28px;
        height: 28px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .reviews-empty {
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        padding: 1.5rem;
      }
      .reviews-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
        margin-bottom: 2.5rem;
      }
      .review-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 1.2rem 1.4rem;
        transition: box-shadow 0.2s;
      }
      .review-card:hover {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }
      .rc-top {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .rc-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--color-accent);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1rem;
        flex-shrink: 0;
      }
      .rc-meta {
        flex: 1;
        min-width: 0;
      }
      .rc-name {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .rc-stars {
        display: flex;
        gap: 1px;
        margin-top: 2px;
      }
      .rstar {
        font-size: 0.9rem;
      }
      .rstar.filled {
        color: #f59e0b;
      }
      .rstar.empty {
        color: rgba(255, 255, 255, 0.15);
      }
      .rc-date {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        white-space: nowrap;
      }
      .rc-text {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      /* Review form */
      .review-form-wrap {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 2rem;
        max-width: 640px;
        margin: 0 auto;
      }
      .review-form-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 1.25rem;
      }
      .review-form-success {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        border-radius: 10px;
        padding: 0.9rem 1.1rem;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .review-form-error {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
        border-radius: 8px;
        padding: 0.65rem 1rem;
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }
      .review-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .rform-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .rform-field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .rform-field label {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }
      .rform-field input,
      .rform-field textarea {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        color: var(--color-text);
        font-size: 0.9rem;
        padding: 0.65rem 0.9rem;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.2s;
        font-family: inherit;
        resize: vertical;
      }
      .rform-field input:focus,
      .rform-field textarea:focus {
        outline: none;
        border-color: var(--color-accent);
      }
      .rform-field input::placeholder,
      .rform-field textarea::placeholder {
        color: rgba(255, 255, 255, 0.25);
      }
      .star-picker {
        display: flex;
        gap: 4px;
      }
      .star-btn {
        background: none;
        border: none;
        font-size: 1.6rem;
        color: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition:
          color 0.15s,
          transform 0.1s;
      }
      .star-btn.selected {
        color: #f59e0b;
      }
      .star-btn:hover {
        transform: scale(1.2);
      }
      .rform-submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: var(--color-accent);
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 0.75rem 1.5rem;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s;
        align-self: flex-start;
      }
      .rform-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .rform-submit:hover:not(:disabled) {
        opacity: 0.85;
      }

      .rental-cta {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-decoration: none;
        transition:
          color 0.2s,
          gap 0.2s;
      }

      .back-link:hover {
        color: var(--color-accent);
        gap: 0.6rem;
      }

      /* ── Responsive ── */
      @media (max-width: 900px) {
        .rental-signature-band {
          grid-template-columns: 1fr;
        }

        .signature-stat-grid {
          grid-template-columns: 1fr;
        }

        .rental-hero-inner {
          grid-template-columns: 1fr;
        }

        .rental-hero-right {
          display: none;
        }

        .pricing-main-grid {
          grid-template-columns: 1fr 1fr;
        }

        .pricing-extra-row,
        .pricing-info-bar {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .rental-hero {
          padding: 5rem 0 3rem;
        }

        .pricing-section,
        .bikes-section,
        .rental-faq-section {
          padding-left: 1rem;
          padding-right: 1rem;
          border-radius: 22px;
        }

        .rental-signature-band {
          margin-top: -0.6rem;
          margin-bottom: 2rem;
          padding: 0.8rem;
          border-radius: 22px;
        }

        .signature-editorial,
        .signature-stat-card {
          border-radius: 18px;
        }

        .pricing-main-grid {
          grid-template-columns: 1fr;
        }

        .seat-map {
          grid-template-columns: 1fr 1fr;
        }

        .rental-cta {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      @media (max-width: 600px) {
        .seat-map,
        .pricing-extra-row {
          grid-template-columns: 1fr;
        }

        .rental-faq-grid {
          grid-template-columns: 1fr;
        }

        .hero-cta-wa,
        .hero-cta-scroll {
          width: 100%;
          justify-content: center;
        }

        .whatsapp-card {
          padding: 1.25rem;
        }

        .pcard-top-badge {
          font-size: 0.62rem;
        }

        .rform-row {
          grid-template-columns: 1fr;
        }
        .reviews-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FahrradverleihComponent implements OnInit {
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private document = inject(DOCUMENT);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  rentalCatalogSlug = computed(() => {
    const l = this.lang();
    if (l === 'en') return 'rental-bikes';
    if (l === 'fr') return 'velos-de-location';
    return 'mietfahrraeder';
  });
  toursSlug = computed(() => {
    const l = this.lang();
    if (l === 'en') return 'bike-tours';
    if (l === 'fr') return 'circuits-velo';
    return 'fahrradtouren';
  });
  rentalGuideSlug = computed(() => {
    const l = this.lang();
    const base = l === 'en' ? 'guide' : 'ratgeber';
    const slug =
      l === 'en'
        ? 'bike-rental-freiburg-guide'
        : l === 'fr'
          ? 'location-velo-fribourg-guide'
          : 'fahrradverleih-freiburg-guide';
    return l === 'fr' ? `guide/${slug}` : `${base}/${slug}`;
  });
  rentalSubCategories = computed(() => {
    const l = this.lang();
    if (l !== 'de' && l !== 'en' && l !== 'fr') return [];
    const parent =
      l === 'en'
        ? 'bike-rental'
        : l === 'fr'
          ? 'location-velo'
          : 'fahrradverleih';
    return RENTAL_CATEGORIES.map((c) => ({
      label: c.translations[l].breadcrumbLabel,
      url: `/${l}/${parent}/${c.slugs[l]}`,
    }));
  });
  pageCopy = computed(
    () => RENTAL_PAGE_COPY[this.getCurrentLanguage()] ?? RENTAL_PAGE_COPY.en!,
  );
  rentalFaq = computed(
    () =>
      RENTAL_FAQ_CONTENT[this.getCurrentLanguage()] ?? RENTAL_FAQ_CONTENT.en!,
  );

  bikes = signal<PublicRentalBicycle[]>([]);
  bikesLoading = signal(true);

  // Multi-bike slot state
  private slotCounter = 0;
  bikeSlots = signal<BikeSlot[]>([]);

  // Global shared calendar state
  calDate = signal<Date>(new Date());
  calStart = signal<Date | null>(null);
  calEnd = signal<Date | null>(null);
  calDays = signal<number>(0);

  // Lightbox state
  lightboxOpen = signal(false);
  lightboxZoomed = signal(false);
  lightboxSlotId = signal<number | null>(null);

  // Shared booking state
  bookingSubmitting = signal(false);
  bookingSuccess = signal(false);
  bookingError = signal<string | null>(null);
  confirmedBookingNrs = signal<string[]>([]);

  bookingForm = {
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    strasse: '',
    hausNr: '',
    plz: '',
    ort: '',
    sprache: this.getCurrentLanguage(),
    notizen: '',
  };

  colorOptions = [
    { value: 'Schwarz', hex: '#111827' },
    { value: 'Weiß', hex: '#f9fafb' },
    { value: 'Silber', hex: '#9ca3af' },
    { value: 'Grau', hex: '#6b7280' },
    { value: 'Blau', hex: '#2563eb' },
    { value: 'Rot', hex: '#dc2626' },
    { value: 'Grün', hex: '#16a34a' },
    { value: 'Gelb', hex: '#facc15' },
  ];

  // Rental Reviews state
  reviews = signal<RentalReviewPublic[]>([]);
  reviewsLoading = signal(false);
  reviewFormSuccess = signal(false);
  reviewFormSending = signal(false);
  reviewFormError = signal<string | null>(null);
  reviewForm: RentalReviewCreate = { ad: '', email: '', sterne: 5, yorum: '' };

  /** The booking flow lives on its own page — all CTAs navigate there. */
  bookingPath = () => getRentalBookingPath(this.lang());

  ngOnInit(): void {
    const t = this.t();
    const lang = this.lang();
    const rentalSlug = getRentalSlug(lang);
    const pageUrl = `https://bikehausfreiburg.com/${lang}/${rentalSlug}`;

    this.bookingForm.sprache = this.getCurrentLanguage();

    this.titleService.setTitle(t.bikeRentalMetaTitle);

    this.metaService.updateTag({
      name: 'description',
      content: t.bikeRentalMetaDescription,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: t.bikeRentalMetaTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: t.bikeRentalMetaDescription,
    });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({
      property: 'og:image',
      content:
        'https://bikehausfreiburg.com/assets/images/fahrradverleih-freiburg.jpg',
    });
    this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    this.metaService.updateTag({
      property: 'og:locale',
      content: OG_LOCALE_BY_LANGUAGE[lang] ?? 'de_DE',
    });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({
      name: 'twitter:title',
      content: t.bikeRentalMetaTitle,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: t.bikeRentalMetaDescription,
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content:
        'https://bikehausfreiburg.com/assets/images/fahrradverleih-freiburg.jpg',
    });

    // Update canonical link
    const canonical = this.document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) {
      canonical.href = pageUrl;
    }

    // Rental Service + FAQPage structured data
    this.addRentalSchema(lang, pageUrl);

    this.apiService.getRentableBikes().subscribe({
      next: (bikes) => {
        this.bikes.set(bikes);
        this.bikesLoading.set(false);
      },
      error: () => this.bikesLoading.set(false),
    });

    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewsLoading.set(true);
    this.apiService.getRentalReviews().subscribe({
      next: (items) => {
        this.reviews.set(items);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false),
    });
  }

  submitReview(): void {
    const f = this.reviewForm;
    if (!f.ad.trim() || !f.yorum.trim()) {
      this.reviewFormError.set(this.t().rentalReviewsFormValidation);
      return;
    }
    this.reviewFormError.set(null);
    this.reviewFormSending.set(true);
    this.apiService
      .createRentalReview({
        ad: f.ad.trim(),
        email: f.email?.trim() || undefined,
        sterne: f.sterne,
        yorum: f.yorum.trim(),
      })
      .subscribe({
        next: () => {
          this.reviewFormSuccess.set(true);
          this.reviewFormSending.set(false);
        },
        error: () => {
          this.reviewFormError.set(this.t().rentalReviewsFormError);
          this.reviewFormSending.set(false);
        },
      });
  }

  starsArr(n: number): number[] {
    return Array(Math.min(5, Math.max(0, n))).fill(0);
  }

  emptyStarsArr(n: number): number[] {
    return Array(Math.max(0, 5 - Math.min(5, n))).fill(0);
  }

  private addRentalSchema(lang: string, pageUrl: string): void {
    const existing = this.document.getElementById('rental-schema');
    if (existing) existing.remove();

    const schemaLang = isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;
    const faqs = (
      RENTAL_FAQ_CONTENT[schemaLang] ?? RENTAL_FAQ_CONTENT.en!
    ).items;

    const serviceNameByLang: Record<string, string> = {
      de: 'Fahrradverleih Freiburg',
      en: 'Bike Rental Freiburg',
      fr: 'Location vélo Fribourg',
      tr: 'Freiburg Bisiklet Kiralama',
    };
    const serviceDescByLang: Record<string, string> = {
      de: 'Fahrradverleih in Freiburg im Breisgau — Cityräder, Trekkingräder und E-Bikes mit individuell gepflegten Tagespreisen je Fahrrad. Helm und Schloss inklusive.',
      en: 'Rent a bike in Freiburg — city bikes, trekking bikes and e-bikes with individual daily rates per bike. Helmet and lock included. No appointment needed.',
      fr: 'Location de vélos à Fribourg — vélos de ville, VTT et VAE avec tarifs journaliers par vélo. Casque et antivol inclus.',
      tr: "Freiburg'da bisiklet kiralama — city bisikletleri, trekking bisikletleri ve e-bisikletler. Kask ve kilit dahil.",
    };
    const breadcrumbNameByLang: Record<string, string> = {
      de: 'Fahrradverleih',
      en: 'Bike Rental',
      fr: 'Location vélo',
      tr: 'Bisiklet Kiralama',
    };

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          '@id': `${pageUrl}#service`,
          serviceType: 'BikeRental',
          name: serviceNameByLang[schemaLang] ?? 'Fahrradverleih Freiburg',
          alternateName: [
            'Bike Rental Freiburg',
            'Fahrradverleih Freiburg',
            'Location vélo Freiburg',
            'Freiburg Bisiklet Kiralama',
          ],
          description: serviceDescByLang[schemaLang] ?? serviceDescByLang['de'],
          provider: {
            '@type': 'LocalBusiness',
            '@id': 'https://bikehausfreiburg.com/#organization',
            name: 'Bike Haus Freiburg',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Heckerstraße 27',
              addressLocality: 'Freiburg im Breisgau',
              postalCode: '79114',
              addressRegion: 'Baden-Württemberg',
              addressCountry: 'DE',
            },
            telephone: '+49-155-66300011',
            url: 'https://bikehausfreiburg.com/de',
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 47.9893,
              longitude: 7.8009,
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Thursday'],
                opens: '11:00',
                closes: '17:30',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Wednesday',
                opens: '14:00',
                closes: '17:30',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Friday',
                opens: '11:00',
                closes: '13:00',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Friday',
                opens: '15:00',
                closes: '18:00',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '11:30',
                closes: '17:00',
              },
            ],
          },
          areaServed: AREA_SERVED,
          offers: {
            '@type': 'Offer',
            priceSpecification: [
              {
                '@type': 'UnitPriceSpecification',
                name: '1 Tag',
                price: '12.00',
                priceCurrency: 'EUR',
                unitCode: 'DAY',
                minPrice: '8.00',
              },
              {
                '@type': 'UnitPriceSpecification',
                name: 'Ab 8 Tage',
                price: '8.00',
                priceCurrency: 'EUR',
                unitCode: 'DAY',
              },
            ],
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'LocalBusiness',
              '@id': 'https://bikehausfreiburg.com/#organization',
            },
          },
          url: pageUrl,
        },
        {
          '@type': 'FAQPage',
          '@id': `${pageUrl}#faq`,
          mainEntity: faqs.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answers.join(' '),
            },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Bike Haus Freiburg',
              item: `https://bikehausfreiburg.com/${lang}`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: breadcrumbNameByLang[schemaLang] ?? 'Fahrradverleih',
              item: pageUrl,
            },
          ],
        },
      ],
    };

    const script = this.document.createElement('script');
    script.id = 'rental-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  // ── Slot management ─────────────────────────────────────────────────────────

  private createSlot(bike: PublicRentalBicycle): BikeSlot {
    return {
      slotId: ++this.slotCounter,
      bike,
      busyPeriods: [],
      busyPeriodsLoading: true,
      calculatedPrice: this.calcPriceForBike(bike),
      rahmennummer: bike.rahmennummer ?? '',
      farbe: bike.farbe ?? '',
      kaution: this.toNullableNumber(bike.kaution),
      imageIndex: 0,
    };
  }

  private calcPriceForBike(bike: PublicRentalBicycle): number | null {
    const days = this.calDays();
    if (days <= 0) return null;
    return calculateRentalPrice(bike.preise, days).total;
  }

  private updateSlot(
    slotId: number,
    updater: (s: BikeSlot) => Partial<BikeSlot>,
  ): void {
    this.bikeSlots.update((slots) =>
      slots.map((s) => (s.slotId === slotId ? { ...s, ...updater(s) } : s)),
    );
  }

  private loadBusyPeriodsForSlot(slotId: number, bikeId: number): void {
    this.apiService.getBusyPeriods(bikeId).subscribe({
      next: (periods) => {
        const toLocal = (str: string) => {
          const d = new Date(str);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };
        this.updateSlot(slotId, () => ({
          busyPeriods: periods.map((p) => ({
            start: toLocal(p.start),
            end: toLocal(p.end),
            type: p.type,
          })),
          busyPeriodsLoading: false,
        }));
      },
      error: () =>
        this.updateSlot(slotId, () => ({ busyPeriodsLoading: false })),
    });
  }

  isSelectedBike(bikeId: number): boolean {
    return this.bikeSlots().some((s) => s.bike.id === bikeId);
  }

  getSlotNumber(bikeId: number): number {
    return this.bikeSlots().findIndex((s) => s.bike.id === bikeId) + 1;
  }

  toggleBike(bike: PublicRentalBicycle): void {
    const existingIndex = this.bikeSlots().findIndex(
      (s) => s.bike.id === bike.id,
    );
    if (existingIndex >= 0) {
      this.bikeSlots.update((slots) =>
        slots.filter((_, i) => i !== existingIndex),
      );
    } else {
      const newSlot = this.createSlot(bike);
      this.bikeSlots.update((slots) => [...slots, newSlot]);
      this.loadBusyPeriodsForSlot(newSlot.slotId, bike.id);
      this.bookingSuccess.set(false);
      this.bookingError.set(null);
      if (this.isBrowser) {
        setTimeout(() => {
          document
            .getElementById('booking-panel')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  }

  addBikeSlot(): void {
    document
      .getElementById('fahrrad-waehlen')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  removeSlot(slotId: number): void {
    this.bikeSlots.update((slots) => slots.filter((s) => s.slotId !== slotId));
    this.bookingError.set(null);
  }

  setSlotRahmennummer(slotId: number, value: string): void {
    this.updateSlot(slotId, () => ({ rahmennummer: value }));
  }

  setSlotKaution(slotId: number, value: unknown): void {
    this.updateSlot(slotId, () => ({ kaution: this.toNullableNumber(value) }));
  }

  toggleSlotColor(slotId: number, color: string): void {
    this.updateSlot(slotId, (s) => ({
      farbe: this.toggleColor(s.farbe, color),
    }));
  }

  resetAll(): void {
    this.bikeSlots.set([]);
    this.calDate.set(new Date());
    this.calStart.set(null);
    this.calEnd.set(null);
    this.calDays.set(0);
    this.bookingSuccess.set(false);
    this.bookingError.set(null);
    this.confirmedBookingNrs.set([]);
    this.bookingForm = {
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      strasse: '',
      hausNr: '',
      plz: '',
      ort: '',
      sprache: this.getCurrentLanguage(),
      notizen: '',
    };
  }

  // ── Slot image / lightbox ────────────────────────────────────────────────────

  getSlotImagePath(slot: BikeSlot): string | null {
    if (!slot.bike || slot.bike.images.length === 0) return null;
    return slot.bike.images[
      Math.min(slot.imageIndex, slot.bike.images.length - 1)
    ].filePath;
  }

  selectSlotImage(slotId: number, index: number): void {
    this.updateSlot(slotId, (s) => {
      if (index < 0 || index >= s.bike.images.length) return {};
      return { imageIndex: index };
    });
  }

  openLightboxForSlot(slot: BikeSlot): void {
    this.lightboxSlotId.set(slot.slotId);
    this.lightboxZoomed.set(false);
    this.lightboxOpen.set(true);
    if (this.isBrowser) document.body.style.overflow = 'hidden';
  }

  getLightboxSlot(): BikeSlot | null {
    const id = this.lightboxSlotId();
    if (id === null) return null;
    return this.bikeSlots().find((s) => s.slotId === id) ?? null;
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    this.lightboxZoomed.set(false);
    this.lightboxSlotId.set(null);
    if (this.isBrowser) document.body.style.overflow = '';
  }

  toggleLightboxZoom(): void {
    this.lightboxZoomed.update((v) => !v);
  }

  lightboxNext(): void {
    const slot = this.getLightboxSlot();
    if (!slot) return;
    const next = (slot.imageIndex + 1) % slot.bike.images.length;
    this.updateSlot(slot.slotId, () => ({ imageIndex: next }));
    this.lightboxZoomed.set(false);
  }

  lightboxPrev(): void {
    const slot = this.getLightboxSlot();
    if (!slot) return;
    const len = slot.bike.images.length;
    const prev = (slot.imageIndex - 1 + len) % len;
    this.updateSlot(slot.slotId, () => ({ imageIndex: prev }));
    this.lightboxZoomed.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onLightboxKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') this.closeLightbox();
    else if (event.key === 'ArrowRight') this.lightboxNext();
    else if (event.key === 'ArrowLeft') this.lightboxPrev();
  }

  // ── Global calendar ───────────────────────────────────────────────────────────

  anyBusyPeriodsLoading(): boolean {
    return this.bikeSlots().some((s) => s.busyPeriodsLoading);
  }

  getCalDays(): (Date | null)[] {
    const d = this.calDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }

  getCalMonthLabel(): string {
    return this.calDate().toLocaleDateString(
      this.getLocaleForCurrentLanguage(),
      {
        month: 'long',
        year: 'numeric',
      },
    );
  }

  prevMonth(): void {
    const d = this.calDate();
    this.calDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.calDate();
    this.calDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  isCalStart(date: Date): boolean {
    const s = this.calStart();
    return !!s && date.getTime() === s.getTime();
  }

  isCalEnd(date: Date): boolean {
    const e = this.calEnd();
    return !!e && date.getTime() === e.getTime();
  }

  isCalInRange(date: Date): boolean {
    const s = this.calStart();
    const e = this.calEnd();
    if (!s || !e) return false;
    return date > s && date < e;
  }

  isDayBusy(date: Date): boolean {
    return this.getDayBusyType(date) !== null;
  }

  getDayBusyType(date: Date): 'booking' | 'pending' | null {
    const t = date.getTime();
    let result: 'booking' | 'pending' | null = null;
    for (const slot of this.bikeSlots()) {
      const covering = slot.busyPeriods.filter(
        (p) => t >= p.start.getTime() && t <= p.end.getTime(),
      );
      if (covering.length === 0) continue;
      if (covering.some((p) => p.type === 'booking' || p.type === 'rental'))
        return 'booking';
      if (covering.some((p) => p.type === 'pending')) result = 'pending';
    }
    return result;
  }

  onCalDayClick(date: Date): void {
    if (this.isClosedDay(date)) return;
    const s = this.calStart();
    const e = this.calEnd();
    if (!s || (s && e) || date < s) {
      this.calStart.set(date);
      this.calEnd.set(null);
      this.calDays.set(0);
      this.bookingError.set(null);
      this.bikeSlots.update((slots) =>
        slots.map((sl) => ({ ...sl, calculatedPrice: null })),
      );
    } else {
      const allBusyPeriods = this.bikeSlots().flatMap((sl) => sl.busyPeriods);
      const hasBusy = allBusyPeriods.some(
        (p) =>
          p.start.getTime() <= date.getTime() && p.end.getTime() >= s.getTime(),
      );
      if (hasBusy) {
        this.calStart.set(date);
        this.calEnd.set(null);
        this.calDays.set(0);
        this.bookingError.set(this.pageCopy().bookingErrors.busyRange);
        this.bikeSlots.update((slots) =>
          slots.map((sl) => ({ ...sl, calculatedPrice: null })),
        );
        return;
      }
      this.bookingError.set(null);
      const days = Math.floor((date.getTime() - s.getTime()) / 86400000) + 1;
      this.calEnd.set(date);
      this.calDays.set(days > 0 ? days : 0);
      this.bikeSlots.update((slots) =>
        slots.map((sl) => ({
          ...sl,
          calculatedPrice:
            days > 0 ? calculateRentalPrice(sl.bike.preise, days).total : null,
        })),
      );
    }
  }

  // ── Pricing ──────────────────────────────────────────────────────────────────

  getKaution(bike: PublicRentalBicycle): number {
    if (bike.kaution != null && bike.kaution > 0)
      return Math.round(bike.kaution);
    return 300;
  }

  getSlotKaution(slot: BikeSlot): number {
    if (slot.kaution != null && slot.kaution > 0)
      return Math.round(slot.kaution);
    return this.getKaution(slot.bike);
  }

  totalRentalPrice(): number {
    return this.bikeSlots().reduce(
      (sum, s) => sum + (s.calculatedPrice ?? 0),
      0,
    );
  }

  totalKaution(): number {
    return this.bikeSlots().reduce((sum, s) => sum + this.getSlotKaution(s), 0);
  }

  isColorSelected(farbe: string, color: string): boolean {
    if (!farbe) return false;
    return farbe.split(/[,/]\s*/).includes(color);
  }

  toggleColor(farbe: string, color: string): string {
    const colors = farbe ? farbe.split(/[,/]\s*/).filter(Boolean) : [];
    const idx = colors.indexOf(color);
    if (idx >= 0) colors.splice(idx, 1);
    else colors.push(color);
    return colors.join(', ');
  }

  toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  getMinPrice(bike: PublicRentalBicycle): number | null {
    const prices = getConfiguredRentalPriceLines(bike.preise).map(
      (item) => item.price,
    );
    return prices.length > 0 ? Math.min(...prices) : null;
  }

  getPriceLines(bike: PublicRentalBicycle) {
    return getConfiguredRentalPriceLines(bike.preise);
  }

  private bwHolidayCache = new Map<number, Set<string>>();

  private easterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }

  private getBWHolidays(year: number): Set<string> {
    if (this.bwHolidayCache.has(year)) return this.bwHolidayCache.get(year)!;
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const add = (d: Date, days: number) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
    const easter = this.easterDate(year);
    const holidays = new Set<string>([
      fmt(new Date(year, 0, 1)), // Neujahr
      fmt(new Date(year, 0, 6)), // Heilige Drei Könige (BW)
      fmt(new Date(year, 4, 1)), // Tag der Arbeit
      fmt(new Date(year, 9, 3)), // Tag der Deutschen Einheit
      fmt(new Date(year, 10, 1)), // Allerheiligen (BW)
      fmt(new Date(year, 11, 25)), // 1. Weihnachtstag
      fmt(new Date(year, 11, 26)), // 2. Weihnachtstag
      fmt(add(easter, -2)), // Karfreitag
      fmt(easter), // Ostersonntag
      fmt(add(easter, 1)), // Ostermontag
      fmt(add(easter, 39)), // Christi Himmelfahrt
      fmt(add(easter, 49)), // Pfingstsonntag
      fmt(add(easter, 50)), // Pfingstmontag
      fmt(add(easter, 60)), // Fronleichnam (BW)
    ]);
    this.bwHolidayCache.set(year, holidays);
    return holidays;
  }

  isClosedDay(date: Date): boolean {
    if (date.getDay() === 0) return true; // Sonntag
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return this.getBWHolidays(date.getFullYear()).has(key);
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isToday(date: Date): boolean {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatCalDay(date: Date): string {
    return date.toLocaleDateString(this.getLocaleForCurrentLanguage(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  submitBooking(): void {
    const f = this.bookingForm;
    const slots = this.bikeSlots();
    if (slots.length === 0) return;

    if (!f.vorname.trim() || !f.nachname.trim()) {
      this.bookingError.set(this.pageCopy().bookingErrors.fullName);
      return;
    }
    if (!f.email.trim() || !f.email.includes('@')) {
      this.bookingError.set(this.pageCopy().bookingErrors.validEmail);
      return;
    }
    const start = this.calStart();
    const end = this.calEnd();
    if (!start || !end) {
      this.bookingError.set(this.pageCopy().bookingErrors.choosePeriod);
      return;
    }
    if (end < start) {
      this.bookingError.set(this.pageCopy().bookingErrors.invalidEnd);
      return;
    }

    this.bookingSubmitting.set(true);
    this.bookingError.set(null);

    const startDatum = this.toIsoDate(start);
    const endDatum = this.toIsoDate(end);

    const dto: RentalBookingCreate = {
      bikes: slots.map((slot) => ({
        bicycleId: slot.bike.id,
        startDatum,
        endDatum,
        rahmennummer: slot.rahmennummer.trim() || undefined,
        farbe: slot.farbe.trim() || undefined,
        kaution: slot.kaution ?? undefined,
      })),
      vorname: f.vorname.trim(),
      nachname: f.nachname.trim(),
      email: f.email.trim(),
      telefon: f.telefon.trim() || undefined,
      strasse: f.strasse.trim() || undefined,
      hausNr: f.hausNr.trim() || undefined,
      plz: f.plz.trim() || undefined,
      ort: f.ort.trim() || undefined,
      sprache: f.sprache,
      notizen: f.notizen.trim() || undefined,
    };

    this.apiService.createRentalBooking(dto).subscribe({
      next: (res) => {
        this.confirmedBookingNrs.set([res.buchungsNummer]);
        this.bookingSuccess.set(true);
        this.bookingSubmitting.set(false);
      },
      error: (err) => {
        const msg = err?.error?.error || this.pageCopy().bookingErrors.generic;
        this.bookingError.set(msg);
        this.bookingSubmitting.set(false);
      },
    });
  }

  private getCurrentLanguage(): Language {
    const lang = this.lang();
    return isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;
  }

  private getLocaleForCurrentLanguage(): string {
    return LOCALE_BY_LANGUAGE[this.getCurrentLanguage()];
  }

  getWhatsappLink(): string {
    return 'https://wa.me/4915566300011';
  }

  getImageUrl(path: string): string {
    const base = environment.apiUrl
      .replace('/api/public', '')
      .replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }
}
