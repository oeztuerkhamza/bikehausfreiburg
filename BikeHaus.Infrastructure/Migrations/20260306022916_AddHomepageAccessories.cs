using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHomepageAccessories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HomepageAccessories",
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
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomepageAccessories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HomepageAccessoryImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    HomepageAccessoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomepageAccessoryImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomepageAccessoryImages_HomepageAccessories_HomepageAccessoryId",
                        column: x => x.HomepageAccessoryId,
                        principalTable: "HomepageAccessories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HomepageAccessories_IsActive",
                table: "HomepageAccessories",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_HomepageAccessories_Kategorie",
                table: "HomepageAccessories",
                column: "Kategorie");

            migrationBuilder.CreateIndex(
                name: "IX_HomepageAccessoryImages_HomepageAccessoryId",
                table: "HomepageAccessoryImages",
                column: "HomepageAccessoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HomepageAccessoryImages");

            migrationBuilder.DropTable(
                name: "HomepageAccessories");
        }
    }
}
