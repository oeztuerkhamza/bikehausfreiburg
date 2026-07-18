using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IAiEmailAssistantService
{
    Task<AiEmailReplyResponse> GenerateReplyAsync(AiEmailReplyRequest request, CancellationToken ct);
}
