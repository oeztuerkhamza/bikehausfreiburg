using System.IO;
using System.Net.Security;
using System.Net.Sockets;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using BikeHaus.Infrastructure.Services.Email;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Linq;
using MailKeys = BikeHaus.Infrastructure.Services.Email.RentalBookingMailTexts.Keys;

namespace BikeHaus.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private const int MaxSendAttempts = 3;
    private const string DefaultGoogleReviewUrl = "https://g.page/r/CRnu1n--kiIYEBM/review";
    private readonly SmtpOptions _options;
    private readonly CampaignSmtpOptions _campaignOptions;
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly BikeHausDbContext _db;

    public SmtpEmailService(
        IOptions<SmtpOptions> options,
        IOptions<CampaignSmtpOptions> campaignOptions,
        ILogger<SmtpEmailService> logger,
        BikeHausDbContext db)
    {
        _options = options.Value;
        _campaignOptions = campaignOptions.Value;
        _logger = logger;
        _db = db;
    }

    /// <summary>Optional per-send sender override (SMTP login + From identity).</summary>
    private sealed record SenderIdentity(string Username, string Password, string FromEmail, string FromName);

    /// <summary>
    /// E-Mail-Typen, die als Marketing gelten und die Abmelde-Liste respektieren
    /// MÜSSEN. Transaktionsmails (Belege, Bestätigungen, Verifizierungscode)
    /// stehen bewusst NICHT hier — sie werden immer zugestellt.
    /// </summary>
    private static readonly HashSet<string> MarketingEmailTypes =
        new(StringComparer.OrdinalIgnoreCase) { "Newsletter", "ErinnerungEinladung" };

    public Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model)
    {
        var lang = NormalizeMailLanguage(model.Language);
        var subject = BuildMailSubject(lang, MailKeys.SubjectApproved, model.BuchungsNummer);
        var body = BuildApprovedBody(model, lang);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietvertragBestaetigt");
    }

    public Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model)
    {
        var lang = NormalizeMailLanguage(model.Language);
        var subject = BuildMailSubject(lang, MailKeys.SubjectCancelled, model.BuchungsNummer);
        var body = BuildCancelledBody(model, lang);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietvertragStorniert");
    }

    public Task SendRentalBookingReactivatedAsync(RentalBookingEmailModel model)
    {
        var lang = NormalizeMailLanguage(model.Language);
        var subject = BuildMailSubject(lang, MailKeys.SubjectReactivated, model.BuchungsNummer);
        var body = BuildReactivatedBody(model, lang);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietanfrageReaktiviert");
    }

    public Task SendRentalBookingUpdatedAsync(RentalBookingEmailModel model)
    {
        var lang = NormalizeMailLanguage(model.Language);
        var subject = BuildMailSubject(lang, MailKeys.SubjectUpdated, model.BuchungsNummer);
        var body = BuildUpdatedBody(model, lang);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietanfrageAktualisiert");
    }

    public Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model)
    {
        var lang = NormalizeMailLanguage(model.Language);
        var subject = BuildMailSubject(lang, MailKeys.SubjectReceived, model.BuchungsNummer);
        var body = BuildReceivedBody(model, lang);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietanfrageEingegangen");
    }

    public Task SendRentalBookingAdminPendingNotificationAsync(RentalBookingEmailModel model, string adminPortalUrl)
    {
        // Versand der Admin-Benachrichtigung bei neuer Mietanfrage ist deaktiviert.
        // Methode bleibt als No-op erhalten, damit die Aufrufer unveraendert bleiben.
        return Task.CompletedTask;
    }

    public Task SendRentalBookingPickupReminderAsync(RentalBookingEmailModel model)
    {
        var lang = NormalizeMailLanguage(model.Language);
        var subject = BuildMailSubject(lang, MailKeys.SubjectPickupReminder, model.BuchungsNummer);
        var body = BuildPickupReminderBody(model, lang);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietanfrageErinnerung");
    }

    public Task SendDepositRefundConfirmationAsync(DepositRefundEmailModel model)
    {
        var subject = $"Kaution zurueckgegeben / Deposit refunded - {model.MietvertragNummer} | Bike Haus Freiburg";
        var body = BilingualHtml(
            BuildDepositRefundConfirmationBodyDe(model, DefaultGoogleReviewUrl),
            BuildDepositRefundConfirmationBodyEn(model, DefaultGoogleReviewUrl));

        // Der unterschriebene Beleg geht als PDF mit. Fehlt er (PDF-Erzeugung
        // fehlgeschlagen), wird die Bestätigung trotzdem verschickt.
        var attachments = model.BelegPdfBytes is { Length: > 0 }
            ? new[]
            {
                (Bytes: model.BelegPdfBytes, FileName: $"Kautionsrueckgabe-{model.MietvertragNummer}.pdf")
            }
            : null;

        return SendAsync(
            model.ToEmail,
            model.ToName,
            subject,
            body,
            "KautionRueckgabeBestaetigung",
            attachments,
            isHtml: true);
    }

    public Task SendSaleReceiptAsync(string toEmail, string toName, string belegNummer, byte[] pdfBytes)
    {
        var subject = $"Rechnung / Invoice - {belegNummer} | Bike Haus Freiburg";
        var germanBody = $@"Hallo {toName},

vielen Dank fuer deinen Einkauf bei uns.

anbei schicken wir dir deine Rechnung als PDF.

Belegnummer: {belegNummer}

Wenn du noch Fragen hast, antworte einfach auf diese E-Mail oder ruf kurz durch.

Viele Gruesse
Dein Team vom Bike Haus Freiburg";
        var englishBody = $@"Hello {toName},

thank you for your purchase with us.

please find your invoice attached as a PDF.

Receipt number: {belegNummer}

If you have any questions, simply reply to this email or give us a quick call.

Best regards
Your Bike Haus Freiburg team";
        var body = Bilingual(germanBody, englishBody);

        return SendAsync(
            toEmail,
            toName,
            subject,
            body,
            "Verkaufsrechnung",
            new[]
            {
                (Bytes: pdfBytes, FileName: $"Rechnung-{belegNummer}.pdf")
            });
    }

    public Task SendReservationAnzahlungAsync(
        string toEmail,
        string toName,
        string reservierungsNummer,
        DateTime ablaufDatum,
        byte[] pdfBytes)
    {
        var subject = $"Reservierung / Reservation - {reservierungsNummer} | Bike Haus Freiburg";
        var germanBody = $@"Hallo {toName},

vielen Dank fuer deine Reservierung.

anbei findest du deinen Anzahlungsbeleg als PDF.

Reservierungsnummer: {reservierungsNummer}
Reserviert bis: {ablaufDatum:dd.MM.yyyy}

Deine Anzahlung wird beim Kauf vollstaendig auf den Kaufpreis angerechnet.
Bitte hol das Fahrrad bis zum genannten Datum ab.

Wenn du noch Fragen hast, antworte einfach auf diese E-Mail oder ruf kurz durch.

Viele Gruesse
Dein Team vom Bike Haus Freiburg";
        var englishBody = $@"Hello {toName},

thank you for your reservation.

please find your down payment receipt attached as a PDF.

Reservation number: {reservierungsNummer}
Reserved until: {ablaufDatum:dd.MM.yyyy}

Your down payment will be credited in full against the purchase price.
Please collect the bike by the date above.

If you have any questions, simply reply to this email or give us a quick call.

Best regards
Your Bike Haus Freiburg team";
        var body = Bilingual(germanBody, englishBody);

        return SendAsync(
            toEmail,
            toName,
            subject,
            body,
            "Reservierung",
            new[]
            {
                (Bytes: pdfBytes, FileName: $"Anzahlungsbeleg-{reservierungsNummer}.pdf")
            });
    }

    public Task SendRentalDocumentsAsync(
        string toEmail,
        string toName,
        string mietvertragNummer,
        byte[] mietvertragPdfBytes,
        byte[] kautionsquittungPdfBytes,
        byte[] bedingungenpdfBytes)
    {
        var subject = $"Ihre Mietunterlagen / Your rental documents - {mietvertragNummer} | Bike Haus Freiburg";
        var germanBody = $@"Hallo {toName},

    deine Mietunterlagen sind da.

    anbei findest du alle Dokumente zu deiner Buchung.

Mietvertragsnummer: {mietvertragNummer}

Im Anhang finden Sie:
- Mietvertrag
- Kautionsquittung
- Mietbedingungen (AGB)

    Wenn du noch Fragen hast, melde dich jederzeit.

    Wir wuenschen dir viel Spass und gute Fahrt.

Viele Gruesse
    Dein Team vom Bike Haus Freiburg";
        var englishBody = $@"Hello {toName},

your rental documents are here.

please find all documents for your booking attached.

Rental contract number: {mietvertragNummer}

Attached you will find:
- Rental contract
- Deposit receipt
- Rental terms and conditions (AGB)

If you have any questions, feel free to contact us anytime.

We wish you lots of fun and a safe ride.

Best regards
Your Bike Haus Freiburg team";
        var body = Bilingual(germanBody, englishBody);

        return SendAsync(
            toEmail,
            toName,
            subject,
            body,
            "Mietunterlagen",
            new[]
            {
                (Bytes: mietvertragPdfBytes, FileName: $"Mietvertrag-{mietvertragNummer}.pdf"),
                (Bytes: kautionsquittungPdfBytes, FileName: $"Kautionsquittung-{mietvertragNummer}.pdf"),
                (Bytes: bedingungenpdfBytes, FileName: $"Mietbedingungen-{mietvertragNummer}.pdf")
            });
    }

    public Task SendNewsletterAsync(string toEmail, string toName, string subject, string textBody)
    {
        // Plain text, no List-Unsubscribe headers, no HTML — deliberately
        // looks like a one-to-one personal mail so Gmail does not file it
        // under "Promotions". Sent from the dedicated campaign mailbox
        // (falls back to the default sender when not configured).
        return SendAsync(
            toEmail,
            toName,
            subject,
            textBody,
            "Newsletter",
            attachments: null,
            isHtml: false,
            sender: ResolveCampaignSender());
    }

    /// <summary>
    /// The campaign is sent from a dedicated mailbox (e.g. cevdet.akarsu@) so
    /// the review newsletter goes out under a real person's name, while ALL
    /// transactional mail keeps using the default no-reply@ sender. Returns
    /// null — and thus falls back to the default sender — when the campaign
    /// account is not configured.
    /// </summary>
    private SenderIdentity? ResolveCampaignSender()
    {
        var c = _campaignOptions;
        if (string.IsNullOrWhiteSpace(c.Username) || string.IsNullOrWhiteSpace(c.Password))
            return null;

        return new SenderIdentity(
            c.Username.Trim(),
            c.Password,
            FirstConfigured(c.FromEmail, c.Username),
            FirstConfigured(c.FromName, _options.FromName));
    }

    private async Task SendAsync(
        string toEmail,
        string toName,
        string subject,
        string body,
        string emailType = "",
        IEnumerable<(byte[] Bytes, string FileName)>? attachments = null,
        bool isHtml = false,
        string? plainTextAlternative = null,
        IDictionary<string, string>? extraHeaders = null,
        SenderIdentity? sender = null)
    {
        // Harte Sicherheitsschranke: Marketing-/Kampagnen-Mails gehen NIEMALS an
        // abgemeldete Adressen — unabhängig davon, ob der Aufrufer schon geprüft
        // hat. Transaktionsmails (Bestätigungen, Belege, Bestätigungscode) sind
        // NICHT betroffen. Letzte Verteidigungslinie gegen versehentliche Sends.
        if (MarketingEmailTypes.Contains(emailType))
        {
            var normalizedTo = (toEmail ?? string.Empty).Trim().ToLowerInvariant();
            if (!string.IsNullOrEmpty(normalizedTo) &&
                await _db.EmailUnsubscribes.AnyAsync(e => e.Email == normalizedTo))
            {
                _logger.LogInformation(
                    "Suppressed marketing email ({Type}) to unsubscribed address {To}.",
                    emailType, toEmail);
                await LogEmailAsync(toEmail, toName, subject, emailType, "Übersprungen", "Empfänger abgemeldet.", null);
                return;
            }
        }

        var dbAccount = await _db.EmailAccounts
            .Where(a => a.IsDefault && a.IsActive)
            .FirstOrDefaultAsync();

        // Host/Port/TLS always come from the server config (same Mailcow).
        var host = dbAccount is not null
            ? FirstConfigured(dbAccount.Host, _options.Host)
            : FirstConfigured(_options.Host);
        var port = dbAccount?.Port > 0 ? dbAccount.Port : _options.Port;
        var useSsl = dbAccount?.UseSsl ?? _options.UseSsl;

        // Identity (login + From) resolution order:
        //   1. explicit per-send override (campaign mailbox), else
        //   2. the active default DB account, else
        //   3. the no-reply@ config. The override never affects the path 2/3
        //      used by all transactional mail.
        var username = sender is not null
            ? sender.Username
            : dbAccount is not null
                ? (dbAccount.Username ?? string.Empty).Trim()
                : FirstConfigured(_options.Username);
        var password = sender is not null
            ? sender.Password
            : dbAccount is not null
                ? dbAccount.Password ?? string.Empty
                : FirstConfigured(_options.Password);
        var fromEmail = sender is not null
            ? sender.FromEmail
            : dbAccount is not null
                ? FirstConfigured(dbAccount.FromEmail, _options.FromEmail)
                : FirstConfigured(_options.FromEmail);
        var fromName = sender is not null
            ? sender.FromName
            : dbAccount is not null
                ? FirstConfigured(dbAccount.FromName, _options.FromName)
                : FirstConfigured(_options.FromName);

        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogError("SMTP host is not configured. Email to {To} cannot be sent.", toEmail);
            await LogEmailAsync(toEmail, toName, subject, emailType, "Fehler", "SMTP host nicht konfiguriert.", dbAccount?.Id);
            throw new InvalidOperationException("SMTP host is not configured.");
        }

        if (!string.IsNullOrWhiteSpace(username) && string.IsNullOrWhiteSpace(password))
        {
            _logger.LogError("SMTP password is empty. Email to {To} cannot be sent.", toEmail);
            await LogEmailAsync(toEmail, toName, subject, emailType, "Fehler", "SMTP Passwort fehlt.", dbAccount?.Id);
            throw new InvalidOperationException("SMTP password is empty.");
        }

        Exception? lastException = null;

        for (var attempt = 1; attempt <= MaxSendAttempts; attempt++)
        {
            try
            {
                var validAttachments = attachments?
                    .Where(a => a.Bytes is { Length: > 0 } && !string.IsNullOrWhiteSpace(a.FileName))
                    .ToList();

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;

                if (extraHeaders is { Count: > 0 })
                {
                    foreach (var header in extraHeaders)
                        message.Headers.Add(header.Key, header.Value);
                }

                if (validAttachments is { Count: > 0 })
                {
                    var multipart = new Multipart("mixed");
                    multipart.Add(new TextPart(isHtml ? "html" : "plain") { Text = body });

                    foreach (var attachment in validAttachments)
                    {
                        multipart.Add(new MimePart("application", "pdf")
                        {
                            Content = new MimeContent(new MemoryStream(attachment.Bytes), ContentEncoding.Default),
                            ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
                            ContentTransferEncoding = ContentEncoding.Base64,
                            FileName = attachment.FileName
                        });
                    }

                    message.Body = multipart;
                }
                else if (isHtml && plainTextAlternative is not null)
                {
                    // multipart/alternative: plain first, HTML last (clients pick HTML)
                    var alternative = new MultipartAlternative
                    {
                        new TextPart("plain") { Text = plainTextAlternative },
                        new TextPart("html") { Text = body },
                    };
                    message.Body = alternative;
                }
                else
                {
                    message.Body = new TextPart(isHtml ? "html" : "plain") { Text = body };
                }

                using var client = new SmtpClient
                {
                    Timeout = 20000,
                    ServerCertificateValidationCallback = (_, _, _, sslPolicyErrors) =>
                        sslPolicyErrors == SslPolicyErrors.None || sslPolicyErrors == SslPolicyErrors.RemoteCertificateChainErrors
                };

                // Port-aware TLS selection. Mailcow (and most submission servers)
                // reject plain auth on 587 — STARTTLS is mandatory. The legacy
                // useSsl=false branch silently disabled encryption and broke auth.
                SecureSocketOptions socketOptions = port switch
                {
                    465 => SecureSocketOptions.SslOnConnect,
                    587 or 2525 => SecureSocketOptions.StartTls,
                    _ => useSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto
                };

                _logger.LogInformation(
                    "Sending email to {To}, subject: {Subject}, attempt {Attempt}/{MaxAttempts}",
                    toEmail,
                    subject,
                    attempt,
                    MaxSendAttempts);
                await client.ConnectAsync(host, port, socketOptions);

                if (!string.IsNullOrWhiteSpace(username))
                    await client.AuthenticateAsync(username, password);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                _logger.LogInformation("Email sent successfully to {To}", toEmail);

                await LogEmailAsync(toEmail, toName, subject, emailType, "Gesendet", null, dbAccount?.Id);
                return;
            }
            catch (Exception ex) when (attempt < MaxSendAttempts && IsTransientFailure(ex) && !IsAuthenticationFailure(ex))
            {
                lastException = ex;
                _logger.LogWarning(
                    ex,
                    "Transient SMTP failure while sending email to {To} via {Host}:{Port}. Retrying attempt {NextAttempt}/{MaxAttempts}",
                    toEmail,
                    host,
                    port,
                    attempt + 1,
                    MaxSendAttempts);
                await Task.Delay(TimeSpan.FromSeconds(attempt));
            }
            catch (Exception ex)
            {
                lastException = ex;
                break;
            }
        }

        _logger.LogError(lastException, "Failed to send email to {To} via {Host}:{Port}", toEmail, host, port);
        await LogEmailAsync(toEmail, toName, subject, emailType, "Fehler", lastException?.Message, dbAccount?.Id);
        throw lastException ?? new InvalidOperationException("SMTP send failed without an exception.");
    }

    private static string FirstConfigured(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }

        return string.Empty;
    }

    private static bool IsAuthenticationFailure(Exception ex)
    {
        return ex.Message.Contains("authentication failed", StringComparison.OrdinalIgnoreCase)
            || ex.Message.Contains("auth failed", StringComparison.OrdinalIgnoreCase)
            || ex.Message.Contains("535", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsTransientFailure(Exception ex)
    {
        return ex switch
        {
            TimeoutException => true,
            IOException => true,
            SocketException => true,
            SmtpProtocolException => true,
            SmtpCommandException smtpCommandException => (int)smtpCommandException.StatusCode >= 400
                && (int)smtpCommandException.StatusCode < 500,
            _ when ex.Message.Contains("try again later", StringComparison.OrdinalIgnoreCase) => true,
            _ => false
        };
    }

    private async Task LogEmailAsync(string toEmail, string toName, string subject, string emailType, string status, string? error, int? accountId)
    {
        try
        {
            _db.EmailLogs.Add(new EmailLog
            {
                ToEmail = toEmail,
                ToName = toName,
                Subject = subject,
                EmailType = emailType,
                Status = status,
                ErrorMessage = error,
                EmailAccountId = accountId,
            });
            await _db.SaveChangesAsync();
        }
        catch (Exception logEx)
        {
            _logger.LogWarning(logEx, "Failed to log email to database.");
        }
    }

    // Trennlinie zwischen der deutschen und der englischen Fassung. Für die
    // Mails, die nicht an RentalBooking.Sprache hängen (Kautionsrückgabe,
    // Verkaufsrechnung, Reservierung, Mietunterlagen — Rental/Sale/Purchase
    // kennen keine Kundensprache), bleibt es bei Deutsch+Englisch in einer
    // Mail. Die Buchungs-Mails weiter unten (Bestätigung, Storno, Reaktivierung,
    // Aktualisierung, Erinnerung, "Anfrage eingegangen") nutzen das NICHT mehr —
    // die gehen seit der Sprachumstellung nur noch in der Sprache des Gasts raus.
    private const string BilingualSeparatorPlain =
        "\n----------------------------------------------------------------------\nENGLISH VERSION\n----------------------------------------------------------------------\n\n";

    private const string BilingualSeparatorHtml =
        "<hr style=\"margin:24px 0;border:none;border-top:1px solid #ddd;\" />\n<p><strong>English version</strong></p>\n";

    private static string Bilingual(string germanBody, string englishBody) =>
        germanBody + BilingualSeparatorPlain + englishBody;

    private static string BilingualHtml(string germanBody, string englishBody) =>
        germanBody + BilingualSeparatorHtml + englishBody;

    // ── Mehrsprachige Buchungs-Mails ─────────────────────────────────────
    //
    // Der Mail-AUFBAU (Reihenfolge der Abschnitte, Platzhalter) steht hier ein
    // einziges Mal je Mail-Typ; die übersetzten Textbausteine kommen aus
    // RentalBookingMailTexts (Sprache → Schlüssel → Text, Fallback Englisch
    // für fehlende Schlüssel/Sprachen). Jede Mail geht nur noch in der
    // Sprache des Gasts raus (model.Language, von RentalBookingService auf
    // eine der 12 geführten Sprachen normalisiert, sonst Englisch) — nicht
    // mehr wie zuvor immer zweisprachig Deutsch+Englisch.
    private static string NormalizeMailLanguage(string? language)
        => string.IsNullOrWhiteSpace(language) ? "en" : language.Trim();

    private static string BuildMailSubject(string lang, string subjectKey, string buchungsNummer)
        => $"{RentalBookingMailTexts.T(lang, subjectKey)} - {buchungsNummer} | Bike Haus Freiburg";

    private static string T(string lang, string key) => RentalBookingMailTexts.T(lang, key);

    private static string T(string lang, string key, params object[] args) => RentalBookingMailTexts.T(lang, key, args);

    /// <summary>
    /// "Kein Zubehör" wird hier sprachabhängig aufgelöst statt schon beim
    /// Anlegen der Buchung (RentalBookingService liefert nur noch die rohe,
    /// deutschsprachige Positionsliste oder einen leeren String).
    /// </summary>
    private static string FormatAccessories(string? raw, string lang)
    {
        if (string.IsNullOrWhiteSpace(raw)
            || raw.Trim().Equals("Keine", StringComparison.OrdinalIgnoreCase)
            || raw.Trim().Equals("None", StringComparison.OrdinalIgnoreCase))
            return T(lang, MailKeys.ValueAccessoriesNone);

        return raw.Replace("\n", ", ").Replace("- ", string.Empty).Trim();
    }

    /// <summary>
    /// Kautions-Absatz der Buchungsmails.
    ///
    /// Kein erfundener Ersatzwert: hier stand frueher <c>m.Deposit ?? 300m</c>, also
    /// eine Summe, die niemand gepflegt hatte. Seit die Website die Kaution nur
    /// noch nennt, wenn sie im Bestand steht, wuerde das auseinanderlaufen — die
    /// Seite schweigt und die Mail behauptet 300 EUR. Ohne gepflegte Kaution nennt
    /// die Mail deshalb ebenfalls keinen Betrag.
    /// </summary>
    private static string BuildDepositParagraph(string lang, decimal? deposit) =>
        deposit.HasValue
            ? T(lang, MailKeys.ValueDepositWithAmount, deposit.Value.ToString("0.00"))
            : T(lang, MailKeys.ValueDepositWithoutAmount);

    private static string BuildDepositReminderSentence(string lang, decimal? deposit) =>
        deposit.HasValue
            ? T(lang, MailKeys.ValueDepositSentenceWithAmountReminder, deposit.Value.ToString("0.00"))
            : T(lang, MailKeys.ValueDepositSentenceWithoutAmountReminder);

    private static string BuildPickupTimeLineDesired(string lang, string? pickupTime) =>
        string.IsNullOrWhiteSpace(pickupTime) ? string.Empty : T(lang, MailKeys.LinePickupTimeDesired, pickupTime);

    private static string BuildPickupTimeLineReminder(string lang, string? pickupTime) =>
        string.IsNullOrWhiteSpace(pickupTime) ? string.Empty : T(lang, MailKeys.LinePickupTimeReminder, pickupTime);

    private static string BuildOpeningHoursLine(string lang, string? openingHours) =>
        string.IsNullOrWhiteSpace(openingHours) ? string.Empty : T(lang, MailKeys.LineOpeningHours, openingHours);

    private static string FormatTotalPrice(string lang, decimal? totalPrice) =>
        totalPrice.HasValue ? $"{totalPrice.Value:0.00} EUR" : T(lang, MailKeys.ValuePriceFallback);

    private static string BuildApprovedBody(RentalBookingEmailModel m, string lang)
    {
        var totalPriceText = FormatTotalPrice(lang, m.TotalPrice);
        var depositParagraph = BuildDepositParagraph(lang, m.Deposit);
        var accessoriesText = FormatAccessories(m.AccessoriesText, lang);
        var pickupTimeLine = BuildPickupTimeLineDesired(lang, m.PickupTime);

        return $@"{T(lang, MailKeys.Greeting, m.ToName)}

{T(lang, MailKeys.IntroApproved)}

{T(lang, MailKeys.HeadingBookingDetails)}

{T(lang, MailKeys.LabelBookingNumber)}: {m.BuchungsNummer}
{T(lang, MailKeys.LabelBike)}: {m.BikeBrand} {m.BikeModel}
{T(lang, MailKeys.LabelPeriod)}: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} {T(lang, MailKeys.UnitDays)}){pickupTimeLine}
{T(lang, MailKeys.LabelAccessoriesIncluded)}: {accessoriesText}
{T(lang, MailKeys.LabelPrice)}: {totalPriceText}

{T(lang, MailKeys.HeadingPickupReturn)}
Bike Haus Freiburg
{m.PickupLocation}

{T(lang, MailKeys.HeadingImportantNote)}
{depositParagraph}

{T(lang, MailKeys.HeadingSelfCancel)}
{T(lang, MailKeys.TextSelfCancel)}
{m.SelfCancelUrl ?? T(lang, MailKeys.ValueSelfCancelFallback)}

{T(lang, MailKeys.ClosingApproved)}

{T(lang, MailKeys.SignOff)}

{m.ShopPhone}
bikehausfreiburg.com
{m.ShopEmail}
";
    }

    // Inhaltlich identisch zur Bestätigungsmail (Buchungen werden seit der
    // Umstellung auf sofortige Bestätigung nicht mehr geprüft — es gibt keine
    // zweite Mail mehr), nur die Einleitung ist eine andere. Praktisch nur
    // noch über den SMTP-Verbindungstest in SettingsController erreichbar.
    private static string BuildReceivedBody(RentalBookingEmailModel m, string lang)
    {
        var totalPriceText = FormatTotalPrice(lang, m.TotalPrice);
        var depositParagraph = BuildDepositParagraph(lang, m.Deposit);
        var accessoriesText = FormatAccessories(m.AccessoriesText, lang);
        var pickupTimeLine = BuildPickupTimeLineDesired(lang, m.PickupTime);

        return $@"{T(lang, MailKeys.Greeting, m.ToName)}

{T(lang, MailKeys.IntroReceived)}

{T(lang, MailKeys.HeadingBookingDetails)}

{T(lang, MailKeys.LabelBookingNumber)}: {m.BuchungsNummer}
{T(lang, MailKeys.LabelBike)}: {m.BikeBrand} {m.BikeModel}
{T(lang, MailKeys.LabelPeriod)}: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} {T(lang, MailKeys.UnitDays)}){pickupTimeLine}
{T(lang, MailKeys.LabelAccessoriesIncluded)}: {accessoriesText}
{T(lang, MailKeys.LabelPrice)}: {totalPriceText}

