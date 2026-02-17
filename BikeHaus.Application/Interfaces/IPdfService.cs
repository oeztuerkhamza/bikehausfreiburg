namespace BikeHaus.Application.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateKaufbelegAsync(int purchaseId);
    Task<byte[]> GenerateVerkaufsbelegAsync(int saleId);
    Task<byte[]> GenerateRueckgabebelegAsync(int returnId);
}
