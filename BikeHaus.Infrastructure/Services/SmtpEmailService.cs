using System.IO;
using System.Net.Security;
using System.Net.Sockets;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Linq;

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

    public Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model)
    {
        var subject = $"Anfrage bestaetigt - {model.BuchungsNummer} | Bike Haus Freiburg";
        var body = BuildApprovedBodyDe(model);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietvertragBestaetigt");
    }

    public Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model)
    {
        var subject = $"Anfrage storniert - {model.BuchungsNummer} | Bike Haus Freiburg";
        var body = BuildCancelledBodyDe(model);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietvertragStorniert");
    }

    public Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model)
    {
        var subject = $"Mietanfrage eingegangen - {model.BuchungsNummer} | Bike Haus Freiburg";
        var body = BuildReceivedBodyDe(model);
        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietanfrageEingegangen");
    }

    public Task SendRentalBookingAdminPendingNotificationAsync(RentalBookingEmailModel model, string adminPortalUrl)
    {
        var subject = $"Neue Mietanfrage (Pending) - {model.BuchungsNummer} | Bike Haus Freiburg";
        var body = BuildAdminPendingNotificationBodyDe(model, adminPortalUrl);
        return SendAsync(
            "info.bikehausfreiburg@gmail.com",
            "Bike Haus Freiburg",
            subject,
            body,
            "MietanfrageAdminBenachrichtigung",
            isHtml: true);
    }

    public Task SendDepositRefundConfirmationAsync(string toEmail, string toName, string mietvertragNummer)
    {
        var subject = $"Kaution zurueckgegeben - {mietvertragNummer} | Bike Haus Freiburg";
        var body = BuildDepositRefundConfirmationBodyDe(toName, mietvertragNummer, DefaultGoogleReviewUrl);
        return SendAsync(
            toEmail,
            toName,
            subject,
            body,
            "KautionRueckgabeBestaetigung",
            isHtml: true);
    }

    public Task SendSaleReceiptAsync(string toEmail, string toName, string belegNummer, byte[] pdfBytes)
    {
        var subject = $"Rechnung - {belegNummer} | Bike Haus Freiburg";
        var body = $@"Hallo {toName},

vielen Dank fuer deinen Einkauf bei uns.

anbei schicken wir dir deine Rechnung als PDF.

Belegnummer: {belegNummer}

Wenn du noch Fragen hast, antworte einfach auf diese E-Mail oder ruf kurz durch.

Viele Gruesse
Dein Team vom Bike Haus Freiburg";

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

    public Task SendRentalDocumentsAsync(
        string toEmail,
        string toName,
        string mietvertragNummer,
        byte[] mietvertragPdfBytes,
        byte[] kautionsquittungPdfBytes,
        byte[] bedingungenpdfBytes)
    {
        var subject = $"Ihre Mietunterlagen - {mietvertragNummer} | Bike Haus Freiburg";
        var body = $@"Hallo {toName},

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

    private static string BuildApprovedBodyDe(RentalBookingEmailModel m)
    {
        var totalPriceText = m.TotalPrice.HasValue ? $"{m.TotalPrice.Value:0.00} EUR" : "wird im Laden bestaetigt";
        var depositAmount = m.Deposit ?? 300m;
        var accessoriesText = string.IsNullOrWhiteSpace(m.AccessoriesText) || m.AccessoriesText.Trim().Equals("Keine", StringComparison.OrdinalIgnoreCase)
            ? "Keine"
            : m.AccessoriesText.Replace("\n", ", ").Replace("- ", string.Empty).Trim();

        return $@"Hallo {m.ToName},

gute Nachrichten: Deine Mietanfrage ist offiziell bestaetigt.
Dein Bike ist fuer deinen Wunschzeitraum fest fuer dich reserviert.

Deine Buchungsdetails:

Buchungsnummer: {m.BuchungsNummer}
Fahrrad: {m.BikeBrand} {m.BikeModel}
Zeitraum: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} Tage)
Zubehoer (inklusive): {accessoriesText}
Mietpreis: {totalPriceText}

Abholung und Rueckgabe:
Dein Bike steht puenktlich an unserem Standort fuer dich bereit:

Bike Haus Freiburg
{m.PickupLocation}

Wichtiger Hinweis:
Bitte bring zur Abholung einen gueltigen Lichtbildausweis und {depositAmount:0.00} EUR in bar als Kaution mit.

Falls du doch nicht fahren kannst:
Du kannst deine Buchung selbst stornieren ueber diesen Link:
{m.SelfCancelUrl ?? "Bitte antworte auf diese E-Mail fuer eine Stornierung."}

Wir wuenschen dir jetzt schon eine richtig coole Tour.
Wenn du noch Fragen hast, antworte einfach auf diese E-Mail oder ruf kurz durch.

Viele Gruesse
Dein Team vom Bike Haus Freiburg

{m.ShopPhone}
bikehausfreiburg.com
{m.ShopEmail}
";
    }

    private static string BuildCancelledBodyDe(RentalBookingEmailModel m)
    {
        var accessoriesText = string.IsNullOrWhiteSpace(m.AccessoriesText) || m.AccessoriesText.Trim().Equals("Keine", StringComparison.OrdinalIgnoreCase)
            ? "Keine"
            : m.AccessoriesText.Replace("\n", ", ").Replace("- ", string.Empty).Trim();

        return $@"Hallo {m.ToName},

vielen Dank fuer deine Anfrage.

leider muessen wir dir mitteilen, dass wir deine Mietanfrage aktuell nicht bestaetigen koennen.

Buchungsnummer: {m.BuchungsNummer}
Fahrrad: {m.BikeBrand} {m.BikeModel}
Zeitraum: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy}
Zubehoer: {accessoriesText}

