namespace BikeHaus.Domain.Entities;

public class RentalReview : BaseEntity
{
    public string Ad { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int Sterne { get; set; } = 5;
    public string Yorum { get; set; } = string.Empty;
    public bool Onaylandi { get; set; } = false;
    public string? AdminNotiz { get; set; }
}
