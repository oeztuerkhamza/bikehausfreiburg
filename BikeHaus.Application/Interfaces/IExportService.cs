namespace BikeHaus.Application.Interfaces;

public interface IExportService
{
    Task<byte[]> GenerateExportZipAsync(DateTime startDate, DateTime endDate);
}
