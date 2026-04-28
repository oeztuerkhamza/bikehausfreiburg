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

namespace BikeHaus.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private const int MaxSendAttempts = 3;
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly BikeHausDbContext _db;

    public SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger, BikeHausDbContext db)
    {
        _options = options.Value;
        _logger = logger;
        _db = db;
    }

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

    public Task SendSaleReceiptAsync(string toEmail, string toName, string belegNummer, byte[] pdfBytes)
    {
        var subject = $"Rechnung - {belegNummer} | Bike Haus Freiburg";
        var body = $@"Hallo {toName},

anbei erhalten Sie Ihre Rechnung zu Ihrem Kauf bei Bike Haus Freiburg.

Belegnummer: {belegNummer}

Vielen Dank fuer Ihren Einkauf.

Viele Gruesse
Bike Haus Freiburg";

        return SendAsync(
            toEmail,
            toName,
            subject,
            body,
            "Verkaufsrechnung",
            pdfBytes,
            $"Rechnung-{belegNummer}.pdf");
    }

    private async Task SendAsync(
        string toEmail,
        string toName,
        string subject,
        string body,
        string emailType = "",
        byte[]? attachmentBytes = null,
        string? attachmentFileName = null)
    {
        var dbAccount = await _db.EmailAccounts
            .Where(a => a.IsDefault && a.IsActive)
            .FirstOrDefaultAsync();

        var host = FirstConfigured(dbAccount?.Host, _options.Host);
        var port = dbAccount?.Port > 0 ? dbAccount.Port : _options.Port;
        var username = FirstConfigured(dbAccount?.Username, _options.Username);
        var password = FirstConfigured(dbAccount?.Password, _options.Password);
        var useSsl = dbAccount?.UseSsl ?? _options.UseSsl;
        var fromEmail = FirstConfigured(dbAccount?.FromEmail, _options.FromEmail);
        var fromName = FirstConfigured(dbAccount?.FromName, _options.FromName);

        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogError("SMTP host is not configured. Email to {To} cannot be sent.", toEmail);
            await LogEmailAsync(toEmail, toName, subject, emailType, "Fehler", "SMTP host nicht konfiguriert.", dbAccount?.Id);
            throw new InvalidOperationException("SMTP host is not configured.");
        }

        if (string.IsNullOrWhiteSpace(password))
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
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;

                if (attachmentBytes is { Length: > 0 } && !string.IsNullOrWhiteSpace(attachmentFileName))
                {
                    var multipart = new Multipart("mixed");
                    multipart.Add(new TextPart("plain") { Text = body });
                    multipart.Add(new MimePart("application", "pdf")
                    {
                        Content = new MimeContent(new MemoryStream(attachmentBytes), ContentEncoding.Default),
                        ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
                        ContentTransferEncoding = ContentEncoding.Base64,
                        FileName = attachmentFileName
                    });
                    message.Body = multipart;
                }
                else
                {
                    message.Body = new TextPart("plain") { Text = body };
                }

                using var client = new SmtpClient
                {
                    Timeout = 20000,
                    ServerCertificateValidationCallback = (_, _, _, sslPolicyErrors) =>
                        sslPolicyErrors == SslPolicyErrors.None || sslPolicyErrors == SslPolicyErrors.RemoteCertificateChainErrors
                };

                var socketOptions = useSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;

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
        return $@"Hallo {m.ToName},

Ihre Mietanfrage wurde bestaetigt. Wir freuen uns auf Ihren Besuch.

Buchung / Mietvertrag: {m.BuchungsNummer}
Fahrrad: {m.BikeBrand} {m.BikeModel}
Rahmennummer: {m.FrameNumber ?? "-"}
Rahmengroesse: {m.FrameSize ?? "-"}
Farbe: {m.Color ?? "-"}

Zeitraum: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} Tage, inkl. Abhol- und Rueckgabetag)
Mietpreis gesamt: {(m.TotalPrice.HasValue ? m.TotalPrice.Value.ToString("0.00") + " EUR" : "-")}
Kaution: {(m.Deposit.HasValue ? m.Deposit.Value.ToString("0.00") + " EUR" : "-")}

Zubehoer:
{m.AccessoriesText}

Abholung/Rueckgabe: {m.PickupLocation}
Zahlung: vor Ort im Laden

Bitte bringen Sie einen gueltigen Ausweis mit.
Bitte unterschreiben Sie den Mietvertrag bei Abholung.
Bei Fragen antworten Sie einfach auf diese E-Mail.

Viele Gruesse
Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildCancelledBodyDe(RentalBookingEmailModel m)
    {
        return $@"Hallo {m.ToName},

Ihre Mietanfrage wurde storniert.

Buchung / Mietvertrag: {m.BuchungsNummer}
Fahrrad: {m.BikeBrand} {m.BikeModel}
Zeitraum: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy}

Wenn Sie einen neuen Termin wuenschen, antworten Sie bitte auf diese E-Mail.

Viele Gruesse
Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildReceivedBodyDe(RentalBookingEmailModel m)
    {
        return $@"Hallo {m.ToName},

vielen Dank fuer Ihre Mietanfrage. Wir bestaetigen den Erhalt und werden uns schnellstmoeglich bei Ihnen melden.

Buchungsnummer: {m.BuchungsNummer}
Fahrrad: {m.BikeBrand} {m.BikeModel}
Gewuenschter Zeitraum: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} Tage)
Geschaetzter Mietpreis: {(m.TotalPrice.HasValue ? m.TotalPrice.Value.ToString("0.00") + " EUR" : "wird berechnet")}

Zubehoer:
{m.AccessoriesText}

Was passiert als naechstes?
Wir pruefen Ihre Anfrage und melden uns innerhalb von 24 Stunden bei Ihnen.
Sie erhalten eine Bestaetigung per E-Mail, sobald Ihr Mietvertrag freigegeben oder abgelehnt wurde.

Abholung/Rueckgabe: {m.PickupLocation}

Bei Fragen antworten Sie einfach auf diese E-Mail oder rufen uns an.

Viele Gruesse
Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }
}
