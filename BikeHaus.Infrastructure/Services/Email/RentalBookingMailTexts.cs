namespace BikeHaus.Infrastructure.Services.Email;

/// <summary>
/// Sprach-Bausteine für die Buchungs-Mails (Bestätigung, Storno, Reaktivierung,
/// Aktualisierung, Erinnerung, "Anfrage eingegangen"). Der Mail-<b>Aufbau</b>
/// (Reihenfolge der Abschnitte, Platzhalter wie Buchungsnummer/Zeitraum/Preis)
/// steht an genau einer Stelle in <see cref="SmtpEmailService"/> — hier stehen
/// nur die übersetzten Textbausteine, pro unterstützter Sprache ein vollständiger
/// Satz an Schlüsseln.
///
/// Vorbild ist bewusst <c>RENTAL_STEPS_TRANSLATIONS</c> in
/// BikeHaus.Homepage/src/app/services/translation.service.ts: eine Map
/// Sprache → Schlüssel → Text, mit Fallback. Eine fehlende Übersetzung für
/// einen einzelnen Schlüssel reißt die Mail nicht auseinander: dann greift für
/// GENAU diesen Baustein Englisch (<see cref="T"/>). Fehlt eine ganze Sprache
/// (kommt bei den 12 geführten Sprachen praktisch nicht vor, ist aber
/// zukunftssicher für neue Sprachen mit unvollständiger Übersetzung), greift
/// ebenfalls Englisch — NIE Deutsch, siehe
/// <see cref="BikeHaus.Application.Services.RentalBookingService"/>.NormalizeLanguage.
/// </summary>
internal static class RentalBookingMailTexts
{
    public static class Keys
    {
        public const string Greeting = "Greeting";
        public const string LabelBookingNumber = "LabelBookingNumber";
        public const string LabelBike = "LabelBike";
        public const string LabelPeriod = "LabelPeriod";
        public const string LabelNewPeriod = "LabelNewPeriod";
        public const string UnitDays = "UnitDays";
        public const string LinePickupTimeDesired = "LinePickupTimeDesired";
        public const string LinePickupTimeReminder = "LinePickupTimeReminder";
        public const string LabelAccessoriesIncluded = "LabelAccessoriesIncluded";
        public const string LabelAccessories = "LabelAccessories";
        public const string ValueAccessoriesNone = "ValueAccessoriesNone";
        public const string LabelPrice = "LabelPrice";
        public const string LabelNewPrice = "LabelNewPrice";
        public const string ValuePriceFallback = "ValuePriceFallback";
        public const string HeadingBookingDetails = "HeadingBookingDetails";
        public const string HeadingPickupReturn = "HeadingPickupReturn";
        public const string HeadingPickup = "HeadingPickup";
        public const string HeadingImportantNote = "HeadingImportantNote";
        public const string LineOpeningHours = "LineOpeningHours";
        public const string LineGoogleMaps = "LineGoogleMaps";
        public const string LineRentalHoursNote = "LineRentalHoursNote";
        public const string ValueDepositWithAmount = "ValueDepositWithAmount";
        public const string ValueDepositWithoutAmount = "ValueDepositWithoutAmount";
        public const string ValueDepositSentenceWithAmountReminder = "ValueDepositSentenceWithAmountReminder";
        public const string ValueDepositSentenceWithoutAmountReminder = "ValueDepositSentenceWithoutAmountReminder";
        public const string HeadingSelfCancel = "HeadingSelfCancel";
        public const string TextSelfCancel = "TextSelfCancel";
        public const string TextSelfCancelReminder = "TextSelfCancelReminder";
        public const string ValueSelfCancelFallback = "ValueSelfCancelFallback";
        public const string SignOff = "SignOff";

        public const string SubjectApproved = "SubjectApproved";
        public const string IntroApproved = "IntroApproved";
        public const string ClosingApproved = "ClosingApproved";

        public const string SubjectUpdated = "SubjectUpdated";
        public const string IntroUpdated = "IntroUpdated";
        public const string ClosingUpdated = "ClosingUpdated";

        public const string SubjectReactivated = "SubjectReactivated";
        public const string IntroReactivatedApology = "IntroReactivatedApology";
        public const string IntroReactivatedGoodNews = "IntroReactivatedGoodNews";
        public const string ClosingReactivated = "ClosingReactivated";

        public const string SubjectCancelled = "SubjectCancelled";
        public const string IntroCancelled = "IntroCancelled";
        public const string ClosingCancelled = "ClosingCancelled";

        public const string SubjectReceived = "SubjectReceived";
        public const string IntroReceived = "IntroReceived";

        public const string SubjectPickupReminder = "SubjectPickupReminder";
        public const string IntroPickupReminder = "IntroPickupReminder";
        public const string ClosingPickupReminder = "ClosingPickupReminder";
    }

    private const string FallbackLanguage = "en";

    /// <summary>
    /// Liefert den Text für <paramref name="key"/> in <paramref name="language"/>.
    /// Fehlt der Schlüssel in dieser Sprache oder die Sprache komplett, greift
    /// Englisch. Fehlt der Schlüssel sogar dort (Programmierfehler beim
    /// Anlegen neuer Schlüssel), kommt der Schlüsselname selbst zurück statt
    /// einer leeren Mail — leicht als Bug erkennbar, reißt aber nichts ab.
    /// </summary>
    public static string T(string language, string key)
    {
        if (Texts.TryGetValue(language, out var dict) && dict.TryGetValue(key, out var value))
            return value;

        if (Texts[FallbackLanguage].TryGetValue(key, out var fallback))
            return fallback;

        return key;
    }

    public static string T(string language, string key, params object[] args)
        => string.Format(T(language, key), args);

    private static readonly Dictionary<string, Dictionary<string, string>> Texts = new(StringComparer.OrdinalIgnoreCase)
    {
        ["de"] = De(),
        ["en"] = En(),
        ["fr"] = Fr(),
        ["tr"] = Tr(),
        ["es"] = Es(),
        ["it"] = It(),
        ["ar"] = Ar(),
        ["ru"] = Ru(),
        ["no"] = No(),
        ["da"] = Da(),
        ["nl"] = Nl(),
        ["pl"] = Pl(),
    };

