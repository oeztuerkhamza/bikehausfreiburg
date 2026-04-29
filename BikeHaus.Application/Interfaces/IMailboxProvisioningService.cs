namespace BikeHaus.Application.Interfaces;

public interface IMailboxProvisioningService
{
    Task CreateMailboxAsync(string email, string password, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(string email, string newPassword, CancellationToken cancellationToken = default);
}
