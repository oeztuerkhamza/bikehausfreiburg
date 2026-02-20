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

    // Brand Colors
    private static readonly string PrimaryColor = "#1a5f7a";       // Dark teal
    private static readonly string SecondaryColor = "#57c5b6";     // Light teal
    private static readonly string AccentColor = "#159895";        // Medium teal
    private static readonly string LightBg = "#f8fffe";           // Very light teal tint
    private static readonly string TableHeaderBg = "#e8f4f3";      // Light table header
    private static readonly string TableAltBg = "#f5faf9";         // Alternating row bg

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

                // Header with brand styling
                page.Header().Container().Column(col =>
                {
                    // Top bar with logo and shop name
                    col.Item().Background(PrimaryColor).Padding(15).Row(row =>
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
                                    leftCol.Item().Height(45).Image(logoBytes);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(18).Bold().FontColor(Colors.White);
                            leftCol.Item().Text(shop.ShopType).FontSize(10).FontColor(Colors.White).Light();
                        });

                        row.ConstantItem(120).AlignRight().Column(rightCol =>
                        {
                            rightCol.Item().Background(Colors.White).Padding(8).Column(box =>
                            {
                                box.Item().Text("KAUFBELEG").FontSize(12).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text(purchase.BelegNummer).FontSize(14).Bold().FontColor(PrimaryColor).AlignCenter();
                            });
                        });
                    });

                    // Contact info bar
                    col.Item().Background(TableHeaderBg).PaddingVertical(6).PaddingHorizontal(15).Row(row =>
                    {
                        row.RelativeItem().Text($"📍 {shop.Street}, {shop.City}").FontSize(8).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignCenter().Text($"📞 {shop.Telefon}").FontSize(8).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text($"✉ {shop.Email}").FontSize(8).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(15).Column(col =>
                {
                    // Date row
                    col.Item().Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(150).Background(LightBg).Border(1).BorderColor(SecondaryColor).Padding(8).Column(c =>
                        {
                            c.Item().Text("Kaufdatum").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{purchase.Kaufdatum:dd.MM.yyyy}").FontSize(14).Bold().FontColor(PrimaryColor);
                        });
                    });

                    // Section: Bicycle Info
                    col.Item().PaddingTop(15).Element(SectionHeader).Text("🚲  FAHRRAD-INFORMATIONEN");
                    col.Item().Background(LightBg).Padding(12).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(110);
                            columns.RelativeColumn();
                            columns.ConstantColumn(110);
                            columns.RelativeColumn();
                        });

                        AddStyledTableRow(table, "Marke", purchase.Bicycle.Marke, "Modell", purchase.Bicycle.Modell);
                        AddStyledTableRow(table, "Rahmennummer", purchase.Bicycle.Rahmennummer, "Farbe", purchase.Bicycle.Farbe);
                        AddStyledTableRow(table, "Reifengröße", purchase.Bicycle.Reifengroesse, "Fahrradtyp", purchase.Bicycle.Fahrradtyp ?? "-");
                        if (!string.IsNullOrEmpty(purchase.Bicycle.StokNo))
                            AddStyledTableRow(table, "Stok Nr.", purchase.Bicycle.StokNo, "", "");
                    });

                    // Section: Seller Info
                    col.Item().PaddingTop(15).Element(SectionHeader).Text("👤  VERKÄUFER (VORBESITZER)");
                    col.Item().Background(LightBg).Padding(12).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(110);
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
                    col.Item().PaddingTop(15).Element(SectionHeader).Text("💰  KAUFDETAILS");
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Background(LightBg).Padding(12).Column(c =>
                        {
                            c.Item().Text("Zahlungsart").FontSize(9).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(purchase.Zahlungsart.ToString()).FontSize(12).Bold();
                        });

                        row.ConstantItem(15);

                        row.ConstantItem(180).Background(PrimaryColor).Padding(15).Column(c =>
                        {
                            c.Item().Text("KAUFPREIS").FontSize(10).FontColor(Colors.White).Light().AlignCenter();
                            c.Item().Text($"{purchase.Preis:N2} €").FontSize(22).Bold().FontColor(Colors.White).AlignCenter();
                        });
                    });

                    // Notes if present
                    if (!string.IsNullOrEmpty(purchase.Notizen))
                    {
                        col.Item().PaddingTop(15).Element(SectionHeader).Text("📝  NOTIZEN");
                        col.Item().Background(LightBg).Padding(12).Text(purchase.Notizen).FontSize(10);
                    }

                    // Suggested Sale Price
                    if (purchase.VerkaufspreisVorschlag.HasValue && purchase.VerkaufspreisVorschlag.Value > 0)
                    {
                        col.Item().PaddingTop(10).Background(TableHeaderBg).Padding(8).Row(row =>
                        {
                            row.RelativeItem().Text("Geplanter Verkaufspreis:").FontSize(10);
                            row.ConstantItem(100).Text($"{purchase.VerkaufspreisVorschlag:N2} €").FontSize(12).Bold().FontColor(AccentColor).AlignRight();
                        });
                    }


                });

                // Footer
                page.Footer().BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(8).Column(col =>
                {
                    col.Item().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(8).FontColor(Colors.Grey.Darken1);
                    col.Item().PaddingTop(4).AlignCenter().Text($"Bank: {shop.BankName} | Kontoinhaber: {shop.BankAccountHolder} | IBAN: {shop.IBAN}").FontSize(8).FontColor(Colors.Grey.Darken1);
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
                page.Margin(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Grey.Darken4));

                // Header with professional branding
                page.Header().Container().Column(col =>
                {
                    // Top header bar
                    col.Item().Background(PrimaryColor).Padding(12).Row(row =>
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
                                    leftCol.Item().Height(35).Image(logoBytes);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(16).Bold().FontColor(Colors.White);
                            leftCol.Item().Text(shop.OwnerName).FontSize(9).FontColor(Colors.White).Light();
                        });

                        row.ConstantItem(140).AlignRight().Column(rightCol =>
                        {
                            rightCol.Item().Background(Colors.White).Padding(8).Column(box =>
                            {
                                box.Item().Text("VERKAUFSBELEG").FontSize(10).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text(sale.BelegNummer).FontSize(13).Bold().FontColor(PrimaryColor).AlignCenter();
                                box.Item().Text($"{sale.Verkaufsdatum:dd.MM.yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1).AlignCenter();
                            });
                        });
                    });

                    // Tax info bar
                    col.Item().Background(TableHeaderBg).PaddingVertical(4).PaddingHorizontal(12).Row(row =>
                    {
                        row.RelativeItem().Text($"Steuernr.: {shop.Steuernummer} | USt-IdNr.: {shop.UStIdNr}").FontSize(7).FontColor(Colors.Grey.Darken2);
                        row.RelativeItem().AlignRight().Text("Kaufvertrag nach §25a UStG – Kein gesonderter Ausweis der Umsatzsteuer").FontSize(7).FontColor(Colors.Grey.Darken2);
                    });
                });

                // Content
                page.Content().PaddingTop(10).Column(col =>
                {
                    // Seller / Buyer Row
                    col.Item().Row(row =>
                    {
                        // Seller (Shop)
                        row.RelativeItem().Background(LightBg).Padding(10).Column(leftCol =>
                        {
                            leftCol.Item().Background(PrimaryColor).Padding(4).Text("VERKÄUFER").FontSize(9).Bold().FontColor(Colors.White).AlignCenter();
                            leftCol.Item().PaddingTop(6).Text(shop.OwnerName).FontSize(10).Bold();
                            leftCol.Item().Text(shop.Street).FontSize(9);
                            leftCol.Item().Text(shop.City).FontSize(9);
                            leftCol.Item().PaddingTop(4).Text($"📞 {shop.Telefon}").FontSize(8);
                            leftCol.Item().Text($"✉ {shop.Email}").FontSize(8);
                        });

                        row.ConstantItem(10);

                        // Buyer
                        row.RelativeItem().Background(LightBg).Padding(10).Column(rightCol =>
                        {
                            rightCol.Item().Background(AccentColor).Padding(4).Text("KÄUFER").FontSize(9).Bold().FontColor(Colors.White).AlignCenter();
                            rightCol.Item().PaddingTop(6).Text(sale.Buyer.FullName).FontSize(10).Bold();
                            rightCol.Item().Text($"{sale.Buyer.Strasse} {sale.Buyer.Hausnummer}").FontSize(9);
                            rightCol.Item().Text($"{sale.Buyer.PLZ} {sale.Buyer.Stadt}").FontSize(9);
                            if (!string.IsNullOrEmpty(sale.Buyer.Telefon))
                                rightCol.Item().PaddingTop(4).Text($"📞 {sale.Buyer.Telefon}").FontSize(8);
                            if (!string.IsNullOrEmpty(sale.Buyer.Email))
                                rightCol.Item().Text($"✉ {sale.Buyer.Email}").FontSize(8);
                        });
                    });

                    // Bicycle Info Section
                    col.Item().PaddingTop(12).Element(SectionHeader).Text("🚲  FAHRRAD-DETAILS");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        // Header row
                        table.Cell().Background(PrimaryColor).Padding(5).Text("Marke").FontSize(8).Bold().FontColor(Colors.White);
                        table.Cell().Background(TableHeaderBg).Padding(5).Text(sale.Bicycle.Marke).FontSize(9).Bold();
                        table.Cell().Background(PrimaryColor).Padding(5).Text("Rahmennummer").FontSize(8).Bold().FontColor(Colors.White);
                        table.Cell().Background(TableHeaderBg).Padding(5).Text(sale.Bicycle.Rahmennummer).FontSize(9).Bold();

                        table.Cell().Background(TableAltBg).Padding(5).Text("Modell").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(sale.Bicycle.Modell).FontSize(9);
                        table.Cell().Background(TableAltBg).Padding(5).Text("Farbe").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(sale.Bicycle.Farbe).FontSize(9);

                        table.Cell().Background(TableAltBg).Padding(5).Text("Reifengröße").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(sale.Bicycle.Reifengroesse).FontSize(9);
                        table.Cell().Background(TableAltBg).Padding(5).Text("Fahrradtyp").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(sale.Bicycle.Fahrradtyp ?? "-").FontSize(9);

                        table.Cell().Background(TableAltBg).Padding(5).Text("Zustand").FontSize(8).FontColor(Colors.Grey.Darken2);
                        if (isNeu)
                            table.Cell().Background("#d4edda").Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text("NEU").FontSize(9).Bold().FontColor("#155724");
                        else
                            table.Cell().Background("#fff3cd").Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text("GEBRAUCHT").FontSize(9).Bold().FontColor("#856404");
                        table.Cell().Background(TableAltBg).Padding(5).Text("Stok Nr.").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Background(Colors.White).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(sale.Bicycle.StokNo ?? "-").FontSize(9);
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
                                columns.ConstantColumn(70);
                                columns.ConstantColumn(50);
                                columns.ConstantColumn(80);
                            });

                            // Header
                            table.Cell().Background(PrimaryColor).Padding(5).Text("Bezeichnung").FontSize(8).Bold().FontColor(Colors.White);
                            table.Cell().Background(PrimaryColor).Padding(5).Text("Einzelpreis").FontSize(8).Bold().FontColor(Colors.White).AlignRight();
                            table.Cell().Background(PrimaryColor).Padding(5).Text("Menge").FontSize(8).Bold().FontColor(Colors.White).AlignCenter();
                            table.Cell().Background(PrimaryColor).Padding(5).Text("Gesamt").FontSize(8).Bold().FontColor(Colors.White).AlignRight();

                            var rowAlt = false;
                            foreach (var accessory in sale.Accessories)
                            {
                                var bgColor = rowAlt ? TableAltBg : "#ffffff";
                                table.Cell().Background(bgColor).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(accessory.Bezeichnung).FontSize(9);
                                table.Cell().Background(bgColor).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{accessory.Preis:N2} €").FontSize(9).AlignRight();
                                table.Cell().Background(bgColor).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(accessory.Menge.ToString()).FontSize(9).AlignCenter();
                                table.Cell().Background(bgColor).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{accessory.Gesamtpreis:N2} €").FontSize(9).AlignRight();
                                rowAlt = !rowAlt;
                            }

                            // Total row
                            var accessoriesTotal = sale.Accessories.Sum(a => a.Gesamtpreis);
                            table.Cell().ColumnSpan(3).Background(TableHeaderBg).Padding(5).Text("Zubehör Summe:").FontSize(9).Bold().AlignRight();
                            table.Cell().Background(TableHeaderBg).Padding(5).Text($"{accessoriesTotal:N2} €").FontSize(9).Bold().AlignRight();
                        });
                    }

                    // Payment and Total Section
                    col.Item().PaddingTop(12).Row(row =>
                    {
                        // Payment method
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Zahlungsart:").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Background(LightBg).Padding(8).Text(sale.Zahlungsart.ToString()).FontSize(11).Bold();

                            if (sale.Accessories.Any() || sale.Rabatt > 0)
                            {
                                c.Item().PaddingTop(8).Text("Preisübersicht:").FontSize(8).FontColor(Colors.Grey.Darken1);
                                c.Item().Text($"Fahrrad: {sale.Preis:N2} €").FontSize(9);
                                if (sale.Accessories.Any())
                                    c.Item().Text($"Zubehör: {sale.Accessories.Sum(a => a.Gesamtpreis):N2} €").FontSize(9);
                                if (sale.Rabatt > 0)
                                    c.Item().Text($"Rabatt: -{sale.Rabatt:N2} €").FontSize(9).FontColor(Colors.Red.Darken1);
                            }
                        });

                        // Grand Total
                        row.ConstantItem(180).Background(PrimaryColor).Padding(15).Column(c =>
                        {
                            c.Item().Text("GESAMTBETRAG").FontSize(9).FontColor(Colors.White).Light().AlignCenter();
                            c.Item().Text("(inkl. MwSt.)").FontSize(7).FontColor(Colors.White).Light().AlignCenter();
                            c.Item().PaddingTop(5).Text($"{sale.Gesamtbetrag:N2} €").FontSize(24).Bold().FontColor(Colors.White).AlignCenter();
                        });
                    });

                    // Warranty Section
                    col.Item().PaddingTop(12).Element(SectionHeader).Text("📋  GARANTIEBEDINGUNGEN");
                    col.Item().Background(LightBg).Padding(10).Column(wCol =>
                    {
                        // New warranty
                        wCol.Item().Row(wRow =>
                        {
                            if (isNeu)
                                wRow.ConstantItem(20).AlignCenter().Text("☑").FontSize(12).FontColor(AccentColor);
                            else
                                wRow.ConstantItem(20).AlignCenter().Text("☐").FontSize(12).FontColor(Colors.Grey.Lighten1);
                            wRow.RelativeItem().Text(text =>
                            {
                                text.Span("NEU: ").Bold().FontSize(8);
                                if (isNeu)
                                    text.Span(NeuWarrantyText).FontSize(8).FontColor(Colors.Grey.Darken3);
                                else
                                    text.Span(NeuWarrantyText).FontSize(8).FontColor(Colors.Grey.Lighten1);
                            });
                        });

                        wCol.Item().PaddingTop(6);

                        // Used warranty
                        wCol.Item().Row(wRow =>
                        {
                            if (!isNeu)
                                wRow.ConstantItem(20).AlignCenter().Text("☑").FontSize(12).FontColor(AccentColor);
                            else
                                wRow.ConstantItem(20).AlignCenter().Text("☐").FontSize(12).FontColor(Colors.Grey.Lighten1);
                            wRow.RelativeItem().Text(text =>
                            {
                                text.Span("GEBRAUCHT: ").Bold().FontSize(8);
                                if (!isNeu)
                                    text.Span(GebrauchtWarrantyText).FontSize(8).FontColor(Colors.Grey.Darken3);
                                else
                                    text.Span(GebrauchtWarrantyText).FontSize(8).FontColor(Colors.Grey.Lighten1);
                            });
                        });

                        wCol.Item().PaddingTop(6).Text(RepairNote).FontSize(7).Italic().FontColor(Colors.Grey.Darken2);
                    });

                    // Notes if present
                    if (!string.IsNullOrEmpty(sale.Notizen))
                    {
                        col.Item().PaddingTop(8).Background(TableAltBg).Padding(8).Row(row =>
                        {
                            row.ConstantItem(50).Text("Notizen:").FontSize(8).Bold();
                            row.RelativeItem().Text(sale.Notizen).FontSize(8);
                        });
                    }

                    // Seller Signature
                    col.Item().PaddingTop(15).Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(sigCol =>
                        {
                            sigCol.Item().Text("Unterschrift Verkäufer").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                            if (sale.SellerSignature != null && !string.IsNullOrEmpty(sale.SellerSignature.SignatureData))
                            {
                                try
                                {
                                    var imageData = Convert.FromBase64String(
                                        sale.SellerSignature.SignatureData.Replace("data:image/png;base64,", ""));
                                    sigCol.Item().AlignCenter().Height(45).Image(imageData);
                                }
                                catch { sigCol.Item().Height(45); }
                            }
                            else if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sigCol.Item().AlignCenter().Height(45).Image(imageData);
                                }
                                catch { sigCol.Item().Height(45); }
                            }
                            else
                            {
                                sigCol.Item().Height(45);
                            }
                            sigCol.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                            sigCol.Item().PaddingTop(3).Text(sale.SellerSignature?.SignerName ?? shop.OwnerName).FontSize(8).AlignCenter();
                        });
                    });
                });

                // Footer
                page.Footer().PaddingTop(5).AlignCenter().Text($"Bank: {shop.BankName} | Kontoinhaber: {shop.BankAccountHolder} | IBAN: {shop.IBAN}").FontSize(7).FontColor(Colors.Grey.Darken1);
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
