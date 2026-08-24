using BikeHaus.Application.DTOs;
using BikeHaus.Application.Services;
using BikeHaus.Domain.Entities;

namespace BikeHaus.Application.Mappings;

public static class MappingExtensions
{
    // ── Bicycle Mappings ──
    public static BicycleDto ToDto(this Bicycle entity) => new(
        entity.Id,
        entity.Marke,
        entity.Modell,
        entity.Rahmennummer,
        entity.Rahmengroesse,
        entity.Farbe,
        entity.Reifengroesse,
        entity.Fahrradtyp,
        entity.Art,
        entity.Beschreibung,
        entity.Status,
        entity.Zustand,
        entity.IsRentable,
        entity.RentalPriceDay1,
        entity.RentalPriceDay2,
        entity.RentalPriceDay3,
        entity.RentalPriceDay4,
        entity.RentalPriceDay5,
        entity.RentalPriceDay6,
        entity.RentalPriceDay7,
        entity.RentalPriceAdditionalDayAfter7,
        entity.Kaution,
        entity.IsPublishedOnWebsite,
        entity.IsPublishedOnKleinanzeigen,
        entity.VerkaufspreisVorschlag,
        entity.KleinanzeigenAnzeigeNr,
        entity.CreatedAt,
        entity.Images?.OrderBy(i => i.SortOrder).Select(i => i.ToDto()).ToList(),
        entity.Lagernummer,
        entity.Fahrradnummer,
        entity.KoerpergroesseVonCm,
        entity.KoerpergroesseBisCm,
        entity.Gangschaltung
    );

    public static BicycleImageDto ToDto(this BicycleImage entity) => new(
        entity.Id,
        entity.BicycleId,
        entity.FilePath,
        entity.SortOrder
    );

    public static PublicBicycleDto ToPublicDto(this Bicycle entity) => new(
        entity.Id,
        entity.Marke,
        entity.Modell,
        entity.Farbe,
        entity.Reifengroesse,
        entity.Fahrradtyp,
        entity.Art,
        entity.Beschreibung,
        entity.Rahmengroesse,
        entity.Zustand,
        entity.VerkaufspreisVorschlag,
        entity.CreatedAt,
        entity.Images?.OrderBy(i => i.SortOrder).Select(i => i.ToDto()).ToList() ?? new List<BicycleImageDto>(),
        entity.Gangschaltung
    );

    public static Bicycle ToEntity(this BicycleCreateDto dto) => new()
    {
        Marke = dto.Marke,
        Modell = dto.Modell!,
        Rahmennummer = dto.Rahmennummer,
        Rahmengroesse = dto.Rahmengroesse,
        Farbe = dto.Farbe,
        Reifengroesse = dto.Reifengroesse,
        Fahrradtyp = dto.Fahrradtyp,
        Art = dto.Art,
        Beschreibung = dto.Beschreibung,
        Gangschaltung = dto.Gangschaltung,
        Zustand = dto.Zustand,
        IsRentable = dto.IsRentable,
        RentalPriceDay1 = dto.RentalPriceDay1,
        RentalPriceDay2 = dto.RentalPriceDay2,
        RentalPriceDay3 = dto.RentalPriceDay3,
        RentalPriceDay4 = dto.RentalPriceDay4,
        RentalPriceDay5 = dto.RentalPriceDay5,
        RentalPriceDay6 = dto.RentalPriceDay6,
        RentalPriceDay7 = dto.RentalPriceDay7,
        RentalPriceAdditionalDayAfter7 = dto.RentalPriceAdditionalDayAfter7,
        Kaution = dto.Kaution,
        Lagernummer = dto.Lagernummer,
        VerkaufspreisVorschlag = dto.VerkaufspreisVorschlag,
        Fahrradnummer = dto.Fahrradnummer,
        KoerpergroesseVonCm = dto.KoerpergroesseVonCm,
        KoerpergroesseBisCm = dto.KoerpergroesseBisCm
    };

