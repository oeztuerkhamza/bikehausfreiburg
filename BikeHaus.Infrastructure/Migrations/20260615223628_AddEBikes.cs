using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEBikes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EBikes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Titel = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Beschreibung = table.Column<string>(type: "TEXT", maxLength: 5000, nullable: true),
                    Preis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PreisText = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Kategorie = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Marke = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Modell = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Farbe = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    Rahmengroesse = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Reifengroesse = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Gangschaltung = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Zustand = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Angebot = table.Column<decimal>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    MotorMarke = table.Column<string>(type: "TEXT", nullable: true),
                    MotorPosition = table.Column<string>(type: "TEXT", nullable: true),
                    AkkuKapazitaetWh = table.Column<int>(type: "INTEGER", nullable: true),
                    ReichweiteKm = table.Column<int>(type: "INTEGER", nullable: true),
                    MotorLeistungNm = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EBikes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EBikeImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EBikeId = table.Column<int>(type: "INTEGER", nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EBikeImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EBikeImages_EBikes_EBikeId",
                        column: x => x.EBikeId,
                        principalTable: "EBikes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EBikeImages_EBikeId",
                table: "EBikeImages",
                column: "EBikeId");

            migrationBuilder.CreateIndex(
                name: "IX_EBikes_IsActive",
                table: "EBikes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_EBikes_Kategorie",
                table: "EBikes",
                column: "Kategorie");

            migrationBuilder.CreateIndex(
                name: "IX_EBikes_Marke",
                table: "EBikes",
                column: "Marke");

            migrationBuilder.CreateIndex(
                name: "IX_EBikes_MotorMarke",
                table: "EBikes",
                column: "MotorMarke");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EBikeImages");

            migrationBuilder.DropTable(
                name: "EBikes");
        }
    }
}
