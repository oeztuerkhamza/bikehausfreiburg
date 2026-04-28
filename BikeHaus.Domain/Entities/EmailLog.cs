namespace BikeHaus.Domain.Entities;

public class EmailLog : BaseEntity
{
    public string ToEmail { get; set; } = string.Empty;
    public string ToName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Status { get; set; } = "Gesendet";
    public string? ErrorMessage { get; set; }
    public string EmailType { get; set; } = string.Empty;
    public int? EmailAccountId { get; set; }
    public EmailAccount? EmailAccount { get; set; }
}