Abholung und Rueckgabe:
Bike Haus Freiburg
{m.PickupLocation}

Wenn du einen neuen Termin moechtest, antworte einfach auf diese E-Mail.
Wir schauen gerne direkt nach einer passenden Alternative fuer dich.

Viele Gruesse
Dein Team vom Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildReceivedBodyDe(RentalBookingEmailModel m)
    {
        var totalPriceText = m.TotalPrice.HasValue ? $"{m.TotalPrice.Value:0.00} EUR" : "wird nach Pruefung bestaetigt";
        var accessoriesText = string.IsNullOrWhiteSpace(m.AccessoriesText) || m.AccessoriesText.Trim().Equals("Keine", StringComparison.OrdinalIgnoreCase)
            ? "Keine"
            : m.AccessoriesText.Replace("\n", ", ").Replace("- ", string.Empty).Trim();

        return $@"Hallo {m.ToName},

vielen Dank fuer deine Mietanfrage.

deine Anfrage ist erfolgreich bei uns eingegangen und wird gerade geprueft.

Buchungsnummer: {m.BuchungsNummer}
Fahrrad: {m.BikeBrand} {m.BikeModel}
Zeitraum: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} Tage)
Geschaetzter Mietpreis: {totalPriceText}
Zubehoer: {accessoriesText}

Wie geht es jetzt weiter?
Wir geben dir schnellstmoeglich Rueckmeldung, in der Regel innerhalb von 24 Stunden.
Sobald alles geprueft ist, bekommst du eine zweite E-Mail mit der finalen Bestaetigung.

Abholung und Rueckgabe:
Bike Haus Freiburg
{m.PickupLocation}

Falls sich deine Plaene aendern:
Du kannst deine Anfrage jederzeit selbst stornieren:
{m.SelfCancelUrl ?? "Bitte antworte auf diese E-Mail fuer eine Stornierung."}

Wenn du Fragen hast, antworte einfach auf diese E-Mail oder ruf kurz durch.

Viele Gruesse
Dein Team vom Bike Haus Freiburg
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

        return $@"<p>Hallo Team,</p>
<p>es ist eine neue Mietanfrage eingegangen und wartet auf Bearbeitung.</p>
<p>
<strong>Buchungsnummer:</strong> {m.BuchungsNummer}<br />
<strong>Kunde:</strong> {m.ToName}<br />
<strong>E-Mail:</strong> {m.ToEmail}<br />
<strong>Fahrrad:</strong> {m.BikeBrand} {m.BikeModel}<br />
<strong>Zeitraum:</strong> {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} Tage)<br />
<strong>Geschaetzter Mietpreis:</strong> {totalPriceText}<br />
<strong>Zubehoer:</strong> {accessoriesText}
</p>
<p>
Bitte auf den folgenden Link klicken, um die Mietanfragen zu pruefen:<br />
<a href=""{adminPortalUrl}"">{adminPortalUrl}</a>
</p>
<p>Diese Benachrichtigung wurde automatisch von no-reply@bikehausfreiburg.com gesendet.</p>";
    }

    private static string BuildDepositRefundConfirmationBodyDe(string toName, string mietvertragNummer, string googleReviewUrl)
    {
        return $@"<p>Hallo {toName},</p>
<p>deine Kaution wurde erfolgreich zurueckgegeben.</p>
<p>Vielen Dank, dass du bei Bike Haus Freiburg gemietet hast.</p>
<p><strong>Mietvertragsnummer:</strong> {mietvertragNummer}</p>
<p>
Wenn du zufrieden warst, freuen wir uns sehr ueber eine kurze Google-Bewertung:<br />
<a href=""{googleReviewUrl}"">{googleReviewUrl}</a>
</p>
<p>Vielen Dank und bis bald.<br />
Dein Team vom Bike Haus Freiburg</p>";
    }
}
