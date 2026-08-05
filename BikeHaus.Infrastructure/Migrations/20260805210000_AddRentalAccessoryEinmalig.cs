using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <summary>
    /// Zubehör kann einmalig statt pro Miettag abgerechnet werden.
    ///
    /// Das Flag steht am Katalog (RentalAccessories) und wird beim Buchen bzw.
    /// beim Anlegen des Mietvertrags in die Position kopiert — genau wie der
    /// Preis. Sonst würde eine späterere Katalogänderung die Summen alter
    /// Verträge verschieben.
    ///
    /// Nur neue Spalten mit Default 0 (false): vorhandenes Zubehör bleibt
    /// Tagespreis-Zubehör, die Summen bestehender Verträge und Buchungen
    /// ändern sich nicht.
    /// </summary>
    public partial class AddRentalAccessoryEinmalig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Einmalig",
                table: "RentalAccessories",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Einmalig",
                table: "RentalAccessoryItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Einmalig",
                table: "RentalBookingAccessories",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Einmalig",
                table: "RentalAccessories");

            migrationBuilder.DropColumn(
                name: "Einmalig",
                table: "RentalBookingAccessories");

            migrationBuilder.DropColumn(
                name: "Einmalig",
                table: "RentalAccessoryItems");
        }
    }
}
