using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IRentalBookingService
{
    Task<PaginatedResult<RentalBookingListDto>> GetPaginatedAsync(PaginationParams paginationParams, bool includeCompleted = false);
    Task<RentalBookingDto?> GetByIdAsync(int id);
    Task<RentalBookingDto> CreateAsync(RentalBookingCreateDto dto, bool requireEmail = true);
    Task<RentalBookingDto> ApproveAsync(int id, RentalBookingApproveDto dto);
    Task<RentalBookingDto> CancelAsync(int id, RentalBookingCancelDto dto);
    Task<RentalBookingDto> CancelByCustomerAsync(string bookingNumber, string email);
    Task<IEnumerable<RentalBookingRangeDto>> GetApprovedRangesAsync(int bicycleId);
    Task<int> GetPendingCountAsync();
    Task<IEnumerable<RentalBookingListDto>> GetCalendarAsync(DateTime from, DateTime to);
    Task<bool> DeleteAsync(int id);
    Task SaveSignatureAsync(int id, string mieterUnterschrift);
    Task SaveAusweisPhotoPathAsync(int id, string ausweisPhotoPath, bool istRueckseite = false);
    Task<string?> GetAusweisPhotoPathAsync(int id, bool istRueckseite = false);
    Task<RentalBookingDto> UpdateBookingBikeAsync(int bookingId, int bookingBikeId, int newBicycleId);
    Task<RentalBookingDto> UpdateDatesAsync(int id, RentalBookingUpdateDatesDto dto);

    /// <summary>
    /// Undoes bookings that were cancelled by the self-cancel email link bug
    /// (identified by the "Self-Storno" note on a Cancelled booking). Dry-run by
    /// default (<paramref name="apply"/> = false) — returns the candidate list
    /// without changing anything. When applied, restores each booking to its
    /// prior status (Approved if it had been approved, otherwise Pending),
    /// clears the cancellation, and emails the customer that it is active again.
    /// <paramref name="cancelledBefore"/> optionally limits candidates to
    /// cancellations before a given time (e.g. the deploy of the fix), so
    /// genuine cancellations made afterwards are left untouched.
    /// </summary>
    Task<RevertStornoResultDto> RevertErroneousStornosAsync(bool apply, DateTime? cancelledBefore = null);

    /// <summary>
    /// Sends the "your bike is ready tomorrow" reminder to every Approved booking
    /// whose StartDatum is tomorrow and that has not been reminded yet. Meant to be
    /// called hourly by a background service; idempotent via
    /// <see cref="Domain.Entities.RentalBooking.ErinnerungGesendetAm"/>. Returns the
    /// number of reminders actually sent.
    /// </summary>
    Task<int> SendPickupRemindersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Side-effect-free lookup for the customer-facing "manage my booking" page.
    /// Booking number AND e-mail are both required and both must match — same
    /// proof-of-ownership as <see cref="CancelByCustomerAsync"/>, but this NEVER
    /// changes anything. Returns null when the booking does not exist OR the
    /// e-mail does not match it — deliberately the SAME null for both cases, so
    /// a wrong booking number cannot be told apart from a wrong e-mail (no
    /// oracle for guessing valid booking numbers).
    /// </summary>
    Task<PublicRentalBookingLookupDto?> LookupByCustomerAsync(string bookingNumber, string email);
}
