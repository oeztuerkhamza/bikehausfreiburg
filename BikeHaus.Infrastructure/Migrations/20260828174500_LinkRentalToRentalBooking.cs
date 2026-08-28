using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LinkRentalToRentalBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RentalBookingId",
                table: "Rentals",
                type: "INTEGER",
                nullable: true);

            // Bestandsdaten nachziehen: bis hierher gab es keine Verknuepfung,
            // und "ist diese Anfrage schon abgearbeitet?" wurde ueber Name +
            // Zeitraum geraten. Genau diese Regel wird hier EINMALIG benutzt,
            // um die vorhandenen Paare zu verbinden — damit bleibt die Ansicht
            // nach der Migration exakt so wie vorher, nur eben auf einem
            // Fremdschluessel statt auf einer Vermutung. Passen mehrere
            // Anfragen, gewinnt die aelteste (MIN(Id)); passt keine, bleibt die
            // Spalte NULL — ein Vertrag, der direkt im Laden geschrieben wurde.
            migrationBuilder.Sql(@"
                UPDATE Rentals
                SET RentalBookingId = (
                    SELECT MIN(b.Id)
                    FROM RentalBookings b
                    WHERE date(b.StartDatum) = date(Rentals.StartDatum)
                      AND date(b.EndDatum)   = date(Rentals.EndDatum)
                      AND b.Vorname  = (SELECT c.Vorname  FROM Customers c WHERE c.Id = Rentals.CustomerId)
                      AND b.Nachname = (SELECT c.Nachname FROM Customers c WHERE c.Id = Rentals.CustomerId)
                )
                WHERE RentalBookingId IS NULL;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_RentalBookingId",
                table: "Rentals",
                column: "RentalBookingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_RentalBookings_RentalBookingId",
                table: "Rentals",
                column: "RentalBookingId",
                principalTable: "RentalBookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_RentalBookings_RentalBookingId",
                table: "Rentals");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_RentalBookingId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "RentalBookingId",
                table: "Rentals");
        }
    }
}
