namespace BikeHaus.Infrastructure.Services;

public class SmtpOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;
    public string FromEmail { get; set; } = "info.bikehausfreiburg@gmail.com";
    public string FromName { get; set; } = "Bike Haus Freiburg";

    /// <summary>
    /// Monitored inbox replies are routed to. We send from a DKIM-signed
    /// no-reply@ mailbox, but a missing reply path is both a Gmail
    /// "Promotions" signal and breaks the "antworte einfach auf diese E-Mail"
    /// hint in the mail bodies. Falls back to <see cref="FromEmail"/> if empty.
    /// </summary>
    public string ReplyTo { get; set; } = "info.bikehausfreiburg@gmail.com";
}
