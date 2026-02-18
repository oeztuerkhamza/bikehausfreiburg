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
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11));

                // Header
                page.Header().Column(col =>
                {
                    AddLogoToHeader(col, shop);
                    col.Item().Text("KAUFBELEG").FontSize(24).Bold().AlignCenter();
                    col.Item().Text(shop.ShopName).FontSize(14).AlignCenter();
                    col.Item().PaddingBottom(10).LineHorizontal(1);
                });

                // Content
                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    // Receipt Info
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text($"Belegnummer: {purchase.BelegNummer}").Bold();
                        row.RelativeItem().Text($"Datum: {purchase.Kaufdatum:dd.MM.yyyy}").AlignRight();
                    });

                    col.Item().PaddingTop(10).Text("FAHRRAD-INFORMATIONEN").FontSize(13).Bold();
                    col.Item().LineHorizontal(0.5f);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn(2);
                        });

                        AddTableRow(table, "Marke:", purchase.Bicycle.Marke);
                        AddTableRow(table, "Modell:", purchase.Bicycle.Modell);
                        AddTableRow(table, "Rahmennummer:", purchase.Bicycle.Rahmennummer);
                        AddTableRow(table, "Farbe:", purchase.Bicycle.Farbe);
                        AddTableRow(table, "Reifengröße:", purchase.Bicycle.Reifengroesse);
                    });

                    col.Item().PaddingTop(10).Text("VERKÄUFER").FontSize(13).Bold();
                    col.Item().LineHorizontal(0.5f);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn(2);
                        });

                        AddTableRow(table, "Name:", purchase.Seller.FullName);
                        if (purchase.Seller.FullAddress != null)
                            AddTableRow(table, "Adresse:", purchase.Seller.FullAddress);
                        if (purchase.Seller.Telefon != null)
                            AddTableRow(table, "Telefon:", purchase.Seller.Telefon);
                    });

                    col.Item().PaddingTop(10).Text("KAUFDETAILS").FontSize(13).Bold();
                    col.Item().LineHorizontal(0.5f);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn(2);
                        });

                        AddTableRow(table, "Preis:", $"{purchase.Preis:N2} €");
                        AddTableRow(table, "Zahlungsart:", purchase.Zahlungsart.ToString());
                    });

                    if (!string.IsNullOrEmpty(purchase.Notizen))
                    {
                        col.Item().PaddingTop(10).Text("Notizen:").Bold();
                        col.Item().Text(purchase.Notizen);
                    }

                    // Signature area
                    if (purchase.Signature != null)
                    {
                        col.Item().PaddingTop(30).Row(row =>
                        {
                            row.RelativeItem().Column(sigCol =>
                            {
                                sigCol.Item().Text("Unterschrift Verkäufer:").FontSize(10);
                                if (!string.IsNullOrEmpty(purchase.Signature.SignatureData))
                                {
                                    var imageData = Convert.FromBase64String(
                                        purchase.Signature.SignatureData.Replace("data:image/png;base64,", ""));
                                    sigCol.Item().Height(60).Image(imageData);
                                }
                                sigCol.Item().LineHorizontal(1);
                                sigCol.Item().Text(purchase.Signature.SignerName).FontSize(9);
                            });

                            row.RelativeItem().Column(sigCol =>
                            {
                                sigCol.Item().Text("Unterschrift Käufer:").FontSize(10);
                                sigCol.Item().PaddingTop(60).LineHorizontal(1);
                                sigCol.Item().Text("Bike Haus Freiburg").FontSize(9);
                            });
                        });
                    }
                });

                // Footer
                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span($"{shop.ShopName} | ");
                    text.Span($"Erstellt am {DateTime.Now:dd.MM.yyyy HH:mm}");
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
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                // Header with shop info
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(leftCol =>
                        {
                            // Logo in header
                            if (!string.IsNullOrEmpty(shop.LogoBase64))
                            {
                                try
                                {
                                    var base64Data = shop.LogoBase64;
                                    if (base64Data.Contains(","))
                                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                                    var logoBytes = Convert.FromBase64String(base64Data);
                                    leftCol.Item().Height(40).Image(logoBytes);
                                    leftCol.Item().PaddingBottom(3);
                                }
                                catch { }
                            }
                            leftCol.Item().Text(shop.ShopName).FontSize(14).Bold();
                            leftCol.Item().Text(shop.OwnerName).FontSize(11);
                            leftCol.Item().Text(shop.ShopType).FontSize(11);
                            leftCol.Item().PaddingTop(5).Text($"Steuernummer:{shop.Steuernummer}").FontSize(9);
                            leftCol.Item().Text(shop.UStIdNr).FontSize(9);
                            leftCol.Item().PaddingTop(3).Text("Kaufvertrag und Rechnung für ein gebrauchtes Kraftfahrzeug nach §25a UStG-Kein").FontSize(8);
                            leftCol.Item().Text("gesonderter Ausweis der Umsatzsteuer.").FontSize(8);
                        });
                        row.ConstantItem(100).Column(rightCol =>
                        {
                            rightCol.Item().Border(1).Padding(5).Text($"Rechnungsnummer:").FontSize(9);
                            rightCol.Item().Border(1).Padding(10).Text(sale.BelegNummer).FontSize(16).Bold().AlignCenter();
                        });
                    });

                    col.Item().PaddingTop(10).LineHorizontal(1);
                });

                // Content
                page.Content().PaddingTop(10).Column(col =>
                {
                    // Verkäufer / Käufer Row
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(leftCol =>
                        {
                            leftCol.Item().Text("Verkäufer:").Bold();
                            leftCol.Item().Text(shop.OwnerName);
                            leftCol.Item().Text(shop.Street);
                            leftCol.Item().Text(shop.City);
                            leftCol.Item().Text($"Email: {shop.Email}");
                            leftCol.Item().Text($"Tel. nummer:{shop.Telefon}");
                        });
                        row.RelativeItem().Column(rightCol =>
                        {
                            rightCol.Item().Text("Käufer:").Bold();
                            rightCol.Item().Text($"(Vor- und Nachname): {sale.Buyer.FullName}");
                            rightCol.Item().Text($"(Straße, Hausnummer): {sale.Buyer.Strasse} {sale.Buyer.Hausnummer}");
                            rightCol.Item().Text($"(PLZ, Ort): {sale.Buyer.PLZ} {sale.Buyer.Stadt}");
                        });
                    });

                    col.Item().PaddingTop(10).LineHorizontal(0.5f);

                    // Fahrrad Info Table
                    col.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        // Row 1: Marke / Serienummer
                        table.Cell().Border(0.5f).Padding(3).Text("Fahrrad-Marke").FontSize(9);
                        table.Cell().Border(0.5f).Padding(3).Text(sale.Bicycle.Marke);
                        table.Cell().Border(0.5f).Padding(3).Text("Serienummer").FontSize(9);
                        table.Cell().Border(0.5f).Padding(3).Text(sale.Bicycle.Rahmennummer);

                        // Row 2: Modell / Rahmenfarbe
                        table.Cell().Border(0.5f).Padding(3).Text("Fahrrad-Modell").FontSize(9);
                        table.Cell().Border(0.5f).Padding(3).Text(sale.Bicycle.Modell);
                        table.Cell().Border(0.5f).Padding(3).Text("Rahmenfarbe").FontSize(9);
                        table.Cell().Border(0.5f).Padding(3).Text(sale.Bicycle.Farbe);

                        // Row 3: Zoll / Fahrradtyp
                        table.Cell().Border(0.5f).Padding(3).Text("Zoll / stok no").FontSize(9);
                        table.Cell().Border(0.5f).Padding(3).Text(sale.Bicycle.Reifengroesse);
                        table.Cell().Border(0.5f).Padding(3).Text("Fahrradtyp").FontSize(9);
                        table.Cell().Border(0.5f).Padding(3).Text(sale.Bicycle.Fahrradtyp ?? "-");
                    });

                    // Description / Features (Ausstattung)
                    if (!string.IsNullOrEmpty(sale.Bicycle.Beschreibung))
                    {
                        col.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn();
                                columns.ConstantColumn(60);
                            });

                            var lines = sale.Bicycle.Beschreibung.Split('\n');
                            var lineNumber = 1;
                            foreach (var line in lines.Take(5))
                            {
                                table.Cell().Border(0.5f).Padding(2).Text(lineNumber.ToString()).FontSize(9);
                                table.Cell().Border(0.5f).Padding(2).Text(line.Trim()).FontSize(9);
                                table.Cell().Border(0.5f).Padding(2).Text("€").FontSize(9).AlignRight();
                                lineNumber++;
                            }
                            // Fill remaining rows if less than 5
                            while (lineNumber <= 5)
                            {
                                table.Cell().Border(0.5f).Padding(2).Text(lineNumber.ToString()).FontSize(9);
                                table.Cell().Border(0.5f).Padding(2).Text("");
                                table.Cell().Border(0.5f).Padding(2).Text("€").FontSize(9).AlignRight();
                                lineNumber++;
                            }
                        });
                    }

                    // Accessories Table (Zubehör)
                    if (sale.Accessories.Any())
                    {
                        col.Item().PaddingTop(10).Text("Zubehör:").Bold();
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(60);
                                columns.ConstantColumn(50);
                                columns.ConstantColumn(80);
                            });

                            // Header
                            table.Cell().Border(0.5f).Background("#f0f0f0").Padding(3).Text("Bezeichnung").FontSize(9).Bold();
                            table.Cell().Border(0.5f).Background("#f0f0f0").Padding(3).Text("Preis").FontSize(9).Bold().AlignRight();
                            table.Cell().Border(0.5f).Background("#f0f0f0").Padding(3).Text("Menge").FontSize(9).Bold().AlignCenter();
                            table.Cell().Border(0.5f).Background("#f0f0f0").Padding(3).Text("Gesamt").FontSize(9).Bold().AlignRight();

                            foreach (var accessory in sale.Accessories)
                            {
                                table.Cell().Border(0.5f).Padding(3).Text(accessory.Bezeichnung).FontSize(9);
                                table.Cell().Border(0.5f).Padding(3).Text($"{accessory.Preis:N2} €").FontSize(9).AlignRight();
                                table.Cell().Border(0.5f).Padding(3).Text(accessory.Menge.ToString()).FontSize(9).AlignCenter();
                                table.Cell().Border(0.5f).Padding(3).Text($"{accessory.Gesamtpreis:N2} €").FontSize(9).AlignRight();
                            }

                            // Zubehör Summe
                            var accessoriesTotal = sale.Accessories.Sum(a => a.Gesamtpreis);
                            table.Cell().ColumnSpan(3).Border(0.5f).Padding(3).Text("Zubehör Summe:").FontSize(9).Bold().AlignRight();
                            table.Cell().Border(0.5f).Padding(3).Text($"{accessoriesTotal:N2} €").FontSize(9).Bold().AlignRight();
                        });
                    }

                    // Price and Payment
                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Zahlungsart:").Bold();
                            c.Item().Text(sale.Zahlungsart.ToString());
                            if (sale.Accessories.Any())
                            {
                                c.Item().PaddingTop(5).Text($"Fahrradpreis: {sale.Preis:N2} €").FontSize(9);
                                c.Item().Text($"Zubehör: {sale.Accessories.Sum(a => a.Gesamtpreis):N2} €").FontSize(9);
                            }
                        });
                        row.ConstantItem(150).Border(1).Padding(5).Column(c =>
                        {
                            c.Item().Text("Bruttobetrag (inkl.MwSt)").FontSize(9);
                            c.Item().Text($"{sale.Gesamtbetrag:N2} €").FontSize(14).Bold();
                        });
                    });

                    // Warranty section with checkbox style
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.ConstantItem(15).Text(isNeu ? "☑" : "☐").FontSize(12);
                        row.RelativeItem().Text(text =>
                        {
                            text.Span("Neu: ").Bold();
                            text.Span(NeuWarrantyText).FontSize(9);
                        });
                    });

                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.ConstantItem(15).Text(!isNeu ? "☑" : "☐").FontSize(12);
                        row.RelativeItem().Text(text =>
                        {
                            text.Span("").Bold();
                            text.Span(GebrauchtWarrantyText).FontSize(9);
                        });
                    });

                    col.Item().PaddingTop(5).Text(RepairNote).FontSize(8).Italic();

                    // Bank Info
                    col.Item().PaddingTop(5).Text($"Bank: {shop.BankName}. {shop.BankAccountHolder} Iban : {shop.IBAN}").FontSize(8);

                    // Date and Signatures
                    col.Item().PaddingTop(15).Text($"Datum:  {sale.Verkaufsdatum:dd.MM.yyyy}");

                    col.Item().PaddingTop(20).Row(row =>
                    {
                        row.RelativeItem().Column(sigCol =>
                        {
                            if (sale.SellerSignature != null && !string.IsNullOrEmpty(sale.SellerSignature.SignatureData))
                            {
                                var imageData = Convert.FromBase64String(
                                    sale.SellerSignature.SignatureData.Replace("data:image/png;base64,", ""));
                                sigCol.Item().Height(50).Image(imageData);
                            }
                            else if (!string.IsNullOrEmpty(shop.OwnerSignatureBase64))
                            {
                                try
                                {
                                    var sigData = shop.OwnerSignatureBase64;
                                    if (sigData.Contains(","))
                                        sigData = sigData.Substring(sigData.IndexOf(",") + 1);
                                    var imageData = Convert.FromBase64String(sigData);
                                    sigCol.Item().Height(50).Image(imageData);
                                }
                                catch { sigCol.Item().PaddingTop(50); }
                            }
                            else
                            {
                                sigCol.Item().PaddingTop(50);
                            }
                            sigCol.Item().LineHorizontal(1);
                            sigCol.Item().Text("Unterschrift des Verkäufers").FontSize(9);
                        });

                        row.ConstantItem(50);

                        row.RelativeItem().Column(sigCol =>
                        {
                            if (sale.BuyerSignature != null && !string.IsNullOrEmpty(sale.BuyerSignature.SignatureData))
                            {
                                var imageData = Convert.FromBase64String(
                                    sale.BuyerSignature.SignatureData.Replace("data:image/png;base64,", ""));
                                sigCol.Item().Height(50).Image(imageData);
                            }
                            else
                            {
                                sigCol.Item().PaddingTop(50);
                            }
                            sigCol.Item().LineHorizontal(1);
                            sigCol.Item().Text("Unterschrift des Käufers").FontSize(9);
                        });
                    });
                });

                // No footer needed - all info is in header
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

                    // Signatures
                    col.Item().PaddingTop(30).Row(row =>
                    {
                        row.RelativeItem().Column(sigCol =>
                        {
                            sigCol.Item().PaddingTop(40).LineHorizontal(1);
                            sigCol.Item().Text("Unterschrift Käufer (Rückgeber)").FontSize(9);
                        });

                        row.ConstantItem(50);

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
