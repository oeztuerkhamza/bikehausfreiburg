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
    IBicycleService bicycleService,
    IShopSettingsService shopSettingsService,
    IConfiguration configuration,
    ILogger<BikeAdviserService> logger) : IBikeAdviserService
{
    private static readonly JsonSerializerOptions CamelCase = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    // Keyword aliases so "Kinderfahrrad", "Kinderrad", "Kinder" all match Art="Kinder"
    private static readonly Dictionary<string, string[]> TypAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Kinder"]      = ["Kinder", "Kinderfahrrad", "Kinderrad", "Kindervelo", "Kind", "children", "enfant", "çocuk"],
        ["Herren"]      = ["Herren", "Herrenfahrrad", "Herrenrad", "Männer", "men", "homme", "erkek"],
        ["Damen"]       = ["Damen", "Damenfahrrad", "Damenrad", "Frauen", "women", "femme", "kadın"],
        ["E-Bike"]      = ["E-Bike", "eBike", "Elektrofahrrad", "Elektro", "Pedelec", "electric", "électrique"],
        ["Mountainbike"]= ["Mountainbike", "MTB", "Mountain"],
        ["Trekkingrad"] = ["Trekking", "Trekkingrad"],
        ["Cityrad"]     = ["City", "Cityrad", "Stadtrad"],
        ["Rennrad"]     = ["Rennrad", "Renn"],
    };

    private static IList<Anthropic.SDK.Common.Tool> BuildTools() =>
    [
        new Anthropic.SDK.Common.Tool(new Function(
            "get_showroom_bikes",
            "Sucht Fahrräder im Showroom-Lager des BikeHaus Freiburg (physischer Bestand, zum Kauf verfügbar). " +
            "Nutze dieses Tool als erstes wenn der Kunde ein Fahrrad kaufen möchte. " +
            "Kann nach Zielgruppe (art), Typ, Reifengröße, Rahmengröße, Zustand, Preis und Marke filtern.",
            JsonNode.Parse("""
            {
              "type": "object",
              "properties": {
                "art": {
                  "type": "string",
                  "description": "Zielgruppe: Kinder, Herren oder Damen",
                  "enum": ["Kinder", "Herren", "Damen"]
                },
                "fahrradtyp": {
                  "type": "string",
                  "description": "Fahrradtyp z.B. Mountainbike, Trekkingrad, E-Bike, Cityrad, Rennrad"
                },
                "reifengroesse": {
                  "type": "string",
                  "description": "Reifengröße in Zoll z.B. 12, 14, 16, 20, 24, 26, 27.5, 28, 29"
                },
                "min_rahmengroesse": {
                  "type": "number",
                  "description": "Minimale Rahmengröße in cm"
                },
                "max_rahmengroesse": {
                  "type": "number",
                  "description": "Maximale Rahmengröße in cm"
                },
                "zustand": {
                  "type": "string",
                  "description": "Zustand: Neu oder Gebraucht",
                  "enum": ["Neu", "Gebraucht"]
                },
                "max_preis": { "type": "number", "description": "Maximaler Preis in Euro" },
                "min_preis": { "type": "number", "description": "Minimaler Preis in Euro" },
                "marke":     { "type": "string", "description": "Marke z.B. Trek, Cube, Specialized, Winora" }
              },
              "required": []
            }
            """)!
        )),
        new Anthropic.SDK.Common.Tool(new Function(
            "get_kleinanzeigen_listings",
            "Sucht in den Kleinanzeigen-Inseraten des BikeHaus Freiburg (Online-Marktplatz). " +
            "Nutze dieses Tool zusätzlich zum Showroom um mehr Angebote zu zeigen.",
            JsonNode.Parse("""
            {
              "type": "object",
              "properties": {
                "fahrradtyp": {
                  "type": "string",
                  "description": "Typ oder Zielgruppe z.B. Mountainbike, Cityrad, Kinderfahrrad, Herren, Damen, E-Bike"
                },
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
            var foundShowroomBikes = new List<PublicBicycleDto>();

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
                    var result = await ExecuteToolAsync(toolUse, foundListings, foundShowroomBikes, request.Language, ct);
                    toolResults.Add(new ToolResultContent
                    {
                        ToolUseId = toolUse.Id,
                        Content = [new TextContent { Text = result }]
                    });
                }
                messages.Add(new Message { Role = RoleType.User, Content = toolResults });
            }

            // ── Emit bike cards (showroom first, then Kleinanzeigen) ──────
            var apiBase = configuration["Api:PublicBaseUrl"] ?? "http://localhost:5196";

            var showroomCards = foundShowroomBikes.Select(b =>
            {
                var imageFile = b.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.FilePath;
                var artLabel  = b.Art != null ? $"{b.Art}-Fahrrad" : null;
                var catParts  = new[] { artLabel, b.Fahrradtyp, b.Reifengroesse + "\"" }.Where(s => s != null);
                return (object)new
                {
                    id          = b.Id,
                    title       = $"{b.Marke} {b.Modell}".Trim(),
                    price       = b.Preis,
                    priceText   = (string?)null,
                    externalUrl = $"/{request.Language}/showroom/{b.Id}",
                    category    = string.Join(" · ", catParts),
                    imageUrl    = imageFile != null ? $"{apiBase}/api/gallery-image/{imageFile}" : null,
                    source      = "showroom"
                };
            });

            var kleinCards = foundListings.Select(l => (object)new
            {
                id          = l.Id,
                title       = l.Title,
                price       = l.Price,
                priceText   = l.PriceText,
                externalUrl = l.ExternalUrl,
                category    = l.Category,
                imageUrl    = l.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImageUrl,
                source      = "kleinanzeigen"
            });

            var allCards = showroomCards.Concat(kleinCards).ToList();
            if (allCards.Count > 0)
                await writer.WriteAsync(SseEvent("listings", new { listings = allCards }), ct);

            // ── Final streaming response ──────────────────────────────────
            var allEvents = new List<MessageResponse>();
            await foreach (var evt in client.Messages.StreamClaudeMessageAsync(
                new MessageParameters
                {
                    Model    = AnthropicModels.Claude45Haiku,
                    MaxTokens = 1024,
                    Messages  = messages,
                    System    = [new SystemMessage(systemPrompt, null!)],
                    Tools     = tools,
                    Stream    = true
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
        List<PublicBicycleDto> foundShowroomBikes,
        string language,
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

        if (toolUse.Name == "get_showroom_bikes")
        {
            string? art = null, fahrradtyp = null, reifengroesse = null, marke = null, zustand = null;
            decimal? maxP = null, minP = null, minRahmen = null, maxRahmen = null;

            if (toolUse.Input is JsonObject obj)
            {
                art          = Str(obj["art"]);
                fahrradtyp   = Str(obj["fahrradtyp"]);
                reifengroesse= Str(obj["reifengroesse"]);
                marke        = Str(obj["marke"]);
                zustand      = Str(obj["zustand"]);
                maxP         = Dec(obj["max_preis"]);
                minP         = Dec(obj["min_preis"]);
                minRahmen    = Dec(obj["min_rahmengroesse"]);
                maxRahmen    = Dec(obj["max_rahmengroesse"]);
            }

            var bikes = (await bicycleService.GetPublishedOnWebsiteAsync()).AsEnumerable();

            if (art != null)
                bikes = bikes.Where(b => b.Art != null &&
                    MatchesTyp(art, b.Art));

            if (fahrradtyp != null)
            {
                var terms = GetTypTerms(fahrradtyp);
                bikes = bikes.Where(b =>
                    (b.Fahrradtyp != null && terms.Any(t => b.Fahrradtyp.Contains(t, StringComparison.OrdinalIgnoreCase))) ||
                    (b.Art        != null && terms.Any(t => b.Art.Contains(t, StringComparison.OrdinalIgnoreCase))));
            }

            if (reifengroesse != null)
            {
                var norm = reifengroesse.Replace("\"", "").Replace("Zoll", "").Replace("zoll", "").Trim();
                bikes = bikes.Where(b =>
                    b.Reifengroesse.Replace("\"", "").Replace("Zoll", "").Trim()
                        .Equals(norm, StringComparison.OrdinalIgnoreCase));
            }

            if (marke != null)
                bikes = bikes.Where(b => b.Marke.Contains(marke, StringComparison.OrdinalIgnoreCase));

            if (zustand != null)
                bikes = bikes.Where(b => b.Zustand.ToString().Equals(zustand, StringComparison.OrdinalIgnoreCase));

            if (maxP.HasValue)
                bikes = bikes.Where(b => b.Preis == null || b.Preis <= maxP);
            if (minP.HasValue)
                bikes = bikes.Where(b => b.Preis == null || b.Preis >= minP);

            if (minRahmen.HasValue || maxRahmen.HasValue)
                bikes = bikes.Where(b =>
                {
                    if (b.Rahmengroesse == null) return true;
                    if (!decimal.TryParse(b.Rahmengroesse.Trim(),
                            System.Globalization.NumberStyles.Number,
                            System.Globalization.CultureInfo.InvariantCulture, out var rs)) return true;
                    if (minRahmen.HasValue && rs < minRahmen) return false;
                    if (maxRahmen.HasValue && rs > maxRahmen) return false;
                    return true;
                });

            var results = bikes.Take(8).ToList();
            if (results.Count == 0)
                return "Keine passenden Fahrräder im Showroom gefunden. Empfehle Besuch im Laden oder Suche in Kleinanzeigen.";

            foundShowroomBikes.AddRange(results);

            var lines = results.Select(b =>
                $"- {b.Marke} {b.Modell}, " +
                $"{(b.Preis.HasValue ? $"{b.Preis:F0}€" : "Preis auf Anfrage")}, " +
                $"Art: {b.Art ?? "–"}, Typ: {b.Fahrradtyp ?? "–"}, " +
                $"Reifen: {b.Reifengroesse}\", Rahmen: {b.Rahmengroesse ?? "–"}, " +
                $"Zustand: {b.Zustand}");
            return $"Showroom-Fahrräder ({results.Count} gefunden):\n{string.Join("\n", lines)}";
        }

        // Handle both old name (backward compat) and new name
        if (toolUse.Name is "get_kleinanzeigen_listings" or "get_available_bikes")
        {
            string? typ = null, zustand = null;
            decimal? maxP = null, minP = null;

            if (toolUse.Input is JsonObject obj)
            {
                typ    = Str(obj["fahrradtyp"]);
                zustand= Str(obj["zustand"]);
                maxP   = Dec(obj["max_preis"]);
                minP   = Dec(obj["min_preis"]);
            }

            var listings = (await kleinanzeigenService.GetAllActiveListingsAsync()).AsEnumerable();

            if (typ != null)
            {
                var terms = GetTypTerms(typ);
                listings = listings.Where(l =>
                    terms.Any(term =>
                        (l.Category    != null && l.Category.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                        l.Title.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                        (l.Description != null && l.Description.Contains(term, StringComparison.OrdinalIgnoreCase))));
            }

            if (zustand != null)
                listings = listings.Where(l =>
                    l.Description != null &&
                    l.Description.Contains(zustand, StringComparison.OrdinalIgnoreCase));

            if (maxP.HasValue)
                listings = listings.Where(l => l.Price == null || l.Price <= maxP);
            if (minP.HasValue)
                listings = listings.Where(l => l.Price == null || l.Price >= minP);

            var results = listings.Take(8).ToList();
            if (results.Count == 0)
                return "Keine passenden Kleinanzeigen-Inserate gefunden.";

            foundListings.AddRange(results);

            var lines = results.Select(l =>
                $"- {l.Title}, " +
                $"{(l.Price.HasValue ? $"{l.Price:F0}€" : l.PriceText ?? "Preis auf Anfrage")}, " +
                $"Kategorie: {l.Category ?? "–"}");
            return $"Kleinanzeigen-Inserate ({results.Count} gefunden):\n{string.Join("\n", lines)}";
        }

        return "Unbekanntes Tool.";
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static string[] GetTypTerms(string input)
    {
        foreach (var kv in TypAliases)
        {
            if (kv.Key.Equals(input, StringComparison.OrdinalIgnoreCase) ||
                kv.Value.Any(v => v.Equals(input, StringComparison.OrdinalIgnoreCase)))
                return kv.Value;
        }
        return [input];
    }

    private static bool MatchesTyp(string input, string fieldValue) =>
        GetTypTerms(input).Any(t => fieldValue.Contains(t, StringComparison.OrdinalIgnoreCase));

    private static string? Str(JsonNode? node) =>
        node?.ToString() is { Length: > 0 } s ? s : null;

    private static decimal? Dec(JsonNode? node) =>
        node?.ToString() is { Length: > 0 } s &&
        decimal.TryParse(s, System.Globalization.NumberStyles.Number,
            System.Globalization.CultureInfo.InvariantCulture, out var v)
            ? v : null;

    private static bool ShouldShowCta(string text)
    {
        var lower = text.ToLowerInvariant();
        return lower.Contains("besuchen sie") || lower.Contains("kommen sie") ||
               lower.Contains("im laden")      || lower.Contains("persönlich") ||
               lower.Contains("kontaktieren")  || lower.Contains("visit us") ||
               lower.Contains("come by")       || lower.Contains("in store") ||
               lower.Contains("venez")         || lower.Contains("visitez") ||
               lower.Contains("keine passenden");
    }

    private static List<Message> MapMessages(List<BikeAdviserMessage> incoming) =>
        incoming.Select(m => new Message
        {
            Role    = m.Role == "user" ? RoleType.User : RoleType.Assistant,
            Content = [new TextContent { Text = m.Content }]
        }).ToList();

    private static string BuildSystemPrompt(string language) => language switch
    {
        "en" => """
                You are a friendly bicycle expert at BikeHaus Freiburg, a used and new bicycle shop.

                Tools:
                - get_showroom_bikes: Search our physical showroom stock. Use FIRST for purchase inquiries.
                - get_kleinanzeigen_listings: Search our online marketplace ads. Use as supplement.
                - get_shop_info: Address, opening hours, contact.

                BIKE SIZE GUIDE — use when customer mentions age or height:
                Children by age → recommended tire size:
                  2–4 years: 12" (balance bike)   4–6 years: 16"   6–9 years: 20"
                  9–12 years: 24"                 12+ years: 26–28" (adult sizes)

                Adults by height → recommended frame size:
                  150–160 cm: 41–44 cm   160–170 cm: 45–48 cm   170–180 cm: 49–52 cm
                  180–190 cm: 53–57 cm   190+ cm: 58+ cm

                Category mapping:
                  "children's bike" / "kids bike" → art="Kinder" in get_showroom_bikes
                  "men's bike" / "gents"           → art="Herren"
                  "ladies bike" / "women's"        → art="Damen"

                Ask 1–2 targeted questions (budget, age/height, usage). Then search. Answer in English.
                """,

        "fr" => """
                Vous êtes un expert vélo chez BikeHaus Freiburg, magasin de vélos neufs et d'occasion.

                Outils:
                - get_showroom_bikes: Stock physique du showroom. À utiliser EN PREMIER pour les achats.
                - get_kleinanzeigen_listings: Annonces en ligne. À utiliser en complément.
                - get_shop_info: Adresse, horaires, contact.

                GUIDE DES TAILLES:
                Enfants par âge → taille de roue:
                  2–4 ans: 12" (draisienne)   4–6 ans: 16"   6–9 ans: 20"
                  9–12 ans: 24"               12+ ans: 26–28" (tailles adulte)

                Adultes par hauteur → taille cadre:
                  150–160 cm: 41–44 cm   160–170 cm: 45–48 cm   170–180 cm: 49–52 cm
                  180–190 cm: 53–57 cm   190+ cm: 58+ cm

                Correspondances catégories:
                  "vélo enfant" / "vélo pour enfant" → art="Kinder"
                  "vélo homme"                       → art="Herren"
                  "vélo femme" / "vélo dame"          → art="Damen"

                Poser 1–2 questions ciblées (budget, âge/taille, usage). Répondre en français.
                """,

        _ => """
             Du bist ein freundlicher Fahrradexperte im BikeHaus Freiburg.

             Verfügbare Tools:
             - get_showroom_bikes: Physischer Showroom-Lagerbestand. ZUERST nutzen bei Kaufwunsch.
             - get_kleinanzeigen_listings: Kleinanzeigen-Online-Inserate. Ergänzend nutzen.
             - get_shop_info: Adresse, Öffnungszeiten, Kontakt.

             FAHRRADGRÖSSEN-TABELLE (nutzen wenn Kunde Alter oder Körpergröße nennt):
             Kinder nach Alter → empfohlene Reifengröße:
               2–4 Jahre: 12" (Laufrad)   4–6 Jahre: 16"   6–9 Jahre: 20"
               9–12 Jahre: 24"            ab 12 Jahre: 26–28" (Erwachsenengrößen)

             Erwachsene nach Körpergröße → empfohlene Rahmengröße:
               150–160 cm: 41–44 cm   160–170 cm: 45–48 cm   170–180 cm: 49–52 cm
               180–190 cm: 53–57 cm   ab 190 cm: 58+ cm

             Kategorie-Zuordnung:
               "Kinderfahrrad" / "Kinderrad" / "für mein Kind" → art="Kinder" in get_showroom_bikes
               "Herrenrad" / "Männerrad"                       → art="Herren"
               "Damenrad" / "Frauenrad"                        → art="Damen"

             Bei konkreten Anforderungen: zuerst get_showroom_bikes, dann ggf. get_kleinanzeigen_listings.
             Stelle 1–2 gezielte Fragen (Budget, Alter/Größe, Nutzungszweck). Antworte auf Deutsch.
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