{T(lang, MailKeys.HeadingPickupReturn)}
Bike Haus Freiburg
{m.PickupLocation}

{T(lang, MailKeys.HeadingImportantNote)}
{depositParagraph}

{T(lang, MailKeys.HeadingSelfCancel)}
{T(lang, MailKeys.TextSelfCancel)}
{m.SelfCancelUrl ?? T(lang, MailKeys.ValueSelfCancelFallback)}

{T(lang, MailKeys.ClosingApproved)}

{T(lang, MailKeys.SignOff)}

{m.ShopPhone}
bikehausfreiburg.com
{m.ShopEmail}
";
    }

    private static string BuildUpdatedBody(RentalBookingEmailModel m, string lang)
    {
        var totalPriceText = FormatTotalPrice(lang, m.TotalPrice);
        var accessoriesText = FormatAccessories(m.AccessoriesText, lang);
        var pickupTimeLine = BuildPickupTimeLineDesired(lang, m.PickupTime);

        return $@"{T(lang, MailKeys.Greeting, m.ToName)}

{T(lang, MailKeys.IntroUpdated)}

{T(lang, MailKeys.LabelBookingNumber)}: {m.BuchungsNummer}
{T(lang, MailKeys.LabelBike)}: {m.BikeBrand} {m.BikeModel}
{T(lang, MailKeys.LabelNewPeriod)}: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} {T(lang, MailKeys.UnitDays)}){pickupTimeLine}
{T(lang, MailKeys.LabelAccessoriesIncluded)}: {accessoriesText}
{T(lang, MailKeys.LabelNewPrice)}: {totalPriceText}

