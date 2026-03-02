using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Domain.Enums;
using BikeHaus.Domain.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BikeHaus.Infrastructure.Services;

public class PdfService : IPdfService
{
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IReturnRepository _returnRepository;
    private readonly IShopSettingsRepository _shopSettingsRepository;

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
    private const string DefaultShopEmail = "bikehausfreiburg@gmail.com";
    private const string DefaultShopTelefon = "0 15566300011";
    private const string DefaultBankName = "Sparkasse";
    private const string DefaultBankAccountHolder = "Cevdet Akarsu";
    private const string DefaultIBAN = "DE28 6805 0101 00 14 5475 04";

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
        IShopSettingsRepository shopSettingsRepository)
    {
        _purchaseRepository = purchaseRepository;
        _saleRepository = saleRepository;
        _returnRepository = returnRepository;
        _shopSettingsRepository = shopSettingsRepository;
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
                OwnerSignatureBase64 = null
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
            OwnerSignatureBase64 = settings.InhaberSignatureBase64
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
    }

    public async Task<byte[]> GenerateKaufbelegAsync(int purchaseId)
    {
        var purchase = await _purchaseRepository.GetWithDetailsAsync(purchaseId)
            ?? throw new KeyNotFoundException($"Purchase with ID {purchaseId} not found.");

        var shop = await GetShopInfoAsync();

        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                // Header with print-friendly styling
                page.Header().Column(col =>
                {
                    // Top bar with logo and shop name
                    col.Item().BorderBottom(1).BorderColor(PrimaryColor).PaddingBottom(10).Row(row =>
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
                                    leftCol.Item().Height(40).Image(logoBytes);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(16).Bold().FontColor(PrimaryColor);
                            leftCol.Item().Text(shop.ShopType).FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        row.ConstantItem(130).AlignRight().AlignMiddle().Border(1.5f).BorderColor(PrimaryColor).Padding(8).Column(box =>
                        {
                            box.Item().Text("KAUFBELEG").FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                            box.Item().Text(purchase.BelegNummer).FontSize(13).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Contact info bar
                    col.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Text($"{shop.Street}, {shop.City}").FontSize(8).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignCenter().Text($"Tel: {shop.Telefon}").FontSize(8).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text($"E-Mail: {shop.Email}").FontSize(8).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(12).Column(col =>
                {
                    // KÄUFER (HÄNDLER) and Kaufdatum row
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

                        row.ConstantItem(10);

                        // Kaufdatum - right side
                        row.ConstantItem(130).AlignTop().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
                        {
                            c.Item().Text("Kaufdatum").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{purchase.Kaufdatum:dd.MM.yyyy}").FontSize(12).Bold().FontColor(PrimaryColor);
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
                    col.Item().PaddingTop(12).Element(SectionHeader).Text("FAHRRAD-INFORMATIONEN");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(100);
                            columns.RelativeColumn();
                            columns.ConstantColumn(100);
                            columns.RelativeColumn();
                        });

                        AddStyledTableRow(table, "Marke", purchase.Bicycle.Marke, "Modell", purchase.Bicycle.Modell);
                        AddStyledTableRow(table, "Rahmennummer", purchase.Bicycle.Rahmennummer, "Farbe", purchase.Bicycle.Farbe);
                        AddStyledTableRow(table, "Rahmengröße", purchase.Bicycle.Rahmengroesse ?? "-", "Reifengröße", purchase.Bicycle.Reifengroesse);
                        AddStyledTableRow(table, "Fahrradtyp", purchase.Bicycle.Fahrradtyp ?? "-", "Zustand", purchase.Bicycle.Zustand.ToString());
                        if (!string.IsNullOrEmpty(purchase.Bicycle.StokNo))
                            AddStyledTableRow(table, "Stok Nr.", purchase.Bicycle.StokNo, "", "");
                    });

                    // Section: Seller Info
                    col.Item().PaddingTop(12).Element(SectionHeader).Text("VERKÄUFER (VORBESITZER)");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(100);
                            columns.RelativeColumn();
                        });

                        AddInfoRow(table, "Name", purchase.Seller.FullName);
                        if (!string.IsNullOrEmpty(purchase.Seller.FullAddress))
                            AddInfoRow(table, "Adresse", purchase.Seller.FullAddress);
                        if (!string.IsNullOrEmpty(purchase.Seller.Telefon))
                            AddInfoRow(table, "Telefon", purchase.Seller.Telefon);
                        if (!string.IsNullOrEmpty(purchase.Seller.Email))
                            AddInfoRow(table, "E-Mail", purchase.Seller.Email);
                    });

                    // Section: Purchase Details
                    col.Item().PaddingTop(12).Element(SectionHeader).Text("KAUFDETAILS");
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Column(c =>
                        {
                            c.Item().Text("Zahlungsart").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(purchase.Zahlungsart.ToString()).FontSize(11).Bold();
                        });

                        row.ConstantItem(10);

                        row.ConstantItem(160).Border(2).BorderColor(PrimaryColor).Padding(12).Column(c =>
                        {
                            c.Item().Text("KAUFPREIS").FontSize(9).FontColor(PrimaryColor).AlignCenter();
                            c.Item().Text($"{purchase.Preis:N2} €").FontSize(20).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Notes if present
                    if (!string.IsNullOrEmpty(purchase.Notizen))
                    {
                        col.Item().PaddingTop(12).Element(SectionHeader).Text("NOTIZEN");
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(10).Text(purchase.Notizen).FontSize(9);
                    }

                    // Suggested Sale Price
                    if (purchase.VerkaufspreisVorschlag.HasValue && purchase.VerkaufspreisVorschlag.Value > 0)
                    {
                        col.Item().PaddingTop(8).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Row(row =>
                        {
                            row.RelativeItem().Text("Geplanter Verkaufspreis:").FontSize(9);
                            row.ConstantItem(100).Text($"{purchase.VerkaufspreisVorschlag:N2} €").FontSize(11).Bold().FontColor(PrimaryColor).AlignRight();
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

    public async Task<byte[]> GenerateVerkaufsbelegAsync(int saleId)
    {
        var sale = await _saleRepository.GetWithDetailsAsync(saleId)
            ?? throw new KeyNotFoundException($"Sale with ID {saleId} not found.");

        var shop = await GetShopInfoAsync();

        QuestPDF.Settings.License = LicenseType.Community;

        // Determine warranty text based on bike condition
        var isNeu = sale.Bicycle.Zustand == BikeCondition.Neu;
        var warrantyText = isNeu ? NeuWarrantyText : GebrauchtWarrantyText;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0.8f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Grey.Darken4));

                // Header with professional branding (print-friendly)
                page.Header().Container().Column(col =>
                {
                    // Top header bar - border instead of filled background
                    col.Item().Border(1).BorderColor(PrimaryColor).Padding(8).Row(row =>
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
                                    leftCol.Item().Height(28).Image(logoBytes);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(14).Bold().FontColor(PrimaryColor);
                            leftCol.Item().Text(shop.OwnerName).FontSize(8).FontColor(Colors.Grey.Darken2);
                        });

                        row.ConstantItem(130).AlignRight().Column(rightCol =>
                        {
                            rightCol.Item().Border(1).BorderColor(PrimaryColor).Padding(6).Column(box =>
                            {
                                box.Item().Text("VERKAUFSBELEG").FontSize(9).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text(sale.BelegNummer).FontSize(11).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text($"{sale.Verkaufsdatum:dd.MM.yyyy}").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                            });
                        });
                    });

                    // Tax info bar - print-friendly border style
                    col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten2).PaddingVertical(3).PaddingHorizontal(8).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(6).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Kaufvertrag nach §25a UStG – Kein gesonderter Ausweis der Umsatzsteuer").FontSize(6).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(6).Column(col =>
                {
                    // Seller / Buyer Row - print-friendly border style
                    var hasBuyerName = !string.IsNullOrWhiteSpace(sale.Buyer.Vorname) || !string.IsNullOrWhiteSpace(sale.Buyer.Nachname);
                    col.Item().Row(row =>
                    {
                        // Seller (Shop)
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(leftCol =>
                        {
                            leftCol.Item().Border(1).BorderColor(PrimaryColor).Padding(3).Text("VERKÄUFER").FontSize(8).Bold().FontColor(PrimaryColor).AlignCenter();
                            leftCol.Item().PaddingTop(4).Text(shop.OwnerName).FontSize(9).Bold();
                            leftCol.Item().Text(shop.Street).FontSize(8);
                            leftCol.Item().Text(shop.City).FontSize(8);
                            leftCol.Item().PaddingTop(3).Text($"📞 {shop.Telefon}").FontSize(7);
                            leftCol.Item().Text($"✉ {shop.Email}").FontSize(7);
                        });

                        if (hasBuyerName)
                        {
                            row.ConstantItem(8);

                            // Buyer
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(rightCol =>
                            {
                                rightCol.Item().Border(1).BorderColor(AccentColor).Padding(3).Text("KÄUFER").FontSize(8).Bold().FontColor(AccentColor).AlignCenter();
                                rightCol.Item().PaddingTop(4).Text(sale.Buyer.FullName).FontSize(9).Bold();
                                rightCol.Item().Text($"{sale.Buyer.Strasse} {sale.Buyer.Hausnummer}").FontSize(8);
                                rightCol.Item().Text($"{sale.Buyer.PLZ} {sale.Buyer.Stadt}").FontSize(8);
                                if (!string.IsNullOrEmpty(sale.Buyer.Telefon))
                                    rightCol.Item().PaddingTop(3).Text($"📞 {sale.Buyer.Telefon}").FontSize(7);
                                if (!string.IsNullOrEmpty(sale.Buyer.Email))
                                    rightCol.Item().Text($"✉ {sale.Buyer.Email}").FontSize(7);
                            });
                        }
                    });

                    // Bicycle Info Section - print-friendly with price
                    col.Item().PaddingTop(8).Element(SectionHeader).Text("🚲  FAHRRAD-DETAILS");
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
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Marke").FontSize(7).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.Marke).FontSize(8).Bold();
                        table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Rahmennummer").FontSize(7).Bold().FontColor(PrimaryColor);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.Rahmennummer).FontSize(8).Bold();

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Modell").FontSize(7).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.Modell).FontSize(8);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Farbe").FontSize(7).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.Farbe).FontSize(8);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Reifengröße").FontSize(7).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.Reifengroesse).FontSize(8);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Rahmengröße").FontSize(7).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.Rahmengroesse ?? "-").FontSize(8);

                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Fahrradtyp").FontSize(7).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.Fahrradtyp ?? "-").FontSize(8);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Zustand").FontSize(7).FontColor(Colors.Grey.Darken2);
                        if (isNeu)
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("NEU").FontSize(8).Bold().FontColor("#155724");
                        else
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("GEBRAUCHT").FontSize(8).Bold().FontColor("#856404");

                        // Additional row with Stok Nr and Price
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Stok Nr.").FontSize(7).FontColor(Colors.Grey.Darken2);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(sale.Bicycle.StokNo ?? "-").FontSize(8);
                        table.Cell().Border(1).BorderColor(AccentColor).Padding(4).Text("Preis").FontSize(7).Bold().FontColor(AccentColor);
                        table.Cell().Border(1).BorderColor(AccentColor).Padding(4).Text($"{sale.Preis:N2} €").FontSize(8).Bold().FontColor(AccentColor);
                    });

                    // Accessories if any
                    if (sale.Accessories.Any())
                    {
                        col.Item().PaddingTop(10).Element(SectionHeader).Text("🔧  ZUBEHÖR");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(60);
                                columns.ConstantColumn(40);
                                columns.ConstantColumn(70);
                            });

                            // Header - print-friendly border style
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Bezeichnung").FontSize(7).Bold().FontColor(PrimaryColor);
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Einzelpreis").FontSize(7).Bold().FontColor(PrimaryColor).AlignRight();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Menge").FontSize(7).Bold().FontColor(PrimaryColor).AlignCenter();
                            table.Cell().Border(1).BorderColor(PrimaryColor).Padding(4).Text("Gesamt").FontSize(7).Bold().FontColor(PrimaryColor).AlignRight();

                            foreach (var accessory in sale.Accessories)
                            {
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(accessory.Bezeichnung).FontSize(8);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text($"{accessory.Preis:N2} €").FontSize(8).AlignRight();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(accessory.Menge.ToString()).FontSize(8).AlignCenter();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text($"{accessory.Gesamtpreis:N2} €").FontSize(8).AlignRight();
                            }

                            // Total row
                            var accessoriesTotal = sale.Accessories.Sum(a => a.Gesamtpreis);
                            table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text("Zubehör Summe:").FontSize(8).Bold().AlignRight();
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text($"{accessoriesTotal:N2} €").FontSize(8).Bold().AlignRight();
                        });
                    }

                    // Payment and Total Section - print-friendly
                    col.Item().PaddingTop(8).Row(row =>
                    {
                        // Payment method
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Zahlungsart:").FontSize(7).FontColor(Colors.Grey.Darken1);
                            c.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Text(sale.Zahlungsart.ToString()).FontSize(10).Bold();

                            if (sale.Accessories.Any() || sale.Rabatt > 0)
                            {
                                c.Item().PaddingTop(6).Text("Preisübersicht:").FontSize(7).FontColor(Colors.Grey.Darken1);
                                c.Item().Text($"Fahrrad: {sale.Preis:N2} €").FontSize(8);
                                if (sale.Accessories.Any())
                                    c.Item().Text($"Zubehör: {sale.Accessories.Sum(a => a.Gesamtpreis):N2} €").FontSize(8);
                                if (sale.Rabatt > 0)
                                    c.Item().Text($"Rabatt: -{sale.Rabatt:N2} €").FontSize(8).FontColor(Colors.Red.Darken1);
                            }
                        });

                        // Grand Total - print-friendly border style
                        row.ConstantItem(160).AlignMiddle().Border(2).BorderColor(PrimaryColor).Padding(10).Column(c =>
                        {
                            c.Item().Text("GESAMTBETRAG").FontSize(8).FontColor(PrimaryColor).AlignCenter();
                            c.Item().Text("(inkl. MwSt.)").FontSize(6).FontColor(Colors.Grey.Darken2).AlignCenter();
                            c.Item().PaddingTop(4).Text($"{sale.Gesamtbetrag:N2} €").FontSize(20).Bold().FontColor(PrimaryColor).AlignCenter();
                        });
                    });

                    // Warranty Section - only show the relevant condition
                    col.Item().PaddingTop(8).Element(SectionHeader).Text("📋  GARANTIEBEDINGUNGEN");
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(wCol =>
                    {
                        wCol.Item().Row(wRow =>
                        {
                            wRow.ConstantItem(18).AlignCenter().Text("☑").FontSize(10).FontColor(AccentColor);
                            wRow.RelativeItem().Text(text =>
                            {
                                if (isNeu)
                                {
                                    text.Span("NEU: ").Bold().FontSize(7);
                                    text.Span(NeuWarrantyText).FontSize(7).FontColor(Colors.Grey.Darken3);
                                }
                                else
                                {
                                    text.Span("GEBRAUCHT: ").Bold().FontSize(7);
                                    text.Span(GebrauchtWarrantyText).FontSize(7).FontColor(Colors.Grey.Darken3);
                                }
                            });
                        });

                        wCol.Item().PaddingTop(4).Text(RepairNote).FontSize(6).Italic().FontColor(Colors.Grey.Darken2);
                    });

                    // Notes if present
                    if (!string.IsNullOrEmpty(sale.Notizen))
                    {
                        col.Item().PaddingTop(6).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(6).Row(row =>
                        {
                            row.ConstantItem(45).Text("Notizen:").FontSize(7).Bold();
                            row.RelativeItem().Text(sale.Notizen).FontSize(7);
                        });
                    }

                    // Seller Signature - compact, left-aligned, 1/4 width
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.ConstantItem(140).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Column(sigCol =>
                        {
                            sigCol.Item().Text("Unterschrift Verkäufer").FontSize(7).FontColor(Colors.Grey.Darken1);
                            if (sale.SellerSignature != null && !string.IsNullOrEmpty(sale.SellerSignature.SignatureData))
                            {
                                try
                                {
                                    var imageData = Convert.FromBase64String(
                                        sale.SellerSignature.SignatureData.Replace("data:image/png;base64,", ""));
                                    sigCol.Item().Height(30).Image(imageData);
                                }
                                catch { sigCol.Item().Height(30); }
                            }
                            else if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sigCol.Item().Height(30).Image(imageData);
                                }
                                catch { sigCol.Item().Height(30); }
                            }
                            else
                            {
                                sigCol.Item().Height(30);
                            }
                            sigCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            sigCol.Item().PaddingTop(2).Text(sale.SellerSignature?.SignerName ?? shop.OwnerName).FontSize(7);
                        });

                        row.RelativeItem(); // empty space to push signature left
                    });
                });

                // Footer
                page.Footer().PaddingTop(3).AlignCenter().Text($"Bank: {shop.BankName} | Kontoinhaber: {shop.BankAccountHolder} | IBAN: {shop.IBAN}").FontSize(6).FontColor(Colors.Grey.Darken1);
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GenerateRueckgabebelegAsync(int returnId)
    {
        var ret = await _returnRepository.GetWithDetailsAsync(returnId)
            ?? throw new KeyNotFoundException($"Return with ID {returnId} not found.");

        var shop = await GetShopInfoAsync();

        QuestPDF.Settings.License = LicenseType.Community;

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11));

                // Header
                page.Header().Column(col =>
                {
                    AddLogoToHeader(col, shop);
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(left =>
                        {
                            left.Item().Text(shop.ShopName).Bold().FontSize(16);
                            left.Item().Text(shop.OwnerName).FontSize(10);
                            left.Item().Text(shop.ShopType).FontSize(10);
                        });
                        row.RelativeItem().AlignRight().Column(right =>
                        {
                            right.Item().Border(1).Padding(5).Column(box =>
                            {
                                box.Item().Text("RÜCKGABEBELEG").Bold().FontSize(12);
                                box.Item().Text($"Belegnr.: {ret.BelegNummer}").FontSize(10);
                                box.Item().Text($"Datum: {ret.Rueckgabedatum:dd.MM.yyyy}").FontSize(10);
                            });
                        });
                    });
                    col.Item().PaddingTop(5).Text($"{shop.Street}, {shop.City}").FontSize(9);
                    col.Item().Text($"Tel: {shop.Telefon} | Email: {shop.Email}").FontSize(9);
                    col.Item().Text($"Steuernummer: {shop.Steuernummer} | UStIdNr: {shop.UStIdNr}").FontSize(9);
                    col.Item().PaddingTop(10).LineHorizontal(1);
                });

                // Content
                page.Content().PaddingTop(10).Column(col =>
                {
                    col.Spacing(8);

                    // Original Sale Reference
                    col.Item().Text($"Bezug auf Verkaufsbeleg: {ret.Sale.BelegNummer}").Bold();
                    col.Item().Text($"Ursprüngliches Verkaufsdatum: {ret.Sale.Verkaufsdatum:dd.MM.yyyy}");

                    col.Item().PaddingTop(10).Text("FAHRRAD-INFORMATIONEN").FontSize(12).Bold();
                    col.Item().LineHorizontal(0.5f);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn(2);
                        });

                        AddTableRow(table, "Marke:", ret.Sale.Bicycle.Marke);
                        AddTableRow(table, "Modell:", ret.Sale.Bicycle.Modell);
                        AddTableRow(table, "Rahmennummer:", ret.Sale.Bicycle.Rahmennummer);
                        AddTableRow(table, "Rahmengröße:", ret.Sale.Bicycle.Rahmengroesse ?? "-");
                        AddTableRow(table, "Farbe:", ret.Sale.Bicycle.Farbe);
                        AddTableRow(table, "Reifengröße:", ret.Sale.Bicycle.Reifengroesse);
                    });

                    col.Item().PaddingTop(10).Text("KÄUFER (RÜCKGEBER)").FontSize(12).Bold();
                    col.Item().LineHorizontal(0.5f);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn(2);
                        });

                        AddTableRow(table, "Name:", ret.Sale.Buyer.FullName);
                        if (!string.IsNullOrEmpty(ret.Sale.Buyer.FullAddress))
                            AddTableRow(table, "Adresse:", ret.Sale.Buyer.FullAddress);
                        if (!string.IsNullOrEmpty(ret.Sale.Buyer.Telefon))
                            AddTableRow(table, "Telefon:", ret.Sale.Buyer.Telefon);
                    });

                    col.Item().PaddingTop(10).Text("RÜCKGABE-DETAILS").FontSize(12).Bold();
                    col.Item().LineHorizontal(0.5f);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn(2);
                        });

                        AddTableRow(table, "Ursprünglicher Kaufpreis:", $"{ret.Sale.Preis:N2} €");
                        AddTableRow(table, "Erstattungsbetrag:", $"{ret.Erstattungsbetrag:N2} €");
                    });

                    col.Item().PaddingTop(10).Text("RÜCKGABEGRUND").FontSize(12).Bold();
                    col.Item().LineHorizontal(0.5f);
                    col.Item().Text(GetReturnReasonText(ret.Grund));
                    if (!string.IsNullOrEmpty(ret.GrundDetails))
                    {
                        col.Item().Text($"Details: {ret.GrundDetails}").FontSize(10);
                    }

                    col.Item().PaddingTop(20).Text("Das Fahrrad wurde vollständig zurückgegeben und der Erstattungsbetrag wurde ausgezahlt.");
                    col.Item().Text("Das Fahrrad ist nun wieder zum Verkauf verfügbar.");

                    // Bank Info
                    col.Item().PaddingTop(10).Text($"Bank: {shop.BankName}. {shop.BankAccountHolder} Iban : {shop.IBAN}").FontSize(8);

                    // Seller Signature
                    col.Item().PaddingTop(30).Row(row =>
                    {
                        row.RelativeItem().Column(sigCol =>
                        {
                            if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sigCol.Item().Height(50).Image(imageData);
                                }
                                catch { sigCol.Item().PaddingTop(40); }
                            }
                            else
                            {
                                sigCol.Item().PaddingTop(40);
                            }
                            sigCol.Item().LineHorizontal(1);
                            sigCol.Item().Text("Unterschrift Verkäufer").FontSize(9);
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    private static void AddTableRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Padding(3).Text(label).SemiBold();
        table.Cell().Padding(3).Text(value);
    }

    // Styled section header
    private static IContainer SectionHeader(IContainer container)
    {
        return container
            .PaddingBottom(6)
            .BorderBottom(2)
            .BorderColor(SecondaryColor);
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
}
