namespace BikeHaus.Infrastructure.Services;

public class MailboxProvisioningOptions
{
    public bool Enabled { get; set; }
    public string Provider { get; set; } = "mailcow";
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string? DefaultDomain { get; set; }
    public int DefaultQuotaMb { get; set; } = 2048;
}
