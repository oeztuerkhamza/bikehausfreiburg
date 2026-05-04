namespace BikeHaus.Application.DTOs;

public record RentalReviewDto(
    int Id,
    string Ad,
    string? Email,
    int Sterne,
    string Yorum,
    bool Onaylandi,
    string? AdminNotiz,
    DateTime CreatedAt
);

public record RentalReviewPublicDto(
    int Id,
    string Ad,
    int Sterne,
    string Yorum,
    DateTime CreatedAt
);

public record RentalReviewCreateDto(
    string Ad,
    string? Email,
    int Sterne,
    string Yorum
);

public record RentalReviewApproveDto(
    bool Onaylandi,
    string? AdminNotiz
);
