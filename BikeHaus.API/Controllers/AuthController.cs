using System.Security.Claims;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeHaus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null)
            return Unauthorized(new { message = "Benutzername oder Passwort falsch." });

        return Ok(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var success = await _authService.ChangePasswordAsync(userId, request);
        if (!success)
            return BadRequest(new { message = "Aktuelles Passwort ist falsch." });

        return Ok(new { message = "Passwort erfolgreich geändert." });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var displayName = User.FindFirst(ClaimTypes.GivenName)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;

        return Ok(new { username, displayName, role });
    }
}
