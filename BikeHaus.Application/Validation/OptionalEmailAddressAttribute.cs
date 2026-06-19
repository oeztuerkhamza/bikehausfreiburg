using System.ComponentModel.DataAnnotations;

namespace BikeHaus.Application.Validation;

/// <summary>
/// Validates that a value is EITHER blank (null / empty / whitespace) OR a
/// syntactically valid e-mail address.
///
/// Unlike <see cref="EmailAddressAttribute"/> — which rejects the empty string —
/// this keeps the field optional ("darf leer bleiben") while still ensuring that
/// any value the user does type is well-formed. Used on the shared customer DTOs
/// so every entry point (Kunde, Verkäufer, Käufer, Mieter, Reservierung, Buchung,
/// Bewertung) is covered by a single rule.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter, AllowMultiple = false)]
public sealed class OptionalEmailAddressAttribute : ValidationAttribute
{
    private static readonly EmailAddressAttribute Inner = new();

    public OptionalEmailAddressAttribute()
        : base("Bitte eine gültige E-Mail-Adresse eingeben oder das Feld leer lassen.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not string s || string.IsNullOrWhiteSpace(s))
            return true; // blank is allowed — the field is optional

        return Inner.IsValid(s.Trim());
    }
}
