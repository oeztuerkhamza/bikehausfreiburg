using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalKautionZahlungsart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KautionZahlungsart",
                table: "Rentals",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // Backfill existing rentals: assume Kaution was paid the same way as Miete.
            migrationBuilder.Sql("UPDATE Rentals SET KautionZahlungsart = Zahlungsart;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KautionZahlungsart",
                table: "Rentals");
        }
    }
}
