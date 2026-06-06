namespace BikeHaus.Domain.Enums;

/// <summary>Which flow triggered a Google-review request mail.</summary>
public enum ReviewRequestSource
{
    Manual = 0,
    Sale = 1,
    Rental = 2
}
