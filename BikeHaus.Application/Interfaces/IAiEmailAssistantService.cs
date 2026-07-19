using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IAiEmailAssistantService
{
    Task<AiEmailReplyResponse> GenerateReplyAsync(AiEmailReplyRequest request, CancellationToken ct);

    /// <summary>Übersetzt einen (fremdsprachigen) E-Mail-Text ins Türkische.</summary>
    Task<string> TranslateToTurkishAsync(string text, CancellationToken ct);
}
