using System.Globalization;
using System.IO.Compression;
using System.Xml.Linq;

namespace BikeHaus.Infrastructure.Services;

/// <summary>
/// Liest den Transaktionsbericht des Flatpay-Terminals (.xlsx).
///
/// Bewusst ohne Excel-Bibliothek: eine xlsx-Datei ist ein ZIP mit XML, und
/// gebraucht werden nur vier Spalten (Datum, Typ, Betrag, Status). Die Spalten
/// werden über die Überschrift gesucht, nicht über feste Positionen — ändert
/// Flatpay die Reihenfolge, liest der Import trotzdem richtig.
/// </summary>
internal static class FlatpayReportReader
{
    public record Zeile(DateTime Datum, string Typ, decimal Betrag, string Status);

    public static IReadOnlyList<Zeile> Read(Stream xlsx)
    {
        using var archive = new ZipArchive(xlsx, ZipArchiveMode.Read, leaveOpen: true);

        var sharedStrings = ReadSharedStrings(archive);
        var sheet = archive.Entries.FirstOrDefault(e =>
                        e.FullName.StartsWith("xl/worksheets/sheet", StringComparison.OrdinalIgnoreCase) &&
                        e.FullName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
                    ?? throw new InvalidOperationException("Die Datei enthält kein Tabellenblatt — ist das wirklich der Flatpay-Bericht?");

        var rows = ReadRows(sheet, sharedStrings);
        if (rows.Count == 0) return [];

        // Kopfzeile suchen: die erste Zeile, die eine Spalte "Datum" trägt.
        var kopfIndex = rows.FindIndex(r => r.Values.Any(v => Gleich(v, "Datum")));
        if (kopfIndex < 0)
            throw new InvalidOperationException("Im Bericht fehlt die Spalte \"Datum\".");

        var kopf = rows[kopfIndex];
        int SpalteVon(string name)
        {
            foreach (var spalte in kopf)
                if (Gleich(spalte.Value, name)) return spalte.Key;
            return -1;
        }

        var spalteDatum = SpalteVon("Datum");
        var spalteTyp = SpalteVon("Typ");
        var spalteBetrag = SpalteVon("Betrag");
        var spalteStatus = SpalteVon("Status");

        if (spalteDatum < 0 || spalteBetrag < 0)
            throw new InvalidOperationException("Im Bericht fehlen die Spalten \"Datum\" und/oder \"Betrag\".");

        var zeilen = new List<Zeile>();
        foreach (var row in rows.Skip(kopfIndex + 1))
        {
            // Die Summenzeile ("Gesamt") trägt kein Datum und fällt hier raus.
            if (!TryDatum(Wert(row, spalteDatum), out var datum)) continue;
            if (!TryBetrag(Wert(row, spalteBetrag), out var betrag)) continue;

            zeilen.Add(new Zeile(
                datum,
                Wert(row, spalteTyp) ?? string.Empty,
                betrag,
                Wert(row, spalteStatus) ?? string.Empty));
        }

        return zeilen;
    }

    private static string? Wert(Dictionary<int, string> row, int spalte) =>
        spalte >= 0 && row.TryGetValue(spalte, out var v) ? v : null;

    private static bool Gleich(string? a, string b) =>
        string.Equals(a?.Trim(), b, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Excel speichert Datumswerte als Zahl (Tage seit 1899-12-30). Steht doch
    /// Text in der Zelle, wird deutsches und ISO-Format akzeptiert.
    /// </summary>
    private static bool TryDatum(string? wert, out DateTime datum)
    {
        datum = default;
        if (string.IsNullOrWhiteSpace(wert)) return false;

        if (double.TryParse(wert, NumberStyles.Any, CultureInfo.InvariantCulture, out var serial)
            && serial > 1)
        {
            try
            {
                datum = DateTime.FromOADate(serial);
                return true;
            }
            catch (ArgumentException)
            {
                return false;
            }
        }

        return DateTime.TryParse(wert, new CultureInfo("de-DE"), DateTimeStyles.None, out datum)
            || DateTime.TryParse(wert, CultureInfo.InvariantCulture, DateTimeStyles.None, out datum);
    }

    private static bool TryBetrag(string? wert, out decimal betrag)
    {
        betrag = 0m;
        if (string.IsNullOrWhiteSpace(wert)) return false;

        return decimal.TryParse(wert, NumberStyles.Any, CultureInfo.InvariantCulture, out betrag)
            || decimal.TryParse(wert, NumberStyles.Any, new CultureInfo("de-DE"), out betrag);
    }

    private static List<Dictionary<int, string>> ReadRows(ZipArchiveEntry sheet, IReadOnlyList<string> sharedStrings)
    {
        using var stream = sheet.Open();
        var doc = XDocument.Load(stream);
        var ns = doc.Root?.GetDefaultNamespace() ?? XNamespace.None;

        var result = new List<Dictionary<int, string>>();
        var sheetData = doc.Root?.Element(ns + "sheetData");
        if (sheetData == null) return result;

        foreach (var row in sheetData.Elements(ns + "row"))
        {
            var zellen = new Dictionary<int, string>();
            foreach (var cell in row.Elements(ns + "c"))
            {
                var spalte = SpalteAusReferenz((string?)cell.Attribute("r"));
                if (spalte < 0) continue;

                var typ = (string?)cell.Attribute("t");
                string? wert;
                if (typ == "inlineStr")
                    wert = string.Concat(cell.Element(ns + "is")?.Descendants(ns + "t").Select(t => t.Value) ?? []);
                else
                    wert = cell.Element(ns + "v")?.Value;

                if (wert == null) continue;

                // t="s": der Wert ist der Index in die gemeinsame Zeichenkettentabelle.
                if (typ == "s" && int.TryParse(wert, out var index)
                    && index >= 0 && index < sharedStrings.Count)
                    wert = sharedStrings[index];

                zellen[spalte] = wert;
            }

            result.Add(zellen);
        }

        return result;
    }

    private static IReadOnlyList<string> ReadSharedStrings(ZipArchive archive)
    {
        var entry = archive.GetEntry("xl/sharedStrings.xml");
        if (entry == null) return [];

        using var stream = entry.Open();
        var doc = XDocument.Load(stream);
        var ns = doc.Root?.GetDefaultNamespace() ?? XNamespace.None;

        // Formatierter Text steht in mehreren <t> je <si> — zusammensetzen.
        return doc.Root?
            .Elements(ns + "si")
            .Select(si => string.Concat(si.Descendants(ns + "t").Select(t => t.Value)))
            .ToList() ?? [];
    }

    /// <summary>"B7" → 2. Spalte (1-basiert); -1, wenn die Referenz fehlt.</summary>
    private static int SpalteAusReferenz(string? reference)
    {
        if (string.IsNullOrEmpty(reference)) return -1;

        var spalte = 0;
        foreach (var c in reference)
        {
            if (char.IsLetter(c)) spalte = spalte * 26 + (char.ToUpperInvariant(c) - 'A' + 1);
            else break;
        }

        return spalte > 0 ? spalte : -1;
    }
}