    private static Dictionary<string, string> De() => new()
    {
        [Keys.Greeting] = "Hallo {0},",
        [Keys.LabelBookingNumber] = "Buchungsnummer",
        [Keys.LabelBike] = "Fahrrad",
        [Keys.LabelPeriod] = "Zeitraum",
        [Keys.LabelNewPeriod] = "Neuer Zeitraum",
        [Keys.UnitDays] = "Tage",
        [Keys.LinePickupTimeDesired] = "\nGewünschte Abholzeit: {0} Uhr",
        [Keys.LinePickupTimeReminder] = "\nAbholzeit: {0} Uhr",
        [Keys.LabelAccessoriesIncluded] = "Zubehör (inklusive)",
        [Keys.LabelAccessories] = "Zubehör",
        [Keys.ValueAccessoriesNone] = "Keine",
        [Keys.LabelPrice] = "Mietpreis",
        [Keys.LabelNewPrice] = "Neuer Mietpreis",
        [Keys.ValuePriceFallback] = "wird im Laden bestätigt",
        [Keys.HeadingBookingDetails] = "Deine Buchungsdetails:",
        [Keys.HeadingPickupReturn] = "Abholung und Rückgabe:",
        [Keys.HeadingPickup] = "Abholung:",
        [Keys.HeadingImportantNote] = "Wichtiger Hinweis:",
        [Keys.LineOpeningHours] = "\nÖffnungszeiten: {0}",
        [Keys.LineGoogleMaps] = "\nAnfahrt (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nHinweis: Verleih-Abholung ist ab 10:00 Uhr möglich – unabhängig von den Öffnungszeiten des Ladens (An- & Verkauf).",
        [Keys.ValueDepositWithAmount] = "Bitte bring zur Abholung einen gültigen Lichtbildausweis und die Kaution von insgesamt {0} EUR in bar mit.\nDie Kaution gilt für die gesamte Buchung, nicht je Fahrrad.",
        [Keys.ValueDepositWithoutAmount] = "Bitte bring zur Abholung einen gültigen Lichtbildausweis und die Kaution in bar mit.\nDie Höhe nennen wir dir vor der Abholung; sie gilt für die gesamte Buchung, nicht je Fahrrad.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Bitte denk an einen gültigen Lichtbildausweis und die Kaution von insgesamt {0} EUR in bar.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Bitte denk an einen gültigen Lichtbildausweis und die Kaution in bar; die Höhe nennen wir dir bei der Abholung.",
        [Keys.HeadingSelfCancel] = "Falls du doch nicht fahren kannst:",
        [Keys.TextSelfCancel] = "Du kannst deine Buchung selbst stornieren über diesen Link:",
        [Keys.TextSelfCancelReminder] = "Falls du doch nicht kommen kannst, kannst du deine Buchung ganz einfach selbst stornieren:",
        [Keys.ValueSelfCancelFallback] = "Bitte antworte auf diese E-Mail für eine Stornierung.",
        [Keys.SignOff] = "Viele Grüße\nDein Team vom Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Buchung bestätigt",
        [Keys.IntroApproved] = "gute Nachricht: deine Buchung ist bestätigt.\nDein Bike ist für deinen Wunschzeitraum fest für dich reserviert.",
        [Keys.ClosingApproved] = "Wir wünschen dir jetzt schon eine richtig coole Tour.\nWenn du noch Fragen hast, antworte einfach auf diese E-Mail oder ruf kurz durch.",

        [Keys.SubjectUpdated] = "Buchung aktualisiert",
        [Keys.IntroUpdated] = "wir haben deine Buchung angepasst. Hier sind die aktualisierten Details:",
        [Keys.ClosingUpdated] = "Alle anderen Details deiner Buchung bleiben unverändert.\n\nFalls etwas nicht stimmt oder du Fragen hast, antworte einfach auf diese E-Mail oder ruf kurz durch.",

        [Keys.SubjectReactivated] = "Buchung wieder aktiv",
        [Keys.IntroReactivatedApology] = "kurze Entschuldigung vorweg: Du hast vor Kurzem fälschlicherweise eine Stornierungs-Bestätigung von uns erhalten. Das war ein technischer Fehler – deine Buchung wurde NICHT von dir storniert.",
        [Keys.IntroReactivatedGoodNews] = "Gute Nachricht: Deine Buchung ist wieder aktiv.",
        [Keys.ClosingReactivated] = "Du musst nichts weiter tun. Falls du Fragen hast oder tatsächlich stornieren möchtest, antworte einfach auf diese E-Mail oder ruf kurz durch.\n\nEntschuldige bitte die Verwirrung.",

        [Keys.SubjectCancelled] = "Buchung storniert",
        [Keys.IntroCancelled] = "deine Buchung wurde storniert.\n\nHier noch einmal die Details:",
        [Keys.ClosingCancelled] = "Wenn du einen neuen Termin möchtest, antworte einfach auf diese E-Mail.\nWir schauen gerne direkt nach einer passenden Alternative für dich.",

        [Keys.SubjectReceived] = "Buchung bestätigt",
        [Keys.IntroReceived] = "vielen Dank für deine Mietanfrage.\n\nDeine Buchung ist direkt bestätigt, eine gesonderte Prüfung ist nicht mehr nötig.",

        [Keys.SubjectPickupReminder] = "Morgen geht's los",
        [Keys.IntroPickupReminder] = "nur eine kurze Erinnerung: morgen liegt dein Fahrrad schon für dich bereit.",
        [Keys.ClosingPickupReminder] = "Wir freuen uns auf dich.",
    };

    private static Dictionary<string, string> En() => new()
    {
        [Keys.Greeting] = "Hello {0},",
        [Keys.LabelBookingNumber] = "Booking number",
        [Keys.LabelBike] = "Bike",
        [Keys.LabelPeriod] = "Period",
        [Keys.LabelNewPeriod] = "New period",
        [Keys.UnitDays] = "days",
        [Keys.LinePickupTimeDesired] = "\nPreferred pickup time: {0}",
        [Keys.LinePickupTimeReminder] = "\nPickup time: {0}",
        [Keys.LabelAccessoriesIncluded] = "Accessories (included)",
        [Keys.LabelAccessories] = "Accessories",
        [Keys.ValueAccessoriesNone] = "None",
        [Keys.LabelPrice] = "Rental price",
        [Keys.LabelNewPrice] = "New rental price",
        [Keys.ValuePriceFallback] = "will be confirmed in store",
        [Keys.HeadingBookingDetails] = "Your booking details:",
        [Keys.HeadingPickupReturn] = "Pickup and return:",
        [Keys.HeadingPickup] = "Pickup:",
        [Keys.HeadingImportantNote] = "Important note:",
        [Keys.LineOpeningHours] = "\nOpening hours: {0}",
        [Keys.LineGoogleMaps] = "\nDirections (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nNote: rental pickup is possible from 10:00 – independent of the shop's regular opening hours (sales).",
        [Keys.ValueDepositWithAmount] = "Please bring a valid photo ID and the total deposit of {0} EUR in cash when you pick up the bike.\nThe deposit covers the whole booking, not each bike separately.",
        [Keys.ValueDepositWithoutAmount] = "Please bring a valid photo ID and the deposit in cash when you pick up the bike.\nWe will tell you the amount before pickup; it covers the whole booking, not each bike separately.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Please bring a valid photo ID and the total deposit of {0} EUR in cash.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Please bring a valid photo ID and the deposit in cash; we will tell you the amount at pickup.",
        [Keys.HeadingSelfCancel] = "If you cannot ride after all:",
        [Keys.TextSelfCancel] = "You can cancel your booking yourself via this link:",
        [Keys.TextSelfCancelReminder] = "If you can't make it after all, you can cancel your booking yourself here:",
        [Keys.ValueSelfCancelFallback] = "Please reply to this email to cancel.",
        [Keys.SignOff] = "Best regards\nYour Bike Haus Freiburg team",

        [Keys.SubjectApproved] = "Booking confirmed",
        [Keys.IntroApproved] = "good news: your booking is confirmed.\nYour bike is firmly reserved for you for your requested period.",
        [Keys.ClosingApproved] = "We already wish you a really great ride.\nIf you have any questions, simply reply to this email or give us a quick call.",

        [Keys.SubjectUpdated] = "Booking updated",
        [Keys.IntroUpdated] = "we have updated your booking. Here are the updated details:",
        [Keys.ClosingUpdated] = "All other details of your booking remain unchanged.\n\nIf something is not right or you have any questions, simply reply to this email or give us a quick call.",

        [Keys.SubjectReactivated] = "Booking reactivated",
        [Keys.IntroReactivatedApology] = "first of all, our apologies: you recently received a cancellation confirmation from us by mistake. That was a technical error – your booking was NOT cancelled by you.",
        [Keys.IntroReactivatedGoodNews] = "Good news: your booking is active again.",
        [Keys.ClosingReactivated] = "There is nothing you need to do. If you have any questions or actually want to cancel, simply reply to this email or give us a quick call.\n\nSorry for the confusion.",

        [Keys.SubjectCancelled] = "Booking cancelled",
        [Keys.IntroCancelled] = "your booking has been cancelled.\n\nHere are the details once more:",
        [Keys.ClosingCancelled] = "If you would like a new date, simply reply to this email.\nWe are happy to look for a suitable alternative for you right away.",

        [Keys.SubjectReceived] = "Booking confirmed",
        [Keys.IntroReceived] = "thank you for your rental request.\n\nYour booking is confirmed right away, no separate review is needed.",

        [Keys.SubjectPickupReminder] = "See you tomorrow",
        [Keys.IntroPickupReminder] = "just a quick reminder: your bike is ready and waiting for you tomorrow.",
        [Keys.ClosingPickupReminder] = "We're looking forward to seeing you.",
    };

