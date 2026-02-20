namespace BikeHaus.Application.DTOs;

public class PaginatedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

public class PaginationParams
{
    private int _pageSize = 20;
    private const int MaxPageSize = 1000;

    public int Page { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    public string? Status { get; set; }
    public string? SearchTerm { get; set; }

    // Additional filters for bicycle properties
    public string? Zustand { get; set; }
    public string? Fahrradtyp { get; set; }
    public string? Reifengroesse { get; set; }
    public string? Marke { get; set; }
    public string? Farbe { get; set; }
}
