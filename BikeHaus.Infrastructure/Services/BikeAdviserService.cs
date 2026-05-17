using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Channels;
using Anthropic.SDK;
using Anthropic.SDK.Common;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using BikeHaus.Application.DTOs;
using BikeHaus.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BikeHaus.Infrastructure.Services;

public class BikeAdviserService(
    IKleinanzeigenService kleinanzeigenService,
    IShopSettingsService shopSettingsService,
    IConfiguration configuration,
    ILogger<BikeAdviserService> logger) : IBikeAdviserService
{
    private static readonly JsonSerializerOptions CamelCase = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private static IList<Anthropic.SDK.Common.Tool> BuildTools() =>
    [
        new Anthropic.SDK.Common.Tool(new Function(
            "get_available_bikes",
            "Gibt verfügbare Fahrräder aus dem Bestand des BikeHaus Freiburg zurück. Nutze dieses Tool wenn der Kunde konkrete Anforderungen hat.",
            JsonNode.Parse("""
            {
              "type": "object",
              "properties": {
                "fahrradtyp": { "type": "string", "description": "Typ des Fahrrads z.B. Mountainbike, Stadtrad, Rennrad, E-Bike, Kinderrad, Trekkingrad" },
                "max_preis":  { "type": "number", "description": "Maximaler Preis in Euro" },
                "min_preis":  { "type": "number", "description": "Minimaler Preis in Euro" },
                "zustand":    { "type": "string", "description": "Zustand: Neu oder Gebraucht", "enum": ["Neu", "Gebraucht"] }
              },
              "required": []
            }
            """)!
        )),
        new Anthropic.SDK.Common.Tool(new Function(
            "get_shop_info",
            "Gibt Informationen über das BikeHaus Freiburg zurück (Adresse, Öffnungszeiten, Kontakt).",
            JsonNode.Parse("""{"type":"object","properties":{}}""")!
        ))
    ];

    // ── Public interface ─────────────────────────────────────────────────────
    public async IAsyncEnumerable<string> StreamChatAsync(
        BikeAdviserRequest request,
        [EnumeratorCancellation] CancellationToken ct)
    {
        var channel = Channel.CreateUnbounded<string>(
            new UnboundedChannelOptions { SingleReader = true, SingleWriter = true });

        var producer = ProduceAsync(request, channel.Writer, ct);

        await foreach (var chunk in channel.Reader.ReadAllAsync(ct))
            yield return chunk;

        await producer;
    }

    // ── Internal producer ────────────────────────────────────────────────────
    private async Task ProduceAsync(
        BikeAdviserRequest request,
        ChannelWriter<string> writer,
        CancellationToken ct)
    {
        try
        {
            var apiKey = configuration["Anthropic:ApiKey"] ?? string.Empty;
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                await writer.WriteAsync(SseEvent("delta", new { text = "KI-Berater ist nicht konfiguriert." }), ct);
                await writer.WriteAsync(SseEvent("done", new { shopCta = new { show = true, type = "contact" } }), ct);
                return;
            }

            var client = new AnthropicClient(new APIAuthentication(apiKey));
            var systemPrompt = BuildSystemPrompt(request.Language);
            var messages = MapMessages(request.Messages);
            var tools = BuildTools();
            var foundListings = new List<KleinanzeigenListingDto>();

            // ── Tool resolution loop (non-streaming) ─────────────────────
            for (int round = 0; round < 3; round++)
            {
                var response = await client.Messages.GetClaudeMessageAsync(
                    new MessageParameters
                    {
                        Model = AnthropicModels.Claude45Haiku,
                        MaxTokens = 1024,
                        Messages = messages,
                        System = [new SystemMessage(systemPrompt, null!)],
                        Tools = tools
                    }, ct);

                var toolUseBlocks = response.Content.OfType<ToolUseContent>().ToList();
                if (toolUseBlocks.Count == 0) break;

                messages.Add(new Message { Role = RoleType.Assistant, Content = response.Content });

                var toolResults = new List<ContentBase>();
                foreach (var toolUse in toolUseBlocks)
                {
                    var result = await ExecuteToolAsync(toolUse, foundListings, ct);
                    toolResults.Add(new ToolResultContent
                    {
                        ToolUseId = toolUse.Id,
                        Content = [new TextContent { Text = result }]
                    });
                }
                messages.Add(new Message { Role = RoleType.User, Content = toolResults });
            }

            // ── Emit listing cards ────────────────────────────────────────
            if (foundListings.Count > 0)
            {
                var cards = foundListings.Select(l => new
                {
                    id = l.Id,
                    title = l.Title,
                    price = l.Price,
                    priceText = l.PriceText,
                    externalUrl = l.ExternalUrl,
                    category = l.Category,
                    imageUrl = l.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImageUrl
                });
                await writer.WriteAsync(SseEvent("listings", new { listings = cards }), ct);
            }

            // ── Final streaming response ──────────────────────────────────
            var allEvents = new List<MessageResponse>();
            await foreach (var evt in client.Messages.StreamClaudeMessageAsync(
                new MessageParameters
                {
                    Model = AnthropicModels.Claude45Haiku,
                    MaxTokens = 1024,
                    Messages = messages,
                    System = [new SystemMessage(systemPrompt, null!)],
                    Tools = tools,
                    Stream = true
                }, ct))
            {
                allEvents.Add(evt);
                var text = evt.Delta?.Text;
                if (!string.IsNullOrEmpty(text))
                    await writer.WriteAsync(SseEvent("delta", new { text }), ct);
            }

            // ── Done event ────────────────────────────────────────────────
            var fullText = string.Concat(allEvents
                .Where(e => e.Delta?.Text != null)
                .Select(e => e.Delta!.Text));
            var showCta = ShouldShowCta(fullText);
            await writer.WriteAsync(
                SseEvent("done", new { shopCta = new { show = showCta, type = showCta ? "contact" : (string?)null } }), ct);
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            logger.LogError(ex, "BikeAdviserService error");
            await writer.WriteAsync(SseEvent("delta", new { text = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." }), ct);
            await writer.WriteAsync(SseEvent("done", new { shopCta = new { show = true, type = "contact" } }), ct);
        }
        finally
        {
            writer.Complete();
        }
    }

    // ── Tool execution ───────────────────────────────────────────────────────
    private async Task<string> ExecuteToolAsync(
        ToolUseContent toolUse,
        List<KleinanzeigenListingDto> foundListings,
        CancellationToken ct)
    {
        if (toolUse.Name == "get_shop_info")
        {
            var settings = await shopSettingsService.GetSettingsAsync();
            if (settings == null) return "Shopinformationen nicht verfügbar.";
            return $"Shop: {settings.ShopName}\n" +
                   $"Adresse: {settings.Strasse} {settings.Hausnummer}, {settings.PLZ} {settings.Stadt}\n" +
                   $"Telefon: {settings.Telefon}\n" +
                   $"E-Mail: {settings.Email}\n" +
                   $"Öffnungszeiten: {settings.Oeffnungszeiten}";
        }

        if (toolUse.Name == "get_available_bikes")
        {
            string? typ = null;
            decimal? maxP = null, minP = null;

            if (toolUse.Input is JsonObject inputObj)
            {
                typ = inputObj["fahrradtyp"]?.ToString() is { Length: > 0 } t ? t : null;

                if (inputObj["max_preis"]?.ToString() is { Length: > 0 } maxPStr &&
                    decimal.TryParse(maxPStr, System.Globalization.NumberStyles.Number,
                        System.Globalization.CultureInfo.InvariantCulture, out var maxParsed))
                    maxP = maxParsed;

                if (inputObj["min_preis"]?.ToString() is { Length: > 0 } minPStr &&
                    decimal.TryParse(minPStr, System.Globalization.NumberStyles.Number,
                        System.Globalization.CultureInfo.InvariantCulture, out var minParsed))
                    minP = minParsed;
            }

            var listings = (await kleinanzeigenService.GetAllActiveListingsAsync()).AsEnumerable();

            if (typ != null)
                listings = listings.Where(l =>
                    (l.Category != null && l.Category.Contains(typ, StringComparison.OrdinalIgnoreCase)) ||
                    l.Title.Contains(typ, StringComparison.OrdinalIgnoreCase));
            if (maxP.HasValue)
                listings = listings.Where(l => l.Price == null || l.Price <= maxP);
            if (minP.HasValue)
                listings = listings.Where(l => l.Price == null || l.Price >= minP);

            var results = listings.Take(8).ToList();

            if (results.Count == 0)
                return "Keine passenden Fahrräder auf Kleinanzeigen gefunden. Empfehle einen Besuch im Laden für aktuelle Neuankünfte.";

            foundListings.AddRange(results);

            var lines = results.Select(l =>
                $"- {l.Title}, " +
                $"{(l.Price.HasValue ? $"{l.Price:F0}€" : l.PriceText ?? "Preis auf Anfrage")}, " +
                $"Kategorie: {l.Category ?? "–"}");
            return $"Gefundene Kleinanzeigen-Inserate ({results.Count}):\n{string.Join("\n", lines)}";
        }

        return "Unbekanntes Tool.";
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private static bool ShouldShowCta(string text)
    {
        var lower = text.ToLowerInvariant();
        return lower.Contains("besuchen sie") || lower.Contains("kommen sie") ||
               lower.Contains("im laden") || lower.Contains("persönlich") ||
               lower.Contains("kontaktieren") || lower.Contains("visit us") ||
               lower.Contains("come by") || lower.Contains("in store") ||
               lower.Contains("venez") || lower.Contains("visitez") ||
               lower.Contains("keine passenden");
    }

    private static List<Message> MapMessages(List<BikeAdviserMessage> incoming) =>
        incoming.Select(m => new Message
        {
            Role = m.Role == "user" ? RoleType.User : RoleType.Assistant,
            Content = [new TextContent { Text = m.Content }]
        }).ToList();

    private static string BuildSystemPrompt(string language) => language switch
    {
        "en" => """
                You are a friendly bicycle expert at BikeHaus Freiburg, a used and new bicycle shop.
                Help customers find the right bicycle. Ask 1-2 targeted questions to understand their needs (budget, usage, type).
                When the customer has clear requirements, use get_available_bikes to search the inventory.
                If no matching bikes are found, or if the customer needs in-person advice (test rides, repairs, sizing),
                recommend a visit to the shop. Be friendly, concise and helpful. Answer in English.
                """,
        "fr" => """
                Vous êtes un expert cycliste sympathique chez BikeHaus Freiburg, un magasin de vélos neufs et d'occasion.
                Aidez les clients à trouver le bon vélo. Posez 1-2 questions ciblées pour comprendre leurs besoins (budget, utilisation, type).
                Quand le client a des exigences claires, utilisez get_available_bikes pour chercher dans l'inventaire.
                Si aucun vélo correspondant n'est trouvé, ou si le client a besoin de conseils en personne,
                recommandez une visite au magasin. Soyez amical, concis et utile. Répondez en français.
                """,
        _ => """
             Du bist ein freundlicher Fahrradexperte im BikeHaus Freiburg, einem Gebraucht- und Neufahrradladen.
             Hilf Kunden beim Finden des richtigen Fahrrads. Stelle 1-2 gezielte Fragen, um die Bedürfnisse zu verstehen (Budget, Nutzung, Typ).
             Wenn der Kunde konkrete Anforderungen hat, nutze get_available_bikes um den Bestand zu durchsuchen.
             Wenn keine passenden Fahrräder gefunden werden, oder wenn der Kunde persönliche Beratung braucht,
             empfiehl einen Besuch im Laden. Sei freundlich, prägnant und hilfreich. Antworte auf Deutsch.
             """
    };

    private static string SseEvent<T>(string type, T payload)
    {
        var obj = new Dictionary<string, object?> { ["type"] = type };
        var extra = JsonSerializer.Deserialize<Dictionary<string, object?>>(
            JsonSerializer.Serialize(payload, CamelCase), CamelCase) ?? [];
        foreach (var kv in extra) obj[kv.Key] = kv.Value;
        return $"data: {JsonSerializer.Serialize(obj, CamelCase)}\n\n";
    }
}
