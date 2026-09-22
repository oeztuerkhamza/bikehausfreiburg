namespace BikeHaus.Domain.Enums;

public enum BikeCondition
{
    Neu,        // New - 2-year warranty
    Gebraucht,  // Used - 3-month warranty

    /// <summary>
    /// Vorfuehrfahrrad: weder neu noch gebraucht, sondern eine eigene
    /// Kategorie. Es wird REGELBESTEUERT verkauft — der Beleg weist die
    /// Umsatzsteuer gesondert aus, statt nach §25a UStG differenzbesteuert zu
    /// sein. Die Garantiedauer legt der Verkauf selbst fest
    /// (Sale.GarantieMonate); ohne Angabe gelten drei Monate.
    ///
    /// Der Wert steht bewusst am Ende: Zustand liegt als INTEGER in der
    /// Datenbank (0/1), ein neuer Wert davor wuerde den Bestand umdeuten.
    /// </summary>
    Vorfuehrfahrrad
}