    private static Dictionary<string, string> Fr() => new()
    {
        [Keys.Greeting] = "Bonjour {0},",
        [Keys.LabelBookingNumber] = "Numéro de réservation",
        [Keys.LabelBike] = "Vélo",
        [Keys.LabelPeriod] = "Période",
        [Keys.LabelNewPeriod] = "Nouvelle période",
        [Keys.UnitDays] = "jours",
        [Keys.LinePickupTimeDesired] = "\nHeure de retrait souhaitée : {0}",
        [Keys.LinePickupTimeReminder] = "\nHeure de retrait : {0}",
        [Keys.LabelAccessoriesIncluded] = "Accessoires (inclus)",
        [Keys.LabelAccessories] = "Accessoires",
        [Keys.ValueAccessoriesNone] = "Aucun",
        [Keys.LabelPrice] = "Prix de la location",
        [Keys.LabelNewPrice] = "Nouveau prix de la location",
        [Keys.ValuePriceFallback] = "sera confirmé en boutique",
        [Keys.HeadingBookingDetails] = "Le détail de ta réservation :",
        [Keys.HeadingPickupReturn] = "Retrait et retour :",
        [Keys.HeadingPickup] = "Retrait :",
        [Keys.HeadingImportantNote] = "Remarque importante :",
        [Keys.LineOpeningHours] = "\nHoraires d'ouverture : {0}",
        [Keys.LineGoogleMaps] = "\nItinéraire (Google Maps) : {0}",
        [Keys.LineRentalHoursNote] = "\nRemarque : le retrait des vélos de location est possible dès 10h00, indépendamment des horaires d'ouverture du magasin (vente).",
        [Keys.ValueDepositWithAmount] = "Merci d'apporter une pièce d'identité avec photo valide et la caution totale de {0} EUR en espèces lors du retrait.\nLa caution couvre toute la réservation, pas chaque vélo séparément.",
        [Keys.ValueDepositWithoutAmount] = "Merci d'apporter une pièce d'identité avec photo valide et la caution en espèces lors du retrait.\nNous t'indiquerons le montant avant le retrait ; elle couvre toute la réservation, pas chaque vélo séparément.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Pense à apporter une pièce d'identité avec photo valide et la caution totale de {0} EUR en espèces.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Pense à apporter une pièce d'identité avec photo valide et la caution en espèces ; nous t'indiquerons le montant au retrait.",
        [Keys.HeadingSelfCancel] = "Si finalement tu ne peux pas venir :",
        [Keys.TextSelfCancel] = "Tu peux annuler ta réservation toi-même via ce lien :",
        [Keys.TextSelfCancelReminder] = "Si tu ne peux finalement pas venir, tu peux annuler ta réservation toi-même ici :",
        [Keys.ValueSelfCancelFallback] = "Merci de répondre à cet e-mail pour annuler.",
        [Keys.SignOff] = "Bien cordialement\nTon équipe de Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Réservation confirmée",
        [Keys.IntroApproved] = "bonne nouvelle : ta réservation est confirmée.\nTon vélo est réservé pour toi pour la période demandée.",
        [Keys.ClosingApproved] = "On te souhaite dès à présent une super balade.\nSi tu as des questions, réponds simplement à cet e-mail ou appelle-nous rapidement.",

        [Keys.SubjectUpdated] = "Réservation mise à jour",
        [Keys.IntroUpdated] = "nous avons modifié ta réservation. Voici les détails mis à jour :",
        [Keys.ClosingUpdated] = "Tous les autres détails de ta réservation restent inchangés.\n\nSi quelque chose ne va pas ou si tu as des questions, réponds simplement à cet e-mail ou appelle-nous rapidement.",

        [Keys.SubjectReactivated] = "Réservation de nouveau active",
        [Keys.IntroReactivatedApology] = "petite excuse d'abord : tu as récemment reçu par erreur une confirmation d'annulation de notre part. C'était une erreur technique – ta réservation n'a PAS été annulée par toi.",
        [Keys.IntroReactivatedGoodNews] = "Bonne nouvelle : ta réservation est de nouveau active.",
        [Keys.ClosingReactivated] = "Tu n'as rien à faire. Si tu as des questions ou si tu souhaites vraiment annuler, réponds simplement à cet e-mail ou appelle-nous rapidement.\n\nDésolé pour la confusion.",

        [Keys.SubjectCancelled] = "Réservation annulée",
        [Keys.IntroCancelled] = "ta réservation a été annulée.\n\nVoici de nouveau les détails :",
        [Keys.ClosingCancelled] = "Si tu souhaites une nouvelle date, réponds simplement à cet e-mail.\nNous serons ravis de te trouver une alternative adaptée tout de suite.",

        [Keys.SubjectReceived] = "Réservation confirmée",
        [Keys.IntroReceived] = "merci pour ta demande de location.\n\nTa réservation est confirmée immédiatement, aucune vérification supplémentaire n'est nécessaire.",

        [Keys.SubjectPickupReminder] = "À demain",
        [Keys.IntroPickupReminder] = "un petit rappel : ton vélo t'attend déjà pour demain.",
        [Keys.ClosingPickupReminder] = "On a hâte de te voir.",
    };

    private static Dictionary<string, string> Tr() => new()
    {
        [Keys.Greeting] = "Merhaba {0},",
        [Keys.LabelBookingNumber] = "Rezervasyon numarası",
        [Keys.LabelBike] = "Bisiklet",
        [Keys.LabelPeriod] = "Tarih aralığı",
        [Keys.LabelNewPeriod] = "Yeni tarih aralığı",
        [Keys.UnitDays] = "gün",
        [Keys.LinePickupTimeDesired] = "\nİstenen teslim alma saati: {0}",
        [Keys.LinePickupTimeReminder] = "\nTeslim alma saati: {0}",
        [Keys.LabelAccessoriesIncluded] = "Aksesuar (dahil)",
        [Keys.LabelAccessories] = "Aksesuar",
        [Keys.ValueAccessoriesNone] = "Yok",
        [Keys.LabelPrice] = "Kiralama ücreti",
        [Keys.LabelNewPrice] = "Yeni kiralama ücreti",
        [Keys.ValuePriceFallback] = "mağazada onaylanacak",
        [Keys.HeadingBookingDetails] = "Rezervasyon detayların:",
        [Keys.HeadingPickupReturn] = "Teslim alma ve iade:",
        [Keys.HeadingPickup] = "Teslim alma:",
        [Keys.HeadingImportantNote] = "Önemli not:",
        [Keys.LineOpeningHours] = "\nÇalışma saatleri: {0}",
        [Keys.LineGoogleMaps] = "\nYol tarifi (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nNot: Kiralama teslim alma saat 10:00'dan itibaren mümkündür – mağazanın (alış-satış) açılış saatlerinden bağımsızdır.",
        [Keys.ValueDepositWithAmount] = "Teslim alırken lütfen geçerli bir fotoğraflı kimlik ve toplam {0} EUR depozitoyu nakit olarak getir.\nDepozito bisiklet başına değil, tüm rezervasyon için geçerlidir.",
        [Keys.ValueDepositWithoutAmount] = "Teslim alırken lütfen geçerli bir fotoğraflı kimlik ve depozitoyu nakit olarak getir.\nTutarı teslimden önce sana bildireceğiz; tüm rezervasyon için geçerlidir, bisiklet başına değil.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Lütfen geçerli bir fotoğraflı kimlik ve toplam {0} EUR depozitoyu nakit olarak yanında getirmeyi unutma.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Lütfen geçerli bir fotoğraflı kimlik ve depozitoyu nakit olarak yanında getirmeyi unutma; tutarı teslim alırken sana söyleyeceğiz.",
        [Keys.HeadingSelfCancel] = "Sonuçta gelemeyecek olursan:",
        [Keys.TextSelfCancel] = "Rezervasyonunu bu link üzerinden kendin iptal edebilirsin:",
        [Keys.TextSelfCancelReminder] = "Sonuçta gelemeyecek olursan, rezervasyonunu buradan kendin kolayca iptal edebilirsin:",
        [Keys.ValueSelfCancelFallback] = "İptal için lütfen bu e-postayı yanıtla.",
        [Keys.SignOff] = "Sevgiler\nBike Haus Freiburg Ekibin",

        [Keys.SubjectApproved] = "Rezervasyon onaylandı",
        [Keys.IntroApproved] = "iyi haber: rezervasyonun onaylandı.\nBisikletin istediğin tarih aralığı için senin için kesin olarak ayrıldı.",
        [Keys.ClosingApproved] = "Şimdiden harika bir sürüş dileriz.\nSorun varsa bu e-postayı yanıtlaman ya da bizi kısaca araman yeterli.",

        [Keys.SubjectUpdated] = "Rezervasyon güncellendi",
        [Keys.IntroUpdated] = "rezervasyonunu güncelledik. Güncel detaylar şöyle:",
        [Keys.ClosingUpdated] = "Rezervasyonunun diğer tüm detayları değişmeden kalır.\n\nBir şey yanlışsa veya sorun varsa bu e-postayı yanıtlaman ya da bizi kısaca araman yeterli.",

        [Keys.SubjectReactivated] = "Rezervasyon tekrar aktif",
        [Keys.IntroReactivatedApology] = "önce kısa bir özür: kısa süre önce yanlışlıkla bizden bir iptal onayı aldın. Bu teknik bir hataydı – rezervasyonun senin tarafından iptal edilmedi.",
        [Keys.IntroReactivatedGoodNews] = "İyi haber: rezervasyonun tekrar aktif.",
        [Keys.ClosingReactivated] = "Senin yapman gereken bir şey yok. Sorun varsa ya da gerçekten iptal etmek istiyorsan bu e-postayı yanıtlaman ya da bizi kısaca araman yeterli.\n\nKarışıklık için özür dileriz.",

        [Keys.SubjectCancelled] = "Rezervasyon iptal edildi",
        [Keys.IntroCancelled] = "rezervasyonun iptal edildi.\n\nDetaylar bir kez daha aşağıda:",
        [Keys.ClosingCancelled] = "Yeni bir tarih istersen bu e-postayı yanıtlaman yeterli.\nSenin için hemen uygun bir alternatif ararız.",

        [Keys.SubjectReceived] = "Rezervasyon onaylandı",
        [Keys.IntroReceived] = "kiralama talebin için teşekkürler.\n\nRezervasyonun hemen onaylandı, ayrıca bir inceleme gerekmiyor.",

        [Keys.SubjectPickupReminder] = "Yarın görüşürüz",
        [Keys.IntroPickupReminder] = "kısa bir hatırlatma: bisikletin yarın senin için hazır olacak.",
        [Keys.ClosingPickupReminder] = "Seni görmeyi dört gözle bekliyoruz.",
    };

