using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace BikeHaus.API.Controllers;

[Route("api/public/bike-adviser")]
[ApiController]
[AllowAnonymous]
public class BikeAdviserController(IBikeAdviserService adviserService) : ControllerBase
{
    [HttpPost("chat")]
    public async Task Chat([FromBody] BikeAdviserRequest request, CancellationToken ct)
    {
        Response.Headers["Content-Type"] = "text/event-stream; charset=utf-8";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";

        await foreach (var chunk in adviserService.StreamChatAsync(request, ct))
        {
            var bytes = Encoding.UTF8.GetBytes(chunk);
            await Response.Body.WriteAsync(bytes, ct);
            await Response.Body.FlushAsync(ct);
        }
    }
}
