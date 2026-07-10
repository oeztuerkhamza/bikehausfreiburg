using System;

namespace BikeHaus.Domain;

/// <summary>
/// Category helpers for <see cref="Entities.Bicycle"/>.
/// </summary>
public static class BicycleCategory
{
    /// <summary>
    /// True when the bike is a children's bike. Children's bikes are listed as
    /// generic/pooled ads (e.g. "20 Zoll Fahrrad") that stand in for several
    /// interchangeable physical bikes, so they must stay rentable even while an
    /// overlapping rental or booking exists — the concrete bike is assigned
    /// manually in the shop. They are therefore exempt from availability and
    /// overlap restrictions.
    ///
    /// The "Kinder" marker may live in either <c>Art</c> (gender) or
    /// <c>Fahrradtyp</c> (bike type), depending on how the bike was created, so
    /// both are checked.
    /// </summary>
    public static bool IsChildrens(string? art, string? fahrradtyp = null) =>
        ContainsKinder(art) || ContainsKinder(fahrradtyp);

    private static bool ContainsKinder(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Contains("Kinder", StringComparison.OrdinalIgnoreCase);
}
