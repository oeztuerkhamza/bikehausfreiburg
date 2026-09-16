using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShopSettingsKleinanzeigenAktiv : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bewusst false als Startwert, auch fuer den vorhandenen Datensatz:
            // die Kleinanzeigen-Anzeigen sollen nach dem Deploy aus sein. Wer sie
            // wieder will, legt den Schalter im Admin-Portal um — es geht nichts
            // verloren, die Anzeigen bleiben in der Datenbank stehen.
            migrationBuilder.AddColumn<bool>(
                name: "KleinanzeigenAktiv",
                table: "ShopSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KleinanzeigenAktiv",
                table: "ShopSettings");
        }
    }
}
