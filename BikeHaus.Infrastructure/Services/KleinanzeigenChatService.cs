using System.Text;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using BikeHaus.Domain.Entities;
using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Kleinanzeigen-Nachrichten als Chatverlauf.
///
/// Quelle ist ausschließlich das verbundene Gmail-Postfach – es wird nichts
/// gespiegelt. Kleinanzeigen leitet jede Nachricht eines Interessenten von einer
/// eigenen Alias-Adresse weiter (<c>…-ek-ek@mail.kleinanzeigen.de</c>); diese
/// Adresse ist pro Interessent und Anzeige stabil und dient deshalb als Schlüssel
/// der Unterhaltung. Eine Antwort an genau diese Adresse erscheint beim
/// Interessenten wieder in der Kleinanzeigen-App.
///
/// In der eigenen Datenbank liegen nur zwei Dinge: die türkischen Übersetzungen
/// je Nachricht und der noch nicht gesendete Entwurf je Unterhaltung.
/// </summary>
public class KleinanzeigenChatService(
    IGmailService gmail,
    IGmailConnectionStore connections,
    IAiEmailAssistantService ai,
    BikeHausDbContext db,
    IMemoryCache cache,
    ILogger<KleinanzeigenChatService> logger) : IKleinanzeigenChatService
{
    /// <summary>
    /// Postfach der Kleinanzeigen-Chats. Ist ein eigenes Konto verbunden, wird es
    /// genommen; sonst faellt es auf das Konto des KI-E-Mail-Assistenten zurueck —
    /// so laeuft der Chat auch ohne zweite Anmeldung, und wer die Anzeigen ueber ein
    /// anderes Postfach fuehrt, verbindet dieses einmal zusaetzlich.
    /// </summary>
    private string Account =>
        connections.Get(GmailAccounts.Kleinanzeigen) is { RefreshToken.Length: > 0 }
            ? GmailAccounts.Kleinanzeigen
            : GmailAccounts.Default;

    public KleinanzeigenAccountDto GetAccountStatus()
    {
        var own = connections.Get(GmailAccounts.Kleinanzeigen);
        if (own is { RefreshToken.Length: > 0 })
            return new KleinanzeigenAccountDto(true, own.Email, true);

        var fallback = connections.Get(GmailAccounts.Default);
        return fallback is { RefreshToken.Length: > 0 }
            ? new KleinanzeigenAccountDto(true, fallback.Email, false)
            : new KleinanzeigenAccountDto(false, null, false);
    }

    public void DisconnectAccount() => connections.Clear(GmailAccounts.Kleinanzeigen);

    /// <summary>Gmail-Suche: alles, was über den Nachrichten-Alias läuft (ein- und ausgehend).</summary>
    private const string Query =
        $"from:{KleinanzeigenMailParser.AliasDomain} OR to:{KleinanzeigenMailParser.AliasDomain}";

    private const int MaxThreads = 30;
    private static readonly TimeSpan CacheTtl = TimeSpan.FromHours(6);

    // ── Öffentliche API ──────────────────────────────────────────────────────

    public async Task<List<KleinanzeigenChatDto>> ListConversationsAsync(CancellationToken ct)
    {
        var conversations = await BuildAllAsync(ct);
        return conversations;
    }

    public async Task<KleinanzeigenChatDto> GetConversationAsync(string id, CancellationToken ct)
    {
        var alias = DecodeId(id);
        var all = await BuildAllAsync(ct);
        return all.FirstOrDefault(c => c.Alias == alias)
               ?? throw new KeyNotFoundException("Unterhaltung nicht gefunden.");
    }

    public async Task<KleinanzeigenChatDto> TranslateIncomingAsync(string id, CancellationToken ct)
    {
        var conv = await GetConversationAsync(id, ct);

        var pending = conv.Messages
            .Where(m => m.Direction == "in" && string.IsNullOrWhiteSpace(m.Translation) && !string.IsNullOrWhiteSpace(m.Body))
            .ToList();
        if (pending.Count == 0) return conv;

        foreach (var m in pending)
        {
            try
            {
                var tr = await ai.TranslateToTurkishAsync(m.Body, ct);
                if (string.IsNullOrWhiteSpace(tr)) continue;

                var row = await db.KleinanzeigenChatTranslations
                    .FirstOrDefaultAsync(t => t.GmailMessageId == m.Id, ct);
                if (row == null)
                    db.KleinanzeigenChatTranslations.Add(new KleinanzeigenChatTranslation
                    {
                        GmailMessageId = m.Id,
                        TranslationTr = tr,
                    });
                else
                    row.TranslationTr = tr;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Kleinanzeigen-Nachricht {Id} konnte nicht übersetzt werden.", m.Id);
            }
        }

        await db.SaveChangesAsync(ct);
        return await GetConversationAsync(id, ct);
    }

    public async Task<KleinanzeigenChatDto> ComposeAsync(string id, string instruction, CancellationToken ct)
    {
        var conv = await GetConversationAsync(id, ct);

        var reply = await ai.GenerateReplyAsync(new AiEmailReplyRequest(
            Body: BuildTranscript(conv),
            Instruction: instruction,
            FromName: conv.PeerName,
            FromEmail: conv.Alias,
            Subject: conv.AdTitle,
            Tone: "chat"), ct);

        var draft = (reply.ReplyBody ?? string.Empty).Trim();
        var draftTr = string.Empty;
        try
        {
            draftTr = await ai.TranslateToTurkishAsync(draft, ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Rückübersetzung des Kleinanzeigen-Entwurfs fehlgeschlagen.");
        }

        await SaveDraftAsync(id, draft, draftTr, ct);
        return conv with { Draft = draft, DraftTr = draftTr };
    }

    public async Task<KleinanzeigenChatDto> SendAsync(string id, string text, CancellationToken ct)
    {
        var alias = DecodeId(id);
        var conv = await GetConversationAsync(id, ct);
        var context = await GetReplyContextAsync(alias, ct);

        // Nur der neue Text geht raus — kein zitierter Verlauf darunter.
        // Kleinanzeigen zeigt dem Interessenten den ganzen Mailtext als Chatnachricht;
        // ein angehängtes Zitat stünde dort doppelt und wirkte maschinell.
        var body = KleinanzeigenMailParser.StripQuotedHistory(text);
        if (string.IsNullOrWhiteSpace(body))
            throw new InvalidOperationException("Nachricht ist leer.");

        await gmail.SendReplyAsync(new GmailSendRequest(
            To: alias,
            Subject: context.Subject,
            Body: body,
            ThreadId: conv.ThreadId,
            InReplyTo: context.MessageIdHeader,
            References: context.References), ct, Account);

        var draftRow = await db.KleinanzeigenChatDrafts.FirstOrDefaultAsync(d => d.ConversationKey == alias, ct);
        if (draftRow != null)
        {
            db.KleinanzeigenChatDrafts.Remove(draftRow);
            await db.SaveChangesAsync(ct);
        }

        // Kein Cache-Eingriff nötig: durch die neue Nachricht hat der Thread eine
        // andere HistoryId — der nächste Aufruf holt ihn ohnehin frisch.
        return await GetConversationAsync(id, ct);
    }

    public async Task SaveDraftAsync(string id, string draft, string? draftTr, CancellationToken ct)
    {
        var alias = DecodeId(id);
        var row = await db.KleinanzeigenChatDrafts.FirstOrDefaultAsync(d => d.ConversationKey == alias, ct);

        if (string.IsNullOrWhiteSpace(draft))
        {
            if (row != null)
            {
                db.KleinanzeigenChatDrafts.Remove(row);
                await db.SaveChangesAsync(ct);
            }
            return;
        }

        if (row == null)
        {
            db.KleinanzeigenChatDrafts.Add(new KleinanzeigenChatDraft
            {
                ConversationKey = alias,
                Draft = draft,
                DraftTr = draftTr ?? string.Empty,
            });
        }
        else
        {
            row.Draft = draft;
            if (draftTr != null) row.DraftTr = draftTr;
            row.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
    }

    public async Task MarkReadAsync(string id, CancellationToken ct)
    {
        var conv = await GetConversationAsync(id, ct);
        foreach (var m in conv.Messages.Where(m => m.Unread))
        {
            try { await gmail.MarkAsReadAsync(m.Id, ct, Account); }
            catch (Exception ex) { logger.LogDebug(ex, "Kleinanzeigen-Nachricht {Id} nicht als gelesen markierbar.", m.Id); }
        }
    }

    // ── Aufbau der Unterhaltungen ────────────────────────────────────────────

    /// <summary>Anzeigendaten aus dem gescrapten Bestand (Bild, Preis, Link).</summary>
    private sealed record AdInfo(string? Title, decimal? Price, string? Url, string? ImageUrl);

    /// <summary>Eine geparste Nachricht, bevor Übersetzung/Entwurf angehängt werden.</summary>
    private sealed record ParsedMessage(
        string Id,
        string ThreadId,
        string Alias,
        string Direction,
        string PeerName,
        string? PeerPhone,
        string AdTitle,
        string? AdId,
        string Body,
        long Ts,
        bool Unread,
        string Subject,
        string MessageIdHeader,
        string References);

    private async Task<List<KleinanzeigenChatDto>> BuildAllAsync(CancellationToken ct)
    {
        var parsed = await LoadParsedMessagesAsync(ct);
        if (parsed.Count == 0) return [];

        var ids = parsed.Select(p => p.Id).ToList();
        var translations = await db.KleinanzeigenChatTranslations
            .Where(t => ids.Contains(t.GmailMessageId))
            .ToDictionaryAsync(t => t.GmailMessageId, t => t.TranslationTr, ct);

        // Bild, Preis und Link der Anzeige kommen aus den gescrapten Anzeigen —
        // Abgleich ueber die Anzeigennummer aus der Mail.
        var adIds = parsed.Select(p => p.AdId).Where(a => !string.IsNullOrEmpty(a)).Distinct().ToList()!;
        var listings = adIds.Count == 0
            ? new Dictionary<string, AdInfo>()
            : await db.KleinanzeigenListings
                .Where(l => adIds.Contains(l.ExternalId))
                .Select(l => new
                {
                    l.ExternalId,
                    l.Title,
                    l.Price,
                    l.ExternalUrl,
                    ImageUrl = l.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                })
                .ToDictionaryAsync(
                    l => l.ExternalId,
                    l => new AdInfo(l.Title, l.Price, l.ExternalUrl, l.ImageUrl), ct);

        var aliases = parsed.Select(p => p.Alias).Distinct().ToList();
        var drafts = await db.KleinanzeigenChatDrafts
            .Where(d => aliases.Contains(d.ConversationKey))
            .ToDictionaryAsync(d => d.ConversationKey, d => d, ct);

        var result = new List<KleinanzeigenChatDto>();
        foreach (var group in parsed.GroupBy(p => p.Alias))
        {
            var ordered = group.OrderBy(m => m.Ts).ToList();
            var last = ordered[^1];
            // Titel/Name aus der jüngsten eingehenden Nachricht – die trägt die
            // Kleinanzeigen-Kopfdaten; unsere eigenen Antworten meist nicht.
            var lastIn = ordered.LastOrDefault(m => m.Direction == "in") ?? last;

            var messages = ordered.Select(m => new KleinanzeigenChatMessageDto(
                m.Id,
                m.Direction,
                m.Body,
                translations.TryGetValue(m.Id, out var tr) ? tr : null,
                m.Ts,
                m.Unread)).ToList();

            drafts.TryGetValue(group.Key, out var draft);

            AdInfo? ad = null;
            if (!string.IsNullOrEmpty(lastIn.AdId)) listings.TryGetValue(lastIn.AdId, out ad);

            // Telefonnummer: die zuletzt genannte gewinnt.
            var phone = ordered.LastOrDefault(m => !string.IsNullOrWhiteSpace(m.PeerPhone))?.PeerPhone;

            result.Add(new KleinanzeigenChatDto(
                Id: EncodeId(group.Key),
                Alias: group.Key,
                PeerName: lastIn.PeerName,
                PeerPhone: phone,
                AdTitle: string.IsNullOrWhiteSpace(ad?.Title) ? lastIn.AdTitle : ad!.Title,
                AdId: lastIn.AdId,
                AdImageUrl: ad?.ImageUrl,
                AdPrice: ad?.Price,
                AdUrl: ad?.Url,
                ThreadId: lastIn.ThreadId,
                UpdatedAt: last.Ts,
                Unread: ordered.Count(m => m.Unread),
                LastMessage: last.Body,
                LastDirection: last.Direction,
                Draft: draft?.Draft ?? string.Empty,
                DraftTr: draft?.DraftTr ?? string.Empty,
                Messages: messages));
        }

        return result.OrderByDescending(c => c.UpdatedAt).ToList();
    }

    /// <summary>
    /// Threads suchen und parsen. Unveränderte Threads (gleiche HistoryId) kommen
    /// aus dem Cache, damit das Pollen der App nicht bei jedem Durchlauf den
    /// kompletten Verlauf von Gmail zieht.
    /// </summary>
    private async Task<List<ParsedMessage>> LoadParsedMessagesAsync(CancellationToken ct)
    {
        var threads = await gmail.ListThreadsAsync(Query, MaxThreads, ct, Account);
        var all = new List<ParsedMessage>();

        foreach (var t in threads)
        {
            var key = CacheKey(t.Id, t.HistoryId);
            if (cache.TryGetValue(key, out List<ParsedMessage>? cached) && cached != null)
            {
                all.AddRange(cached);
                continue;
            }

            try
            {
                var thread = await gmail.GetThreadAsync(t.Id, ct, Account);
                var parsed = ParseThread(thread);
                cache.Set(key, parsed, CacheTtl);
                all.AddRange(parsed);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Kleinanzeigen-Thread {Id} konnte nicht geladen werden.", t.Id);
            }
        }

        return all;
    }

    private static List<ParsedMessage> ParseThread(GmailThreadDto thread)
    {
        var result = new List<ParsedMessage>();

        foreach (var m in thread.Messages)
        {
            // Ausgehend = von uns gesendet (SENT-Label); der Alias steht dann im "An".
            var outgoing = m.Sent;
            var alias = outgoing
                ? KleinanzeigenMailParser.ExtractAlias(m.To)
                : KleinanzeigenMailParser.ExtractAlias(m.FromEmail);

            if (alias == null) continue;   // gehört nicht zum Kleinanzeigen-Chat

            string body;
            var peerName = string.Empty;
            string? phone = null;

            if (outgoing)
            {
                body = KleinanzeigenMailParser.ExtractOutgoingText(m.Body);
            }
            else
            {
                // Der Name aus dem Von-Kopf hilft dem Parser, wenn in der Mail
                // nichts den Namen vom Text trennt ("Antwort von Kelvin Ok.").
                var fromName = string.IsNullOrWhiteSpace(m.FromName)
                    ? null
                    : KleinanzeigenMailParser.CleanPeerName(m.FromName, null);

                var parsed = KleinanzeigenMailParser.ParseIncoming(m.Body, fromName);
                body = parsed.Text;
                phone = parsed.Phone;
                peerName = KleinanzeigenMailParser.CleanPeerName(parsed.SenderName ?? m.FromName, alias);
            }

            if (string.IsNullOrWhiteSpace(body)) continue;

            result.Add(new ParsedMessage(
                Id: m.Id,
                ThreadId: m.ThreadId,
                Alias: alias,
                Direction: outgoing ? "out" : "in",
                PeerName: peerName,
                PeerPhone: phone,
                AdTitle: KleinanzeigenMailParser.ExtractAdTitle(m.Subject),
                AdId: KleinanzeigenMailParser.ExtractAdId(m.Body),
                Body: body,
                Ts: m.TimestampMs,
                Unread: m.Unread && !outgoing,
                Subject: m.Subject,
                MessageIdHeader: m.MessageIdHeader,
                References: m.References));
        }

        return result;
    }

    /// <summary>Kopfdaten für die Antwort: Betreff und Threading-Header der letzten eingehenden Mail.</summary>
    private async Task<(string Subject, string? MessageIdHeader, string? References)> GetReplyContextAsync(
        string alias, CancellationToken ct)
    {
        var parsed = await LoadParsedMessagesAsync(ct);
        var lastIn = parsed
            .Where(p => p.Alias == alias && p.Direction == "in")
            .OrderBy(p => p.Ts)
            .LastOrDefault();

        if (lastIn == null)
            return ("Kleinanzeigen", null, null);

        var subject = lastIn.Subject.StartsWith("Re:", StringComparison.OrdinalIgnoreCase)
            ? lastIn.Subject
            : $"Re: {lastIn.Subject}";

        var references = string.Join(" ", new[] { lastIn.References, lastIn.MessageIdHeader }
            .Where(x => !string.IsNullOrWhiteSpace(x)));

        return (subject, lastIn.MessageIdHeader, references);
    }

    /// <summary>Bisheriger Verlauf als Text – Kontext für die KI-Antwort.</summary>
    private static string BuildTranscript(KleinanzeigenChatDto conv)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Kleinanzeigen-Chat zur Anzeige: {conv.AdTitle}");
        sb.AppendLine($"Interessent: {conv.PeerName}");
        sb.AppendLine();

        foreach (var m in conv.Messages.TakeLast(12))
            sb.AppendLine($"{(m.Direction == "in" ? conv.PeerName : "Wir")}: {m.Body}");

        return sb.ToString().Trim();
    }

    // ── Hilfsmittel ──────────────────────────────────────────────────────────

    private static string CacheKey(string threadId, string historyId) => $"ka-chat:{threadId}:{historyId}";

    private static string EncodeId(string alias) =>
        Convert.ToBase64String(Encoding.UTF8.GetBytes(alias))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');

    private static string DecodeId(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new KeyNotFoundException("Unterhaltung nicht gefunden.");

        // Kompatibel: auch eine direkt übergebene Alias-Adresse wird akzeptiert.
        if (id.Contains('@')) return id.Trim().ToLowerInvariant();

        var b64 = id.Replace('-', '+').Replace('_', '/');
        switch (b64.Length % 4)
        {
            case 2: b64 += "=="; break;
            case 3: b64 += "="; break;
        }
        try
        {
            return Encoding.UTF8.GetString(Convert.FromBase64String(b64)).ToLowerInvariant();
        }
        catch (FormatException)
        {
            throw new KeyNotFoundException("Unterhaltung nicht gefunden.");
        }
    }
}
