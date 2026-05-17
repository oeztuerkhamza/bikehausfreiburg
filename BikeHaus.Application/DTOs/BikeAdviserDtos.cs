namespace BikeHaus.Application.DTOs;

public record BikeAdviserMessage(string Role, string Content);

public record BikeAdviserRequest(List<BikeAdviserMessage> Messages, string Language = "de");

public record BikeAdviserShopCta(bool Show, string? Type);
