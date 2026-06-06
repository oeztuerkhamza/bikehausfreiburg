using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IEmailService
{
    Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model);
    Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model);
    Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model);
    Task SendRentalBookingAdminPendingNotificationAsync(RentalBookingEmailModel model, string adminPortalUrl);
    Task SendDepositRefundConfirmationAsync(string toEmail, string toName, string mietvertragNummer);
    Task SendSaleReceiptAsync(string toEmail, string toName, string belegNummer, byte[] pdfBytes);
    Task SendRentalDocumentsAsync(string toEmail, string toName, string mietvertragNummer, byte[] mietvertragPdfBytes, byte[] kautionsquittungPdfBytes, byte[] bedingungenpdfBytes);

    /// <summary>
    /// Sends a marketing/newsletter mail as multipart/alternative (plain + HTML)
    /// with RFC 8058 one-click unsubscribe headers. Used for campaigns.
    /// </summary>
    Task SendNewsletterAsync(string toEmail, string toName, string subject, string htmlBody, string textBody, string unsubscribeUrl);
}
