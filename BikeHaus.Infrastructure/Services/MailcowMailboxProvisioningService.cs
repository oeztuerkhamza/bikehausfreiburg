using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BikeHaus.Infrastructure.Services;

public class MailcowMailboxProvisioningService : IMailboxProvisioningService
{
    private readonly HttpClient _httpClient;
    private readonly MailboxProvisioningOptions _options;
    private readonly ILogger<MailcowMailboxProvisioningService> _logger;

    public MailcowMailboxProvisioningService(
        HttpClient httpClient,
        IOptions<MailboxProvisioningOptions> options,
        ILogger<MailcowMailboxProvisioningService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task CreateMailboxAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var (localPart, domain) = SplitEmail(email);
        var endpoint = BuildEndpoint("/api/v1/add/mailbox");

        var payload = new
        {
            local_part = localPart,
            domain,
            name = email,
            password,
            password2 = password,
            quota = _options.DefaultQuotaMb,
            active = "1"
        };

        await SendJsonAsync(endpoint, payload, cancellationToken);
    }

    public async Task ChangePasswordAsync(string email, string newPassword, CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var endpoint = BuildEndpoint("/api/v1/edit/mailbox");
        var payload = new
        {
            items = new[] { email },
            attr = new
            {
                password = newPassword,
                password2 = newPassword
            }
        };

        await SendJsonAsync(endpoint, payload, cancellationToken);
    }

    private void EnsureConfigured()
    {
        if (!_options.Enabled)
            throw new InvalidOperationException("Mailbox provisioning is disabled. Configure MailboxProvisioning:Enabled=true.");

        if (!string.Equals(_options.Provider, "mailcow", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Only provider 'mailcow' is currently supported.");

        if (string.IsNullOrWhiteSpace(_options.BaseUrl) || string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("Mailbox provisioning is not configured. BaseUrl and ApiKey are required.");
    }

    private async Task SendJsonAsync(string endpoint, object payload, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Add("X-API-Key", _options.ApiKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Mailbox provisioning call failed ({Status}): {Body}", response.StatusCode, body);
            throw new InvalidOperationException($"Mailbox provisioning failed: {response.StatusCode}");
        }
    }

    private static (string LocalPart, string Domain) SplitEmail(string email)
    {
        var at = email.IndexOf('@');
        if (at <= 0 || at == email.Length - 1)
            throw new InvalidOperationException("Invalid email address.");

        return (email[..at], email[(at + 1)..]);
    }

    private string BuildEndpoint(string path)
    {
        var baseUrl = _options.BaseUrl.TrimEnd('/');
        var normalizedPath = path.StartsWith('/') ? path : $"/{path}";
        return $"{baseUrl}{normalizedPath}";
    }
}