    private static Dictionary<string, string> Es() => new()
    {
        [Keys.Greeting] = "Hola {0},",
        [Keys.LabelBookingNumber] = "Número de reserva",
        [Keys.LabelBike] = "Bicicleta",
        [Keys.LabelPeriod] = "Periodo",
        [Keys.LabelNewPeriod] = "Nuevo periodo",
        [Keys.UnitDays] = "días",
        [Keys.LinePickupTimeDesired] = "\nHora de recogida deseada: {0}",
        [Keys.LinePickupTimeReminder] = "\nHora de recogida: {0}",
        [Keys.LabelAccessoriesIncluded] = "Accesorios (incluidos)",
        [Keys.LabelAccessories] = "Accesorios",
        [Keys.ValueAccessoriesNone] = "Ninguno",
        [Keys.LabelPrice] = "Precio del alquiler",
        [Keys.LabelNewPrice] = "Nuevo precio del alquiler",
        [Keys.ValuePriceFallback] = "se confirmará en la tienda",
        [Keys.HeadingBookingDetails] = "Los detalles de tu reserva:",
        [Keys.HeadingPickupReturn] = "Recogida y devolución:",
        [Keys.HeadingPickup] = "Recogida:",
        [Keys.HeadingImportantNote] = "Aviso importante:",
        [Keys.LineOpeningHours] = "\nHorario de apertura: {0}",
        [Keys.LineGoogleMaps] = "\nCómo llegar (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nNota: la recogida del alquiler es posible a partir de las 10:00, independientemente del horario de apertura de la tienda (venta).",
        [Keys.ValueDepositWithAmount] = "Trae contigo un documento de identidad con foto válido y la fianza total de {0} EUR en efectivo al recoger la bici.\nLa fianza cubre toda la reserva, no cada bicicleta por separado.",
        [Keys.ValueDepositWithoutAmount] = "Trae contigo un documento de identidad con foto válido y la fianza en efectivo al recoger la bici.\nTe indicaremos el importe antes de la recogida; cubre toda la reserva, no cada bicicleta por separado.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Recuerda traer un documento de identidad con foto válido y la fianza total de {0} EUR en efectivo.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Recuerda traer un documento de identidad con foto válido y la fianza en efectivo; te indicaremos el importe al recoger la bici.",
        [Keys.HeadingSelfCancel] = "Si al final no puedes venir:",
        [Keys.TextSelfCancel] = "Puedes cancelar tu reserva tú mismo/a a través de este enlace:",
        [Keys.TextSelfCancelReminder] = "Si al final no puedes venir, puedes cancelar tu reserva tú mismo/a aquí:",
        [Keys.ValueSelfCancelFallback] = "Responde a este correo para cancelar.",
        [Keys.SignOff] = "Un saludo\nTu equipo de Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Reserva confirmada",
        [Keys.IntroApproved] = "buenas noticias: tu reserva está confirmada.\nTu bici queda reservada firmemente para ti durante el periodo solicitado.",
        [Keys.ClosingApproved] = "Ya te deseamos un paseo fantástico.\nSi tienes alguna pregunta, simplemente responde a este correo o llámanos.",

        [Keys.SubjectUpdated] = "Reserva actualizada",
        [Keys.IntroUpdated] = "hemos actualizado tu reserva. Estos son los detalles actualizados:",
        [Keys.ClosingUpdated] = "El resto de los detalles de tu reserva no cambian.\n\nSi algo no es correcto o tienes preguntas, simplemente responde a este correo o llámanos.",

        [Keys.SubjectReactivated] = "Reserva activa de nuevo",
        [Keys.IntroReactivatedApology] = "antes de nada, disculpa: recientemente recibiste por error una confirmación de cancelación por nuestra parte. Fue un error técnico: tu reserva NO fue cancelada por ti.",
        [Keys.IntroReactivatedGoodNews] = "Buenas noticias: tu reserva vuelve a estar activa.",
        [Keys.ClosingReactivated] = "No tienes que hacer nada más. Si tienes preguntas o realmente quieres cancelar, simplemente responde a este correo o llámanos.\n\nDisculpa la confusión.",

        [Keys.SubjectCancelled] = "Reserva cancelada",
        [Keys.IntroCancelled] = "tu reserva ha sido cancelada.\n\nAquí tienes de nuevo los detalles:",
        [Keys.ClosingCancelled] = "Si quieres una nueva fecha, simplemente responde a este correo.\nCon gusto buscamos enseguida una alternativa adecuada para ti.",

        [Keys.SubjectReceived] = "Reserva confirmada",
        [Keys.IntroReceived] = "gracias por tu solicitud de alquiler.\n\nTu reserva queda confirmada de inmediato, no es necesaria ninguna revisión adicional.",

        [Keys.SubjectPickupReminder] = "Nos vemos mañana",
        [Keys.IntroPickupReminder] = "solo un breve recordatorio: mañana tu bici ya estará lista para ti.",
        [Keys.ClosingPickupReminder] = "Nos hace ilusión verte.",
    };

    private static Dictionary<string, string> It() => new()
    {
        [Keys.Greeting] = "Ciao {0},",
        [Keys.LabelBookingNumber] = "Numero di prenotazione",
        [Keys.LabelBike] = "Bici",
        [Keys.LabelPeriod] = "Periodo",
        [Keys.LabelNewPeriod] = "Nuovo periodo",
        [Keys.UnitDays] = "giorni",
        [Keys.LinePickupTimeDesired] = "\nOrario di ritiro desiderato: {0}",
        [Keys.LinePickupTimeReminder] = "\nOrario di ritiro: {0}",
        [Keys.LabelAccessoriesIncluded] = "Accessori (inclusi)",
        [Keys.LabelAccessories] = "Accessori",
        [Keys.ValueAccessoriesNone] = "Nessuno",
        [Keys.LabelPrice] = "Prezzo del noleggio",
        [Keys.LabelNewPrice] = "Nuovo prezzo del noleggio",
        [Keys.ValuePriceFallback] = "verrà confermato in negozio",
        [Keys.HeadingBookingDetails] = "I dettagli della tua prenotazione:",
        [Keys.HeadingPickupReturn] = "Ritiro e riconsegna:",
        [Keys.HeadingPickup] = "Ritiro:",
        [Keys.HeadingImportantNote] = "Nota importante:",
        [Keys.LineOpeningHours] = "\nOrari di apertura: {0}",
        [Keys.LineGoogleMaps] = "\nIndicazioni (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nNota: il ritiro del noleggio è possibile dalle 10:00, indipendentemente dagli orari di apertura del negozio (vendita).",
        [Keys.ValueDepositWithAmount] = "Porta con te un documento d'identità con foto valido e la cauzione totale di {0} EUR in contanti al ritiro.\nLa cauzione copre l'intera prenotazione, non ogni bici singolarmente.",
        [Keys.ValueDepositWithoutAmount] = "Porta con te un documento d'identità con foto valido e la cauzione in contanti al ritiro.\nTi comunicheremo l'importo prima del ritiro; copre l'intera prenotazione, non ogni bici singolarmente.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Ricorda di portare un documento d'identità con foto valido e la cauzione totale di {0} EUR in contanti.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Ricorda di portare un documento d'identità con foto valido e la cauzione in contanti; ti comunicheremo l'importo al ritiro.",
        [Keys.HeadingSelfCancel] = "Se alla fine non puoi venire:",
        [Keys.TextSelfCancel] = "Puoi cancellare la tua prenotazione da solo/a tramite questo link:",
        [Keys.TextSelfCancelReminder] = "Se alla fine non puoi venire, puoi cancellare la tua prenotazione da solo/a qui:",
        [Keys.ValueSelfCancelFallback] = "Rispondi a questa e-mail per cancellare.",
        [Keys.SignOff] = "Un caro saluto\nIl tuo team di Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Prenotazione confermata",
        [Keys.IntroApproved] = "buone notizie: la tua prenotazione è confermata.\nLa tua bici è riservata per te per il periodo richiesto.",
        [Keys.ClosingApproved] = "Ti auguriamo già ora un giro fantastico.\nSe hai domande, rispondi semplicemente a questa e-mail o chiamaci.",

        [Keys.SubjectUpdated] = "Prenotazione aggiornata",
        [Keys.IntroUpdated] = "abbiamo modificato la tua prenotazione. Ecco i dettagli aggiornati:",
        [Keys.ClosingUpdated] = "Tutti gli altri dettagli della tua prenotazione restano invariati.\n\nSe qualcosa non è corretto o hai domande, rispondi semplicemente a questa e-mail o chiamaci.",

        [Keys.SubjectReactivated] = "Prenotazione di nuovo attiva",
        [Keys.IntroReactivatedApology] = "prima di tutto, ci scusiamo: di recente hai ricevuto per errore una conferma di cancellazione da parte nostra. È stato un errore tecnico: la tua prenotazione NON è stata cancellata da te.",
        [Keys.IntroReactivatedGoodNews] = "Buone notizie: la tua prenotazione è di nuovo attiva.",
        [Keys.ClosingReactivated] = "Non devi fare nulla. Se hai domande o vuoi davvero cancellare, rispondi semplicemente a questa e-mail o chiamaci.\n\nScusa per il disguido.",

        [Keys.SubjectCancelled] = "Prenotazione cancellata",
        [Keys.IntroCancelled] = "la tua prenotazione è stata cancellata.\n\nEcco di nuovo i dettagli:",
        [Keys.ClosingCancelled] = "Se desideri una nuova data, rispondi semplicemente a questa e-mail.\nCerchiamo volentieri subito un'alternativa adatta a te.",

        [Keys.SubjectReceived] = "Prenotazione confermata",
        [Keys.IntroReceived] = "grazie per la tua richiesta di noleggio.\n\nLa tua prenotazione è confermata subito, non è necessaria alcuna verifica.",

        [Keys.SubjectPickupReminder] = "Ci vediamo domani",
        [Keys.IntroPickupReminder] = "solo un rapido promemoria: domani la tua bici sarà già pronta per te.",
        [Keys.ClosingPickupReminder] = "Non vediamo l'ora di vederti.",
    };

