namespace BikeHaus.Domain.Entities;

public class OnlineSale : BaseEntity
{
    public int BikeId { get; set; }
    public string BikeTitle { get; set; } = "";
    public decimal Preis { get; set; }
    public string Vorname { get; set; } = "";
    public string Nachname { get; set; } = "";
    public string Email { get; set; } = "";
    public string Adresse { get; set; } = "";
    public string Abholtag { get; set; } = "";
    public string MolliePaymentId { get; set; } = "";
    public bool IsVerarbeitet { get; set; } = false;
}
