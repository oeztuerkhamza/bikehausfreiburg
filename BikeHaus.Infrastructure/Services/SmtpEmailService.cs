using System.Net;
using System.Net.Mail;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BikeHaus.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Rental contract confirmed - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Mietvertrag bestaetigt - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildApprovedBodyEn(model)
            : BuildApprovedBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body);
    }

    public Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Rental contract cancelled - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Mietvertrag storniert - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildCancelledBodyEn(model)
            : BuildCancelledBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body);
    }

    public Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Rental request received - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Mietanfrage eingegangen - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildReceivedBodyEn(model)
            : BuildReceivedBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body);
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            _logger.LogError("SMTP host is not configured. Email to {To} cannot be sent.", toEmail);
            throw new InvalidOperationException("SMTP host is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_options.Password))
        {
            _logger.LogError("SMTP password is empty. Email to {To} cannot be sent.", toEmail);
            throw new InvalidOperationException("SMTP password is empty.");
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_options.FromEmail, _options.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };
            message.To.Add(new MailAddress(toEmail, toName));

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                EnableSsl = _options.UseSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 20000
            };

            if (!string.IsNullOrWhiteSpace(_options.Username))
                client.Credentials = new NetworkCredential(_options.Username, _options.Password);

            _logger.LogInformation("Sending email to {To}, subject: {Subject}", toEmail, subject);
            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {To}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To} via {Host}:{Port}", toEmail, _options.Host, _options.Port);
            throw;
        }
    }

    private static string BuildApprovedBodyDe(RentalBookingEmailModel m)
    {
        return $@"Hallo {m.ToName},

Ihre Mietanfrage wurde bestaetigt. Ihr Mietvertrag ist vorbereitet.

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

Ihr Mietvertrag wurde storniert.

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

vielen Dank fuer Ihre Mietanfrage. Wir haben Ihre Angaben erhalten und pruefen jetzt die Vertragsdaten.

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
