using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Serverseitige Gmail-Integration über den OAuth-2.0-Authorization-Code-Flow.
/// Der Refresh-Token wird zentral gespeichert (siehe <see cref="IGmailConnectionStore"/>),
/// sodass die einmal hergestellte Verbindung von jedem Rechner/Browser aus ohne erneutes
/// Anmelden genutzt werden kann. Access-Tokens werden bei Bedarf automatisch erneuert.
/// </summary>
public class GmailService(
    HttpClient http,
    IConfiguration configuration,
    IGmailConnectionStore store,
    ILogger<GmailService> logger) : IGmailService
{
    private const string GmailApi = "https://gmail.googleapis.com/gmail/v1/users/me";
    private const string TokenEndpoint = "https://oauth2.googleapis.com/token";
    private const string AuthEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string Scopes =
        "https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send";

    private string ClientId => configuration["Google:ClientId"] ?? string.Empty;
    private string ClientSecret => configuration["Google:ClientSecret"] ?? string.Empty;

    private string RedirectUri =>
        configuration["Google:RedirectUri"]
        ?? $"{(configuration["Api:PublicBaseUrl"] ?? "http://localhost:5196").TrimEnd('/')}/api/gmail/callback";

    // ── Status / OAuth ───────────────────────────────────────────────────────
    public GmailStatusDto GetStatus()
    {
        var conn = store.Get();
        return conn == null || string.IsNullOrEmpty(conn.RefreshToken)
            ? new GmailStatusDto(false, null)
            : new GmailStatusDto(true, conn.Email);
    }

    public string BuildAuthUrl(string state)
    {
        var query = new Dictionary<string, string?>
        {
            ["client_id"] = ClientId,
            ["redirect_uri"] = RedirectUri,
            ["response_type"] = "code",
            ["scope"] = Scopes,
            ["access_type"] = "offline",
            ["prompt"] = "consent",
            ["include_granted_scopes"] = "true",
            ["state"] = state,
        };
        var qs = string.Join("&", query
            .Where(kv => kv.Value != null)
            .Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value!)}"));
        return $"{AuthEndpoint}?{qs}";
    }

    public async Task HandleCallbackAsync(string code, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(ClientId) || string.IsNullOrWhiteSpace(ClientSecret))
            throw new InvalidOperationException("Google OAuth ist nicht konfiguriert (Google:ClientId / Google:ClientSecret).");

        using var res = await http.PostAsync(TokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = ClientId,
            ["client_secret"] = ClientSecret,
            ["redirect_uri"] = RedirectUri,
            ["grant_type"] = "authorization_code",
        }), ct);

        var json = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            logger.LogError("Gmail Token-Austausch fehlgeschlagen: {Status} {Body}", res.StatusCode, json);
            throw new InvalidOperationException("Token-Austausch mit Google fehlgeschlagen.");
        }

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        var accessToken = root.GetProperty("access_token").GetString() ?? string.Empty;
        var refreshToken = root.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : null;
        var expiresIn = root.TryGetProperty("expires_in", out var ei) ? ei.GetInt32() : 3600;

        // Bestehenden Refresh-Token behalten, falls Google keinen neuen zurückgibt.
        var existing = store.Get();
        if (string.IsNullOrEmpty(refreshToken))
            refreshToken = existing?.RefreshToken;
        if (string.IsNullOrEmpty(refreshToken))
            throw new InvalidOperationException("Kein Refresh-Token erhalten. Bitte erneut verbinden (prompt=consent).");

        var email = await FetchEmailAsync(accessToken, ct) ?? existing?.Email ?? string.Empty;

        store.Save(new GmailConnection
        {
            Email = email,
            RefreshToken = refreshToken,
            AccessToken = accessToken,
            AccessTokenExpiryUtc = DateTime.UtcNow.AddSeconds(expiresIn),
            ConnectedAtUtc = DateTime.UtcNow,
        });
    }

    public void Disconnect() => store.Clear();

    // ── Access-Token-Verwaltung ────────────────────────────────────────────────
    private async Task<string> GetAccessTokenAsync(CancellationToken ct)
    {
        var conn = store.Get() ?? throw new InvalidOperationException("Gmail ist nicht verbunden.");
        if (!string.IsNullOrEmpty(conn.AccessToken) && DateTime.UtcNow < conn.AccessTokenExpiryUtc.AddSeconds(-60))
            return conn.AccessToken!;

        using var res = await http.PostAsync(TokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = ClientId,
            ["client_secret"] = ClientSecret,
            ["refresh_token"] = conn.RefreshToken,
            ["grant_type"] = "refresh_token",
        }), ct);

        var json = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            logger.LogError("Gmail Token-Refresh fehlgeschlagen: {Status} {Body}", res.StatusCode, json);
            throw new InvalidOperationException("Gmail-Sitzung abgelaufen. Bitte erneut verbinden.");
        }

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        conn.AccessToken = root.GetProperty("access_token").GetString();
        var expiresIn = root.TryGetProperty("expires_in", out var ei) ? ei.GetInt32() : 3600;
        conn.AccessTokenExpiryUtc = DateTime.UtcNow.AddSeconds(expiresIn);
        store.Save(conn);
        return conn.AccessToken!;
    }

    private async Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, HttpContent? content, CancellationToken ct)
    {
        var token = await GetAccessTokenAsync(ct);
        using var req = new HttpRequestMessage(method, $"{GmailApi}{path}") { Content = content };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var res = await http.SendAsync(req, ct);
        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync(ct);
            logger.LogWarning("Gmail API {Method} {Path} → {Status}: {Body}", method, path, res.StatusCode, body);
            res.Dispose();
            throw new InvalidOperationException($"Gmail API Fehler ({(int)res.StatusCode}).");
        }
        return res;
    }

    private async Task<string?> FetchEmailAsync(string accessToken, CancellationToken ct)
    {
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Get, $"{GmailApi}/profile");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using var res = await http.SendAsync(req, ct);
            if (!res.IsSuccessStatusCode) return null;
            using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(ct));
            return doc.RootElement.TryGetProperty("emailAddress", out var e) ? e.GetString() : null;
        }
        catch
        {
            return null;
        }
    }

    // ── Gmail-Operationen ──────────────────────────────────────────────────────
    public async Task<List<GmailListItemDto>> ListInboxAsync(string? query, int maxResults, CancellationToken ct)
    {
        var path = $"/messages?maxResults={maxResults}&labelIds=INBOX";
        if (!string.IsNullOrWhiteSpace(query))
            path += $"&q={Uri.EscapeDataString(query)}";

        using var listRes = await SendAsync(HttpMethod.Get, path, null, ct);
        using var listDoc = JsonDocument.Parse(await listRes.Content.ReadAsStringAsync(ct));
        var result = new List<GmailListItemDto>();
        if (!listDoc.RootElement.TryGetProperty("messages", out var msgs) || msgs.ValueKind != JsonValueKind.Array)
            return result;

        foreach (var m in msgs.EnumerateArray())
        {
            var id = m.GetProperty("id").GetString()!;
            try
            {
                using var res = await SendAsync(HttpMethod.Get,
                    $"/messages/{id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date",
                    null, ct);
                using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(ct));
                var root = doc.RootElement;
                var headers = GetHeaders(root);
                var (name, mail) = ParseAddress(HeaderValue(headers, "From"));
                var labels = root.TryGetProperty("labelIds", out var l) && l.ValueKind == JsonValueKind.Array
                    ? l.EnumerateArray().Select(x => x.GetString()).ToList()
                    : new List<string?>();
                result.Add(new GmailListItemDto(
                    id,
                    root.TryGetProperty("threadId", out var tid) ? tid.GetString() ?? "" : "",
                    name,
                    mail,
                    HeaderValue(headers, "Subject") is { Length: > 0 } s ? s : "(kein Betreff)",
                    root.TryGetProperty("snippet", out var sn) ? DecodeEntities(sn.GetString() ?? "") : "",
                    HeaderValue(headers, "Date"),
                    labels.Contains("UNREAD")));
            }
            catch (Exception ex)
            {
                logger.LogDebug(ex, "Gmail-Listeneintrag {Id} übersprungen", id);
            }
        }
        return result;
    }

    public async Task<GmailMessageDto> GetMessageAsync(string id, CancellationToken ct)
    {
        using var res = await SendAsync(HttpMethod.Get, $"/messages/{id}?format=full", null, ct);
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(ct));
        var root = doc.RootElement;
        var headers = GetHeaders(root);
        var (name, mail) = ParseAddress(HeaderValue(headers, "From"));
        var payload = root.TryGetProperty("payload", out var p) ? p : default;
        return new GmailMessageDto(
            id,
            root.TryGetProperty("threadId", out var tid) ? tid.GetString() ?? "" : "",
            HeaderValue(headers, "Message-ID") is { Length: > 0 } mid ? mid : HeaderValue(headers, "Message-Id"),
            HeaderValue(headers, "References"),
            name,
            mail,
            HeaderValue(headers, "To"),
            HeaderValue(headers, "Subject"),
            HeaderValue(headers, "Date"),
            ExtractBody(payload));
    }

    public async Task MarkAsReadAsync(string id, CancellationToken ct)
    {
        var content = JsonContent.Create(new { removeLabelIds = new[] { "UNREAD" } });
        (await SendAsync(HttpMethod.Post, $"/messages/{id}/modify", content, ct)).Dispose();
    }

    public async Task TrashAsync(string id, CancellationToken ct)
    {
        (await SendAsync(HttpMethod.Post, $"/messages/{id}/trash", null, ct)).Dispose();
    }

    public async Task SendReplyAsync(GmailSendRequest request, CancellationToken ct)
    {
        var conn = store.Get() ?? throw new InvalidOperationException("Gmail ist nicht verbunden.");
        var raw = BuildRawMessage(conn.Email, request);
        var content = JsonContent.Create(new { raw, threadId = request.ThreadId });
        (await SendAsync(HttpMethod.Post, "/messages/send", content, ct)).Dispose();
    }

    // ── Parsing / Encoding ──────────────────────────────────────────────────────
    private static List<(string Name, string Value)> GetHeaders(JsonElement root)
    {
        var list = new List<(string, string)>();
        if (root.TryGetProperty("payload", out var payload) &&
            payload.TryGetProperty("headers", out var headers) &&
            headers.ValueKind == JsonValueKind.Array)
        {
            foreach (var h in headers.EnumerateArray())
                list.Add((h.GetProperty("name").GetString() ?? "", h.GetProperty("value").GetString() ?? ""));
        }
        return list;
    }

    private static string HeaderValue(List<(string Name, string Value)> headers, string name) =>
        headers.FirstOrDefault(h => h.Name.Equals(name, StringComparison.OrdinalIgnoreCase)).Value ?? "";

    private static (string Name, string Email) ParseAddress(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return ("", "");
        var lt = raw.IndexOf('<');
        var gt = raw.IndexOf('>');
        if (lt >= 0 && gt > lt)
        {
            var name = raw[..lt].Trim().Trim('"').Trim();
            var email = raw[(lt + 1)..gt].Trim();
            return (name, email);
        }
        return ("", raw.Trim());
    }

    private static string ExtractBody(JsonElement payload)
    {
        if (payload.ValueKind != JsonValueKind.Object) return "";
        var plain = FindPart(payload, "text/plain");
        if (plain != null) return DecodeB64Url(plain);
        var html = FindPart(payload, "text/html");
        if (html != null) return HtmlToText(DecodeB64Url(html));
        if (payload.TryGetProperty("body", out var body) && body.TryGetProperty("data", out var data))
            return DecodeB64Url(data.GetString() ?? "");
        return "";
    }

    private static string? FindPart(JsonElement part, string mime)
    {
        if (part.TryGetProperty("mimeType", out var mt) && mt.GetString() == mime &&
            part.TryGetProperty("body", out var body) && body.TryGetProperty("data", out var data))
            return data.GetString();
        if (part.TryGetProperty("parts", out var parts) && parts.ValueKind == JsonValueKind.Array)
        {
            foreach (var sub in parts.EnumerateArray())
            {
                var found = FindPart(sub, mime);
                if (found != null) return found;
            }
        }
        return null;
    }

    private static string DecodeB64Url(string data)
    {
        if (string.IsNullOrEmpty(data)) return "";
        try
        {
            var b64 = data.Replace('-', '+').Replace('_', '/');
            switch (b64.Length % 4)
            {
                case 2: b64 += "=="; break;
                case 3: b64 += "="; break;
            }
            return Encoding.UTF8.GetString(Convert.FromBase64String(b64));
        }
        catch
        {
            return "";
        }
    }

    private static string HtmlToText(string html)
    {
        if (string.IsNullOrEmpty(html)) return "";
        var text = System.Text.RegularExpressions.Regex.Replace(html, "<\\s*br\\s*/?>", "\n",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        text = System.Text.RegularExpressions.Regex.Replace(text, "</\\s*p\\s*>", "\n\n",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        text = System.Text.RegularExpressions.Regex.Replace(text, "<[^>]+>", "");
        text = System.Net.WebUtility.HtmlDecode(text);
        text = System.Text.RegularExpressions.Regex.Replace(text, "\n{3,}", "\n\n");
        return text.Trim();
    }

    private static string DecodeEntities(string text) => System.Net.WebUtility.HtmlDecode(text);

    private static string BuildRawMessage(string from, GmailSendRequest req)
    {
        var subject = $"=?UTF-8?B?{Convert.ToBase64String(Encoding.UTF8.GetBytes(req.Subject))}?=";
        var refs = string.Join(" ", new[] { req.References, req.InReplyTo }
            .Where(x => !string.IsNullOrWhiteSpace(x)));
        var headers = new List<string>
        {
            $"From: {(string.IsNullOrWhiteSpace(from) ? "me" : from)}",
            $"To: {req.To}",
            $"Subject: {subject}",
        };
        if (!string.IsNullOrWhiteSpace(req.InReplyTo)) headers.Add($"In-Reply-To: {req.InReplyTo}");
        if (!string.IsNullOrWhiteSpace(refs)) headers.Add($"References: {refs}");
        headers.Add("MIME-Version: 1.0");
        headers.Add("Content-Type: text/plain; charset=\"UTF-8\"");
        headers.Add("Content-Transfer-Encoding: base64");

        var bodyB64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(req.Body));
        var wrapped = string.Join("\r\n", Chunk(bodyB64, 76));
        var mime = $"{string.Join("\r\n", headers)}\r\n\r\n{wrapped}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(mime))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    private static IEnumerable<string> Chunk(string s, int size)
    {
        for (var i = 0; i < s.Length; i += size)
            yield return s.Substring(i, Math.Min(size, s.Length - i));
    }
}
