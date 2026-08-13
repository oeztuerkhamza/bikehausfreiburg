using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSprachnotizen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sprachnotizen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Titel = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Text = table.Column<string>(type: "TEXT", nullable: false),
                    RohText = table.Column<string>(type: "TEXT", nullable: false),
                    TerminAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Erledigt = table.Column<bool>(type: "INTEGER", nullable: false),
                    Sprache = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sprachnotizen", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sprachnotizen_Erledigt_CreatedAt",
                table: "Sprachnotizen",
                columns: new[] { "Erledigt", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sprachnotizen");
        }
    }
}
