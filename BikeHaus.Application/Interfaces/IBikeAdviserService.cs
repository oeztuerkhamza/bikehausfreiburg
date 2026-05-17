using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IBikeAdviserService
{
    IAsyncEnumerable<string> StreamChatAsync(BikeAdviserRequest request, CancellationToken ct);
}
