namespace BikeHaus.Application.DTOs;

public class KleinanzeigenListingDto
{
    public int Id { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? PriceText { get; set; }
    public string? Category { get; set; }
    public string? Location { get; set; }
    public string ExternalUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastScrapedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<KleinanzeigenImageDto> Images { get; set; } = new();
}

public class KleinanzeigenImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LocalPath { get; set; }
    public int SortOrder { get; set; }
}

public class KleinanzeigenCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class KleinanzeigenSyncResultDto
{
    public int NewListings { get; set; }
    public int UpdatedListings { get; set; }
    public int DeactivatedListings { get; set; }
    public DateTime SyncedAt { get; set; }
    public string? Error { get; set; }
}

public class PublicShopInfoDto
{
    public string ShopName { get; set; } = string.Empty;
    public string? Strasse { get; set; }
    public string? Hausnummer { get; set; }
    public string? PLZ { get; set; }
    public string? Stadt { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? LogoBase64 { get; set; }
    public string? LogoFileName { get; set; }
    public string? Oeffnungszeiten { get; set; }
    public string? FullAddress { get; set; }
    public int TotalActiveListings { get; set; }
    public string? KleinanzeigenUrl { get; set; }
}