    public static PublicRentalBicycleDto ToPublicRentalDto(this Bicycle entity) => new(
        entity.Id,
        entity.Marke,
        entity.Modell,
        entity.Rahmennummer,
        entity.Farbe,
        entity.Reifengroesse,
        entity.Fahrradtyp,
        entity.Art,
        entity.Beschreibung,
        entity.Rahmengroesse,
        entity.Kaution,
        entity.Images?.OrderBy(i => i.SortOrder).Select(i => i.ToDto()).ToList() ?? new List<BicycleImageDto>(),
        new RentalPriceDto(
            entity.RentalPriceDay1,
            entity.RentalPriceDay2,
            entity.RentalPriceDay3,
            entity.RentalPriceDay4,
            entity.RentalPriceDay5,
            entity.RentalPriceDay6,
            entity.RentalPriceDay7,
            entity.RentalPriceAdditionalDayAfter7
        ),
        entity.KoerpergroesseVonCm,
        entity.KoerpergroesseBisCm
    );

    // ── Customer Mappings ──
    public static CustomerDto ToDto(this Customer entity) => new(
        entity.Id,
        entity.Vorname,
        entity.Nachname,
        entity.Strasse,
        entity.Hausnummer,
        entity.PLZ,
        entity.Stadt,
        entity.Telefon,
        entity.Email,
        entity.Steuernummer,
        entity.FullName,
        entity.FullAddress
    );

    public static Customer ToEntity(this CustomerCreateDto dto) => new()
    {
        Vorname = dto.Vorname,
        Nachname = dto.Nachname,
        Strasse = dto.Strasse,
        Hausnummer = dto.Hausnummer,
        PLZ = dto.PLZ,
        Stadt = dto.Stadt,
        Telefon = dto.Telefon,
        Email = dto.Email,
        Steuernummer = dto.Steuernummer
    };

    // ── Purchase Mappings ──
    public static PurchaseDto ToDto(this Purchase entity) => new(
        entity.Id,
        entity.BelegNummer,
        entity.AnzeigeNr,
        entity.Bicycle.ToDto(),
        entity.Seller?.ToDto(),
        entity.Preis,
        entity.VerkaufspreisVorschlag,
        entity.Zahlungsart,
        entity.Kaufdatum,
        entity.Notizen,
        entity.Signature?.ToDto(),
        entity.CreatedAt
    );

    public static PurchaseListDto ToListDto(this Purchase entity) => new(
        entity.Id,
        entity.BelegNummer,
        $"{entity.Bicycle.Marke} {entity.Bicycle.Modell}",
        entity.Bicycle.Rahmennummer,
        entity.Bicycle.Lagernummer,
        entity.Seller?.FullName,
        entity.Preis,
        entity.VerkaufspreisVorschlag,
        entity.Zahlungsart,
        entity.Kaufdatum,
        entity.Sale != null,
        entity.Bicycle.Marke,
        entity.Bicycle.Reifengroesse,
        entity.Bicycle.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.FilePath,
        entity.Bicycle.Images.Count
    );

    // ── Sale Mappings ──
    public static SaleDto ToDto(this Sale entity) => new(
        entity.Id,
        entity.BelegNummer,
        entity.Bicycle.ToDto(),
        entity.Buyer.ToDto(),
        entity.PurchaseId,
        entity.Preis,
        entity.Zahlungsart,
        entity.Verkaufsdatum,
        entity.Garantie,
        entity.GarantieBedingungen,
        entity.Notizen,
        entity.BuyerSignature?.ToDto(),
        entity.SellerSignature?.ToDto(),
        entity.Accessories.Select(a => a.ToDto()).ToList(),
        entity.Zahlungen.Select(z => z.ToDto()).ToList(),
        entity.Rabatt,
        entity.Gesamtbetrag,
        // Effective Ankauf: linked Purchase wins, else the sale-level fallback.
        entity.Purchase != null ? entity.Purchase.Preis : entity.AnkaufPreis,
        entity.Purchase != null ? entity.Purchase.Kaufdatum : entity.AnkaufDatum,
        entity.CreatedAt
    );

