namespace BikeHaus.Application.DTOs;

/// <summary>Result of attempting to send a single review-request mail.</summary>
public enum ReviewSendOutcome
{
    Sent,
    SkippedInvalidEmail,
    SkippedUnsubscribed,
    SkippedAlreadySent,
    Failed
}
