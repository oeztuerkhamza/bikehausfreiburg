using BikeHaus.Application.Interfaces;
using BikeHaus.Application.Services;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;

namespace BikeHaus.Infrastructure.Services;

public class PdfService : IPdfService
{
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IReturnRepository _returnRepository;
    private readonly IShopSettingsRepository _shopSettingsRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IExpenseRepository _expenseRepository;
    private readonly IRentalRepository _rentalRepository;
    private readonly IRentalBookingRepository _rentalBookingRepository;
    private readonly IBicycleRepository _bicycleRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IFileStorageService _fileStorage;

    // Print-Friendly Colors (optimized for less ink consumption)
    private static readonly string PrimaryColor = "#2c5282";       // Medium blue (for text)
    private static readonly string SecondaryColor = "#4299e1";     // Light blue (for accents)
    private static readonly string AccentColor = "#2b6cb0";        // Blue accent
    private static readonly string LightBg = "#ffffff";           // White background
    private static readonly string TableHeaderBg = "#f7fafc";      // Very light gray
    private static readonly string TableAltBg = "#f7fafc";         // Very light gray for rows

    // Default Shop Information (fallback if no settings in DB)
    private const string DefaultShopName = "BIKE HAUS FREIBURG";
    private const string DefaultOwnerName = "CEVDET AKARSU";
    private const string DefaultShopType = "FAHRRADLADEN";
    private const string DefaultSteuernummer = "06002/40667";
    private const string DefaultUStIdNr = "DE437595861";
    private const string DefaultShopStreet = "Heckerstraße 27";
    private const string DefaultShopCity = "79114 Freiburg";
    private const string DefaultShopEmail = "info.bikehausfreiburg@gmail.com";
    private const string DefaultShopTelefon = "0 15566300011";
    private const string DefaultBankName = "Sparkasse";
    private const string DefaultBankAccountHolder = "Cevdet Akarsu";
    private const string DefaultIBAN = "DE28 6805 0101 00 14 5475 04";
    private const string GoogleReviewUrl = "https://g.page/r/CRnu1n--kiIYEBM/review";
    private const string WebsiteUrl = "www.bikehausfreiburg.com";

    // Warranty Texts
    private const string NeuWarrantyText =
        "Dieses Fahrrad ist Neuwaren und unterliegt der gesetzlichen 2-jährigen Gewährleistung. " +
        "Die Rechnung wird mitgeliefert. Der Verkäufer garantiert, dass das Fahrrad bei Übergabe mängelfrei ist. " +
        "Der Käufer hat das Recht, das Fahrrad innerhalb von 3 Tagen ohne Angabe von Gründen zurückzugeben, " +
        "vorausgesetzt, das Fahrrad wird vollständig und unversehrt zurückgegeben.";

    private const string GebrauchtWarrantyText =
        "Gebraucht Garantiebedingungen: 3 Monate Garantie auf: Kette, Schaltung, Schaltwerk, " +
        "Dynamo, Pedale und hydraulische Bremsen. Von der Garantie ausgeschlossen sind: Reifen, Schläuche, " +
        "Bremsbeläge, Lampen. Ebenfalls ausgeschlossen: Schäden durch Unfälle oder unsachgemäße Nutzung. " +
        "Rückgaberecht: innerhalb von 3 Arbeitstagen.";

    private const string RepairNote =
        "*Reparaturen im Garantiefall dürfen ausschließlich durch Bike Haus Freiburg durchgeführt werden.*";

    public PdfService(
        IPurchaseRepository purchaseRepository,
        ISaleRepository saleRepository,
        IReturnRepository returnRepository,
        IShopSettingsRepository shopSettingsRepository,
        IInvoiceRepository invoiceRepository,
        IExpenseRepository expenseRepository,
        IRentalRepository rentalRepository,
        IRentalBookingRepository rentalBookingRepository,
        IBicycleRepository bicycleRepository,
        IReservationRepository reservationRepository,
        IFileStorageService fileStorage)
    {
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
        _returnRepository = returnRepository;
        _shopSettingsRepository = shopSettingsRepository;
        _invoiceRepository = invoiceRepository;
        _expenseRepository = expenseRepository;
        _rentalRepository = rentalRepository;
        _rentalBookingRepository = rentalBookingRepository;
        _bicycleRepository = bicycleRepository;
        _reservationRepository = reservationRepository;
        _fileStorage = fileStorage;
    }

    // Helper to get shop info from DB settings or use defaults
    private async Task<ShopInfo> GetShopInfoAsync()
    {
        var settings = await _shopSettingsRepository.GetSettingsAsync();
        if (settings == null)
        {
            return new ShopInfo
            {
                ShopName = DefaultShopName,
                OwnerName = DefaultOwnerName,
                ShopType = DefaultShopType,
                Steuernummer = DefaultSteuernummer,
                UStIdNr = DefaultUStIdNr,
                Street = DefaultShopStreet,
                City = DefaultShopCity,
                Email = DefaultShopEmail,
                Telefon = DefaultShopTelefon,
                BankName = DefaultBankName,
                BankAccountHolder = DefaultBankAccountHolder,
                IBAN = DefaultIBAN,
                LogoBase64 = null,
                OwnerSignatureBase64 = null,
                GoogleReviewUrl = GoogleReviewUrl
            };
        }

        // Build owner name from settings or fallback
        var ownerName = DefaultOwnerName;
        if (!string.IsNullOrEmpty(settings.InhaberVorname) || !string.IsNullOrEmpty(settings.InhaberNachname))
        {
            ownerName = $"{settings.InhaberVorname} {settings.InhaberNachname}".Trim().ToUpper();
        }

        return new ShopInfo
        {
            ShopName = !string.IsNullOrEmpty(settings.ShopName) ? settings.ShopName.ToUpper() : DefaultShopName,
            OwnerName = ownerName,
            ShopType = DefaultShopType,
            Steuernummer = !string.IsNullOrEmpty(settings.Steuernummer) ? settings.Steuernummer : DefaultSteuernummer,
            UStIdNr = !string.IsNullOrEmpty(settings.UstIdNr) ? settings.UstIdNr : DefaultUStIdNr,
            Street = !string.IsNullOrEmpty(settings.Strasse) ? $"{settings.Strasse} {settings.Hausnummer}" : DefaultShopStreet,
            City = !string.IsNullOrEmpty(settings.PLZ) ? $"{settings.PLZ} {settings.Stadt}" : DefaultShopCity,
            Email = !string.IsNullOrEmpty(settings.Email) ? settings.Email : DefaultShopEmail,
            Telefon = !string.IsNullOrEmpty(settings.Telefon) ? settings.Telefon : DefaultShopTelefon,
            BankName = !string.IsNullOrEmpty(settings.Bankname) ? settings.Bankname : DefaultBankName,
            BankAccountHolder = ownerName,
            IBAN = !string.IsNullOrEmpty(settings.IBAN) ? settings.IBAN : DefaultIBAN,
            LogoBase64 = settings.LogoBase64,
            OwnerSignatureBase64 = settings.InhaberSignatureBase64,
            GoogleReviewUrl = !string.IsNullOrEmpty(settings.GoogleReviewUrl) ? settings.GoogleReviewUrl : GoogleReviewUrl
        };
    }