    private static Dictionary<string, string> Ar() => new()
    {
        [Keys.Greeting] = "مرحبًا {0}،",
        [Keys.LabelBookingNumber] = "رقم الحجز",
        [Keys.LabelBike] = "الدراجة",
        [Keys.LabelPeriod] = "الفترة",
        [Keys.LabelNewPeriod] = "الفترة الجديدة",
        [Keys.UnitDays] = "أيام",
        [Keys.LinePickupTimeDesired] = "\nوقت الاستلام المطلوب: {0}",
        [Keys.LinePickupTimeReminder] = "\nوقت الاستلام: {0}",
        [Keys.LabelAccessoriesIncluded] = "الملحقات (شاملة)",
        [Keys.LabelAccessories] = "الملحقات",
        [Keys.ValueAccessoriesNone] = "لا يوجد",
        [Keys.LabelPrice] = "سعر الإيجار",
        [Keys.LabelNewPrice] = "سعر الإيجار الجديد",
        [Keys.ValuePriceFallback] = "سيتم تأكيده في المتجر",
        [Keys.HeadingBookingDetails] = "تفاصيل حجزك:",
        [Keys.HeadingPickupReturn] = "الاستلام والإرجاع:",
        [Keys.HeadingPickup] = "الاستلام:",
        [Keys.HeadingImportantNote] = "ملاحظة مهمة:",
        [Keys.LineOpeningHours] = "\nساعات العمل: {0}",
        [Keys.LineGoogleMaps] = "\nالاتجاهات (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nملاحظة: استلام دراجة الإيجار ممكن من الساعة 10:00 – بغض النظر عن ساعات عمل المتجر (البيع).",
        [Keys.ValueDepositWithAmount] = "يرجى إحضار بطاقة هوية سارية تحمل صورة والتأمين الإجمالي البالغ {0} يورو نقدًا عند الاستلام.\nالتأمين يشمل الحجز بالكامل وليس كل دراجة على حدة.",
        [Keys.ValueDepositWithoutAmount] = "يرجى إحضار بطاقة هوية سارية تحمل صورة والتأمين نقدًا عند الاستلام.\nسنخبرك بالمبلغ قبل الاستلام؛ وهو يشمل الحجز بالكامل وليس كل دراجة على حدة.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "يرجى عدم نسيان إحضار بطاقة هوية سارية تحمل صورة والتأمين الإجمالي البالغ {0} يورو نقدًا.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "يرجى عدم نسيان إحضار بطاقة هوية سارية تحمل صورة والتأمين نقدًا؛ سنخبرك بالمبلغ عند الاستلام.",
        [Keys.HeadingSelfCancel] = "إذا تعذر عليك القدوم في النهاية:",
        [Keys.TextSelfCancel] = "يمكنك إلغاء حجزك بنفسك عبر هذا الرابط:",
        [Keys.TextSelfCancelReminder] = "إذا تعذر عليك القدوم في النهاية، يمكنك إلغاء حجزك بنفسك من هنا:",
        [Keys.ValueSelfCancelFallback] = "يرجى الرد على هذا البريد الإلكتروني للإلغاء.",
        [Keys.SignOff] = "مع أطيب التحيات\nفريق Bike Haus Freiburg",

        [Keys.SubjectApproved] = "تم تأكيد الحجز",
        [Keys.IntroApproved] = "خبر سار: تم تأكيد حجزك.\nتم حجز دراجتك لك بشكل نهائي للفترة التي طلبتها.",
        [Keys.ClosingApproved] = "نتمنى لك مسبقًا رحلة رائعة.\nإذا كانت لديك أي أسئلة، يمكنك ببساطة الرد على هذا البريد الإلكتروني أو الاتصال بنا مباشرة.",

        [Keys.SubjectUpdated] = "تم تحديث الحجز",
        [Keys.IntroUpdated] = "لقد قمنا بتعديل حجزك. إليك التفاصيل المحدثة:",
        [Keys.ClosingUpdated] = "تبقى جميع تفاصيل حجزك الأخرى دون تغيير.\n\nإذا كان هناك خطأ ما أو لديك أسئلة، يمكنك ببساطة الرد على هذا البريد الإلكتروني أو الاتصال بنا مباشرة.",

        [Keys.SubjectReactivated] = "الحجز نشط مجددًا",
        [Keys.IntroReactivatedApology] = "اعتذار سريع أولًا: لقد تلقيت مؤخرًا عن طريق الخطأ تأكيد إلغاء منا. كان ذلك خطأً تقنيًا - لم يتم إلغاء حجزك من قبلك.",
        [Keys.IntroReactivatedGoodNews] = "خبر سار: حجزك نشط مجددًا.",
        [Keys.ClosingReactivated] = "لا داعي لفعل أي شيء. إذا كانت لديك أسئلة أو كنت ترغب فعلًا في الإلغاء، يمكنك ببساطة الرد على هذا البريد الإلكتروني أو الاتصال بنا مباشرة.\n\nنعتذر عن هذا اللبس.",

        [Keys.SubjectCancelled] = "تم إلغاء الحجز",
        [Keys.IntroCancelled] = "تم إلغاء حجزك.\n\nإليك التفاصيل مرة أخرى:",
        [Keys.ClosingCancelled] = "إذا كنت ترغب في موعد جديد، يمكنك ببساطة الرد على هذا البريد الإلكتروني.\nيسعدنا البحث عن بديل مناسب لك على الفور.",

        [Keys.SubjectReceived] = "تم تأكيد الحجز",
        [Keys.IntroReceived] = "شكرًا لطلب الإيجار الخاص بك.\n\nتم تأكيد حجزك فورًا، ولا حاجة لأي مراجعة إضافية.",

        [Keys.SubjectPickupReminder] = "أراك غدًا",
        [Keys.IntroPickupReminder] = "مجرد تذكير سريع: دراجتك ستكون جاهزة لك غدًا.",
        [Keys.ClosingPickupReminder] = "نتطلع لرؤيتك.",
    };

