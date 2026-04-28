using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeHaus.Infrastructure.Services;

public class EmailAccountService : IEmailAccountService
{
    private readonly BikeHausDbContext _db;

    public EmailAccountService(BikeHausDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<EmailAccountDto>> GetAllAsync()
    {
        return await _db.EmailAccounts
            .OrderByDescending(a => a.IsDefault)
            .ThenBy(a => a.Name)
            .Select(a => ToDto(a))
            .ToListAsync();
    }

    public async Task<EmailAccountDto?> GetByIdAsync(int id)
    {
        var account = await _db.EmailAccounts.FindAsync(id);
        return account is null ? null : ToDto(account);
    }

    public async Task<EmailAccountDto> CreateAsync(CreateEmailAccountDto dto)
    {
        if (dto.IsDefault)
            await ClearDefaultAsync();

        var account = new EmailAccount
        {
            Name = dto.Name,
            Host = dto.Host,
            Port = dto.Port,
            Username = dto.Username,
            Password = dto.Password,
            FromEmail = dto.FromEmail,
            FromName = dto.FromName,
            UseSsl = dto.UseSsl,
            IsDefault = dto.IsDefault,
            IsActive = dto.IsActive,
        };

        _db.EmailAccounts.Add(account);
        await _db.SaveChangesAsync();
        return ToDto(account);
    }

    public async Task<EmailAccountDto> UpdateAsync(int id, UpdateEmailAccountDto dto)
    {
        var account = await _db.EmailAccounts.FindAsync(id)
            ?? throw new KeyNotFoundException($"E-Mail-Konto {id} nicht gefunden.");

        if (dto.IsDefault && !account.IsDefault)
            await ClearDefaultAsync();

        account.Name = dto.Name;
        account.Host = dto.Host;
        account.Port = dto.Port;
        account.Username = dto.Username;
        if (!string.IsNullOrEmpty(dto.Password))
            account.Password = dto.Password;
        account.FromEmail = dto.FromEmail;
        account.FromName = dto.FromName;
        account.UseSsl = dto.UseSsl;
        account.IsDefault = dto.IsDefault;
        account.IsActive = dto.IsActive;
        account.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToDto(account);
    }

    public async Task DeleteAsync(int id)
    {
        var account = await _db.EmailAccounts.FindAsync(id)
            ?? throw new KeyNotFoundException($"E-Mail-Konto {id} nicht gefunden.");
        _db.EmailAccounts.Remove(account);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<EmailLogDto>> GetLogsAsync(int page = 1, int pageSize = 100)
    {
        return await _db.EmailLogs
            .Include(l => l.EmailAccount)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new EmailLogDto(
                l.Id,
                l.ToEmail,
                l.ToName,
                l.Subject,
                l.Status,
                l.ErrorMessage,
                l.EmailType,
                l.EmailAccount != null ? l.EmailAccount.Name : null,
                l.CreatedAt
            ))
            .ToListAsync();
    }

    private async Task ClearDefaultAsync()
    {
        await _db.EmailAccounts
            .Where(a => a.IsDefault)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false));
    }

    private static EmailAccountDto ToDto(EmailAccount a) => new(
        a.Id, a.Name, a.Host, a.Port, a.Username,
        a.FromEmail, a.FromName, a.UseSsl, a.IsDefault, a.IsActive, a.CreatedAt
    );
}