{T(lang, MailKeys.ClosingUpdated)}

{T(lang, MailKeys.SignOff)}

{m.ShopPhone}
bikehausfreiburg.com
{m.ShopEmail}
";
    }

    private static string BuildReactivatedBody(RentalBookingEmailModel m, string lang)
    {
        return $@"{T(lang, MailKeys.Greeting, m.ToName)}

{T(lang, MailKeys.IntroReactivatedApology)}

{T(lang, MailKeys.IntroReactivatedGoodNews)}

{T(lang, MailKeys.LabelBookingNumber)}: {m.BuchungsNummer}
{T(lang, MailKeys.LabelBike)}: {m.BikeBrand} {m.BikeModel}
{T(lang, MailKeys.LabelPeriod)}: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} {T(lang, MailKeys.UnitDays)})

{T(lang, MailKeys.ClosingReactivated)}

{T(lang, MailKeys.SignOff)}
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildCancelledBody(RentalBookingEmailModel m, string lang)
    {
        var accessoriesText = FormatAccessories(m.AccessoriesText, lang);

        return $@"{T(lang, MailKeys.Greeting, m.ToName)}

{T(lang, MailKeys.IntroCancelled)}

{T(lang, MailKeys.LabelBookingNumber)}: {m.BuchungsNummer}
{T(lang, MailKeys.LabelBike)}: {m.BikeBrand} {m.BikeModel}
{T(lang, MailKeys.LabelPeriod)}: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy}
{T(lang, MailKeys.LabelAccessories)}: {accessoriesText}