    public static SaleListDto ToListDto(this Sale entity) => new(
        entity.Id,
        entity.BelegNummer,
        entity.BicycleId,
        entity.PurchaseId,
        $"{entity.Bicycle.Marke} {entity.Bicycle.Modell}",
        entity.Bicycle.Rahmennummer,
        entity.Bicycle.Lagernummer,
        entity.Bicycle.Reifengroesse,
        entity.Buyer.FullName,
        entity.Preis,
        entity.Gesamtbetrag,
        entity.Rabatt,
        entity.Zahlungsart,
        entity.Zahlungen.Select(z => z.ToDto()).ToList(),
        entity.Verkaufsdatum,
        entity.Garantie,
        entity.Bicycle.Zustand
    );

    // ── SaleAccessory Mappings ──
    public static SaleAccessoryDto ToDto(this SaleAccessory entity) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Preis,
        entity.Menge,
        entity.Gesamtpreis
    );

    // ── SalePayment Mappings ──
    public static SalePaymentDto ToDto(this SalePayment entity) => new(
        entity.Id,
        entity.Zahlungsart,
        entity.Betrag,
        entity.RatenMonate,
        entity.MonatsRate
    );

    public static SaleAccessory ToEntity(this SaleAccessoryCreateDto dto, int saleId) => new()
    {
        SaleId = saleId,
        Bezeichnung = dto.Bezeichnung,
        Preis = dto.Preis,
        Menge = dto.Menge
    };

    // ── Signature Mappings ──
    public static SignatureDto ToDto(this Signature entity) => new(
        entity.Id,
        entity.SignatureData,
        entity.SignerName,
        entity.SignatureType,
        entity.SignedAt
    );

    public static Signature ToEntity(this SignatureCreateDto dto) => new()
    {
        SignatureData = dto.SignatureData,
        SignerName = dto.SignerName,
        SignatureType = dto.SignatureType
    };

    // ── Document Mappings ──
    public static DocumentDto ToDto(this Document entity) => new(
        entity.Id,
        entity.FileName,
        entity.ContentType,
        entity.FileSize,
        entity.DocumentType,
        entity.BicycleId,
        entity.PurchaseId,
        entity.SaleId,
        entity.CreatedAt
    );

    // ── Return Mappings ──
    public static ReturnDto ToDto(this Return entity) => new(
        entity.Id,
        entity.BelegNummer,
        entity.Sale.ToDto(),
        entity.Bicycle.ToDto(),
        entity.Customer.ToDto(),
        entity.Rueckgabedatum,
        entity.Grund,
        entity.GrundDetails,
        entity.Erstattungsbetrag,
        entity.Zahlungsart,
        entity.Notizen,
        entity.CustomerSignature?.ToDto(),
        entity.ShopSignature?.ToDto(),
        entity.CreatedAt
    );

    public static ReturnListDto ToListDto(this Return entity) => new(
        entity.Id,
        entity.BelegNummer,
        $"{entity.Bicycle.Marke} {entity.Bicycle.Modell}",
        entity.Customer.FullName,
        entity.Sale.BelegNummer,
        entity.Rueckgabedatum,
        entity.Grund,
        entity.Erstattungsbetrag
    );

    // ── Reservation Mappings ──
    public static ReservationDto ToDto(this Reservation entity) => new(
        entity.Id,
        entity.ReservierungsNummer,
        entity.Bicycle.ToDto(),
        entity.Customer.ToDto(),
        entity.ReservierungsDatum,
        entity.AblaufDatum,
        entity.Anzahlung,
        entity.Notizen,
        entity.Status,
        entity.SaleId,
        entity.CreatedAt,
        entity.AblaufDatum < DateTime.UtcNow && entity.Status == Domain.Enums.ReservationStatus.Active,
        entity.AnzahlungZahlungsart,
        entity.Verkaufspreis,
        entity.Verkaufspreis.HasValue
            ? entity.Verkaufspreis.Value - (entity.Anzahlung ?? 0m)
            : null,
        entity.KundenUnterschrift
    );

    // ── RentalAccessory Mappings ──
    public static RentalAccessoryDto ToDto(this RentalAccessory entity) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Tagespreis,
        entity.Verlustgebuehr,
        entity.Aktiv,
        entity.Beschreibung,
        entity.BildPfad,
        entity.Einmalig,
        entity.CreatedAt
    );

    public static RentalAccessoryListDto ToListDto(this RentalAccessory entity) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Tagespreis,
        entity.Verlustgebuehr,
        entity.Aktiv,
        entity.Beschreibung,
        entity.BildPfad,
        entity.Einmalig,
        entity.CreatedAt
    );

    // ── RentalBooking Mappings ──
    /// <summary>Zubehör-Zeilensumme: Tagespreis × Menge × Miettage — bei einmaligen
    /// Positionen ohne die Miettage (siehe RentalPricingCalculator.LineTotal).</summary>
    private static int InclusiveRentalDays(DateTime start, DateTime end)
        => Math.Max(1, (end.Date - start.Date).Days + 1);

    public static RentalBookingAccessoryDto ToDto(this RentalBookingAccessory entity, int days) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Tagespreis,
        entity.Menge,
        entity.LineTotal(days),
        entity.RentalAccessoryId,
        entity.Einmalig
    );

    public static RentalBookingBikeDto ToDto(this RentalBookingBike entity) => new(
        entity.Id,
        entity.BicycleId,
        entity.Bicycle?.Marke ?? string.Empty,
        entity.Bicycle?.Modell ?? string.Empty,
        entity.Rahmennummer,
        entity.Farbe,
        entity.Bicycle?.Rahmengroesse,
        entity.Bicycle?.Art,
        entity.Kaution,
        entity.StartDatum,
        entity.EndDatum,
        entity.Gesamtpreis
    );

    public static RentalBookingDto ToDto(this RentalBooking entity)
    {
        var bikes = entity.Bikes.Any()
            ? entity.Bikes.Select(bk => bk.ToDto()).ToList()
            : new List<RentalBookingBikeDto>
            {
                new(0, entity.BicycleId,
                    entity.Bicycle?.Marke ?? string.Empty,
                    entity.Bicycle?.Modell ?? string.Empty,
                    entity.Bicycle?.Rahmennummer,
                    entity.Bicycle?.Farbe,
                    entity.Bicycle?.Rahmengroesse,
                    entity.Bicycle?.Art,
                    entity.Bicycle?.Kaution,
                    entity.StartDatum,
                    entity.EndDatum,
                    entity.Gesamtpreis)
            };

        return new RentalBookingDto(
            entity.Id,
            entity.BuchungsNummer,
            entity.Bicycle?.ToDto(),
            bikes,
            entity.StartDatum,
            entity.EndDatum,
            entity.Abholzeit,
            entity.Vorname,
            entity.Nachname,
            entity.Email,
            entity.Telefon,
            entity.Strasse,
            entity.HausNr,
            entity.PLZ,
            entity.Ort,
            entity.Sprache,
            entity.Notizen,
            entity.AdminNotizen,
            entity.Gesamtpreis,
            entity.Status,
            entity.CreatedAt,
            entity.ApprovedAt,
            entity.CancelledAt,
            entity.Accessories.Select(a => a.ToDto(InclusiveRentalDays(entity.StartDatum, entity.EndDatum))).ToList(),
            entity.AusweisPhotoPath,
            entity.AusweisPhotoRueckseitePath
        );
    }

    public static RentalBookingListDto ToListDto(this RentalBooking entity)
    {
        string bikeInfo;
        bool hasEBike;
        if (entity.Bikes.Any())
        {
            bikeInfo = string.Join(" + ", entity.Bikes.Select(bk =>
                $"{bk.Bicycle?.Marke ?? ""} {bk.Bicycle?.Modell ?? ""}".Trim()));
            hasEBike = entity.Bikes.Any(bk => IsEBike(bk.Bicycle));
        }
        else
        {
            bikeInfo = $"{entity.Bicycle?.Marke ?? ""} {entity.Bicycle?.Modell ?? ""}".Trim();
            hasEBike = IsEBike(entity.Bicycle);
        }

        return new RentalBookingListDto(
            entity.Id,
            entity.BuchungsNummer,
            bikeInfo,
            $"{entity.Vorname} {entity.Nachname}".Trim(),
            entity.StartDatum,
            entity.EndDatum,
            entity.Gesamtpreis,
            entity.Status,
            entity.CreatedAt,
            hasEBike
        );
    }

    /// <summary>E-Bike-Heuristik über Fahrradtyp/Modell (e-bike, pedelec, elektro …).</summary>
    private static bool IsEBike(Bicycle? bike)
    {
        if (bike == null) return false;
        var haystack = $"{bike.Fahrradtyp} {bike.Modell}";
        return haystack.Contains("e-bike", StringComparison.OrdinalIgnoreCase)
            || haystack.Contains("ebike", StringComparison.OrdinalIgnoreCase)
            || haystack.Contains("e bike", StringComparison.OrdinalIgnoreCase)
            || haystack.Contains("pedelec", StringComparison.OrdinalIgnoreCase)
            || haystack.Contains("elektro", StringComparison.OrdinalIgnoreCase);
    }

    public static ReservationListDto ToListDto(this Reservation entity) => new(
        entity.Id,
        entity.ReservierungsNummer,
        $"{entity.Bicycle.Marke} {entity.Bicycle.Modell}",
        entity.Customer.FullName,
        entity.ReservierungsDatum,
        entity.AblaufDatum,
        entity.Anzahlung,
        entity.Status,
        entity.AblaufDatum < DateTime.UtcNow && entity.Status == Domain.Enums.ReservationStatus.Active
    );

    // ── Rental Mappings ──
    public static RentalAccessoryItemDto ToDto(this RentalAccessoryItem entity, int days) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Tagespreis,
        entity.Verlustgebuehr,
        entity.Menge,
        entity.LineTotal(days),
        entity.Zurueckgegeben,
        entity.Einmalig
    );

    public static RentalBikeDto ToDto(this RentalBike entity) => new(
        entity.Id,
        entity.BicycleId,
        entity.Bicycle.ToDto(),
        entity.Rahmennummer,
        entity.Farbe,
        entity.StartDatum,
        entity.EndDatum,
        entity.Mietpreis,
        entity.Kaution,
        entity.KautionZurueckgegeben,
        entity.KautionRueckgabeUnterschrift,
        entity.ZustandBeiUebergabe,
        entity.ZustandBeiRueckgabe,
        entity.SchadenAbzug,
        entity.VerspaetungsAbzug,
        entity.TatsaechlichesRueckgabeDatum,
        entity.AbzugNotizen
    );

    public static RentalDto ToDto(this Rental entity) => new(
        entity.Id,
        entity.MietvertragNummer,
        entity.Bikes.OrderBy(b => b.Id).Select(b => b.ToDto()).ToList(),
        entity.Customer.ToDto(),
        entity.StartDatum,
        entity.EndDatum,
        // Altverträge ohne eigenes Belegdatum fallen auf den Anlagetag zurück.
        entity.Vertragsdatum == default ? entity.CreatedAt : entity.Vertragsdatum,
        entity.Gesamtmiete,
        entity.Rabatt,
        entity.Kaution,
        entity.Bikes.Count > 0 && entity.Bikes.All(b => b.KautionZurueckgegeben),
        entity.Zahlungsart,
        entity.KautionZahlungsart,
        entity.Status,
        entity.Notizen,
        entity.CreatedAt,
        entity.Accessories.Select(a => a.ToDto(InclusiveRentalDays(entity.StartDatum, entity.EndDatum))).ToList(),
        entity.MieterUnterschrift,
        entity.AgbAkzeptiert,
        entity.UnterschriftOrt,
        entity.AusweisPhotoPath,
        entity.AusweisPhotoRueckseitePath
    );

    public static RentalListDto ToListDto(this Rental entity)
    {
        var firstBike = entity.Bikes.OrderBy(b => b.Id).FirstOrDefault();
        var bikeCount = entity.Bikes.Count;
        var info = firstBike != null
            ? bikeCount > 1
                ? $"{firstBike.Bicycle.Marke} {firstBike.Bicycle.Modell} (+{bikeCount - 1})"
                : $"{firstBike.Bicycle.Marke} {firstBike.Bicycle.Modell}"
            : string.Empty;

        var kautionZurueck = bikeCount > 0 && entity.Bikes.All(b => b.KautionZurueckgegeben);

        return new RentalListDto(
            entity.Id,
            entity.MietvertragNummer,
            info,
            bikeCount,
            entity.Customer.FullName,
            entity.StartDatum,
            entity.EndDatum,
            entity.Gesamtmiete,
            entity.Rabatt,
            entity.Kaution,
            entity.Status,
            entity.EndDatum < DateTime.UtcNow && entity.Status == Domain.Enums.RentalStatus.Active,
            kautionZurueck,
            // Erledigt heißt: Rad zurück UND Kaution abgerechnet. Storniert zählt
            // ebenfalls als erledigt — dort gab es keine Übergabe.
            (entity.Status == Domain.Enums.RentalStatus.Returned && kautionZurueck)
                || entity.Status == Domain.Enums.RentalStatus.Cancelled
        );
    }

    public static RentalCalendarItemDto ToCalendarItemDto(this Rental entity)
    {
        var bikeInfo = entity.Bikes.Any()
            ? string.Join(" + ", entity.Bikes.Select(bk =>
                $"{bk.Bicycle?.Marke ?? ""} {bk.Bicycle?.Modell ?? ""}".Trim()))
            : string.Empty;
        var hasEBike = entity.Bikes.Any(bk => IsEBike(bk.Bicycle));

        return new RentalCalendarItemDto(
            entity.Id,
            entity.MietvertragNummer,
            bikeInfo,
            entity.Customer?.FullName ?? string.Empty,
            entity.StartDatum,
            entity.EndDatum,
            entity.Status,
            hasEBike
        );
    }

    // ── EBike Mappings ──
    public static EBikeImageDto ToDto(this EBikeImage entity) => new(
        entity.Id,
        entity.FilePath,
        entity.SortOrder
    );

    public static EBikeDto ToDto(this EBike entity) => new(
        entity.Id,
        entity.Titel,
        entity.Beschreibung,
        entity.Preis,
        entity.PreisText,
        entity.Kategorie,
        entity.Marke,
        entity.Modell,
        entity.Farbe,
        entity.Rahmengroesse,
        entity.Reifengroesse,
        entity.Gangschaltung,
        entity.Zustand,
        entity.Angebot,
        entity.IsActive,
        entity.MotorMarke,
        entity.MotorPosition,
        entity.AkkuKapazitaetWh,
        entity.ReichweiteKm,
        entity.MotorLeistungNm,
        entity.CreatedAt,
        entity.Images.OrderBy(i => i.SortOrder).Select(i => i.ToDto()).ToList()
    );

    public static PublicEBikeDto ToPublicDto(this EBike entity) => new(
        entity.Id,
        entity.Titel,
        entity.Beschreibung,
        entity.Preis,
        entity.PreisText,
        entity.Kategorie,
        entity.Marke,
        entity.Modell,
        entity.Farbe,
        entity.Rahmengroesse,
        entity.Reifengroesse,
        entity.Gangschaltung,
        entity.Zustand,
        entity.Angebot,
        entity.MotorMarke,
        entity.MotorPosition,
        entity.AkkuKapazitaetWh,
        entity.ReichweiteKm,
        entity.MotorLeistungNm,
        entity.CreatedAt,
        entity.Images.OrderBy(i => i.SortOrder).Select(i => i.ToDto()).ToList()
    );
}
