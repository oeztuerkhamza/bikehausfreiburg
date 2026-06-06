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
}
