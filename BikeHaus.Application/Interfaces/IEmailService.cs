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
    Task SendOnlineSaleNotificationAsync(OnlineSaleEmailModel model);
}

public record OnlineSaleEmailModel(
    string BikeTitle,
    decimal Price,
    string Vorname,
    string Nachname,
    string Email,
    string Adresse,
    string Abholtag,
    string AdminEmail
);
