using System.Net;
using System.Net.Mail;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Options;

namespace BikeHaus.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly SmtpOptions _options;

    public SmtpEmailService(IOptions<SmtpOptions> options)
    {
        _options = options.Value;
    }

    public Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Booking confirmed - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Buchung bestaetigt - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildApprovedBodyEn(model)
            : BuildApprovedBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body);
    }

    public Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Booking cancelled - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Buchung storniert - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildCancelledBodyEn(model)
            : BuildCancelledBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body);
    }

    public Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model)
    {
        var subject = model.Language == "en"
            ? $"Booking request received - {model.BuchungsNummer} | Bike Haus Freiburg"
            : $"Buchungsanfrage eingegangen - {model.BuchungsNummer} | Bike Haus Freiburg";

        var body = model.Language == "en"
            ? BuildReceivedBodyEn(model)
            : BuildReceivedBodyDe(model);

        return SendAsync(model.ToEmail, model.ToName, subject, body);
    }

    private Task SendAsync(string toEmail, string toName, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
            return Task.CompletedTask;

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
            EnableSsl = _options.UseSsl
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            client.Credentials = new NetworkCredential(_options.Username, _options.Password);
        }

        return client.SendMailAsync(message);
    }

    private static string BuildApprovedBodyDe(RentalBookingEmailModel m)
    {
        return $@"Hallo {m.ToName},

Ihre Buchung wurde bestaetigt.

Buchung: {m.BuchungsNummer}
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

Your booking has been confirmed.

Booking: {m.BuchungsNummer}
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

Ihre Buchung wurde storniert.

Buchung: {m.BuchungsNummer}
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

Your booking has been cancelled.

Booking: {m.BuchungsNummer}
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

vielen Dank fuer Ihre Buchungsanfrage! Wir haben Ihre Anfrage erhalten und werden sie so schnell wie moeglich bearbeiten.

Buchungsnummer: {m.BuchungsNummer}
Fahrrad: {m.BikeBrand} {m.BikeModel}
Gewuenschter Zeitraum: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} Tage)
Geschaetzter Mietpreis: {(m.TotalPrice.HasValue ? m.TotalPrice.Value.ToString("0.00") + " EUR" : "wird berechnet")}

Zubehoer:
{m.AccessoriesText}

Was passiert als naechstes?
Wir pruefen Ihre Anfrage und melden uns innerhalb von 24 Stunden bei Ihnen.
Sie erhalten eine Bestaetigung per E-Mail, sobald Ihre Buchung bestaetigt oder abgelehnt wurde.

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

thank you for your booking request! We have received your request and will process it as soon as possible.

Booking number: {m.BuchungsNummer}
Bike: {m.BikeBrand} {m.BikeModel}
Requested period: {m.StartDate:dd.MM.yyyy} - {m.EndDate:dd.MM.yyyy} ({m.Days} days)
Estimated rental price: {(m.TotalPrice.HasValue ? m.TotalPrice.Value.ToString("0.00") + " EUR" : "to be calculated")}

Accessories:
{m.AccessoriesText}

What happens next?
We will review your request and get back to you within 24 hours.
You will receive a confirmation email once your booking is confirmed or declined.

Pickup/Return: {m.PickupLocation}

If you have any questions, just reply to this email or give us a call.

Best regards
Bike Haus Freiburg
{m.ShopPhone}
{m.ShopEmail}
";
    }
}
