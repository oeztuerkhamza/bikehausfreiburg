using System.IO.Compression;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Interfaces;

namespace BikeHaus.Application.Services;

public class ExportService : IExportService
{
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IReturnRepository _returnRepository;
    private readonly IExpenseRepository _expenseRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IPdfService _pdfService;
    private readonly string _uploadsPath;

    public ExportService(
        IPurchaseRepository purchaseRepository,
        ISaleRepository saleRepository,
        IReturnRepository returnRepository,
        IExpenseRepository expenseRepository,
        IInvoiceRepository invoiceRepository,
        IPdfService pdfService,
        string uploadsPath)
    {
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
        _returnRepository = returnRepository;
        _expenseRepository = expenseRepository;
        _invoiceRepository = invoiceRepository;
        _pdfService = pdfService;
        _uploadsPath = uploadsPath;
    }

    public async Task<byte[]> GenerateExportZipAsync(DateTime startDate, DateTime endDate)
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            // 1. Kaufbelege (Purchase receipts)
            var purchases = await _purchaseRepository.FindAsync(p =>
                p.Kaufdatum >= startDate && p.Kaufdatum <= endDate);
            foreach (var purchase in purchases)
            {
                var pdf = await _pdfService.GenerateKaufbelegAsync(purchase.Id);
                var fileName = $"Kaufbelege/Kaufbeleg_{purchase.BelegNummer ?? purchase.Id.ToString()}_{purchase.Kaufdatum:yyyy-MM-dd}.pdf";
                var entry = archive.CreateEntry(SanitizeFileName(fileName));
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(pdf);
            }

            // 2. Verkaufsbelege (Sales receipts) - with purchase price included in PDF
            var sales = await _saleRepository.FindAsync(s =>
                s.Verkaufsdatum >= startDate && s.Verkaufsdatum <= endDate);
            foreach (var sale in sales)
            {
                var pdf = await _pdfService.GenerateVerkaufsbelegAsync(sale.Id);
                var fileName = $"Verkaufsbelege/Verkaufsbeleg_{sale.BelegNummer}_{sale.Verkaufsdatum:yyyy-MM-dd}.pdf";
                var entry = archive.CreateEntry(SanitizeFileName(fileName));
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(pdf);
            }

            // 3. Rückgabebelege (Return receipts)
            var returns = await _returnRepository.FindAsync(r =>
                r.Rueckgabedatum >= startDate && r.Rueckgabedatum <= endDate);
            foreach (var ret in returns)
            {
                var pdf = await _pdfService.GenerateRueckgabebelegAsync(ret.Id);
                var fileName = $"Rueckgabebelege/Rueckgabebeleg_{ret.BelegNummer}_{ret.Rueckgabedatum:yyyy-MM-dd}.pdf";
                var entry = archive.CreateEntry(SanitizeFileName(fileName));
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(pdf);
            }

            // 4. Ausgaben (Expense uploaded documents)
            var expenses = await _expenseRepository.GetByDateRangeAsync(startDate, endDate);
            foreach (var expense in expenses)
            {
                if (string.IsNullOrEmpty(expense.BelegDatei))
                    continue;

                var filePath = Path.Combine(_uploadsPath, expense.BelegDatei.TrimStart('/'));
                if (!File.Exists(filePath))
                    continue;

                var ext = Path.GetExtension(filePath);
                var fileName = $"Ausgaben/Ausgabe_{expense.BelegNummer ?? expense.Id.ToString()}_{expense.Datum:yyyy-MM-dd}{ext}";
                var entry = archive.CreateEntry(SanitizeFileName(fileName));
                using var entryStream = entry.Open();
                using var fileStream = File.OpenRead(filePath);
                await fileStream.CopyToAsync(entryStream);
            }

            // 5. Rechnungen (Invoices)
            var allInvoices = await _invoiceRepository.GetAllAsync();
            var invoices = allInvoices.Where(i => i.Datum >= startDate && i.Datum <= endDate);
            foreach (var invoice in invoices)
            {
                var pdf = await _pdfService.GenerateRechnungAsync(invoice.Id);
                var fileName = $"Rechnungen/Rechnung_{invoice.RechnungsNummer}_{invoice.Datum:yyyy-MM-dd}.pdf";
                var entry = archive.CreateEntry(SanitizeFileName(fileName));
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(pdf);
            }
        }

        return memoryStream.ToArray();
    }

    private static string SanitizeFileName(string fileName)
    {
        // Replace characters that are invalid in file names but keep path separators
        var invalid = Path.GetInvalidFileNameChars().Where(c => c != '/' && c != '\\');
        foreach (var c in invalid)
        {
            fileName = fileName.Replace(c, '_');
        }
        return fileName;
    }
}
