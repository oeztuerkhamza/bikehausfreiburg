using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVerkaufspreisAndInhaber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InhaberNachname",
                table: "ShopSettings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InhaberSignatureBase64",
                table: "ShopSettings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InhaberSignatureFileName",
                table: "ShopSettings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InhaberVorname",
                table: "ShopSettings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "VerkaufspreisVorschlag",
                table: "Purchases",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InhaberNachname",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "InhaberSignatureBase64",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "InhaberSignatureFileName",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "InhaberVorname",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "VerkaufspreisVorschlag",
                table: "Purchases");
        }
    }
}
