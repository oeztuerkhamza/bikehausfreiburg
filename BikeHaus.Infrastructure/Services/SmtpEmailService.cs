using System.Net.Security;
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
        var subject = model.Language == "en"
            ? $"Rental contract confirmed - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Anfrage bestaetigt - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildApprovedBodyEn(model)
            : BuildApprovedBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietvertragBestaetigt");
    }

    public Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Rental contract cancelled - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Anfrage storniert - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildCancelledBodyEn(model)
            : BuildCancelledBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietvertragStorniert");
    }

    public Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Rental request received - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Talebiniz alindi - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildReceivedBodyEn(model)
            : BuildReceivedBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body, "MietanfrageEingegangen");
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string body, string emailType = "")
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

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = body };

            using var client = new SmtpClient
            {
                Timeout = 20000,
                ServerCertificateValidationCallback = (_, _, _, sslPolicyErrors) =>
                    sslPolicyErrors == SslPolicyErrors.None || sslPolicyErrors == SslPolicyErrors.RemoteCertificateChainErrors
            };

            var socketOptions = useSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;

            _logger.LogInformation("Sending email to {To}, subject: {Subject}", toEmail, subject);
            await client.ConnectAsync(host, port, socketOptions);

            if (!string.IsNullOrWhiteSpace(username))
                await client.AuthenticateAsync(username, password);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            _logger.LogInformation("Email sent successfully to {To}", toEmail);

            await LogEmailAsync(toEmail, toName, subject, emailType, "Gesendet", null, dbAccount?.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To} via {Host}:{Port}", toEmail, host, port);
            await LogEmailAsync(toEmail, toName, subject, emailType, "Fehler", ex.Message, dbAccount?.Id);
            throw;
        }
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

Ihre Mietanfrage wurde bestaetigt.
Talebiniz onaylanmistir. Bike Haus Freiburg sizinle en kisa surede ilgilenecektir.

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

    private static string BuildApprovedBodyEn(RentalBookingEmailModel m)
    {
        return $@"Hello {m.ToName},

Your rental request has been confirmed. Your rental contract is prepared.

Booking / rental contract: {m.BuchungsNummer}
Bike: {m.BikeBrand} {m.BikeModel}
Frame No.: {m.FrameNumber ?? "-"}
Frame Size: {m.FrameSize ?? "-"}
Color: {m.Color ?? "-"}

Period: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} days, incl. pickup and return day)
Total rental price: {(m.TotalPrice.HasValue ? m.TotalPrice.Value.ToString("0.00") + " EUR" : "-")}
Deposit: {(m.Deposit.HasValue ? m.Deposit.Value.ToString("0.00") + " EUR" : "-")}

Accessories:
{m.AccessoriesText}

Pickup/Return: {m.PickupLocation}
Payment: in store only

Please bring a valid ID.
Please sign the rental contract when picking up the bike.
If you have questions, just reply to this email.

Best regards
Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildCancelledBodyDe(RentalBookingEmailModel m)
    {
        return $@"Hallo {m.ToName},

Ihre Mietanfrage wurde storniert.
Talebiniz su an icin storniert (iptal) edilmistir.

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

    private static string BuildCancelledBodyEn(RentalBookingEmailModel m)
    {
        return $@"Hello {m.ToName},

Your rental contract has been cancelled.

Booking / rental contract: {m.BuchungsNummer}
Bike: {m.BikeBrand} {m.BikeModel}
Period: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy}

If you want to book a new date, please reply to this email.

Best regards
Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }

    private static string BuildReceivedBodyDe(RentalBookingEmailModel m)
    {
        return $@"Hallo {m.ToName},

vielen Dank fuer Ihre Mietanfrage.
Talebiniz alinmistir. Bike Haus Freiburg ilgilenecektir.

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

    private static string BuildReceivedBodyEn(RentalBookingEmailModel m)
    {
        return $@"Hello {m.ToName},

thank you for your rental request. We have received your details and are reviewing the contract information now.

Booking number: {m.BuchungsNummer}
Bike: {m.BikeBrand} {m.BikeModel}
Requested period: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} days)
Estimated rental price: {(m.TotalPrice.HasValue ? m.TotalPrice.Value.ToString("0.00") + " EUR" : "to be calculated")}

Accessories:
{m.AccessoriesText}

What happens next?
We will review your request and get back to you within 24 hours.
You will receive a confirmation email once your rental contract is approved or declined.

Pickup/Return: {m.PickupLocation}

If you have any questions, just reply to this email or give us a call.

Best regards
Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }
}
