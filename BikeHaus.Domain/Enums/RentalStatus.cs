namespace BikeHaus.Domain.Enums;

public enum RentalStatus
{
    Active,      // Aktive Miete
    Returned,    // Fahrrad zurückgegeben
    Cancelled    // Storniert
}

public enum BikeConditionAtHandover
{
    SehrGut,         // Sehr gut
    Gut,             // Gut
    Gebrauchsspuren  // Gebrauchsspuren
}