    private static void AddLogoToHeader(ColumnDescriptor col, ShopInfo shop)
    {
        if (!string.IsNullOrEmpty(shop.LogoBase64))
        {
            try
            {
                var base64Data = shop.LogoBase64;
                // Remove data URI prefix if present
                if (base64Data.Contains(","))
                    base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);

                var logoBytes = Convert.FromBase64String(base64Data);
                col.Item().AlignCenter().Height(60).Image(logoBytes);
                col.Item().PaddingBottom(5);
            }
            catch
            {
                // Ignore logo errors, continue without logo
            }
        }
    }

    private static byte[] GenerateQrCode(string url)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.M);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(8);
    }

    private class ShopInfo
    {
        public string ShopName { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string ShopType { get; set; } = string.Empty;
        public string Steuernummer { get; set; } = string.Empty;
        public string UStIdNr { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefon { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BankAccountHolder { get; set; } = string.Empty;
        public string IBAN { get; set; } = string.Empty;
        public string? LogoBase64 { get; set; }
        public string? OwnerSignatureBase64 { get; set; }
        public string? GoogleReviewUrl { get; set; }
    }

    public async Task<byte[]> GenerateKaufbelegAsync(int purchaseId)
    {
        var purchase = await _purchaseRepository.GetWithDetailsAsync(purchaseId)
            ?? throw new KeyNotFoundException($"Purchase with ID {purchaseId} not found.");

        var shop = await GetShopInfoAsync();

        // Append the bicycle's gallery photos (the same images shown on the
        // purchase card) to the bottom of the receipt. Files missing on disk are
        // skipped so a broken image never breaks the receipt.
        var bicycleWithImages = await _bicycleRepository.GetWithImagesAsync(purchase.BicycleId);
        var galleryImages = bicycleWithImages?.Images ?? new List<BicycleImage>();
        var ankaufPhotos = await LoadBicycleGalleryImagesAsync(galleryImages);

        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header aligned with Verkaufsbeleg template
                page.Header().Container().Column(col =>
                {
                    // Top header bar
                    col.Item().Row(row =>
                    {
                        // Logo - left
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        // Shop info - center
                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        // Ankaufbeleg box - right
                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("RECHNUNGSNUMMER").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(purchase.BelegNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            if (purchase.Bicycle?.Lagernummer != null)
                            {
                                box.Item().Text("LAGERNUMMER").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                                box.Item().Text(purchase.Bicycle.Lagernummer.Value.ToString()).FontSize(12).Bold().FontColor(PrimaryColor).AlignCenter();
                            }
                            box.Item().Text("RECHNUNGSDATUM").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                            box.Item().Text($"{purchase.Kaufdatum:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    // Tax info bar
                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Rechnung nach §25a UStG – Kein gesonderter Ausweis der Umsatzsteuer").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(4).Column(col =>
                {
                    // Big KAUFBELEG title
                    col.Item().PaddingTop(2).PaddingBottom(4).Text("KAUFBELEG").FontSize(18).Bold().FontColor(PrimaryColor);

                    // KÄUFER (left) and VERKÄUFER (right) side by side
                    col.Item().Row(row =>
                    {
                        // Buyer Info (Shop Owner) - left side
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(c =>
                        {
                            c.Item().Text("KÄUFER (HÄNDLER)").FontSize(9).Bold().FontColor(PrimaryColor);
                            c.Item().PaddingTop(4).Text(shop.ShopName).FontSize(10).Bold();
                            c.Item().Text($"Inhaber: {shop.OwnerName}").FontSize(9);
                            c.Item().Text($"{shop.Street}, {shop.City}").FontSize(9);
                            if (!string.IsNullOrEmpty(shop.Telefon))
                                c.Item().Text($"Tel: {shop.Telefon}").FontSize(9);
                            if (!string.IsNullOrEmpty(shop.Email))
                                c.Item().Text(shop.Email).FontSize(9);
                            if (!string.IsNullOrEmpty(shop.Steuernummer))
                                c.Item().Text($"Steuernummer: {shop.Steuernummer}").FontSize(9);
                        });

                        row.ConstantItem(8);

                        // Seller Info (Vorbesitzer) - right side
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(c =>
                        {
                            c.Item().Text("VERKÄUFER (VORBESITZER)").FontSize(9).Bold().FontColor(PrimaryColor);
                            c.Item().PaddingTop(4).Text(purchase.Seller?.FullName ?? "-").FontSize(10).Bold();
                            if (!string.IsNullOrEmpty(purchase.Seller?.FullAddress))
                                c.Item().Text(purchase.Seller.FullAddress).FontSize(9);
                            if (!string.IsNullOrEmpty(purchase.Seller?.Telefon))
                                c.Item().Text($"Tel: {purchase.Seller.Telefon}").FontSize(9);
                            if (!string.IsNullOrEmpty(purchase.Seller?.Email))
                                c.Item().Text(purchase.Seller.Email).FontSize(9);
                        });
                    });

                    // AnzeigeNr if present (separate row)
                    if (!string.IsNullOrEmpty(purchase.AnzeigeNr))
                    {
                        col.Item().PaddingTop(8).Row(row =>
                        {
                            row.ConstantItem(150).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
                            {
                                c.Item().Text("Anzeige Nr.").FontSize(8).FontColor(Colors.Grey.Darken1);
                                c.Item().Text(purchase.AnzeigeNr).FontSize(11).Bold().FontColor(PrimaryColor);
                            });
                        });
                    }

                    // Section: Bicycle Info
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("FAHRRAD-INFORMATIONEN");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(95);
                            columns.RelativeColumn();
                            columns.ConstantColumn(95);
                            columns.RelativeColumn();
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Marke").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(purchase.Bicycle.Marke ?? "-").FontSize(10).Bold();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Modell").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(purchase.Bicycle.Modell ?? "-").FontSize(10).Bold();

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Rahmennummer").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(purchase.Bicycle.Rahmennummer ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Farbe").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(purchase.Bicycle.Farbe ?? "-").FontSize(10);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Rahmengröße").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(purchase.Bicycle.Rahmengroesse ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Reifengröße").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(purchase.Bicycle.Reifengroesse ?? "-").FontSize(10);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Fahrradtyp").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(purchase.Bicycle.Fahrradtyp ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Zustand").FontSize(9).FontColor(Colors.Grey.Darken2);
                        if (purchase.Bicycle.Zustand == BikeCondition.Neu)
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("NEU").FontSize(10).Bold().FontColor("#155724");
                        else
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("GEBRAUCHT").FontSize(10).Bold().FontColor("#856404");
                    });

                    // Section: Purchase Details
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("KAUFDETAILS");
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(c =>
                        {
                            c.Item().Text("Zahlungsart").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(purchase.Zahlungsart.ToString()).FontSize(12).Bold();
                        });

                        row.ConstantItem(10);

                        row.ConstantItem(160).Border(2).BorderColor(PrimaryColor).Padding(12).Column(c =>
                        {
                            c.Item().Text("BRUTTOBETRAG").FontSize(10).FontColor(PrimaryColor).AlignCenter();
                            c.Item().Text("(inkl. MwSt.)").FontSize(8).FontColor(Colors.Grey.Darken2).AlignCenter();
                            c.Item().PaddingTop(3).Text($"{purchase.Preis:N2} €").FontSize(25).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Bicycle gallery photos at the bottom — 3 per row, height-capped
                    // so three photos fit within roughly half a page.
                    if (ankaufPhotos.Count > 0)
                    {
                        col.Item().PaddingTop(8).Element(SectionHeader).Text("FOTOS ZUM ANKAUF");
                        col.Item().PaddingTop(4).Column(photoCol =>
                        {
                            for (int i = 0; i < ankaufPhotos.Count; i += 3)
                            {
                                photoCol.Item().PaddingBottom(6).Row(photoRow =>
                                {
                                    for (int j = 0; j < 3; j++)
                                    {
                                        if (j > 0) photoRow.ConstantItem(6);
                                        int idx = i + j;
                                        if (idx < ankaufPhotos.Count)
                                            photoRow.RelativeItem().MaxHeight(250).AlignTop().AlignCenter()
                                                .Image(ankaufPhotos[idx]).FitArea();
                                        else
                                            photoRow.RelativeItem(); // keep the row left-aligned when < 3 photos
                                    }
                                });
                            }
                        });
                    }
                });

                // Footer
                page.Footer().Column(col =>
                {
                    col.Item().BorderTop(1).BorderColor(PrimaryColor).PaddingTop(8).Column(inner =>
                    {
                        inner.Item().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(8).FontColor(Colors.Grey.Darken1);
                        inner.Item().PaddingTop(4).AlignCenter().Text($"Bank: {shop.BankName} | Kontoinhaber: {shop.BankAccountHolder} | IBAN: {shop.IBAN}").FontSize(8).FontColor(Colors.Grey.Darken1);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    // Reads the raw bytes of the bicycle's gallery images (in sort order) so they
    // can be embedded into a QuestPDF document. BicycleImage.FilePath is stored as
    // "uploads/gallery/{id}/{file}"; the leading "uploads/" is stripped so it
    // resolves against the FileStorage base path in both dev and production. Files
    // that can no longer be found on disk are ignored.
    private async Task<List<byte[]>> LoadBicycleGalleryImagesAsync(IEnumerable<BicycleImage> images)
    {
        var result = new List<byte[]>();

        foreach (var img in images.OrderBy(i => i.SortOrder))
        {
            if (string.IsNullOrEmpty(img.FilePath))
                continue;

            var relativePath = img.FilePath;
            if (relativePath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
                relativePath = relativePath.Substring("uploads/".Length);
            relativePath = relativePath.Replace('/', Path.DirectorySeparatorChar);

            if (!_fileStorage.FileExists(relativePath))
                continue;

            try
            {
                using var stream = await _fileStorage.GetFileAsync(relativePath);
                using var ms = new MemoryStream();
                await stream.CopyToAsync(ms);
                result.Add(ms.ToArray());
            }
            catch
            {
                // Ignore unreadable files – a broken photo must not break the receipt.
            }
        }

        return result;
    }

    public async Task<byte[]> GenerateVerkaufsbelegAsync(int saleId, bool includeAnkaufPreis = false)
    {
        var sale = await _saleRepository.GetWithDetailsAsync(saleId)
            ?? throw new KeyNotFoundException($"Sale with ID {saleId} not found.");

        var matchedPurchase = await ResolvePurchaseForSaleAsync(sale);

        var shop = await GetShopInfoAsync();

        QuestPDF.Settings.License = LicenseType.Community;

        // Determine warranty text based on bike condition
        var isNeu = sale.Bicycle.Zustand == BikeCondition.Neu;
        var warrantyText = isNeu ? NeuWarrantyText : GebrauchtWarrantyText;
        var isAccessoryOnlySale =
            string.Equals(sale.Bicycle.Marke, "Zubehör", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(sale.Bicycle.Modell, "Direktverkauf", StringComparison.OrdinalIgnoreCase) &&
            (sale.Bicycle.Rahmennummer?.StartsWith("ACC-", StringComparison.OrdinalIgnoreCase) ?? false);

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header with professional branding (print-friendly)
                page.Header().Container().Column(col =>
                {
                    // Top header bar
                    col.Item().Row(row =>
                    {
                        // Logo - left
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        // Shop info - center
                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        // Verkaufsbeleg box - right
                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("RECHNUNGSNUMMER").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(sale.BelegNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            if (!isAccessoryOnlySale && sale.Bicycle?.Lagernummer != null)
                            {
                                box.Item().Text("LAGERNUMMER").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                                box.Item().Text(sale.Bicycle.Lagernummer.Value.ToString()).FontSize(12).Bold().FontColor(PrimaryColor).AlignCenter();
                            }
                            box.Item().Text("RECHNUNGSDATUM").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                            box.Item().Text($"{sale.Verkaufsdatum:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    // Tax info bar - print-friendly border style
                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Rechnung nach §25a UStG – Kein gesonderter Ausweis der Umsatzsteuer").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(4).Column(col =>
                {
                    var hasBuyerName = !string.IsNullOrWhiteSpace(sale.Buyer.Vorname) || !string.IsNullOrWhiteSpace(sale.Buyer.Nachname);

                    // Bicycle Info Section - hidden for accessory-only receipts
                    if (!isAccessoryOnlySale)
                    {
                        col.Item().PaddingTop(6).Element(SectionHeader).Text("FAHRRAD-DETAILS");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            // Header row - border style instead of filled
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Marke").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sale.Bicycle.Marke).FontSize(10).Bold();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Rahmennummer").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sale.Bicycle.Rahmennummer).FontSize(10).Bold();

                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Modell").FontSize(9).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sale.Bicycle.Modell).FontSize(10);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Farbe").FontSize(9).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sale.Bicycle.Farbe).FontSize(10);

                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Reifengröße").FontSize(9).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sale.Bicycle.Reifengroesse).FontSize(10);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Kauf Beleg Nr.").FontSize(9).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Column(c =>
                            {
                                c.Item().Text(matchedPurchase?.BelegNummer ?? "-").FontSize(10);
                                // Effective Ankauf: sale-level override wins, else the resolved purchase.
                                var ankaufPreis = sale.AnkaufPreis ?? matchedPurchase?.Preis;
                                var ankaufDatum = sale.AnkaufDatum ?? matchedPurchase?.Kaufdatum;
                                if (includeAnkaufPreis && ankaufPreis.HasValue)
                                {
                                    c.Item().Text($"Ankaufpreis: {ankaufPreis.Value:N2} €").FontSize(8).FontColor(Colors.Grey.Darken2);
                                    if (ankaufDatum.HasValue)
                                        c.Item().Text($"Ankaufdatum: {ankaufDatum.Value:dd.MM.yyyy}").FontSize(8).FontColor(Colors.Grey.Darken2);
                                }
                            });

                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Fahrradtyp").FontSize(9).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sale.Bicycle.Fahrradtyp ?? "-").FontSize(10);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Zustand").FontSize(9).FontColor(Colors.Grey.Darken2);
                            if (isNeu)
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("NEU").FontSize(10).Bold().FontColor("#155724");
                            else
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("GEBRAUCHT").FontSize(10).Bold().FontColor("#856404");

                            // Empty cells for alignment
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("").FontSize(9);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("").FontSize(9);
                            // Price row - right side
                            table.Cell().Border(1).BorderColor(AccentColor).Padding(3).Text("Preis").FontSize(9).Bold().FontColor(AccentColor);
                            table.Cell().Border(1).BorderColor(AccentColor).Padding(3).Text($"{sale.Preis:N2} €").FontSize(10).Bold().FontColor(AccentColor);
                        });
                    }

                    // Accessories if any
                    if (sale.Accessories.Any())
                    {
                        col.Item().PaddingTop(6).Element(SectionHeader).Text("ZUBEHÖR");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(70);
                                columns.ConstantColumn(45);
                                columns.ConstantColumn(80);
                            });

                            // Header - print-friendly border style
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Bezeichnung").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Einzelpreis").FontSize(9).Bold().FontColor(PrimaryColor).AlignRight();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Menge").FontSize(9).Bold().FontColor(PrimaryColor).AlignCenter();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Gesamt").FontSize(9).Bold().FontColor(PrimaryColor).AlignRight();

                            foreach (var accessory in sale.Accessories)
                            {
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(accessory.Bezeichnung).FontSize(10);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{accessory.Preis:N2} €").FontSize(10).AlignRight();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(accessory.Menge.ToString()).FontSize(10).AlignCenter();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{accessory.Gesamtpreis:N2} €").FontSize(10).AlignRight();
                            }

                            // Total row
                            var accessoriesTotal = sale.Accessories.Sum(a => a.Gesamtpreis);
                            table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Zubehör Summe:").FontSize(10).Bold().AlignRight();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{accessoriesTotal:N2} €").FontSize(10).Bold().AlignRight();
                        });
                    }

                    // Payment and Total Section - print-friendly
                    col.Item().PaddingTop(6).Row(row =>
                    {
                        // Payment method
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Zahlungsart:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (sale.Zahlungen.Any())
                            {
                                foreach (var zahlung in sale.Zahlungen)
                                {
                                    c.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(3).Column(zc =>
                                    {
                                        zc.Item().Text($"{ZahlungsartText(zahlung.Zahlungsart)}: {zahlung.Betrag:N2} €").FontSize(11).Bold();
                                        // Ratenzahlung: Laufzeit und Monatsrate gehören auf den Beleg.
                                        if (zahlung.Zahlungsart == Domain.Enums.PaymentMethod.Raten && zahlung.RatenMonate is > 0)
                                        {
                                            zc.Item().Text($"{zahlung.RatenMonate} Monate à {zahlung.MonatsRate:N2} €")
                                                .FontSize(9).FontColor(Colors.Grey.Darken2);
                                        }
                                    });
                                }
                            }
                            else
                            {
                                c.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(5).Text(sale.Zahlungsart.ToString()).FontSize(13).Bold();
                            }

                            if (!isAccessoryOnlySale && (sale.Accessories.Any() || sale.Rabatt > 0))
                            {
                                c.Item().PaddingTop(4).Text("Preisübersicht:").FontSize(9).FontColor(Colors.Grey.Darken1);
                                c.Item().Text($"Fahrrad: {sale.Preis:N2} €").FontSize(10);
                                if (sale.Accessories.Any())
                                    c.Item().Text($"Zubehör: {sale.Accessories.Sum(a => a.Gesamtpreis):N2} €").FontSize(10);
                                if (sale.Rabatt > 0)
                                    c.Item().Text($"Rabatt: -{sale.Rabatt:N2} €").FontSize(10).FontColor(Colors.Red.Darken1);
                            }
                        });

                        // Grand Total - print-friendly border style
                        row.ConstantItem(170).AlignMiddle().Border(2).BorderColor(PrimaryColor).Padding(8).Column(c =>
                        {
                            c.Item().Text("GESAMTBETRAG").FontSize(10).FontColor(PrimaryColor).AlignCenter();
                            c.Item().Text("(inkl. MwSt.)").FontSize(8).FontColor(Colors.Grey.Darken2).AlignCenter();
                            c.Item().PaddingTop(3).Text($"{sale.Gesamtbetrag:N2} €").FontSize(25).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Warranty Section - only for bicycle sales
                    if (!isAccessoryOnlySale)
                    {
                        col.Item().PaddingTop(6).Element(SectionHeader).Text("GARANTIEBEDINGUNGEN");
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(wCol =>
                        {
                            wCol.Item().Row(wRow =>
                            {
                                wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                                wRow.RelativeItem().Text(text =>
                                {
                                    if (isNeu)
                                    {
                                        text.Span("NEU: ").Bold().FontSize(9);
                                        text.Span(NeuWarrantyText).FontSize(9).FontColor(Colors.Grey.Darken3);
                                    }
                                    else
                                    {
                                        text.Span("GEBRAUCHT: ").Bold().FontSize(9);
                                        text.Span(GebrauchtWarrantyText).FontSize(9).FontColor(Colors.Grey.Darken3);
                                    }
                                });
                            });

                            wCol.Item().PaddingTop(3).Text(RepairNote).FontSize(8).Italic().FontColor(Colors.Grey.Darken2);
                        });
                    }

                    // Notes if present
                    if (!string.IsNullOrEmpty(sale.Notizen))
                    {
                        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Row(row =>
                        {
                            row.ConstantItem(55).Text("Notizen:").FontSize(9).Bold();
                            row.RelativeItem().Text(sale.Notizen).FontSize(9);
                        });
                    }

                    // Seller / Buyer / Google layout
                    if (isAccessoryOnlySale)
                    {
                        col.Item().PaddingTop(8).Row(row =>
                        {
                            // VERKÄUFER - left side
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sellerCol =>
                            {
                                sellerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERKÄUFER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                                sellerCol.Item().PaddingTop(3).Text("Unterschrift Verkäufer").FontSize(9).FontColor(Colors.Grey.Darken1);
                                if (sale.SellerSignature != null && !string.IsNullOrEmpty(sale.SellerSignature.SignatureData))
                                {
                                    try
                                    {
                                        var imageData = Convert.FromBase64String(
                                            sale.SellerSignature.SignatureData.Replace("data:image/png;base64,", ""));
                                        sellerCol.Item().Height(35).Image(imageData);
                                    }
                                    catch { sellerCol.Item().Height(35); }
                                }
                                else if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                                {
                                    try
                                    {
                                        var sigData = shop.OwnerSignatureBase64;
                                        if (sigData.Contains(","))
                                            sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                        var imageData = Convert.FromBase64String(sigData);
                                        sellerCol.Item().Height(35).Image(imageData);
                                    }
                                    catch { sellerCol.Item().Height(35); }
                                }
                                else
                                {
                                    sellerCol.Item().Height(35);
                                }
                                sellerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                                sellerCol.Item().PaddingTop(2).Text(sale.SellerSignature?.SignerName ?? shop.OwnerName).FontSize(9);
                            });

                            row.ConstantItem(8);

                            // Google Review - right side
                            row.RelativeItem().Border(1).BorderColor(PrimaryColor).Padding(8).Row(reviewRow =>
                            {
                                reviewRow.ConstantItem(80).Column(qrCol =>
                                {
                                    var qrBytes = GenerateQrCode(shop.GoogleReviewUrl ?? GoogleReviewUrl);
                                    qrCol.Item().Height(72).Width(72).Image(qrBytes);
                                });

                                reviewRow.ConstantItem(10);

                                reviewRow.RelativeItem().AlignMiddle().Column(infoCol =>
                                {
                                    infoCol.Item().Text("Bewerten Sie uns auf Google!").FontSize(13).Bold().FontColor(PrimaryColor);
                                    infoCol.Item().PaddingTop(2).Text("Ihre Meinung ist uns wichtig! Scannen Sie den QR-Code").FontSize(9).FontColor(Colors.Grey.Darken3);
                                    infoCol.Item().Text("und teilen Sie Ihre Erfahrung mit uns.").FontSize(9).FontColor(Colors.Grey.Darken3);
                                });
                            });
                        });
                    }
                    else
                    {
                        // KÄUFER (left) + VERKÄUFER (right)
                        col.Item().PaddingTop(8).Row(row =>
                        {
                            if (hasBuyerName)
                            {
                                row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(buyerCol =>
                                {
                                    buyerCol.Item().Border(1).BorderColor(AccentColor).Padding(3).Text("KÄUFER").FontSize(10).Bold().FontColor(AccentColor).AlignCenter();
                                    buyerCol.Item().PaddingTop(3).Text(sale.Buyer.FullName).FontSize(11).Bold();
                                    buyerCol.Item().Text($"{sale.Buyer.Strasse} {sale.Buyer.Hausnummer}").FontSize(10);
                                    buyerCol.Item().Text($"{sale.Buyer.PLZ} {sale.Buyer.Stadt}").FontSize(10);
                                    if (!string.IsNullOrEmpty(sale.Buyer.Telefon))
                                        buyerCol.Item().PaddingTop(2).Text($"Tel: {sale.Buyer.Telefon}").FontSize(9);
                                    if (!string.IsNullOrEmpty(sale.Buyer.Email))
                                        buyerCol.Item().Text($"E-Mail: {sale.Buyer.Email}").FontSize(9);
                                });
                            }
                            else
                            {
                                row.RelativeItem();
                            }

                            row.ConstantItem(8);

                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sellerCol =>
                            {
                                sellerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERKÄUFER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                                sellerCol.Item().PaddingTop(3).Text("Unterschrift Verkäufer").FontSize(9).FontColor(Colors.Grey.Darken1);
                                if (sale.SellerSignature != null && !string.IsNullOrEmpty(sale.SellerSignature.SignatureData))
                                {
                                    try
                                    {
                                        var imageData = Convert.FromBase64String(
                                            sale.SellerSignature.SignatureData.Replace("data:image/png;base64,", ""));
                                        sellerCol.Item().Height(35).Image(imageData);
                                    }
                                    catch { sellerCol.Item().Height(35); }
                                }
                                else if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                                {
                                    try
                                    {
                                        var sigData = shop.OwnerSignatureBase64;
                                        if (sigData.Contains(","))
                                            sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                        var imageData = Convert.FromBase64String(sigData);
                                        sellerCol.Item().Height(35).Image(imageData);
                                    }
                                    catch { sellerCol.Item().Height(35); }
                                }
                                else
                                {
                                    sellerCol.Item().Height(35);
                                }
                                sellerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                                sellerCol.Item().PaddingTop(2).Text(sale.SellerSignature?.SignerName ?? shop.OwnerName).FontSize(9);
                            });
                        });

                        // Google Review & Shop Info Section
                        col.Item().PaddingTop(8).Border(1).BorderColor(PrimaryColor).Padding(8).Row(reviewRow =>
                        {
                            reviewRow.ConstantItem(80).Column(qrCol =>
                            {
                                var qrBytes = GenerateQrCode(shop.GoogleReviewUrl ?? GoogleReviewUrl);
                                qrCol.Item().Height(72).Width(72).Image(qrBytes);
                            });

                            reviewRow.ConstantItem(10);

                            reviewRow.RelativeItem().AlignMiddle().Column(infoCol =>
                            {
                                infoCol.Item().Text("Bewerten Sie uns auf Google!").FontSize(13).Bold().FontColor(PrimaryColor);
                                infoCol.Item().PaddingTop(2).Text("Ihre Meinung ist uns wichtig! Scannen Sie den QR-Code").FontSize(9).FontColor(Colors.Grey.Darken3);
                                infoCol.Item().Text("und teilen Sie Ihre Erfahrung mit uns.").FontSize(9).FontColor(Colors.Grey.Darken3);
                            });
                        });
                    }
                });

                // Footer
                page.Footer().PaddingTop(2).AlignCenter().Text($"Bank: {shop.BankName} | Kontoinhaber: {shop.BankAccountHolder} | IBAN: {shop.IBAN}").FontSize(8).FontColor(Colors.Grey.Darken1);
            });
        });

        return document.GeneratePdf();
    }

    private async Task<Purchase?> ResolvePurchaseForSaleAsync(Sale sale)
    {
        // Primary source: loaded navigation from Sale details.
        if (sale.Purchase != null)
            return sale.Purchase;

        // Fallback 1: explicit PurchaseId link.
        if (sale.PurchaseId.HasValue)
        {
            var byPurchaseId = await _purchaseRepository.GetByIdAsync(sale.PurchaseId.Value);
            if (byPurchaseId != null)
                return byPurchaseId;
        }

        // Fallback 2: relation by BicycleId.
        var byBicycleId = await _purchaseRepository.GetByBicycleIdAsync(sale.BicycleId);
        if (byBicycleId != null)
            return byBicycleId;

        // Fallback 3: relation by Lagernummer (stock number) — the shared key
        // between Ankauf- and Verkaufsbelege, designed for exactly this case
        // where Rahmennummer is missing or mismatched.
        var lagernummer = sale.Bicycle?.Lagernummer;
        if (lagernummer.HasValue)
        {
            var byLagernummer = await _purchaseRepository.FindAsync(p =>
                p.Bicycle.Lagernummer == lagernummer.Value);
            var match = byLagernummer
                .OrderByDescending(p => p.Kaufdatum)
                .FirstOrDefault();
            if (match != null)
                return match;
        }

        // Fallback 4: relation by Rahmennummer if available.
        var rahmennummer = sale.Bicycle?.Rahmennummer?.Trim();
        if (string.IsNullOrWhiteSpace(rahmennummer))
            return null;

        var matches = await _purchaseRepository.FindAsync(p =>
            p.Bicycle.Rahmennummer != null &&
            p.Bicycle.Rahmennummer.ToLower() == rahmennummer.ToLower());

        return matches
            .OrderByDescending(p => p.Kaufdatum)
            .FirstOrDefault();
    }

    public async Task<byte[]> GenerateRueckgabebelegAsync(int returnId)
    {
        var ret = await _returnRepository.GetWithDetailsAsync(returnId)
            ?? throw new KeyNotFoundException($"Return with ID {returnId} not found.");

        var shop = await GetShopInfoAsync();
        var originalSaleTotal = ret.Sale.Gesamtbetrag;
        var accessoriesTotal = ret.Sale.Accessories.Sum(a => a.Gesamtpreis);
        var hasAccessories = accessoriesTotal > 0;
        var hasDiscount = ret.Sale.Rabatt > 0;
        var hasCustomerName = !string.IsNullOrWhiteSpace(ret.Customer.Vorname) || !string.IsNullOrWhiteSpace(ret.Customer.Nachname);

        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                page.Header().Container().Column(col =>
                {
                    // Top header bar
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("RECHNUNGSNUMMER").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(ret.BelegNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text("RECHNUNGSDATUM").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                            box.Item().Text($"{ret.Rueckgabedatum:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Rechnung nach §25a UStG – Kein gesonderter Ausweis der Umsatzsteuer").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                page.Content().PaddingTop(4).Column(col =>
                {
                    col.Item().PaddingTop(2).PaddingBottom(4).Text("RÜCKGABEBELEG").FontSize(18).Bold().FontColor(PrimaryColor);

                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(c =>
                        {
                            c.Item().Text("ANNEHMER (HÄNDLER)").FontSize(9).Bold().FontColor(PrimaryColor);
                            c.Item().PaddingTop(4).Text(shop.ShopName).FontSize(10).Bold();
                            c.Item().Text($"Inhaber: {shop.OwnerName}").FontSize(9);
                            c.Item().Text($"{shop.Street}, {shop.City}").FontSize(9);
                            if (!string.IsNullOrEmpty(shop.Telefon))
                                c.Item().Text($"Tel: {shop.Telefon}").FontSize(9);
                            if (!string.IsNullOrEmpty(shop.Email))
                                c.Item().Text(shop.Email).FontSize(9);
                        });

                        row.ConstantItem(8);

                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(c =>
                        {
                            c.Item().Text("RÜCKGEBER (KUNDE)").FontSize(9).Bold().FontColor(PrimaryColor);
                            c.Item().PaddingTop(4).Text(hasCustomerName ? ret.Customer.FullName : "-").FontSize(10).Bold();
                            if (!string.IsNullOrWhiteSpace(ret.Customer.FullAddress))
                                c.Item().Text(ret.Customer.FullAddress).FontSize(9);
                            if (!string.IsNullOrWhiteSpace(ret.Customer.Telefon))
                                c.Item().Text($"Tel: {ret.Customer.Telefon}").FontSize(9);
                            if (!string.IsNullOrWhiteSpace(ret.Customer.Email))
                                c.Item().Text(ret.Customer.Email).FontSize(9);
                        });
                    });

                    col.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
                        {
                            c.Item().Text("VERKAUFSBEZUG").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(ret.Sale.BelegNummer).FontSize(11).Bold().FontColor(PrimaryColor);
                        });

                        row.ConstantItem(8);

                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
                        {
                            c.Item().Text("URSPRÜNGLICHES VERKAUFSDATUM").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{ret.Sale.Verkaufsdatum:dd.MM.yyyy}").FontSize(11).Bold();
                        });
                    });

                    col.Item().PaddingTop(6).Element(SectionHeader).Text("FAHRRAD-INFORMATIONEN");

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(95);
                            columns.RelativeColumn(2);
                            columns.ConstantColumn(95);
                            columns.RelativeColumn(2);
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Marke").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Bicycle.Marke ?? "-").FontSize(10).Bold();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Modell").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Bicycle.Modell ?? "-").FontSize(10).Bold();

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Rahmennummer").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Bicycle.Rahmennummer ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Farbe").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Bicycle.Farbe ?? "-").FontSize(10);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Rahmengröße").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Bicycle.Rahmengroesse ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Reifengröße").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Bicycle.Reifengroesse ?? "-").FontSize(10);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Fahrradtyp").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Bicycle.Fahrradtyp ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Zahlungsart Verkauf").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ret.Sale.Zahlungen.Any()
                            ? string.Join(", ", ret.Sale.Zahlungen.Select(z =>
                                z.Zahlungsart == Domain.Enums.PaymentMethod.Raten && z.RatenMonate is > 0
                                    ? $"{ZahlungsartText(z.Zahlungsart)}: {z.Betrag:N2} € ({z.RatenMonate} Monate à {z.MonatsRate:N2} €)"
                                    : $"{ZahlungsartText(z.Zahlungsart)}: {z.Betrag:N2} €"))
                            : ZahlungsartText(ret.Sale.Zahlungsart)).FontSize(10);
                    });

                    if (hasAccessories)
                    {
                        col.Item().PaddingTop(6).Element(SectionHeader).Text("ZUBEHÖR");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(70);
                                columns.ConstantColumn(45);
                                columns.ConstantColumn(80);
                            });

                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Bezeichnung").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Einzelpreis").FontSize(9).Bold().FontColor(PrimaryColor).AlignRight();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Menge").FontSize(9).Bold().FontColor(PrimaryColor).AlignCenter();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Gesamt").FontSize(9).Bold().FontColor(PrimaryColor).AlignRight();

                            foreach (var accessory in ret.Sale.Accessories)
                            {
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(accessory.Bezeichnung).FontSize(10);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{accessory.Preis:N2} €").FontSize(10).AlignRight();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(accessory.Menge.ToString()).FontSize(10).AlignCenter();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{accessory.Gesamtpreis:N2} €").FontSize(10).AlignRight();
                            }

                            table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Zubehör Summe:").FontSize(10).Bold().AlignRight();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{accessoriesTotal:N2} €").FontSize(10).Bold().AlignRight();
                        });
                    }

                    col.Item().PaddingTop(6).Element(SectionHeader).Text("RÜCKGABE-DETAILS");
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(c =>
                        {
                            c.Item().Text("Preisübersicht").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"Ursprünglicher Kaufpreis: {originalSaleTotal:N2} €").FontSize(12).Bold();
                            c.Item().Text($"Fahrradpreis: {ret.Sale.Preis:N2} €").FontSize(10);
                            if (hasAccessories)
                                c.Item().Text($"Zubehör: {accessoriesTotal:N2} €").FontSize(10);
                            if (hasDiscount)
                                c.Item().Text($"Rabatt: -{ret.Sale.Rabatt:N2} €").FontSize(10).FontColor(Colors.Red.Darken1);

                            c.Item().PaddingTop(6).Text("Rückgabegrund").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(GetReturnReasonText(ret.Grund)).FontSize(11).Bold();
                            if (!string.IsNullOrWhiteSpace(ret.GrundDetails))
                                c.Item().Text(ret.GrundDetails).FontSize(9).FontColor(Colors.Grey.Darken2);

                            c.Item().PaddingTop(6).Text("Auszahlungsart").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(ret.Zahlungsart.ToString()).FontSize(11).Bold();
                        });

                        row.ConstantItem(10);

                        row.ConstantItem(170).Border(2).BorderColor(PrimaryColor).Padding(10).Column(c =>
                        {
                            c.Item().Text("ERSTATTUNGSBETRAG").FontSize(10).FontColor(PrimaryColor).AlignCenter();
                            c.Item().Text("(an Kunde ausgezahlt)").FontSize(8).FontColor(Colors.Grey.Darken2).AlignCenter();
                            c.Item().PaddingTop(3).Text($"{ret.Erstattungsbetrag:N2} €").FontSize(25).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    if (!string.IsNullOrWhiteSpace(ret.Notizen))
                    {
                        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Row(row =>
                        {
                            row.ConstantItem(55).Text("Notizen:").FontSize(9).Bold();
                            row.RelativeItem().Text(ret.Notizen).FontSize(9);
                        });
                    }

                    col.Item().PaddingTop(6).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
                    {
                        c.Item().Text("BESTÄTIGUNG").FontSize(9).Bold().FontColor(PrimaryColor);
                        c.Item().PaddingTop(3).Text("Das Fahrrad wurde vollständig zurückgegeben und der Erstattungsbetrag wurde ausgezahlt.").FontSize(9);
                        c.Item().Text("Das Fahrrad ist nun wieder zum Verkauf verfügbar.").FontSize(9);
                    });

                    col.Item().PaddingTop(6).Text($"Bank: {shop.BankName} | Kontoinhaber: {shop.BankAccountHolder} | IBAN: {shop.IBAN}").FontSize(8).FontColor(Colors.Grey.Darken2);
                });
            });
        });

        return document.GeneratePdf();
    }

    // Styled section header
    private static IContainer SectionHeader(IContainer container)
    {
        return container
            .PaddingBottom(6)
            .BorderBottom(2)
            .BorderColor(SecondaryColor);
    }

    /// <summary>
    /// Fahrräder eines Mietvertrags mit der Kaution als einzelnem Gesamtbetrag.
    ///
    /// Die Kaution wird pro Vertrag hinterlegt und zurückgezahlt, nicht pro Rad —
    /// deshalb listet die Tabelle nur die Räder auf und schließt mit einer Zeile
    /// „KAUTION (GESAMT)" ab. Kautionsquittung und Kautionsrückgabebeleg nutzen
    /// dieselbe Darstellung, damit beide Belege denselben Betrag zeigen.
    /// </summary>
    private static void AddFahrraederMitGesamtkaution(ColumnDescriptor col, Rental rental)
    {
        col.Item().PaddingTop(6).Element(SectionHeader).Text("FAHRRÄDER & KAUTION");

        var kautionsBikes = rental.Bikes.OrderBy(b => b.Id).ToList();
        col.Item().Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(25);
                columns.RelativeColumn(2);
                columns.RelativeColumn(1);
                columns.RelativeColumn(1);
            });

            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Nr.").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Fahrrad").FontSize(8).Bold().FontColor(PrimaryColor);
            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Rahmennr.").FontSize(8).Bold().FontColor(PrimaryColor);
            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Farbe").FontSize(8).Bold().FontColor(PrimaryColor);

            for (int i = 0; i < kautionsBikes.Count; i++)
            {
                var rb = kautionsBikes[i];
                var bicycle = rb.Bicycle;
                var rahmennr = !string.IsNullOrWhiteSpace(rb.Rahmennummer) ? rb.Rahmennummer : (bicycle?.Rahmennummer ?? "-");
                var farbe = !string.IsNullOrWhiteSpace(rb.Farbe) ? rb.Farbe : (bicycle?.Farbe ?? "-");

                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{i + 1}").FontSize(9).AlignCenter();
                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{bicycle?.Marke} {bicycle?.Modell}".Trim()).FontSize(9).Bold();
                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rahmennr).FontSize(9);
                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(farbe).FontSize(9);
            }

            table.Cell().ColumnSpan(3).Border(1).BorderColor(AccentColor).Padding(3).Text("KAUTION (GESAMT)").FontSize(9).Bold().FontColor(AccentColor).AlignRight();
            table.Cell().Border(1).BorderColor(AccentColor).Padding(3).Text($"{rental.Kaution:N2} €").FontSize(10).Bold().FontColor(AccentColor).AlignRight();
        });
    }

    // Add a styled two-column info row
    private static void AddInfoRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Padding(4).Text(label).FontSize(9).FontColor(Colors.Grey.Darken1);
        table.Cell().Padding(4).Text(value).FontSize(10).Bold();
    }

    // Add a 4-column styled table row (for bicycle info)
    private static void AddStyledTableRow(TableDescriptor table, string label1, string value1, string label2, string value2)
    {
        table.Cell().Background(TableAltBg).Padding(6).Text(label1).FontSize(9).FontColor(Colors.Grey.Darken2);
        table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(value1).FontSize(10).Bold();
        if (!string.IsNullOrEmpty(label2))
        {
            table.Cell().Background(TableAltBg).Padding(6).Text(label2).FontSize(9).FontColor(Colors.Grey.Darken2);
            table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(value2).FontSize(10).Bold();
        }
        else
        {
            table.Cell().Background(TableAltBg).Padding(6).Text("");
            table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("");
        }
    }

    private static string GetReturnReasonText(ReturnReason reason)
    {
        return reason switch
        {
            ReturnReason.Defekt => "Defekt / Mangelhaft",
            ReturnReason.NichtWieErwartet => "Nicht wie erwartet",
            ReturnReason.Garantie => "Garantieanspruch",
            ReturnReason.Sonstiges => "Sonstiges",
            _ => reason.ToString()
        };
    }

    public async Task<byte[]> GenerateRechnungAsync(int invoiceId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId)
            ?? throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found.");

        var shop = await GetShopInfoAsync();

        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Grey.Darken4));

                // Header
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(leftCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    leftCol.Item().Height(32).Image(logoBytes);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(16).Bold().FontColor(PrimaryColor);
                            leftCol.Item().Text(shop.OwnerName).FontSize(9).FontColor(Colors.Grey.Darken2);
                            leftCol.Item().PaddingTop(4).Text(shop.Street).FontSize(8);
                            leftCol.Item().Text(shop.City).FontSize(8);
                            leftCol.Item().Text($"Tel: {shop.Telefon}").FontSize(8);
                            leftCol.Item().Text($"E-Mail: {shop.Email}").FontSize(8);
                        });

                        row.ConstantItem(150).AlignRight().Column(rightCol =>
                        {
                            rightCol.Item().Border(2).BorderColor(PrimaryColor).Padding(8).Column(box =>
                            {
                                box.Item().Text("RECHNUNG").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text(invoice.RechnungsNummer).FontSize(12).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text($"{invoice.Datum:dd.MM.yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1).AlignCenter();
                            });
                        });
                    });

                    col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(3).PaddingHorizontal(8).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Kleinunternehmerregelung gem. \u00a719 UStG").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(14).Column(col =>
                {
                    // Customer info
                    if (!string.IsNullOrWhiteSpace(invoice.KundenName))
                    {
                        col.Item().Text("Rechnungsempf\u00e4nger:").FontSize(8).FontColor(Colors.Grey.Darken1);
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(custCol =>
                        {
                            custCol.Item().Text(invoice.KundenName).FontSize(10).Bold();
                            if (!string.IsNullOrWhiteSpace(invoice.KundenAdresse))
                                custCol.Item().Text(invoice.KundenAdresse).FontSize(9);
                        });
                    }

                    // Invoice details table
                    col.Item().PaddingTop(16).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(40);
                            columns.RelativeColumn(3);
                            columns.ConstantColumn(80);
                            columns.ConstantColumn(80);
                        });

                        // Header
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(6).Text("Pos.").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(6).Text("Bezeichnung").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(6).Text("Kategorie").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(6).Text("Betrag").FontSize(8).Bold().FontColor(PrimaryColor).AlignRight();

                        // Single row
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("1").FontSize(9).AlignCenter();
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(invoice.Bezeichnung).FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(invoice.Kategorie ?? "-").FontSize(9).AlignCenter();
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text($"{invoice.Betrag:N2} \u20ac").FontSize(9).Bold().AlignRight();
                    });

                    // Total
                    col.Item().PaddingTop(8).AlignRight().Row(row =>
                    {
                        row.ConstantItem(200).Border(2).BorderColor(PrimaryColor).Padding(10).Column(c =>
                        {
                            c.Item().Row(r =>
                            {
                                r.RelativeItem().Text("Gesamtbetrag:").FontSize(10).FontColor(PrimaryColor);
                                r.ConstantItem(80).AlignRight().Text($"{invoice.Betrag:N2} \u20ac").FontSize(12).Bold().FontColor(PrimaryColor);
                            });
                            c.Item().Text("(inkl. gesetzlicher Mehrwertsteuer)").FontSize(6).FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // Notes
                    if (!string.IsNullOrWhiteSpace(invoice.Notizen))
                    {
                        col.Item().PaddingTop(12).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(nCol =>
                        {
                            nCol.Item().Text("Bemerkungen:").FontSize(8).Bold().FontColor(Colors.Grey.Darken1);
                            nCol.Item().PaddingTop(2).Text(invoice.Notizen).FontSize(8);
                        });
                    }

                    // Bank info
                    col.Item().PaddingTop(16).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(bankCol =>
                    {
                        bankCol.Item().Text("Bankverbindung").FontSize(8).Bold().FontColor(PrimaryColor);
                        bankCol.Item().PaddingTop(2).Text($"Bank: {shop.BankName}").FontSize(8);
                        bankCol.Item().Text($"Kontoinhaber: {shop.BankAccountHolder}").FontSize(8);
                        bankCol.Item().Text($"IBAN: {shop.IBAN}").FontSize(8).Bold();
                    });

                    // Payment note
                    col.Item().PaddingTop(10).Text("Bitte \u00fcberweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen unter Angabe der Rechnungsnummer.").FontSize(8).FontColor(Colors.Grey.Darken2);

                    // Footer
                    col.Item().PaddingTop(20).Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}").FontSize(7).FontColor(Colors.Grey.Darken1).AlignCenter();
                });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GenerateAusgabebelegAsync(int expenseId)
    {
        var expense = await _expenseRepository.GetByIdAsync(expenseId)
            ?? throw new KeyNotFoundException($"Expense with ID {expenseId} not found.");

        var shop = await GetShopInfoAsync();

        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Grey.Darken4));

                // Header
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(leftCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    leftCol.Item().Height(32).Image(logoBytes);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(16).Bold().FontColor(PrimaryColor);
                            leftCol.Item().Text(shop.OwnerName).FontSize(9).FontColor(Colors.Grey.Darken2);
                            leftCol.Item().PaddingTop(4).Text(shop.Street).FontSize(8);
                            leftCol.Item().Text(shop.City).FontSize(8);
                        });

                        row.ConstantItem(150).AlignRight().Column(rightCol =>
                        {
                            rightCol.Item().Border(2).BorderColor(PrimaryColor).Padding(8).Column(box =>
                            {
                                box.Item().Text("AUSGABEBELEG").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text(expense.BelegNummer ?? $"A-{expense.Id}").FontSize(12).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text($"{expense.Datum:dd.MM.yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1).AlignCenter();
                            });
                        });
                    });
                });

                // Content
                page.Content().PaddingTop(20).Column(col =>
                {
                    // Details table
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(6).Text("Bezeichnung").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(expense.Bezeichnung).FontSize(9);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Kategorie").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(expense.Kategorie ?? "-").FontSize(9);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Lieferant").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(expense.Lieferant ?? "-").FontSize(9);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Datum").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text($"{expense.Datum:dd.MM.yyyy}").FontSize(9);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Beleg Nr.").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(expense.BelegNummer ?? "-").FontSize(9);

                        table.Cell().Border(1).BorderColor(AccentColor).Padding(6).Text("Betrag").FontSize(8).Bold().FontColor(AccentColor);
                        table.Cell().Border(1).BorderColor(AccentColor).Padding(6).Text($"{expense.Betrag:N2} \u20ac").FontSize(10).Bold().FontColor(AccentColor);
                    });

                    // Notes
                    if (!string.IsNullOrWhiteSpace(expense.Notizen))
                    {
                        col.Item().PaddingTop(12).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(nCol =>
                        {
                            nCol.Item().Text("Notizen:").FontSize(8).Bold().FontColor(Colors.Grey.Darken1);
                            nCol.Item().PaddingTop(2).Text(expense.Notizen).FontSize(8);
                        });
                    }

                    // Footer
                    col.Item().PaddingTop(30).Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}").FontSize(7).FontColor(Colors.Grey.Darken1).AlignCenter();
                });
            });
        });

        return document.GeneratePdf();
    }

    // ══════════════════════════════════════════════════════════════
    // RESERVIERUNG / ANZAHLUNGSBELEG PDF
    // Quittung über die Anzahlung auf ein reserviertes Fahrrad. Dient dem
    // Kunden als Nachweis, bis die Reservierung in einen Verkauf übergeht.
    // ══════════════════════════════════════════════════════════════
    private static string ZahlungsartText(Domain.Enums.PaymentMethod zahlungsart) => zahlungsart switch
    {
        Domain.Enums.PaymentMethod.Bar => "Bar",
        Domain.Enums.PaymentMethod.PayPal => "PayPal",
        Domain.Enums.PaymentMethod.Karte => "Karte",
        Domain.Enums.PaymentMethod.Überweisung => "Überweisung",
        Domain.Enums.PaymentMethod.Raten => "Ratenzahlung",
        _ => zahlungsart.ToString()
    };

    public async Task<byte[]> GenerateAnzahlungsbelegAsync(int reservationId)
    {
        var reservation = await _reservationRepository.GetWithDetailsAsync(reservationId)
            ?? throw new KeyNotFoundException($"Reservierung mit ID {reservationId} nicht gefunden.");

        var shop = await GetShopInfoAsync();
        var kunde = reservation.Customer;
        var rad = reservation.Bicycle;
        var anzahlung = reservation.Anzahlung ?? 0m;
        // Der bei der Reservierung vereinbarte Preis hat Vorrang vor dem
        // Vorschlagspreis am Fahrrad — der kann sich später ändern.
        var kaufpreis = reservation.Verkaufspreis ?? rad?.VerkaufspreisVorschlag;
        var restbetrag = kaufpreis.HasValue ? kaufpreis.Value - anzahlung : (decimal?)null;

        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Grey.Darken4));

                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(leftCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    leftCol.Item().Height(32).Image(logoBytes);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(16).Bold().FontColor(PrimaryColor);
                            leftCol.Item().Text(shop.OwnerName).FontSize(9).FontColor(Colors.Grey.Darken2);
                            leftCol.Item().PaddingTop(4).Text(shop.Street).FontSize(8);
                            leftCol.Item().Text(shop.City).FontSize(8);
                        });

                        row.ConstantItem(160).AlignRight().Column(rightCol =>
                        {
                            rightCol.Item().Border(2).BorderColor(PrimaryColor).Padding(8).Column(box =>
                            {
                                box.Item().Text("ANZAHLUNGSBELEG").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text($"Nr. {reservation.ReservierungsNummer}").FontSize(12).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text($"{reservation.ReservierungsDatum:dd.MM.yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1).AlignCenter();
                            });
                        });
                    });
                });

                page.Content().PaddingTop(20).Column(col =>
                {
                    // ── Kunde ──
                    col.Item().Text("Reserviert für").FontSize(8).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(kCol =>
                    {
                        kCol.Item().Text(kunde?.FullName ?? "-").FontSize(10).Bold();
                        if (!string.IsNullOrWhiteSpace(kunde?.FullAddress))
                            kCol.Item().Text(kunde.FullAddress!).FontSize(9);
                        if (!string.IsNullOrWhiteSpace(kunde?.Telefon))
                            kCol.Item().Text($"Tel: {kunde.Telefon}").FontSize(9);
                        if (!string.IsNullOrWhiteSpace(kunde?.Email))
                            kCol.Item().Text($"E-Mail: {kunde.Email}").FontSize(9);
                    });

                    // ── Fahrrad ──
                    col.Item().PaddingTop(14).Text("Reserviertes Fahrrad").FontSize(8).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(4).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn(2);
                        });

                        void Zeile(string label, string wert)
                        {
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                                .Text(label).FontSize(8).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                                .Text(wert).FontSize(9);
                        }

                        var markeModell = $"{rad?.Marke} {rad?.Modell}".Trim();
                        Zeile("Marke / Modell", string.IsNullOrWhiteSpace(markeModell) ? "-" : markeModell);
                        Zeile("Rahmennummer", string.IsNullOrWhiteSpace(rad?.Rahmennummer) ? "-" : rad!.Rahmennummer!);
                        Zeile("Farbe", string.IsNullOrWhiteSpace(rad?.Farbe) ? "-" : rad!.Farbe!);
                        Zeile("Rahmengröße", string.IsNullOrWhiteSpace(rad?.Rahmengroesse) ? "-" : rad!.Rahmengroesse!);
                        Zeile("Zustand", rad?.Zustand.ToString() ?? "-");
                    });

                    // ── Beträge ──
                    col.Item().PaddingTop(14).Text("Anzahlung").FontSize(8).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(4).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        if (kaufpreis.HasValue)
                        {
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                                .Text("Verkaufspreis des Fahrrads").FontSize(8).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                                .Text($"{kaufpreis.Value:N2} €").FontSize(9).Bold();
                        }

                        table.Cell().Border(1).BorderColor(AccentColor).Padding(6)
                            .Text("Erhaltene Anzahlung").FontSize(8).Bold().FontColor(AccentColor);
                        table.Cell().Border(1).BorderColor(AccentColor).Padding(6)
                            .Text($"{anzahlung:N2} €").FontSize(11).Bold().FontColor(AccentColor);

                        if (reservation.AnzahlungZahlungsart.HasValue)
                        {
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                                .Text("Zahlungsart der Anzahlung").FontSize(8).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                                .Text(ZahlungsartText(reservation.AnzahlungZahlungsart.Value)).FontSize(9);
                        }

                        if (restbetrag.HasValue)
                        {
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(6)
                                .Text("Offener Restbetrag bei Abholung").FontSize(8).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(6)
                                .Text($"{restbetrag.Value:N2} €").FontSize(11).Bold().FontColor(PrimaryColor);
                        }

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                            .Text("Reserviert bis").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6)
                            .Text($"{reservation.AblaufDatum:dd.MM.yyyy}").FontSize(9).Bold();
                    });

                    if (!string.IsNullOrWhiteSpace(reservation.Notizen))
                    {
                        col.Item().PaddingTop(12).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(nCol =>
                        {
                            nCol.Item().Text("Notizen:").FontSize(8).Bold().FontColor(Colors.Grey.Darken1);
                            nCol.Item().PaddingTop(2).Text(reservation.Notizen!).FontSize(8);
                        });
                    }

                    // ── Bedingungen ──
                    col.Item().PaddingTop(14).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(bCol =>
                    {
                        bCol.Item().Text("Bedingungen der Reservierung").FontSize(8).Bold().FontColor(PrimaryColor);
                        bCol.Item().PaddingTop(3).Text(
                            "Das oben genannte Fahrrad wird bis zum angegebenen Datum für den Kunden zurückgelegt. " +
                            "Die Anzahlung wird beim Kauf vollständig auf den Kaufpreis angerechnet. " +
                            "Wird das Fahrrad bis zum Ablaufdatum nicht abgeholt, verfällt die Reservierung und " +
                            "das Fahrrad kann anderweitig verkauft werden.")
                            .FontSize(8);
                    });

                    // ── Unterschriften ──
                    // Links die hinterlegte Inhaber-Unterschrift (Einstellungen),
                    // rechts die auf dem Tablet erfasste Unterschrift des Kunden.
                    // Fehlt eine von beiden, bleibt die Linie zum Unterschreiben stehen.
                    col.Item().PaddingTop(28).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    // Kein AlignLeft: zusammen mit der festen Höhe
                                    // wirft QuestPDF eine DocumentLayoutException
                                    // („conflicting size constraints") — dieselbe
                                    // Schreibweise wie in den Mietbelegen.
                                    c.Item().Height(35).Image(Convert.FromBase64String(sigData));
                                }
                                catch { c.Item().Height(35); }
                            }
                            else
                            {
                                c.Item().Height(35);
                            }
                            c.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Darken1);
                            c.Item().PaddingTop(3).Text(shop.ShopName).FontSize(8).FontColor(Colors.Grey.Darken2);
                        });
                        row.ConstantItem(30);
                        row.RelativeItem().Column(c =>
                        {
                            if (!string.IsNullOrEmpty(reservation.KundenUnterschrift))
                            {
                                try
                                {
                                    var sigData = reservation.KundenUnterschrift!;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    // Kein AlignLeft: zusammen mit der festen Höhe
                                    // wirft QuestPDF eine DocumentLayoutException
                                    // („conflicting size constraints") — dieselbe
                                    // Schreibweise wie in den Mietbelegen.
                                    c.Item().Height(35).Image(Convert.FromBase64String(sigData));
                                }
                                catch { c.Item().Height(35); }
                            }
                            else
                            {
                                c.Item().Height(35);
                            }
                            c.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Darken1);
                            c.Item().PaddingTop(3).Text(kunde?.FullName ?? "Kunde").FontSize(8).FontColor(Colors.Grey.Darken2);
                        });
                    });

                    col.Item().PaddingTop(24).Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}")
                        .FontSize(7).FontColor(Colors.Grey.Darken1).AlignCenter();
                });
            });
        });

        return document.GeneratePdf();
    }

    // ══════════════════════════════════════════════════════════════
    // MIETVERTRAG (Rental Contract) PDF
    // ══════════════════════════════════════════════════════════════
    public async Task<byte[]> GenerateMietvertragAsync(int rentalId)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(rentalId)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {rentalId} nicht gefunden.");

        var shop = await GetShopInfoAsync();
        QuestPDF.Settings.License = LicenseType.Community;

        static string ConditionToText(Domain.Enums.BikeConditionAtHandover c) => c switch
        {
            Domain.Enums.BikeConditionAtHandover.SehrGut => "Sehr gut",
            Domain.Enums.BikeConditionAtHandover.Gut => "Gut",
            Domain.Enums.BikeConditionAtHandover.Gebrauchsspuren => "Gebrauchsspuren",
            _ => "Gut"
        };

        var zahlungsartText = ZahlungsartText(rental.Zahlungsart);

        var rentalBikes = rental.Bikes.OrderBy(b => b.Id).ToList();
        var mietTage = (rental.EndDatum - rental.StartDatum).Days + 1;
        var berechneterPreis = rental.Gesamtmiete + rental.Rabatt;

        // 19% MwSt breakdown (Gesamtmiete is treated as brutto)
        const decimal mwstRate = 0.19m;
        var brutto = rental.Gesamtmiete;
        var netto = Math.Round(brutto / (1 + mwstRate), 2);
        var mwst = brutto - netto;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header with professional branding
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        // Logo - left
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        // Shop info - center
                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        // Mietvertrag box - right
                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("MIETVERTRAG").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(rental.MietvertragNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text($"{rental.CreatedAt:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    // Tax info bar
                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Mietvertrag Fahrrad").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(4).Column(col =>
                {
                    // MIETER Section
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("MIETER");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Name").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.FullName).FontSize(10).Bold();

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Adresse").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.FullAddress ?? "-").FontSize(10);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Telefon").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.Telefon ?? "-").FontSize(10);
                    });

                    col.Item().PaddingTop(3).Text("✓ Die Identität des Mieters wurde anhand eines gültigen Ausweisdokuments überprüft.")
                        .FontSize(8).Italic().FontColor(Colors.Grey.Darken2);

                    // GEMIETETE FAHRRÄDER Section (one row per rented bike)
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("GEMIETETE FAHRRÄDER");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(25);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.ConstantColumn(85);
                            columns.ConstantColumn(40);
                            columns.ConstantColumn(70);
                            columns.ConstantColumn(70);
                        });

                        // Header row
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Nr.").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Fahrrad").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Rahmennr.").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Farbe").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Zeitraum").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Tage").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Zustand").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Preis").FontSize(8).Bold().FontColor(PrimaryColor).AlignRight();

                        for (int i = 0; i < rentalBikes.Count; i++)
                        {
                            var rb = rentalBikes[i];
                            var bicycle = rb.Bicycle;
                            var days = (rb.EndDatum.Date - rb.StartDatum.Date).Days + 1;
                            var rahmennr = !string.IsNullOrWhiteSpace(rb.Rahmennummer) ? rb.Rahmennummer : (bicycle?.Rahmennummer ?? "-");
                            var farbe = !string.IsNullOrWhiteSpace(rb.Farbe) ? rb.Farbe : (bicycle?.Farbe ?? "-");

                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{i + 1}").FontSize(9).AlignCenter();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{bicycle?.Marke} {bicycle?.Modell}".Trim()).FontSize(9).Bold();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rahmennr).FontSize(9);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(farbe).FontSize(9);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{rb.StartDatum:dd.MM} - {rb.EndDatum:dd.MM.yy}").FontSize(8);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{days}").FontSize(9).AlignCenter();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ConditionToText(rb.ZustandBeiUebergabe)).FontSize(8);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{rb.Mietpreis:N2} €").FontSize(9).AlignRight();
                        }

                        table.Cell().ColumnSpan(7).Border(1).BorderColor(AccentColor).Padding(3).Text("GESAMTMIETE").FontSize(9).Bold().FontColor(AccentColor).AlignRight();
                        table.Cell().Border(1).BorderColor(AccentColor).Padding(3).Text($"{rental.Gesamtmiete:N2} €").FontSize(10).Bold().FontColor(AccentColor).AlignRight();
                    });

                    // MIETDAUER & PREIS Section
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("MIETDAUER & KOSTEN");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Mietbeginn").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{rental.StartDatum:dd.MM.yyyy}").FontSize(10).Bold();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Mietende").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{rental.EndDatum:dd.MM.yyyy}").FontSize(10).Bold();

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Mietdauer").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{mietTage} Tag{(mietTage != 1 ? "e" : "")}").FontSize(10).Bold();
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Zahlungsart").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(zahlungsartText).FontSize(10).Bold();

                        if (rental.Rabatt > 0)
                        {
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Mietpreis").FontSize(9).FontColor(Colors.Grey.Darken2);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{berechneterPreis:N2} €").FontSize(10);
                            table.Cell().Border(0.5f).BorderColor("#10b981").Padding(3).Text("Rabatt").FontSize(9).Bold().FontColor("#10b981");
                            table.Cell().Border(0.5f).BorderColor("#10b981").Padding(3).Text($"- {rental.Rabatt:N2} €").FontSize(10).Bold().FontColor("#10b981");
                        }

                        // VAT breakdown (Netto + 19% MwSt = Brutto). Each row uses two label cells + two value cells.
                        table.Cell().ColumnSpan(2).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3)
                            .Text("Nettopreis").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().ColumnSpan(2).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3)
                            .Text($"{netto:N2} €").FontSize(10).AlignRight();

                        table.Cell().ColumnSpan(2).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3)
                            .Text("zzgl. 19% MwSt.").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().ColumnSpan(2).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3)
                            .Text($"{mwst:N2} €").FontSize(10).AlignRight();

                        table.Cell().ColumnSpan(2).Border(1).BorderColor(AccentColor).Padding(3)
                            .Text("Gesamtmiete (inkl. MwSt.)").FontSize(9).Bold().FontColor(AccentColor);
                        table.Cell().ColumnSpan(2).Border(1).BorderColor(AccentColor).Padding(3)
                            .Text($"{brutto:N2} €").FontSize(10).Bold().FontColor(AccentColor).AlignRight();
                    });

                    // Zubehör steht in zwei getrennten Blöcken, weil es zwei
                    // verschiedene Dinge sind: das mitvermietete Zubehör gehört zur
                    // Miete, das Verbrauchsmaterial gehört zur Kaution. Ein Schlauch
                    // wird über die Mietzeit nicht genutzt — er liegt für den Notfall
                    // bereit. Nimmt der Mieter ihn in Anspruch, wird er bei der
                    // Rückgabe von der Kaution einbehalten, nicht auf die Miete
                    // aufgeschlagen: die steht mit dieser Unterschrift fest.
                    var mietZubehoer = rental.Accessories.Where(a => !a.Einmalig).ToList();
                    var verbrauchsZubehoer = rental.Accessories.Where(a => a.Einmalig).ToList();

                    if (mietZubehoer.Count > 0)
                    {
                        col.Item().PaddingTop(6).Element(SectionHeader).Text("MITGEGEBENES ZUBEHÖR (INKLUSIVE)");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(40);
                            });

                            // Header row
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Bezeichnung").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).AlignCenter().Text("Menge").FontSize(9).Bold().FontColor(PrimaryColor);

                            foreach (var acc in mietZubehoer)
                            {
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(acc.Bezeichnung).FontSize(9);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignCenter().Text(acc.Menge.ToString()).FontSize(9);
                            }
                        });
                        col.Item().PaddingTop(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(text =>
                        {
                            text.Span("Hinweis: ").Bold().FontSize(8);
                            text.Span("Das Zubehör ist im Mietpreis inklusive.").FontSize(8).FontColor(Colors.Grey.Darken2);
                        });
                    }

                    if (verbrauchsZubehoer.Count > 0)
                    {
                        col.Item().PaddingTop(6).Element(SectionHeader).Text("VERBRAUCHSMATERIAL (ABRECHNUNG ÜBER DIE KAUTION)");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(40);
                                columns.ConstantColumn(70);
                            });

                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Bezeichnung").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).AlignCenter().Text("Menge").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).AlignRight().Text("bei Verbrauch").FontSize(9).Bold().FontColor(PrimaryColor);

                            foreach (var acc in verbrauchsZubehoer)
                            {
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(acc.Bezeichnung).FontSize(9);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignCenter().Text(acc.Menge.ToString()).FontSize(9);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).AlignRight()
                                    .Text($"{acc.Tagespreis * acc.Menge:N2} €").FontSize(9);
                            }
                        });
                        col.Item().PaddingTop(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(text =>
                        {
                            text.Span("Hinweis: ").Bold().FontSize(8);
                            text.Span(
                                "Dieses Material wird nur bereitgestellt und ist nicht Teil der Miete. " +
                                "Kommt es unbenutzt zurück, kostet es nichts. Wird es verbraucht oder behalten, " +
                                "wird der genannte Betrag bei der Rückgabe von der Kaution einbehalten."
                            ).FontSize(8).FontColor(Colors.Grey.Darken2);
                        });
                    }


                    // Notes if present
                    if (!string.IsNullOrEmpty(rental.Notizen))
                    {
                        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Row(row =>
                        {
                            row.ConstantItem(55).Text("Notizen:").FontSize(9).Bold();
                            row.RelativeItem().Text(rental.Notizen).FontSize(9);
                        });
                    }

                    // Signature (Vermieter only)
                    col.Item().PaddingTop(16).Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sellerCol =>
                        {
                            sellerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERMIETER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            sellerCol.Item().PaddingTop(3).Text("Unterschrift Vermieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sellerCol.Item().Height(35).Image(imageData);
                                }
                                catch { sellerCol.Item().Height(35); }
                            }
                            else
                            {
                                sellerCol.Item().Height(35);
                            }
                            sellerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            sellerCol.Item().PaddingTop(2).Text(shop.OwnerName).FontSize(9);
                        });

                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(mieterCol =>
                        {
                            mieterCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3)
                                .Text("MIETER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            mieterCol.Item().PaddingTop(3).Text("Unterschrift Mieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(rental.MieterUnterschrift))
                            {
                                try
                                {
                                    var sigData = rental.MieterUnterschrift;
                                    if (sigData.Contains(",")) sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    mieterCol.Item().Height(35).Image(Convert.FromBase64String(sigData));
                                }
                                catch { mieterCol.Item().Height(35); }
                            }
                            else
                            {
                                mieterCol.Item().Height(35);
                            }
                            mieterCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            mieterCol.Item().PaddingTop(2).Text(rental.Customer.FullName).FontSize(9);
                            mieterCol.Item().PaddingTop(2).Text("Mit Unterschrift bestätigt der Mieter den Erhalt des Fahrrads und die Kenntnis der beiliegenden Mietbedingungen.")
                                .FontSize(7).Italic().FontColor(Colors.Grey.Darken2);
                        });
                    });

                });

                // Footer
                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().AlignCenter().Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}")
                        .FontSize(7).FontColor(Colors.Grey.Darken1);
                });
            });
        });

        return document.GeneratePdf();
    }

    // ══════════════════════════════════════════════════════════════
    // MIETBEDINGUNGEN (AGB) — separate A4 document
    // ══════════════════════════════════════════════════════════════
    public async Task<byte[]> GenerateMietbedingungenpdfAsync(int rentalId)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(rentalId)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {rentalId} nicht gefunden.");

        var shop = await GetShopInfoAsync();
        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Same header as Mietvertrag
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    logoCol.Item().Height(84).Image(Convert.FromBase64String(base64Data));
                                }
                                catch { }
                            }
                        });

                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("MIETBEDINGUNGEN").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(rental.MietvertragNummer).FontSize(13).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text($"{rental.CreatedAt:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Allgemeine Mietbedingungen").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                page.Content().PaddingTop(4).Column(col =>
                {
                    col.Item().PaddingTop(4).Element(SectionHeader).Text("ALLGEMEINE GESCHÄFTSBEDINGUNGEN (AGB)");
                    col.Item().PaddingTop(2).Text($"Zum Mietvertrag Nr. {rental.MietvertragNummer} vom {rental.CreatedAt:dd.MM.yyyy}")
                        .FontSize(9).FontColor(Colors.Grey.Darken2);

                    // § 1 Mietgegenstand
                    col.Item().PaddingTop(8).Text("§ 1 Mietgegenstand").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Der Vermieter überlässt dem Mieter das im Vertrag bezeichnete Fahrrad samt Zubehör für die vereinbarte Mietdauer. " +
                        "Der Mieter bestätigt den Erhalt und die Anerkennung dieser Bedingungen."
                    ).FontSize(9);

                    // § 2 Übergabe und Zustand
                    col.Item().PaddingTop(8).Text("§ 2 Übergabe und Zustand").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text("Der Mieter bestätigt, dass das Fahrrad bei Übergabe:").FontSize(9);
                    col.Item().PaddingLeft(12).Text("•  technisch funktionsfähig ist").FontSize(9);
                    col.Item().PaddingLeft(12).Text("•  verkehrstauglich ist").FontSize(9);
                    col.Item().PaddingLeft(12).Text("•  keine sichtbaren Mängel aufweist").FontSize(9);
                    col.Item().PaddingTop(2).Text(
                        "Innerhalb von 1 Stunde nach Übergabe festgestellte technische Mängel berechtigen zur kostenlosen Rückgabe."
                    ).FontSize(9);

                    // § 3 Schadenspauschalen
                    col.Item().PaddingTop(8).Text("§ 3 Schadenspauschalen").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text("Folgende Pauschalen gelten als Schadensersatz (jeweils inkl. Materialkosten und Arbeitslohn):").FontSize(9);
                    col.Item().PaddingTop(2).Table(t =>
                    {
                        t.ColumnsDefinition(cdef =>
                        {
                            cdef.RelativeColumn(3);
                            cdef.ConstantColumn(70);
                        });

                        void AddSchadenRow(string label, string price)
                        {
                            t.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(label).FontSize(9);
                            t.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(price).FontSize(9).AlignRight().Bold();
                        }

                        AddSchadenRow("Schlauch-/Reifenpanne",    "10,00 €");
                        AddSchadenRow("Kettenschaden",            "20,00 €");
                        AddSchadenRow("Schaltungsschaden",        "30,00 €");
                        AddSchadenRow("Leichte Felgenverformung", "10,00 €");
                        AddSchadenRow("Reifenersatz",             "50,00 €");
                    });
                    col.Item().PaddingTop(2).Text(
                        "Dem Mieter bleibt ausdrücklich der Nachweis vorbehalten, dass ein Schaden nicht entstanden ist " +
                        "oder der tatsächliche Schaden erheblich niedriger ist als die Pauschale (§ 309 Nr. 5 BGB). " +
                        "Dem Vermieter bleibt der Nachweis eines höheren Schadens vorbehalten."
                    ).FontSize(8).Italic().FontColor(Colors.Grey.Darken2);

                    // § 4 Kaution
                    // rental.Kaution ist die Gesamtkaution des Vertrags. Sie wird als
                    // ein Betrag für die gesamte Vermietung genannt — auch bei mehreren
                    // Rädern kein Einzelbetrag je Fahrrad. Ist keine Kaution vereinbart
                    // (0 €), entfällt der Absatz.
                    col.Item().PaddingTop(8).Text("§ 4 Kaution").FontSize(11).Bold().FontColor(PrimaryColor);
                    if (rental.Kaution > 0)
                    {
                        var bikeCount = rental.Bikes?.Count ?? 0;
                        var kautionSatz = bikeCount > 1
                            ? $"Für diese Vermietung ist eine Kaution in Höhe von insgesamt {rental.Kaution:N2} € für alle Fahrräder zu hinterlegen. "
                            : $"Für diese Vermietung ist eine Kaution in Höhe von {rental.Kaution:N2} € zu hinterlegen. ";
                        col.Item().PaddingTop(2).Text(
                            kautionSatz +
                            "Die Kaution wird spätestens innerhalb von 14 Tagen nach ordnungsgemäßer Rückgabe des Fahrrads ohne Schäden und vollständigem Zubehör zurückerstattet."
                        ).FontSize(9);
                        col.Item().PaddingTop(3).Text("Bei folgenden Fällen kann die Kaution ganz oder teilweise einbehalten werden:").FontSize(9);
                        col.Item().PaddingLeft(12).Text("•  Schäden am Fahrrad").FontSize(9);
                        col.Item().PaddingLeft(12).Text("•  Verlust oder Diebstahl").FontSize(9);
                        col.Item().PaddingLeft(12).Text("•  unsachgemäße Nutzung").FontSize(9);
                        col.Item().PaddingLeft(12).Text("•  fehlendes Zubehör").FontSize(9);
                        // Der Verbrauch von bereitgestelltem Material gehört hierher
                        // und nicht in die Miete — sonst änderte sich der Mietbetrag
                        // nach der Unterschrift.
                        if (rental.Accessories.Any(a => a.Einmalig))
                        {
                            col.Item().PaddingLeft(12).Text(
                                "•  verbrauchtes oder einbehaltenes Verbrauchsmaterial (siehe Auflistung oben)"
                            ).FontSize(9);
                        }
                    }
                    else
                    {
                        col.Item().PaddingTop(2).Text(
                            "Für diese Vermietung wurde keine Kaution vereinbart. Die Haftung des Mieters für Schäden, " +
                            "Verlust und unsachgemäße Nutzung nach § 6 bleibt davon unberührt."
                        ).FontSize(9);
                    }

                    // § 5 Übergabe & Öffnungszeiten
                    col.Item().PaddingTop(8).Text("§ 5 Übergabe & Öffnungszeiten").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Die Fahrradübergabe ist Mo-Fr ab 10:00 Uhr und Sa ab 11:00 Uhr möglich. Die Rückgabe muss bis spätestens 18:00 Uhr erfolgen. " +
                        "Ist das Fahrrad am Folgetag verfügbar, kann die Miete nach vorheriger Mitteilung an den Vermieter verlängert werden; " +
                        "pro zusätzlichem Tag wird der reguläre Tagespreis berechnet."
                    ).FontSize(9);

                    // § 6 Diebstahl und Haftung
                    col.Item().PaddingTop(8).Text("§ 6 Diebstahl und Haftung").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Der Mieter haftet für schuldhaft verursachte Schäden, Verlust und unsachgemäße Nutzung des Fahrrads während der Mietzeit. " +
                        "Für Diebstahl haftet der Mieter nur dann in voller Höhe, wenn das Fahrrad nicht ordnungsgemäß gesichert war."
                    ).FontSize(9);
                    col.Item().PaddingTop(2).Text(
                        "Wird ein Diebstahl bei ordnungsgemäßer Sicherung nachgewiesen (Polizeianzeige + Aktenzeichen), " +
                        "beschränkt sich die Haftung des Mieters auf die hinterlegte Kaution."
                    ).FontSize(9);

                    // § 7 Diebstahlmeldung
                    col.Item().PaddingTop(8).Text("§ 7 Diebstahlmeldung").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text("Im Falle eines Diebstahls hat der Mieter unverzüglich:").FontSize(9);
                    col.Item().PaddingLeft(12).Text("•  die Polizei zu informieren").FontSize(9);
                    col.Item().PaddingLeft(12).Text("•  eine Anzeige zu erstatten").FontSize(9);
                    col.Item().PaddingLeft(12).Text("•  den Vermieter zu benachrichtigen").FontSize(9);
                    col.Item().PaddingTop(2).Text("Das polizeiliche Aktenzeichen ist vorzulegen.").FontSize(9);

                    // § 8 Rückgabe
                    col.Item().PaddingTop(8).Text("§ 8 Rückgabe").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Das Fahrrad ist zum vereinbarten Zeitpunkt zurückzugeben. " +
                        "Bei verspäteter Rückgabe kann eine zusätzliche Tagesmiete berechnet werden."
                    ).FontSize(9);

                    // § 9 Versicherung
                    col.Item().PaddingTop(8).Text("§ 9 Versicherung").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Die Mietfahrräder sind nicht über den Vermieter haftpflicht- oder kaskoversichert. " +
                        "Der Mieter haftet für alle während der Mietzeit entstandenen Schäden gemäß § 6 dieser Bedingungen. " +
                        "Es wird empfohlen, eine eigene Haftpflichtversicherung abzuschließen oder den Versicherungsschutz der vorhandenen Hausratversicherung zu prüfen."
                    ).FontSize(9);

                    // § 10 Haftung des Vermieters
                    col.Item().PaddingTop(8).Text("§ 10 Haftung des Vermieters").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Die Haftung des Vermieters ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. " +
                        "Für leichte Fahrlässigkeit haftet der Vermieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), " +
                        "in diesem Fall begrenzt auf den vorhersehbaren, vertragstypischen Schaden. " +
                        "Eine Haftung für technische Mängel, die dem Vermieter trotz ordnungsgemäßer Prüfung nicht erkennbar waren, ist ausgeschlossen."
                    ).FontSize(9);

                    // § 11 Datenschutz
                    col.Item().PaddingTop(8).Text("§ 11 Datenschutz").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Die im Rahmen dieses Vertrags erhobenen personenbezogenen Daten (Name, Anschrift, Telefon, Ausweisnummer) " +
                        "werden auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) verarbeitet und ausschließlich " +
                        "zur Abwicklung des Mietverhältnisses verwendet. Eine Weitergabe an Dritte erfolgt nicht, " +
                        "es sei denn, dies ist zur Vertragserfüllung oder zur Geltendmachung von Schadenersatzansprüchen erforderlich. " +
                        "Die Daten werden nach Ablauf der gesetzlichen Aufbewahrungsfristen gelöscht. " +
                        "Der Mieter hat das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung seiner Daten."
                    ).FontSize(9);

                    // § 12 Recht und Gerichtsstand
                    col.Item().PaddingTop(8).Text("§ 12 Recht und Gerichtsstand").FontSize(11).Bold().FontColor(PrimaryColor);
                    col.Item().PaddingTop(2).Text(
                        "Es gilt deutsches Recht. Soweit gesetzlich zulässig ist Gerichtsstand Freiburg im Breisgau."
                    ).FontSize(9);

                    // Bestätigung
                    col.Item().PaddingTop(16).Border(1).BorderColor(PrimaryColor).Padding(8).Column(bc =>
                    {
                        bc.Item().Text("BESTÄTIGUNG DES MIETERS").FontSize(10).Bold().FontColor(PrimaryColor);
                        bc.Item().PaddingTop(4).Text("Der Mieter bestätigt den Erhalt des Fahrrads sowie die vollständige Kenntnisnahme der vorstehenden Mietbedingungen.").FontSize(9);
                        bc.Item().PaddingTop(3).Row(r =>
                        {
                            r.ConstantItem(20).AlignTop().Element(e =>
                            {
                                if (rental.AgbAkzeptiert)
                                    e.Width(13).Height(13).Background(AccentColor).AlignCenter().AlignMiddle()
                                        .Text("X").FontSize(8).FontColor(Colors.White).Bold();
                                else
                                    e.Width(13).Height(13).Border(1).BorderColor(Colors.Grey.Darken2).AlignCenter().AlignMiddle()
                                        .Text(" ").FontSize(8);
                            });
                            r.RelativeItem().PaddingLeft(2).Text("Ich habe die Mietbedingungen gelesen und akzeptiert.").FontSize(10).Bold();
                        });
                        bc.Item().PaddingTop(10).Row(r =>
                        {
                            r.RelativeItem().Column(oc =>
                            {
                                oc.Item().Text("Ort, Datum").FontSize(9).FontColor(Colors.Grey.Darken1);
                                var ortDatum = !string.IsNullOrEmpty(rental.UnterschriftOrt)
                                    ? $"{rental.UnterschriftOrt}, {rental.CreatedAt:dd.MM.yyyy}"
                                    : string.Empty;
                                if (!string.IsNullOrEmpty(ortDatum))
                                    oc.Item().PaddingTop(4).Text(ortDatum).FontSize(10).Bold();
                                else
                                    oc.Item().Height(28);
                                oc.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            });
                            r.ConstantItem(20);
                            r.RelativeItem().Column(sc =>
                            {
                                sc.Item().Text("Unterschrift Mieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                                if (!string.IsNullOrEmpty(rental.MieterUnterschrift))
                                {
                                    try
                                    {
                                        var sigData = rental.MieterUnterschrift;
                                        if (sigData.Contains(",")) sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                        sc.Item().Height(28).Image(Convert.FromBase64String(sigData));
                                    }
                                    catch { sc.Item().Height(28); }
                                }
                                else
                                {
                                    sc.Item().Height(28);
                                }
                                sc.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                                sc.Item().PaddingTop(2).Text(rental.Customer.FullName).FontSize(8).FontColor(Colors.Grey.Darken2);
                            });
                        });
                    });
                });

                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().AlignCenter().Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}")
                        .FontSize(7).FontColor(Colors.Grey.Darken1);
                });
            });
        });

        return document.GeneratePdf();
    }

    // ══════════════════════════════════════════════════════════════
    // KAUTIONSQUITTUNG (Deposit Receipt) PDF
    // ══════════════════════════════════════════════════════════════
    public async Task<byte[]> GenerateKautionsquittungAsync(int rentalId)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(rentalId)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {rentalId} nicht gefunden.");

        var shop = await GetShopInfoAsync();
        QuestPDF.Settings.License = LicenseType.Community;

        var zahlungsartText = ZahlungsartText(rental.KautionZahlungsart);

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        // Logo - left
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        // Shop info - center
                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        // Kautionsquittung box - right
                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("KAUTIONSQUITTUNG").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(rental.MietvertragNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text($"{rental.CreatedAt:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    // Tax info bar
                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Kautionsquittung").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(4).Column(col =>
                {
                    // KUNDE Section
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("KUNDE / MIETER");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Name").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.FullName).FontSize(10).Bold();

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Adresse").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.FullAddress ?? "-").FontSize(10);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Telefon").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.Telefon ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("E-Mail").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.Email ?? "-").FontSize(10);
                    });

                    AddFahrraederMitGesamtkaution(col, rental);

                    // KAUTION BETRAG - big highlight
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Zahlungsart:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(5).Text(zahlungsartText).FontSize(13).Bold();
                            c.Item().PaddingTop(6).Text("Zweck:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Text("Sicherheitskaution für Fahrradvermietung.").FontSize(9);
                        });

                        // Kaution amount box
                        row.ConstantItem(170).AlignMiddle().Border(2).BorderColor(PrimaryColor).Padding(8).Column(c =>
                        {
                            c.Item().Text("GESAMTKAUTION").FontSize(10).FontColor(PrimaryColor).AlignCenter();
                            c.Item().PaddingTop(3).Text($"{rental.Kaution:N2} €").FontSize(25).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Conditions
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("BEDINGUNGEN");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(wCol =>
                    {
                        wCol.Item().Row(wRow =>
                        {
                            wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                            wRow.RelativeItem().Text("Die Kaution wird bei ordnungsgemäßer Rückgabe des Fahrrads vollständig zurückerstattet.").FontSize(9).FontColor(Colors.Grey.Darken3);
                        });
                        wCol.Item().PaddingTop(3).Row(wRow =>
                        {
                            wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                            wRow.RelativeItem().Text("Bei Schäden, Verlust oder Diebstahl kann die Kaution einbehalten werden.").FontSize(9).FontColor(Colors.Grey.Darken3);
                        });
                    });

                    // Signature (Vermieter only)
                    col.Item().PaddingTop(16).Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sellerCol =>
                        {
                            sellerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERMIETER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            sellerCol.Item().PaddingTop(3).Text("Unterschrift Vermieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sellerCol.Item().Height(35).Image(imageData);
                                }
                                catch { sellerCol.Item().Height(35); }
                            }
                            else
                            {
                                sellerCol.Item().Height(35);
                            }
                            sellerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            sellerCol.Item().PaddingTop(2).Text(shop.OwnerName).FontSize(9);
                        });

                        row.RelativeItem();
                    });
                });

                // Footer
                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().AlignCenter().Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}")
                        .FontSize(7).FontColor(Colors.Grey.Darken1);
                });
            });
        });

        return document.GeneratePdf();
    }

    // ══════════════════════════════════════════════════════════════
    // KAUTIONSRÜCKGABEBELEG (Deposit Refund Receipt) PDF
    // Gegenstück zur Kautionsquittung: belegt, dass die Kaution an den Mieter
    // ausgezahlt wurde — mit Auszahlungsart, Betrag, etwaigen Abzügen und der
    // Unterschrift des Mieters, die bei der Rückgabe abgenommen wurde.
    // ══════════════════════════════════════════════════════════════
    public async Task<byte[]> GenerateKautionsrueckgabebelegAsync(int rentalId)
    {
        var rental = await _rentalRepository.GetWithDetailsAsync(rentalId)
            ?? throw new KeyNotFoundException($"Mietvertrag mit ID {rentalId} nicht gefunden.");

        var shop = await GetShopInfoAsync();
        QuestPDF.Settings.License = LicenseType.Community;

        var zahlungsartText = ZahlungsartText(rental.KautionZahlungsart);

        // Rückgabedatum: der späteste erfasste Zeitpunkt. Fehlt er (Verträge aus
        // der Zeit vor dem Feld), fällt der Beleg auf das heutige Datum zurück.
        var rueckgabeDatum = rental.Bikes
            .Where(b => b.KautionRueckgabeDatum.HasValue)
            .Select(b => b.KautionRueckgabeDatum!.Value)
            .DefaultIfEmpty(DateTime.UtcNow)
            .Max();

        // Die Unterschrift wird für alle Räder eines Vertrags gleich gesetzt.
        var mieterUnterschrift = rental.Bikes
            .Select(b => b.KautionRueckgabeUnterschrift)
            .FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));

        var schadenAbzug = rental.Bikes.Sum(b => b.SchadenAbzug);
        var verspaetungsAbzug = rental.Bikes.Sum(b => b.VerspaetungsAbzug);
        // Verbrauchtes Einmal-Zubehör (der Schlauch, den der Mieter behalten hat)
        // steckt mit drin: es gehört zur Kaution und nicht in die Miete, denn die
        // stand bei der Unterschrift fest, während sich der Verbrauch erst bei der
        // Rückgabe zeigt. Die Summe kommt aus derselben Stelle, die auch die
        // Rückgabemaske benutzt.
        var abzuegeGesamt = rental.KautionAbzugGesamt();
        var erstattet = Math.Max(0m, rental.Kaution - abzuegeGesamt);

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        // Logo - left
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        // Shop info - center
                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        // Rückgabebeleg box - right
                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("KAUTIONSRÜCKGABE").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(rental.MietvertragNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text($"{rueckgabeDatum:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    // Tax info bar
                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Kautionsrückgabebeleg").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(4).Column(col =>
                {
                    // KUNDE Section
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("KUNDE / MIETER");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Name").FontSize(9).Bold().FontColor(PrimaryColor);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.FullName).FontSize(10).Bold();

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Adresse").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.FullAddress ?? "-").FontSize(10);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("Telefon").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.Telefon ?? "-").FontSize(10);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text("E-Mail").FontSize(9).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(rental.Customer.Email ?? "-").FontSize(10);
                    });

                    AddFahrraederMitGesamtkaution(col, rental);

                    // RÜCKZAHLUNG - Auszahlungsart links, Betrag rechts
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Auszahlungsart:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(5).Text(zahlungsartText).FontSize(13).Bold();
                            c.Item().PaddingTop(6).Text("Rückgabedatum:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{rueckgabeDatum:dd.MM.yyyy}").FontSize(11).Bold();

                            if (abzuegeGesamt > 0)
                            {
                                c.Item().PaddingTop(6).Text("Abzüge:").FontSize(9).FontColor(Colors.Grey.Darken1);
                                if (schadenAbzug > 0)
                                    c.Item().Text($"Schaden: -{schadenAbzug:N2} €").FontSize(9);
                                if (verspaetungsAbzug > 0)
                                    c.Item().Text($"Verspätung: -{verspaetungsAbzug:N2} €").FontSize(9);
                                foreach (var acc in rental.Accessories.Where(a => a.VerbrauchsAbzug() > 0))
                                    c.Item().Text($"{acc.Bezeichnung} verbraucht: -{acc.VerbrauchsAbzug():N2} €").FontSize(9);
                            }
                        });

                        // Erstatteter Betrag
                        row.ConstantItem(170).AlignMiddle().Border(2).BorderColor(PrimaryColor).Padding(8).Column(c =>
                        {
                            c.Item().Text("ZURÜCKGEZAHLT").FontSize(10).FontColor(PrimaryColor).AlignCenter();
                            c.Item().PaddingTop(3).Text($"{erstattet:N2} €").FontSize(25).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Bestätigung
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("BESTÄTIGUNG");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(wCol =>
                    {
                        wCol.Item().Row(wRow =>
                        {
                            wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                            wRow.RelativeItem().Text($"Der Mieter bestätigt mit seiner Unterschrift den Erhalt von {erstattet:N2} € ({zahlungsartText}).").FontSize(9).FontColor(Colors.Grey.Darken3);
                        });
                        if (abzuegeGesamt > 0)
                        {
                            wCol.Item().PaddingTop(3).Row(wRow =>
                            {
                                wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                                wRow.RelativeItem().Text($"Von der Kaution ({rental.Kaution:N2} €) wurden {abzuegeGesamt:N2} € einbehalten.").FontSize(9).FontColor(Colors.Grey.Darken3);
                            });
                        }
                        wCol.Item().PaddingTop(3).Row(wRow =>
                        {
                            wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                            wRow.RelativeItem().Text("Mit der Auszahlung ist der Kautionsanspruch aus diesem Mietvertrag erledigt.").FontSize(9).FontColor(Colors.Grey.Darken3);
                        });
                    });

                    // Unterschriften: Vermieter + Mieter (Unterschrift der Kautionsrückgabe)
                    col.Item().PaddingTop(16).Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sellerCol =>
                        {
                            sellerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERMIETER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            sellerCol.Item().PaddingTop(3).Text("Unterschrift Vermieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sellerCol.Item().Height(35).Image(imageData);
                                }
                                catch { sellerCol.Item().Height(35); }
                            }
                            else
                            {
                                sellerCol.Item().Height(35);
                            }
                            sellerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            sellerCol.Item().PaddingTop(2).Text(shop.OwnerName).FontSize(9);
                        });

                        row.ConstantItem(20);

                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(buyerCol =>
                        {
                            buyerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("MIETER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            buyerCol.Item().PaddingTop(3).Text("Unterschrift Mieter (Kaution erhalten)").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(mieterUnterschrift))
                            {
                                try
                                {
                                    var sigData = mieterUnterschrift;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    buyerCol.Item().Height(35).Image(imageData);
                                }
                                catch { buyerCol.Item().Height(35); }
                            }
                            else
                            {
                                buyerCol.Item().Height(35);
                            }
                            buyerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            buyerCol.Item().PaddingTop(2).Text(rental.Customer.FullName).FontSize(9);
                        });
                    });
                });

                // Footer
                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().AlignCenter().Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}")
                        .FontSize(7).FontColor(Colors.Grey.Darken1);
                });
            });
        });

        return document.GeneratePdf();
    }

    // ══════════════════════════════════════════════════════════════
    // BOOKING RECHNUNG (Consolidated Invoice for multi-bike booking)
    // ══════════════════════════════════════════════════════════════
    public async Task<byte[]> GenerateBookingRechnungAsync(int bookingId)
    {
        var booking = await _rentalBookingRepository.GetWithDetailsAsync(bookingId)
            ?? throw new KeyNotFoundException($"Buchung mit ID {bookingId} nicht gefunden.");

        var bicycles = new List<Bicycle>();
        foreach (var bk in booking.Bikes)
        {
            var bike = await _bicycleRepository.GetByIdAsync(bk.BicycleId);
            if (bike != null) bicycles.Add(bike);
        }

        var shop = await GetShopInfoAsync();
        QuestPDF.Settings.License = LicenseType.Community;

        var totalMiete = booking.Bikes.Sum(b => b.Gesamtpreis ?? 0m);
        var totalKaution = booking.Bikes.Sum(b => b.Kaution ?? 0m);
        var kundenName = $"{booking.Vorname} {booking.Nachname}".Trim();
        var kundenAdresse = string.Join(", ",
            new[] { $"{booking.Strasse} {booking.HausNr}".Trim(), $"{booking.PLZ} {booking.Ort}".Trim() }
            .Where(s => !string.IsNullOrWhiteSpace(s)));

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("MIETRECHNUNG").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(booking.BuchungsNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text("DATUM").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                            box.Item().Text($"{booking.CreatedAt:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Mietrechnung Fahrradverleih").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(4).Column(col =>
                {
                    // KUNDE Section
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("KUNDE");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(c =>
                    {
                        c.Item().Text(kundenName).FontSize(11).Bold();
                        if (!string.IsNullOrWhiteSpace(kundenAdresse))
                            c.Item().Text(kundenAdresse).FontSize(9);
                        if (!string.IsNullOrWhiteSpace(booking.Email))
                            c.Item().Text($"E-Mail: {booking.Email}").FontSize(9);
                        if (!string.IsNullOrWhiteSpace(booking.Telefon))
                            c.Item().Text($"Tel: {booking.Telefon}").FontSize(9);
                    });

                    // FAHRRÄDER Section
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("GEMIETETE FAHRRÄDER");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(25);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.ConstantColumn(80);
                            columns.ConstantColumn(80);
                            columns.ConstantColumn(80);
                        });

                        // Header
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Nr.").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Fahrrad").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Rahmennr.").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Farbe").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Zeitraum").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Tage").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Preis").FontSize(8).Bold().FontColor(PrimaryColor).AlignRight();

                        for (int i = 0; i < booking.Bikes.Count; i++)
                        {
                            var bk = booking.Bikes.ElementAt(i);
                            var bicycle = bicycles.FirstOrDefault(b => b.Id == bk.BicycleId);
                            var days = (bk.EndDatum.Date - bk.StartDatum.Date).Days + 1;

                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{i + 1}").FontSize(9).AlignCenter();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{bicycle?.Marke} {bicycle?.Modell}".Trim()).FontSize(9).Bold();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(bk.Rahmennummer ?? bicycle?.Rahmennummer ?? "-").FontSize(9);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(bk.Farbe ?? bicycle?.Farbe ?? "-").FontSize(9);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{bk.StartDatum:dd.MM} - {bk.EndDatum:dd.MM.yy}").FontSize(8);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{days}").FontSize(9).AlignCenter();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(bk.Gesamtpreis.HasValue ? $"{bk.Gesamtpreis:N2} €" : "-").FontSize(9).AlignRight();
                        }

                        // Total row
                        table.Cell().ColumnSpan(6).Border(1).BorderColor(AccentColor).Padding(3).Text("GESAMTMIETE").FontSize(9).Bold().FontColor(AccentColor).AlignRight();
                        table.Cell().Border(1).BorderColor(AccentColor).Padding(3).Text($"{totalMiete:N2} €").FontSize(10).Bold().FontColor(AccentColor).AlignRight();
                    });

                    // ZUBEHÖR
                    if (booking.Accessories.Any())
                    {
                        col.Item().PaddingTop(6).Element(SectionHeader).Text("ZUBEHÖR");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(70);
                                columns.ConstantColumn(45);
                                columns.ConstantColumn(80);
                            });

                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Bezeichnung").FontSize(9).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Preis").FontSize(9).Bold().FontColor(PrimaryColor).AlignRight();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Menge").FontSize(9).Bold().FontColor(PrimaryColor).AlignCenter();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Gesamt").FontSize(9).Bold().FontColor(PrimaryColor).AlignRight();

                            // Miettage der Buchung: Tagespreis-Zubehör wird damit
                            // multipliziert. Ohne die Tage stand hier bisher eine zu
                            // kleine Summe, die nicht zum Gesamtpreis der Buchung passte.
                            var zubehoerTage = (booking.EndDatum.Date - booking.StartDatum.Date).Days + 1;
                            foreach (var acc in booking.Accessories)
                            {
                                var accTotal = acc.LineTotal(zubehoerTage);
                                var preisText = acc.Einmalig
                                    ? $"{acc.Tagespreis:N2} € einmalig"
                                    : $"{acc.Tagespreis:N2} €/Tag";
                                // Einmaliges Zubehör ist Verbrauchsmaterial: es steht
                                // bereit, kostet aber nur, wenn es verwendet wird —
                                // deshalb hier kein Betrag, sondern ein Hinweis.
                                var summeText = acc.Einmalig ? "nur bei Verbrauch" : $"{accTotal:N2} €";
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(acc.Bezeichnung).FontSize(10);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(preisText).FontSize(9).AlignRight();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(acc.Menge.ToString()).FontSize(10).AlignCenter();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(summeText).FontSize(acc.Einmalig ? 8 : 10).AlignRight();
                            }
                        });

                        if (booking.Accessories.Any(a => a.Einmalig))
                        {
                            col.Item().PaddingTop(3).Text(text =>
                            {
                                text.Span("Hinweis: ").Bold().FontSize(8);
                                text.Span(
                                    "Einmaliges Zubehör (z. B. Schlauch) ist Verbrauchsmaterial und nicht Teil des " +
                                    "Mietpreises. Kommt es unbenutzt zurück, entsteht keine Gebühr; wird es verbraucht " +
                                    "oder behalten, wird der Betrag vor Ort von der Kaution einbehalten."
                                ).FontSize(8).FontColor(Colors.Grey.Darken2);
                            });
                        }
                    }

                    // Grand Total
                    col.Item().PaddingTop(8).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Mietdauer:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{booking.StartDatum:dd.MM.yyyy} – {booking.EndDatum:dd.MM.yyyy}").FontSize(11).Bold();
                            c.Item().PaddingTop(6).Text("Kaution (gesamt):").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(5).Text($"{totalKaution:N2} €").FontSize(13).Bold();
                        });

                        row.ConstantItem(170).AlignMiddle().Border(2).BorderColor(PrimaryColor).Padding(8).Column(c =>
                        {
                            c.Item().Text("GESAMTBETRAG").FontSize(10).FontColor(PrimaryColor).AlignCenter();
                            c.Item().Text("(inkl. MwSt.)").FontSize(8).FontColor(Colors.Grey.Darken2).AlignCenter();
                            c.Item().PaddingTop(3).Text($"{totalMiete:N2} €").FontSize(25).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Notes
                    if (!string.IsNullOrWhiteSpace(booking.Notizen))
                    {
                        col.Item().PaddingTop(4).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Row(row =>
                        {
                            row.ConstantItem(55).Text("Notizen:").FontSize(9).Bold();
                            row.RelativeItem().Text(booking.Notizen).FontSize(9);
                        });
                    }

                    // Vermieter signature
                    col.Item().PaddingTop(12).Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sellerCol =>
                        {
                            sellerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERMIETER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            sellerCol.Item().PaddingTop(3).Text("Unterschrift Vermieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sellerCol.Item().Height(35).Image(imageData);
                                }
                                catch { sellerCol.Item().Height(35); }
                            }
                            else { sellerCol.Item().Height(35); }
                            sellerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            sellerCol.Item().PaddingTop(2).Text(shop.OwnerName).FontSize(9);
                        });
                        row.RelativeItem();
                    });
                });

                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().AlignCenter().Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}")
                        .FontSize(7).FontColor(Colors.Grey.Darken1);
                });
            });
        });

        return document.GeneratePdf();
    }

    // ══════════════════════════════════════════════════════════════
    // BOOKING KAUTIONSQUITTUNG (Consolidated Deposit Receipt)
    // ══════════════════════════════════════════════════════════════
    public async Task<byte[]> GenerateBookingKautionsquittungAsync(int bookingId)
    {
        var booking = await _rentalBookingRepository.GetWithDetailsAsync(bookingId)
            ?? throw new KeyNotFoundException($"Buchung mit ID {bookingId} nicht gefunden.");

        var bicycles = new List<Bicycle>();
        foreach (var bk in booking.Bikes)
        {
            var bike = await _bicycleRepository.GetByIdAsync(bk.BicycleId);
            if (bike != null) bicycles.Add(bike);
        }

        var shop = await GetShopInfoAsync();
        QuestPDF.Settings.License = LicenseType.Community;

        var totalKaution = booking.Bikes.Sum(b => b.Kaution ?? 0m);
        var kundenName = $"{booking.Vorname} {booking.Nachname}".Trim();
        var kundenAdresse = string.Join(", ",
            new[] { $"{booking.Strasse} {booking.HausNr}".Trim(), $"{booking.PLZ} {booking.Ort}".Trim() }
            .Where(s => !string.IsNullOrWhiteSpace(s)));

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.6f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header
                page.Header().Container().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(90).Column(logoCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    logoCol.Item().Height(84).Image(logoBytes);
                                }
                                catch { }
                            }
                        });

                        row.RelativeItem().AlignMiddle().PaddingHorizontal(10).Column(centerCol =>
                        {
                            centerCol.Item().AlignCenter().Text(shop.ShopName).FontSize(18).Bold().FontColor(PrimaryColor);
                            centerCol.Item().AlignCenter().Text(shop.OwnerName).FontSize(10).Bold().FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.Street).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text(shop.City).FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(9).FontColor(Colors.Grey.Darken2);
                            centerCol.Item().AlignCenter().Text($"E-Mail: {shop.Email}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        row.ConstantItem(150).AlignMiddle().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                        {
                            box.Item().Text("KAUTIONSQUITTUNG").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(booking.BuchungsNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text($"{booking.CreatedAt:dd.MM.yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1).AlignCenter();
                        });
                    });

                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(2).PaddingHorizontal(6).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Kautionsquittung").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(4).Column(col =>
                {
                    // KUNDE Section
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("KUNDE / MIETER");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(c =>
                    {
                        c.Item().Text(kundenName).FontSize(11).Bold();
                        if (!string.IsNullOrWhiteSpace(kundenAdresse))
                            c.Item().Text(kundenAdresse).FontSize(9);
                        if (!string.IsNullOrWhiteSpace(booking.Email))
                            c.Item().Text($"E-Mail: {booking.Email}").FontSize(9);
                        if (!string.IsNullOrWhiteSpace(booking.Telefon))
                            c.Item().Text($"Tel: {booking.Telefon}").FontSize(9);
                    });

                    // FAHRRÄDER + KAUTION: nur die Räder, die Kaution einmal als
                    // Gesamtbetrag (sie gilt für die ganze Buchung, nicht je Rad).
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("FAHRRÄDER & KAUTION");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(25);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                        });

                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Nr.").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Fahrrad").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Rahmennr.").FontSize(8).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(3).Text("Farbe").FontSize(8).Bold().FontColor(PrimaryColor);

                        for (int i = 0; i < booking.Bikes.Count; i++)
                        {
                            var bk = booking.Bikes.ElementAt(i);
                            var bicycle = bicycles.FirstOrDefault(b => b.Id == bk.BicycleId);

                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{i + 1}").FontSize(9).AlignCenter();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text($"{bicycle?.Marke} {bicycle?.Modell}".Trim()).FontSize(9).Bold();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(bk.Rahmennummer ?? bicycle?.Rahmennummer ?? "-").FontSize(9);
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(bk.Farbe ?? bicycle?.Farbe ?? "-").FontSize(9);
                        }

                        // Total
                        table.Cell().ColumnSpan(3).Border(1).BorderColor(AccentColor).Padding(3).Text("GESAMTKAUTION").FontSize(9).Bold().FontColor(AccentColor).AlignRight();
                        table.Cell().Border(1).BorderColor(AccentColor).Padding(3).Text($"{totalKaution:N2} €").FontSize(10).Bold().FontColor(AccentColor).AlignRight();
                    });

                    // Kaution amount box
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Zweck:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Text("Sicherheitskaution für Fahrradvermietung.").FontSize(9);
                            c.Item().PaddingTop(4).Text("Mietdauer:").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{booking.StartDatum:dd.MM.yyyy} – {booking.EndDatum:dd.MM.yyyy}").FontSize(11).Bold();
                        });

                        row.ConstantItem(170).AlignMiddle().Border(2).BorderColor(PrimaryColor).Padding(8).Column(c =>
                        {
                            c.Item().Text("GESAMTKAUTION").FontSize(10).FontColor(PrimaryColor).AlignCenter();
                            c.Item().PaddingTop(3).Text($"{totalKaution:N2} €").FontSize(25).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Conditions
                    col.Item().PaddingTop(6).Element(SectionHeader).Text("BEDINGUNGEN");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(wCol =>
                    {
                        wCol.Item().Row(wRow =>
                        {
                            wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                            wRow.RelativeItem().Text("Die Kaution wird bei ordnungsgemäßer Rückgabe des Fahrrads vollständig zurückerstattet.").FontSize(9).FontColor(Colors.Grey.Darken3);
                        });
                        wCol.Item().PaddingTop(3).Row(wRow =>
                        {
                            wRow.ConstantItem(18).AlignCenter().Text(">").FontSize(13).Bold().FontColor(AccentColor);
                            wRow.RelativeItem().Text("Bei Schäden, Verlust oder Diebstahl kann die Kaution einbehalten werden.").FontSize(9).FontColor(Colors.Grey.Darken3);
                        });
                    });

                    // Signatures
                    col.Item().PaddingTop(12).Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sellerCol =>
                        {
                            sellerCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERMIETER").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            sellerCol.Item().PaddingTop(3).Text("Unterschrift Vermieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sellerCol.Item().Height(35).Image(imageData);
                                }
                                catch { sellerCol.Item().Height(35); }
                            }
                            else { sellerCol.Item().Height(35); }
                            sellerCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            sellerCol.Item().PaddingTop(2).Text(shop.OwnerName).FontSize(9);
                        });

                        row.ConstantItem(12);

                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(mieterCol =>
                        {
                            mieterCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("MIETER / KUNDE").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                            mieterCol.Item().PaddingTop(3).Text("Unterschrift Mieter").FontSize(9).FontColor(Colors.Grey.Darken1);
                            if (!string.IsNullOrEmpty(booking.MieterUnterschrift))
                            {
                                try
                                {
                                    var sigData = booking.MieterUnterschrift;
                                    if (sigData.Contains(",")) sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    mieterCol.Item().Height(35).Image(Convert.FromBase64String(sigData));
                                }
                                catch { mieterCol.Item().Height(35); }
                            }
                            else { mieterCol.Item().Height(35); }
                            mieterCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            mieterCol.Item().PaddingTop(2).Text(kundenName).FontSize(9);
                        });
                    });
                });

                page.Footer().Column(footerCol =>
                {
                    footerCol.Item().AlignCenter().Text($"{shop.ShopName} | {shop.Street}, {shop.City} | Tel: {shop.Telefon} | {shop.Email}")
                        .FontSize(7).FontColor(Colors.Grey.Darken1);
                });
            });
        });

        return document.GeneratePdf();
    }
}
