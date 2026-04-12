namespace BikeHaus.Application.DTOs;

public class GoogleReviewsResponse
{
    public double Rating { get; set; }
    public int TotalReviews { get; set; }
    public List<GoogleReviewDto> Reviews { get; set; } = new();
    public string PlaceUrl { get; set; } = string.Empty;
}

public class GoogleReviewDto
{
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorPhotoUrl { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Text { get; set; } = string.Empty;
    public string RelativeTime { get; set; } = string.Empty;
    public long Time { get; set; }
}
