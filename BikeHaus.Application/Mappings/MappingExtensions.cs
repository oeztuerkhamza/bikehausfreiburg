using BikeHaus.Application.DTOs;
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
        entity.Farbe,
        entity.Reifengroesse,
        entity.StokNo,
        entity.Fahrradtyp,
        entity.Beschreibung,
        entity.Status,
        entity.Zustand,
        entity.CreatedAt
    );

    public static Bicycle ToEntity(this BicycleCreateDto dto) => new()
    {
        Marke = dto.Marke,
        Modell = dto.Modell,
        Rahmennummer = dto.Rahmennummer,
        Farbe = dto.Farbe,
        Reifengroesse = dto.Reifengroesse,
        StokNo = dto.StokNo,
        Fahrradtyp = dto.Fahrradtyp,
        Beschreibung = dto.Beschreibung,
        Zustand = dto.Zustand
    };

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
        Email = dto.Email
    };

    // ── Purchase Mappings ──
    public static PurchaseDto ToDto(this Purchase entity) => new(
        entity.Id,
        entity.BelegNummer,
        entity.Bicycle.ToDto(),
        entity.Seller.ToDto(),
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
        entity.Seller.FullName,
        entity.Preis,
        entity.VerkaufspreisVorschlag,
        entity.Zahlungsart,
        entity.Kaufdatum,
        entity.Sale != null
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
        entity.Gesamtbetrag,
        entity.CreatedAt
    );

    public static SaleListDto ToListDto(this Sale entity) => new(
        entity.Id,
        entity.BelegNummer,
        $"{entity.Bicycle.Marke} {entity.Bicycle.Modell}",
        entity.Buyer.FullName,
        entity.Preis,
        entity.Zahlungsart,
        entity.Verkaufsdatum,
        entity.Garantie
    );

    // ── SaleAccessory Mappings ──
    public static SaleAccessoryDto ToDto(this SaleAccessory entity) => new(
        entity.Id,
        entity.Bezeichnung,
        entity.Preis,
        entity.Menge,
        entity.Gesamtpreis
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
        entity.AblaufDatum < DateTime.UtcNow && entity.Status == Domain.Enums.ReservationStatus.Active
    );

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
}
