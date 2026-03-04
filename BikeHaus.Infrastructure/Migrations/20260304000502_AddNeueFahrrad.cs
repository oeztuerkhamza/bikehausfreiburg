using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNeueFahrrad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NeueFahrraeder",
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
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NeueFahrraeder", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NeueFahrradImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NeueFahrradId = table.Column<int>(type: "INTEGER", nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NeueFahrradImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NeueFahrradImages_NeueFahrraeder_NeueFahrradId",
                        column: x => x.NeueFahrradId,
                        principalTable: "NeueFahrraeder",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NeueFahrradImages_NeueFahrradId",
                table: "NeueFahrradImages",
                column: "NeueFahrradId");

            migrationBuilder.CreateIndex(
                name: "IX_NeueFahrraeder_IsActive",
                table: "NeueFahrraeder",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_NeueFahrraeder_Kategorie",
                table: "NeueFahrraeder",
                column: "Kategorie");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NeueFahrradImages");

            migrationBuilder.DropTable(
                name: "NeueFahrraeder");
        }
    }
}
