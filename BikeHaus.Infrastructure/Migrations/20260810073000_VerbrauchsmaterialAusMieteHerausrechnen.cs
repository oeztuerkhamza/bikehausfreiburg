using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <summary>
    /// Verbrauchsmaterial (einmaliges Zubehör wie ein Schlauch) gehört nicht in
    /// die Miete, sondern in die Kaution.
    ///
    /// Bis hierher hat die Rückgabe die Gesamtmiete neu gebildet und den Preis
    /// eines verbrauchten Schlauchs aufgeschlagen. Damit stand im Vertrag ein
    /// anderer Betrag als der, den der Mieter unterschrieben hatte. Ab jetzt
    /// bleibt die Miete unangetastet und der Verbrauch wird bei der Rückgabe von
    /// der Kaution einbehalten.
    ///
    /// Für bereits zurückgegebene Verträge muss der alte Aufschlag deshalb hier
    /// wieder heraus: sonst steckt derselbe Betrag zweimal drin — einmal in der
    /// Miete und ab jetzt zusätzlich im Kautionsabzug des
    /// Kautionsrückgabebelegs.
    ///
    /// Betroffen sind nur Verträge seit 20260805210000_AddRentalAccessoryEinmalig
    /// (davor gab es kein einmaliges Zubehör), und davon nur die, bei denen ein
    /// solches Zubehör bei der Rückgabe nicht abgehakt wurde.
    /// </summary>
    public partial class VerbrauchsmaterialAusMieteHerausrechnen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"UPDATE ""Rentals""
                  SET ""Gesamtmiete"" = ""Gesamtmiete"" - (
                      SELECT COALESCE(SUM(a.""Tagespreis"" * a.""Menge""), 0)
                      FROM ""RentalAccessoryItems"" a
                      WHERE a.""RentalId"" = ""Rentals"".""Id""
                        AND a.""Einmalig"" = 1
                        AND a.""Zurueckgegeben"" = 0)
                  WHERE EXISTS (
                      SELECT 1
                      FROM ""RentalAccessoryItems"" a
                      WHERE a.""RentalId"" = ""Rentals"".""Id""
                        AND a.""Einmalig"" = 1
                        AND a.""Zurueckgegeben"" = 0)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"UPDATE ""Rentals""
                  SET ""Gesamtmiete"" = ""Gesamtmiete"" + (
                      SELECT COALESCE(SUM(a.""Tagespreis"" * a.""Menge""), 0)
                      FROM ""RentalAccessoryItems"" a
                      WHERE a.""RentalId"" = ""Rentals"".""Id""
                        AND a.""Einmalig"" = 1
                        AND a.""Zurueckgegeben"" = 0)
                  WHERE EXISTS (
                      SELECT 1
                      FROM ""RentalAccessoryItems"" a
                      WHERE a.""RentalId"" = ""Rentals"".""Id""
                        AND a.""Einmalig"" = 1
                        AND a.""Zurueckgegeben"" = 0)");
        }
    }
}