    private static Dictionary<string, string> Ru() => new()
    {
        [Keys.Greeting] = "Привет, {0}!",
        [Keys.LabelBookingNumber] = "Номер бронирования",
        [Keys.LabelBike] = "Велосипед",
        [Keys.LabelPeriod] = "Период",
        [Keys.LabelNewPeriod] = "Новый период",
        [Keys.UnitDays] = "дней",
        [Keys.LinePickupTimeDesired] = "\nЖелаемое время получения: {0}",
        [Keys.LinePickupTimeReminder] = "\nВремя получения: {0}",
        [Keys.LabelAccessoriesIncluded] = "Аксессуары (включены)",
        [Keys.LabelAccessories] = "Аксессуары",
        [Keys.ValueAccessoriesNone] = "Нет",
        [Keys.LabelPrice] = "Стоимость аренды",
        [Keys.LabelNewPrice] = "Новая стоимость аренды",
        [Keys.ValuePriceFallback] = "будет подтверждена в магазине",
        [Keys.HeadingBookingDetails] = "Детали твоего бронирования:",
        [Keys.HeadingPickupReturn] = "Получение и возврат:",
        [Keys.HeadingPickup] = "Получение:",
        [Keys.HeadingImportantNote] = "Важное замечание:",
        [Keys.LineOpeningHours] = "\nЧасы работы: {0}",
        [Keys.LineGoogleMaps] = "\nМаршрут (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nПримечание: выдача прокатных велосипедов возможна с 10:00 – независимо от часов работы магазина (продажа).",
        [Keys.ValueDepositWithAmount] = "Пожалуйста, возьми с собой действительное удостоверение личности с фото и общий залог {0} EUR наличными при получении велосипеда.\nЗалог покрывает всё бронирование целиком, а не каждый велосипед отдельно.",
        [Keys.ValueDepositWithoutAmount] = "Пожалуйста, возьми с собой действительное удостоверение личности с фото и залог наличными при получении велосипеда.\nСумму мы сообщим тебе перед получением; она покрывает всё бронирование целиком, а не каждый велосипед отдельно.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Не забудь взять действительное удостоверение личности с фото и общий залог {0} EUR наличными.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Не забудь взять действительное удостоверение личности с фото и залог наличными; сумму мы сообщим при получении.",
        [Keys.HeadingSelfCancel] = "Если ты всё же не сможешь приехать:",
        [Keys.TextSelfCancel] = "Ты можешь самостоятельно отменить бронирование по этой ссылке:",
        [Keys.TextSelfCancelReminder] = "Если ты всё же не сможешь приехать, можешь отменить бронирование самостоятельно здесь:",
        [Keys.ValueSelfCancelFallback] = "Ответь на это письмо, чтобы отменить.",
        [Keys.SignOff] = "С наилучшими пожеланиями\nТвоя команда Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Бронирование подтверждено",
        [Keys.IntroApproved] = "хорошие новости: твоё бронирование подтверждено.\nТвой велосипед забронирован за тобой на выбранный период.",
        [Keys.ClosingApproved] = "Уже сейчас желаем тебе отличной поездки.\nЕсли у тебя есть вопросы, просто ответь на это письмо или позвони нам.",

        [Keys.SubjectUpdated] = "Бронирование обновлено",
        [Keys.IntroUpdated] = "мы изменили твоё бронирование. Вот обновлённые данные:",
        [Keys.ClosingUpdated] = "Все остальные детали твоего бронирования остаются без изменений.\n\nЕсли что-то не так или у тебя есть вопросы, просто ответь на это письмо или позвони нам.",

        [Keys.SubjectReactivated] = "Бронирование снова активно",
        [Keys.IntroReactivatedApology] = "сначала небольшое извинение: недавно ты по ошибке получил(а) от нас подтверждение отмены. Это была техническая ошибка — ты НЕ отменял(а) своё бронирование.",
        [Keys.IntroReactivatedGoodNews] = "Хорошие новости: твоё бронирование снова активно.",
        [Keys.ClosingReactivated] = "Тебе ничего не нужно делать. Если у тебя есть вопросы или ты действительно хочешь отменить бронирование, просто ответь на это письмо или позвони нам.\n\nПриносим извинения за путаницу.",

        [Keys.SubjectCancelled] = "Бронирование отменено",
        [Keys.IntroCancelled] = "твоё бронирование отменено.\n\nВот детали ещё раз:",
        [Keys.ClosingCancelled] = "Если хочешь новую дату, просто ответь на это письмо.\nМы с радостью сразу подберём подходящий вариант для тебя.",

        [Keys.SubjectReceived] = "Бронирование подтверждено",
        [Keys.IntroReceived] = "спасибо за заявку на аренду.\n\nТвоё бронирование подтверждено сразу, дополнительная проверка не требуется.",

        [Keys.SubjectPickupReminder] = "До встречи завтра",
        [Keys.IntroPickupReminder] = "небольшое напоминание: завтра твой велосипед уже будет готов для тебя.",
        [Keys.ClosingPickupReminder] = "Мы будем рады тебя видеть.",
    };

    private static Dictionary<string, string> No() => new()
    {
        [Keys.Greeting] = "Hei {0},",
        [Keys.LabelBookingNumber] = "Bestillingsnummer",
        [Keys.LabelBike] = "Sykkel",
        [Keys.LabelPeriod] = "Periode",
        [Keys.LabelNewPeriod] = "Ny periode",
        [Keys.UnitDays] = "dager",
        [Keys.LinePickupTimeDesired] = "\nØnsket hentetidspunkt: {0}",
        [Keys.LinePickupTimeReminder] = "\nHentetidspunkt: {0}",
        [Keys.LabelAccessoriesIncluded] = "Tilbehør (inkludert)",
        [Keys.LabelAccessories] = "Tilbehør",
        [Keys.ValueAccessoriesNone] = "Ingen",
        [Keys.LabelPrice] = "Leiepris",
        [Keys.LabelNewPrice] = "Ny leiepris",
        [Keys.ValuePriceFallback] = "bekreftes i butikken",
        [Keys.HeadingBookingDetails] = "Bestillingsdetaljene dine:",
        [Keys.HeadingPickupReturn] = "Henting og retur:",
        [Keys.HeadingPickup] = "Henting:",
        [Keys.HeadingImportantNote] = "Viktig merknad:",
        [Keys.LineOpeningHours] = "\nÅpningstider: {0}",
        [Keys.LineGoogleMaps] = "\nVeibeskrivelse (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nMerk: henting av leiesykler er mulig fra kl. 10.00 – uavhengig av butikkens åpningstider (salg).",
        [Keys.ValueDepositWithAmount] = "Ta med gyldig legitimasjon med bilde og det totale depositumet på {0} EUR kontant ved henting.\nDepositumet gjelder for hele bestillingen, ikke per sykkel.",
        [Keys.ValueDepositWithoutAmount] = "Ta med gyldig legitimasjon med bilde og depositumet kontant ved henting.\nVi opplyser beløpet før henting; det gjelder for hele bestillingen, ikke per sykkel.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Husk gyldig legitimasjon med bilde og det totale depositumet på {0} EUR kontant.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Husk gyldig legitimasjon med bilde og depositumet kontant; vi opplyser beløpet ved henting.",
        [Keys.HeadingSelfCancel] = "Hvis du likevel ikke kan sykle:",
        [Keys.TextSelfCancel] = "Du kan selv avbestille bestillingen din via denne lenken:",
        [Keys.TextSelfCancelReminder] = "Hvis du likevel ikke kan komme, kan du enkelt avbestille bestillingen din selv her:",
        [Keys.ValueSelfCancelFallback] = "Svar på denne e-posten for å avbestille.",
        [Keys.SignOff] = "Vennlig hilsen\nDitt team hos Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Bestilling bekreftet",
        [Keys.IntroApproved] = "gode nyheter: bestillingen din er bekreftet.\nSykkelen din er fast reservert til deg for ønsket periode.",
        [Keys.ClosingApproved] = "Vi ønsker deg allerede nå en fantastisk tur.\nHvis du har spørsmål, svar bare på denne e-posten eller ring oss.",

        [Keys.SubjectUpdated] = "Bestilling oppdatert",
        [Keys.IntroUpdated] = "vi har endret bestillingen din. Her er de oppdaterte detaljene:",
        [Keys.ClosingUpdated] = "Alle andre detaljer i bestillingen din forblir uendret.\n\nHvis noe ikke stemmer eller du har spørsmål, svar bare på denne e-posten eller ring oss.",

        [Keys.SubjectReactivated] = "Bestilling aktiv igjen",
        [Keys.IntroReactivatedApology] = "først en kort unnskyldning: du mottok nylig en avbestillingsbekreftelse fra oss ved en feil. Det var en teknisk feil – bestillingen din ble IKKE avbestilt av deg.",
        [Keys.IntroReactivatedGoodNews] = "Gode nyheter: bestillingen din er aktiv igjen.",
        [Keys.ClosingReactivated] = "Du trenger ikke å gjøre noe. Hvis du har spørsmål eller faktisk ønsker å avbestille, svar bare på denne e-posten eller ring oss.\n\nBeklager forvirringen.",

        [Keys.SubjectCancelled] = "Bestilling avbestilt",
        [Keys.IntroCancelled] = "bestillingen din er avbestilt.\n\nHer er detaljene igjen:",
        [Keys.ClosingCancelled] = "Hvis du ønsker en ny dato, svar bare på denne e-posten.\nVi finner gjerne en passende alternativ løsning for deg med en gang.",

        [Keys.SubjectReceived] = "Bestilling bekreftet",
        [Keys.IntroReceived] = "takk for din leieforespørsel.\n\nBestillingen din er bekreftet med en gang, ingen egen vurdering er nødvendig.",

        [Keys.SubjectPickupReminder] = "Sees i morgen",
        [Keys.IntroPickupReminder] = "bare en rask påminnelse: sykkelen din står klar til deg allerede i morgen.",
        [Keys.ClosingPickupReminder] = "Vi gleder oss til å se deg.",
    };

