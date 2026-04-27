using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IEmailService
{
    Task SendRentalBookingApprovedAsync(RentalBookingEmailModel model);
    Task SendRentalBookingCancelledAsync(RentalBookingEmailModel model);
}