{T(lang, MailKeys.HeadingPickupReturn)}
Bike Haus Freiburg
{m.PickupLocation}

{T(lang, MailKeys.ClosingCancelled)}

{T(lang, MailKeys.SignOff)}
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildPickupReminderBody(RentalBookingEmailModel m, string lang)
    {
        var depositSentence = BuildDepositReminderSentence(lang, m.Deposit);
        var pickupTimeLine = BuildPickupTimeLineReminder(lang, m.PickupTime);
        var openingHoursLine = BuildOpeningHoursLine(lang, m.OpeningHours);

        return $@"{T(lang, MailKeys.Greeting, m.ToName)}

{T(lang, MailKeys.IntroPickupReminder)}

{T(lang, MailKeys.LabelBookingNumber)}: {m.BuchungsNummer}
{T(lang, MailKeys.LabelBike)}: {m.BikeBrand} {m.BikeModel}
{T(lang, MailKeys.LabelPeriod)}: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} {T(lang, MailKeys.UnitDays)}){pickupTimeLine}

{T(lang, MailKeys.HeadingPickup)}
Bike Haus Freiburg
{m.PickupLocation}{openingHoursLine}

{depositSentence}

{T(lang, MailKeys.TextSelfCancelReminder)}
{m.SelfCancelUrl ?? T(lang, MailKeys.ValueSelfCancelFallback)}