    private static Dictionary<string, string> Da() => new()
    {
        [Keys.Greeting] = "Hej {0},",
        [Keys.LabelBookingNumber] = "Bookingnummer",
        [Keys.LabelBike] = "Cykel",
        [Keys.LabelPeriod] = "Periode",
        [Keys.LabelNewPeriod] = "Ny periode",
        [Keys.UnitDays] = "dage",
        [Keys.LinePickupTimeDesired] = "\nØnsket afhentningstidspunkt: {0}",
        [Keys.LinePickupTimeReminder] = "\nAfhentningstidspunkt: {0}",
        [Keys.LabelAccessoriesIncluded] = "Tilbehør (inkluderet)",
        [Keys.LabelAccessories] = "Tilbehør",
        [Keys.ValueAccessoriesNone] = "Ingen",
        [Keys.LabelPrice] = "Lejepris",
        [Keys.LabelNewPrice] = "Ny lejepris",
        [Keys.ValuePriceFallback] = "bekræftes i butikken",
        [Keys.HeadingBookingDetails] = "Dine bookingdetaljer:",
        [Keys.HeadingPickupReturn] = "Afhentning og aflevering:",
        [Keys.HeadingPickup] = "Afhentning:",
        [Keys.HeadingImportantNote] = "Vigtig bemærkning:",
        [Keys.LineOpeningHours] = "\nÅbningstider: {0}",
        [Keys.LineGoogleMaps] = "\nRutevejledning (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nBemærk: afhentning af lejecykler er mulig fra kl. 10.00 – uafhængigt af butikkens åbningstider (salg).",
        [Keys.ValueDepositWithAmount] = "Medbring venligst gyldigt billed-ID og det samlede depositum på {0} EUR kontant ved afhentning.\nDepositummet gælder for hele bookingen, ikke pr. cykel.",
        [Keys.ValueDepositWithoutAmount] = "Medbring venligst gyldigt billed-ID og depositummet kontant ved afhentning.\nVi oplyser beløbet inden afhentning; det gælder for hele bookingen, ikke pr. cykel.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Husk gyldigt billed-ID og det samlede depositum på {0} EUR kontant.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Husk gyldigt billed-ID og depositummet kontant; vi oplyser beløbet ved afhentning.",
        [Keys.HeadingSelfCancel] = "Hvis du alligevel ikke kan komme:",
        [Keys.TextSelfCancel] = "Du kan selv annullere din booking via dette link:",
        [Keys.TextSelfCancelReminder] = "Hvis du alligevel ikke kan komme, kan du nemt annullere din booking selv her:",
        [Keys.ValueSelfCancelFallback] = "Svar på denne e-mail for at annullere.",
        [Keys.SignOff] = "Mange hilsner\nDit team hos Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Booking bekræftet",
        [Keys.IntroApproved] = "gode nyheder: din booking er bekræftet.\nDin cykel er fast reserveret til dig i den ønskede periode.",
        [Keys.ClosingApproved] = "Vi ønsker dig allerede nu en rigtig god tur.\nHvis du har spørgsmål, så svar blot på denne e-mail eller ring til os.",

        [Keys.SubjectUpdated] = "Booking opdateret",
        [Keys.IntroUpdated] = "vi har justeret din booking. Her er de opdaterede detaljer:",
        [Keys.ClosingUpdated] = "Alle øvrige detaljer i din booking forbliver uændrede.\n\nHvis noget ikke stemmer, eller du har spørgsmål, så svar blot på denne e-mail eller ring til os.",

        [Keys.SubjectReactivated] = "Booking aktiv igen",
        [Keys.IntroReactivatedApology] = "først en kort undskyldning: du modtog for nylig en annulleringsbekræftelse fra os ved en fejl. Det var en teknisk fejl – din booking blev IKKE annulleret af dig.",
        [Keys.IntroReactivatedGoodNews] = "Gode nyheder: din booking er aktiv igen.",
        [Keys.ClosingReactivated] = "Du behøver ikke gøre noget. Hvis du har spørgsmål eller faktisk ønsker at annullere, så svar blot på denne e-mail eller ring til os.\n\nUndskyld forvirringen.",

        [Keys.SubjectCancelled] = "Booking annulleret",
        [Keys.IntroCancelled] = "din booking er blevet annulleret.\n\nHer er detaljerne igen:",
        [Keys.ClosingCancelled] = "Hvis du ønsker en ny dato, så svar blot på denne e-mail.\nVi finder gerne en passende alternativ løsning til dig med det samme.",

        [Keys.SubjectReceived] = "Booking bekræftet",
        [Keys.IntroReceived] = "tak for din lejeforespørgsel.\n\nDin booking er bekræftet med det samme, ingen yderligere gennemgang er nødvendig.",

        [Keys.SubjectPickupReminder] = "Vi ses i morgen",
        [Keys.IntroPickupReminder] = "bare en hurtig påmindelse: din cykel står klar til dig allerede i morgen.",
        [Keys.ClosingPickupReminder] = "Vi glæder os til at se dig.",
    };

    private static Dictionary<string, string> Nl() => new()
    {
        [Keys.Greeting] = "Hallo {0},",
        [Keys.LabelBookingNumber] = "Boekingsnummer",
        [Keys.LabelBike] = "Fiets",
        [Keys.LabelPeriod] = "Periode",
        [Keys.LabelNewPeriod] = "Nieuwe periode",
        [Keys.UnitDays] = "dagen",
        [Keys.LinePickupTimeDesired] = "\nGewenst ophaaltijdstip: {0}",
        [Keys.LinePickupTimeReminder] = "\nOphaaltijdstip: {0}",
        [Keys.LabelAccessoriesIncluded] = "Accessoires (inbegrepen)",
        [Keys.LabelAccessories] = "Accessoires",
        [Keys.ValueAccessoriesNone] = "Geen",
        [Keys.LabelPrice] = "Huurprijs",
        [Keys.LabelNewPrice] = "Nieuwe huurprijs",
        [Keys.ValuePriceFallback] = "wordt in de winkel bevestigd",
        [Keys.HeadingBookingDetails] = "Jouw boekingsgegevens:",
        [Keys.HeadingPickupReturn] = "Ophalen en terugbrengen:",
        [Keys.HeadingPickup] = "Ophalen:",
        [Keys.HeadingImportantNote] = "Belangrijke opmerking:",
        [Keys.LineOpeningHours] = "\nOpeningstijden: {0}",
        [Keys.LineGoogleMaps] = "\nRoutebeschrijving (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nLet op: ophalen van huurfietsen kan vanaf 10:00 uur, los van de openingstijden van de winkel (verkoop).",
        [Keys.ValueDepositWithAmount] = "Neem bij het ophalen een geldig identiteitsbewijs met foto en de totale borg van {0} EUR contant mee.\nDe borg geldt voor de hele boeking, niet per fiets.",
        [Keys.ValueDepositWithoutAmount] = "Neem bij het ophalen een geldig identiteitsbewijs met foto en de borg contant mee.\nWe laten je het bedrag vóór het ophalen weten; het geldt voor de hele boeking, niet per fiets.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Denk aan een geldig identiteitsbewijs met foto en de totale borg van {0} EUR contant.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Denk aan een geldig identiteitsbewijs met foto en de borg contant; we laten je het bedrag bij het ophalen weten.",
        [Keys.HeadingSelfCancel] = "Als je uiteindelijk toch niet kunt komen:",
        [Keys.TextSelfCancel] = "Je kunt je boeking zelf annuleren via deze link:",
        [Keys.TextSelfCancelReminder] = "Als je uiteindelijk toch niet kunt komen, kun je je boeking hier gemakkelijk zelf annuleren:",
        [Keys.ValueSelfCancelFallback] = "Beantwoord deze e-mail om te annuleren.",
        [Keys.SignOff] = "Groetjes\nJouw team van Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Boeking bevestigd",
        [Keys.IntroApproved] = "goed nieuws: je boeking is bevestigd.\nJe fiets is voor jou gereserveerd voor de gewenste periode.",
        [Keys.ClosingApproved] = "We wensen je nu al een heel leuke tocht.\nAls je nog vragen hebt, beantwoord dan gewoon deze e-mail of bel ons even.",

        [Keys.SubjectUpdated] = "Boeking bijgewerkt",
        [Keys.IntroUpdated] = "we hebben je boeking aangepast. Hier zijn de bijgewerkte gegevens:",
        [Keys.ClosingUpdated] = "Alle overige gegevens van je boeking blijven ongewijzigd.\n\nAls er iets niet klopt of je hebt vragen, beantwoord dan gewoon deze e-mail of bel ons even.",

        [Keys.SubjectReactivated] = "Boeking weer actief",
        [Keys.IntroReactivatedApology] = "eerst even onze excuses: je hebt onlangs per ongeluk een annuleringsbevestiging van ons ontvangen. Dat was een technische fout – je boeking is NIET door jou geannuleerd.",
        [Keys.IntroReactivatedGoodNews] = "Goed nieuws: je boeking is weer actief.",
        [Keys.ClosingReactivated] = "Je hoeft verder niets te doen. Heb je vragen of wil je toch echt annuleren, beantwoord dan gewoon deze e-mail of bel ons even.\n\nOnze excuses voor de verwarring.",

        [Keys.SubjectCancelled] = "Boeking geannuleerd",
        [Keys.IntroCancelled] = "je boeking is geannuleerd.\n\nHier nogmaals de gegevens:",
        [Keys.ClosingCancelled] = "Wil je een nieuwe datum, beantwoord dan gewoon deze e-mail.\nWe zoeken graag meteen een passend alternatief voor je.",

        [Keys.SubjectReceived] = "Boeking bevestigd",
        [Keys.IntroReceived] = "bedankt voor je huuraanvraag.\n\nJe boeking is meteen bevestigd, een aparte controle is niet meer nodig.",

        [Keys.SubjectPickupReminder] = "Tot morgen",
        [Keys.IntroPickupReminder] = "even een korte herinnering: morgen staat je fiets al voor je klaar.",
        [Keys.ClosingPickupReminder] = "We kijken ernaar uit je te zien.",
    };

