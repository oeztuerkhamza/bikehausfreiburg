using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IEmailService
{
    Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model);
    Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model);
    Task SendRentalBookingReceivedAsync(RentalBookingEmailModel model);
    Task SendSaleReceiptAsync(string toEmail, string toName, string belegNummer, byte[] pdfBytes);
    Task SendRentalDocumentsAsync(string toEmail, string toName, string mietvertragNummer, byte[] mietvertragPdfBytes, byte[] kautionsquittungPdfBytes);
}