{T(lang, MailKeys.ClosingPickupReminder)}

{T(lang, MailKeys.SignOff)}
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildAdminPendingNotificationBodyDe(RentalBookingEmailModel m, string adminPortalUrl)
    {
        var totalPriceText = m.TotalPrice.HasValue ? $"{m.TotalPrice.Value:0.00} EUR" : "offen";
        var accessoriesText = string.IsNullOrWhiteSpace(m.AccessoriesText) || m.AccessoriesText.Trim().Equals("Keine", StringComparison.OrdinalIgnoreCase)
            ? "Keine"
            : m.AccessoriesText.Replace("\n", ", ").Replace("- ", string.Empty).Trim();
        var abholzeitLine = string.IsNullOrWhiteSpace(m.PickupTime) ? "" : $"<strong>Gewuenschte Abholzeit:</strong> {m.PickupTime} Uhr<br />\n";

        return $@"<p>Hallo Team,</p>
<p>es ist eine neue Mietanfrage eingegangen und wartet auf Bearbeitung.</p>
<p>
<strong>Buchungsnummer:</strong> {m.BuchungsNummer}<br />
<strong>Kunde:</strong> {m.ToName}<br />
<strong>E-Mail:</strong> {m.ToEmail}<br />
<strong>Fahrrad:</strong> {m.BikeBrand} {m.BikeModel}<br />
<strong>Zeitraum:</strong> {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} Tage)<br />
{abholzeitLine}<strong>Geschaetzter Mietpreis:</strong> {totalPriceText}<br />
<strong>Zubehoer:</strong> {accessoriesText}
</p>
<p>
Bitte auf den folgenden Link klicken, um die Mietanfragen zu pruefen:<br />
<a href=""{adminPortalUrl}"">{adminPortalUrl}</a>
</p>
<p>Diese Benachrichtigung wurde automatisch von no-reply@bikehausfreiburg.com gesendet.</p>";
    }

    private static string BuildDepositRefundConfirmationBodyDe(DepositRefundEmailModel m, string googleReviewUrl)
    {
        var abzugZeile = m.AbzuegeGesamt > 0
            ? $@"<strong>Kaution:</strong> {m.KautionsBetrag:N2} EUR<br />
<strong>Einbehalten:</strong> {m.AbzuegeGesamt:N2} EUR<br />"
            : string.Empty;

        var anhangZeile = m.BelegPdfBytes is { Length: > 0 }
            ? "<p>Den von dir unterschriebenen Rueckgabebeleg findest du als PDF im Anhang.</p>"
            : string.Empty;

        return $@"<p>Hallo {m.ToName},</p>
<p>deine Kaution wurde erfolgreich zurueckgegeben.</p>
<p>
<strong>Mietvertragsnummer:</strong> {m.MietvertragNummer}<br />
{abzugZeile}<strong>Zurueckgezahlt:</strong> {m.ErstatteterBetrag:N2} EUR<br />
<strong>Auszahlungsart:</strong> {m.ZahlungsartText}<br />
<strong>Rueckgabedatum:</strong> {m.RueckgabeDatum:dd.MM.yyyy}
</p>
{anhangZeile}<p>Vielen Dank, dass du bei Bike Haus Freiburg gemietet hast.</p>
<p>
Wenn du zufrieden warst, freuen wir uns sehr ueber eine kurze Google-Bewertung:<br />
<a href=""{googleReviewUrl}"">{googleReviewUrl}</a>
</p>
<p>Vielen Dank und bis bald.<br />
Dein Team vom Bike Haus Freiburg</p>";
    }

    private static string BuildDepositRefundConfirmationBodyEn(DepositRefundEmailModel m, string googleReviewUrl)
    {
        var deductionLine = m.AbzuegeGesamt > 0
            ? $@"<strong>Deposit:</strong> {m.KautionsBetrag:N2} EUR<br />
<strong>Retained:</strong> {m.AbzuegeGesamt:N2} EUR<br />"
            : string.Empty;

        var attachmentLine = m.BelegPdfBytes is { Length: > 0 }
            ? "<p>The refund receipt you signed is attached as a PDF.</p>"
            : string.Empty;

        return $@"<p>Hello {m.ToName},</p>
<p>your deposit has been refunded successfully.</p>
<p>
<strong>Rental contract number:</strong> {m.MietvertragNummer}<br />
{deductionLine}<strong>Refunded:</strong> {m.ErstatteterBetrag:N2} EUR<br />
<strong>Payment method:</strong> {m.ZahlungsartText}<br />
<strong>Refund date:</strong> {m.RueckgabeDatum:dd.MM.yyyy}
</p>
{attachmentLine}<p>Thank you for renting from Bike Haus Freiburg.</p>
<p>
If you were satisfied, we would be very happy about a short Google review:<br />
<a href=""{googleReviewUrl}"">{googleReviewUrl}</a>
</p>
<p>Thank you and see you soon.<br />
Your Bike Haus Freiburg team</p>";
    }
}
