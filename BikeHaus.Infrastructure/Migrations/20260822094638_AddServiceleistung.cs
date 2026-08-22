using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceleistung : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Serviceleistungen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BelegNummer = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Datum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    KundeName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    KundeTelefon = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    KundeEmail = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    KundeAdresse = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    FahrradMarke = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    FahrradModell = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Rahmennummer = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Farbe = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    DurchgefuehrteArbeiten = table.Column<string>(type: "TEXT", maxLength: 3000, nullable: false),
                    VerwendeteTeile = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Preis = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Zahlungsart = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Notizen = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Serviceleistungen", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Serviceleistungen_BelegNummer",
                table: "Serviceleistungen",
                column: "BelegNummer",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Serviceleistungen");
        }
    }
}
