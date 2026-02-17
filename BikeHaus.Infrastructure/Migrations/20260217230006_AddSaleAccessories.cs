using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleAccessories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ausweisnummer",
                table: "Customers");

            migrationBuilder.CreateTable(
                name: "SaleAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SaleId = table.Column<int>(type: "INTEGER", nullable: false),
                    Bezeichnung = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Preis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Menge = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaleAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaleAccessories_Sales_SaleId",
                        column: x => x.SaleId,
                        principalTable: "Sales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShopSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShopName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Strasse = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Hausnummer = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    PLZ = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    Stadt = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Telefon = table.Column<string>(type: "TEXT", maxLength: 30, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Website = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Steuernummer = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    UstIdNr = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Bankname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    IBAN = table.Column<string>(type: "TEXT", maxLength: 34, nullable: true),
                    BIC = table.Column<string>(type: "TEXT", maxLength: 11, nullable: true),
                    LogoBase64 = table.Column<string>(type: "TEXT", nullable: true),
                    LogoFileName = table.Column<string>(type: "TEXT", nullable: true),
                    Oeffnungszeiten = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Zusatzinfo = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SaleAccessories_SaleId",
                table: "SaleAccessories",
                column: "SaleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SaleAccessories");

            migrationBuilder.DropTable(
                name: "ShopSettings");

            migrationBuilder.AddColumn<string>(
                name: "Ausweisnummer",
                table: "Customers",
                type: "TEXT",
                maxLength: 50,
                nullable: true);
        }
    }
}
