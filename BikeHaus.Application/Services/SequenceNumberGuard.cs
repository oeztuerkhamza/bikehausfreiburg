using System.Collections.Concurrent;

namespace BikeHaus.Application.Services;

/// <summary>
/// Serialisiert die Vergabe fortlaufender Belegnummern pro Sequenz.
///
/// Die Nummern werden nach dem Muster "höchste vorhandene Nummer + 1" erzeugt.
/// Lesen + Speichern ist nicht atomar: Speichern zwei Benutzer gleichzeitig,
/// lesen beide dieselbe höchste Nummer und erzeugen dieselbe Belegnummer,
/// was beim zweiten Speichern den Unique-Index verletzt (Fehler beim Anlegen).
///
/// Da die API als ein einzelner Prozess läuft (ein Container bzw. Electron),
/// genügt eine prozessweite In-Process-Sperre, um die Sektion
/// "Nummer erzeugen + speichern" zu serialisieren.
/// </summary>
public static class SequenceNumberGuard
{
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> Gates = new();

    /// <summary>
    /// Führt <paramref name="action"/> exklusiv pro <paramref name="sequenceKey"/> aus.
    /// Innerhalb der Sperre dürfen Nummer erzeugt und Entität gespeichert werden,
    /// ohne dass eine parallele Anfrage dieselbe Nummer ziehen kann.
    /// </summary>
    public static async Task<T> RunExclusiveAsync<T>(string sequenceKey, Func<Task<T>> action)
    {
        var gate = Gates.GetOrAdd(sequenceKey, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync();
        try
        {
            return await action();
        }
        finally
        {
            gate.Release();
        }
    }
}

/// <summary>
/// Schlüssel für die Belegnummer-Sequenzen. Entitäten, die sich denselben
/// Nummernkreis teilen, müssen denselben Schlüssel verwenden.
/// </summary>
public static class SequenceKeys
{
    /// <summary>Verkauf + Vermietung teilen sich einen Nummernkreis (siehe GenerateBelegNummer / GenerateMietvertragNummer).</summary>
    public const string VerkaufMiete = "beleg:verkauf-miete";

    /// <summary>Ankauf-Belegnummern.</summary>
    public const string Ankauf = "beleg:ankauf";

    /// <summary>Rückgabe-Belegnummern.</summary>
    public const string Rueckgabe = "beleg:rueckgabe";

    /// <summary>Rechnungsnummern.</summary>
    public const string Rechnung = "beleg:rechnung";

    /// <summary>Reservierungsnummern.</summary>
    public const string Reservierung = "beleg:reservierung";

    /// <summary>Online-Buchungsnummern.</summary>
    public const string Buchung = "beleg:buchung";
}