    private static Dictionary<string, string> Pl() => new()
    {
        [Keys.Greeting] = "Cześć {0},",
        [Keys.LabelBookingNumber] = "Numer rezerwacji",
        [Keys.LabelBike] = "Rower",
        [Keys.LabelPeriod] = "Okres",
        [Keys.LabelNewPeriod] = "Nowy okres",
        [Keys.UnitDays] = "dni",
        [Keys.LinePickupTimeDesired] = "\nPreferowana godzina odbioru: {0}",
        [Keys.LinePickupTimeReminder] = "\nGodzina odbioru: {0}",
        [Keys.LabelAccessoriesIncluded] = "Akcesoria (w cenie)",
        [Keys.LabelAccessories] = "Akcesoria",
        [Keys.ValueAccessoriesNone] = "Brak",
        [Keys.LabelPrice] = "Cena wynajmu",
        [Keys.LabelNewPrice] = "Nowa cena wynajmu",
        [Keys.ValuePriceFallback] = "zostanie potwierdzona w sklepie",
        [Keys.HeadingBookingDetails] = "Szczegóły Twojej rezerwacji:",
        [Keys.HeadingPickupReturn] = "Odbiór i zwrot:",
        [Keys.HeadingPickup] = "Odbiór:",
        [Keys.HeadingImportantNote] = "Ważna informacja:",
        [Keys.LineOpeningHours] = "\nGodziny otwarcia: {0}",
        [Keys.LineGoogleMaps] = "\nDojazd (Google Maps): {0}",
        [Keys.LineRentalHoursNote] = "\nUwaga: odbiór rowerów z wypożyczalni jest możliwy od 10:00 – niezależnie od godzin otwarcia sklepu (sprzedaż).",
        [Keys.ValueDepositWithAmount] = "Przy odbiorze zabierz ze sobą ważny dokument tożsamości ze zdjęciem oraz łączną kaucję w wysokości {0} EUR w gotówce.\nKaucja dotyczy całej rezerwacji, a nie każdego roweru osobno.",
        [Keys.ValueDepositWithoutAmount] = "Przy odbiorze zabierz ze sobą ważny dokument tożsamości ze zdjęciem oraz kaucję w gotówce.\nWysokość kwoty podamy przed odbiorem; dotyczy ona całej rezerwacji, a nie każdego roweru osobno.",
        [Keys.ValueDepositSentenceWithAmountReminder] = "Pamiętaj o ważnym dokumencie tożsamości ze zdjęciem oraz łącznej kaucji w wysokości {0} EUR w gotówce.",
        [Keys.ValueDepositSentenceWithoutAmountReminder] = "Pamiętaj o ważnym dokumencie tożsamości ze zdjęciem oraz kaucji w gotówce; kwotę podamy przy odbiorze.",
        [Keys.HeadingSelfCancel] = "Jeśli jednak nie będziesz mógł/mogła przyjechać:",
        [Keys.TextSelfCancel] = "Możesz samodzielnie odwołać swoją rezerwację poprzez ten link:",
        [Keys.TextSelfCancelReminder] = "Jeśli jednak nie będziesz mógł/mogła przyjechać, możesz łatwo odwołać rezerwację samodzielnie tutaj:",
        [Keys.ValueSelfCancelFallback] = "Aby odwołać, odpowiedz na tę wiadomość e-mail.",
        [Keys.SignOff] = "Pozdrawiamy serdecznie\nTwój zespół Bike Haus Freiburg",

        [Keys.SubjectApproved] = "Rezerwacja potwierdzona",
        [Keys.IntroApproved] = "dobra wiadomość: Twoja rezerwacja jest potwierdzona.\nTwój rower jest dla Ciebie pewnie zarezerwowany na wybrany okres.",
        [Keys.ClosingApproved] = "Już teraz życzymy Ci naprawdę świetnej wycieczki.\nJeśli masz pytania, po prostu odpowiedz na tę wiadomość e-mail lub zadzwoń do nas.",

        [Keys.SubjectUpdated] = "Rezerwacja zaktualizowana",
        [Keys.IntroUpdated] = "zaktualizowaliśmy Twoją rezerwację. Oto zaktualizowane szczegóły:",
        [Keys.ClosingUpdated] = "Wszystkie pozostałe szczegóły Twojej rezerwacji pozostają bez zmian.\n\nJeśli coś się nie zgadza lub masz pytania, po prostu odpowiedz na tę wiadomość e-mail lub zadzwoń do nas.",

        [Keys.SubjectReactivated] = "Rezerwacja ponownie aktywna",
        [Keys.IntroReactivatedApology] = "najpierw krótkie przeprosiny: niedawno przez pomyłkę otrzymałeś/aś od nas potwierdzenie anulowania. To był błąd techniczny – Twoja rezerwacja NIE została przez Ciebie anulowana.",
        [Keys.IntroReactivatedGoodNews] = "Dobra wiadomość: Twoja rezerwacja jest znów aktywna.",
        [Keys.ClosingReactivated] = "Nie musisz nic robić. Jeśli masz pytania lub rzeczywiście chcesz anulować, po prostu odpowiedz na tę wiadomość e-mail lub zadzwoń do nas.\n\nPrzepraszamy za zamieszanie.",

        [Keys.SubjectCancelled] = "Rezerwacja anulowana",
        [Keys.IntroCancelled] = "Twoja rezerwacja została anulowana.\n\nOto ponownie szczegóły:",
        [Keys.ClosingCancelled] = "Jeśli chcesz nowy termin, po prostu odpowiedz na tę wiadomość e-mail.\nChętnie od razu poszukamy dla Ciebie odpowiedniej alternatywy.",

        [Keys.SubjectReceived] = "Rezerwacja potwierdzona",
        [Keys.IntroReceived] = "dziękujemy za zapytanie o wynajem.\n\nTwoja rezerwacja jest potwierdzona od razu, dodatkowa weryfikacja nie jest już potrzebna.",

        [Keys.SubjectPickupReminder] = "Do zobaczenia jutro",
        [Keys.IntroPickupReminder] = "tylko krótkie przypomnienie: Twój rower będzie na Ciebie czekał już jutro.",
        [Keys.ClosingPickupReminder] = "Nie możemy się doczekać, żeby Cię zobaczyć.",
    };
}
