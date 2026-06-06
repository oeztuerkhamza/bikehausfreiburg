namespace BikeHaus.Application.DTOs;

/// <summary>Recipient counts for the Google-review campaign.</summary>
public record CampaignPreviewDto(int RecipientCount, int SkippedUnsubscribed);

/// <summary>Request body for a test send.</summary>
public record CampaignTestRequest(string Email);

/// <summary>Result of starting a campaign (background) or a test send.</summary>
public record CampaignActionResult(bool Ok, string Message, int Total = 0);

/// <summary>Live status of the running/last campaign (polled by the admin UI).</summary>
public record CampaignStatusDto(
    string State,        // idle | running | completed | failed
    int Total,
    int Sent,
    int Failed,
    DateTime? StartedAt,
    DateTime? FinishedAt,
    string? LastError);
