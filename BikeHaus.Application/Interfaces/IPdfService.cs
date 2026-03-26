namespace BikeHaus.Application.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateKaufbelegAsync(int purchaseId);
    Task<byte[]> GenerateVerkaufsbelegAsync(int saleId, bool includeAnkaufPreis = false);
    Task<byte[]> GenerateRueckgabebelegAsync(int returnId);
    Task<byte[]> GenerateRechnungAsync(int invoiceId);
    Task<byte[]> GenerateAusgabebelegAsync(int expenseId);
    Task<byte[]> GenerateMietvertragAsync(int rentalId);
    Task<byte[]> GenerateKautionsquittungAsync(int rentalId);
}
