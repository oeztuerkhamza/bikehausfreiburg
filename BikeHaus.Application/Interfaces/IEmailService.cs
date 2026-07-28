using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IEmailService
{
    Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model);
    Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model);
    Task SendRentalBookingReactivatedAsync(RentalBookingEmailModel model);
    Task SendRentalBookingUpdatedAsync(RentalBookingEmailModel model);
    Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model);
    Task SendErinnerungVerificationCodeAsync(string toEmail, string code);
    /// <summary>Einladung zur Erinnerungsecke ("Anı Köşesi"), zweisprachig, vom Kampagnen-Absender.</summary>
    Task SendMemoryInviteAsync(string toEmail, string? vorname, string unsubscribeUrl);
    Task SendRentalBookingAdminPendingNotificationAsync(RentalBookingEmailModel model, string adminPortalUrl);
    Task SendDepositRefundConfirmationAsync(string toEmail, string toName, string mietvertragNummer);
    Task SendSaleReceiptAsync(string toEmail, string toName, string belegNummer, byte[] pdfBytes);
    Task SendReservationAnzahlungAsync(string toEmail, string toName, string reservierungsNummer, DateTime ablaufDatum, byte[] pdfBytes);
    Task SendRentalDocumentsAsync(string toEmail, string toName, string mietvertragNummer, byte[] mietvertragPdfBytes, byte[] kautionsquittungPdfBytes, byte[] bedingungenpdfBytes);

    /// <summary>
    /// Sends the review campaign as a PLAIN-TEXT message from the dedicated
    /// campaign sender — no HTML, no List-Unsubscribe headers — so it reads
    /// like a normal personal mail instead of a newsletter. The opt-out link
    /// is embedded in the body text by the caller for legal compliance.
    /// </summary>
    Task SendNewsletterAsync(string toEmail, string toName, string subject, string textBody);
}
