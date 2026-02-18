using BikeHaus.Application.DTOs;

namespace BikeHaus.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request);
    Task SeedDefaultUserAsync();
}
