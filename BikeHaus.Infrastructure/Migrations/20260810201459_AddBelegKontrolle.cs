using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBelegKontrolle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BelegKontrollen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Art = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    BelegId = table.Column<int>(type: "INTEGER", nullable: false),
                    Flatpay = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BelegKontrollen", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BelegKontrollen_Art_BelegId",
                table: "BelegKontrollen",
                columns: new[] { "Art", "BelegId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BelegKontrollen");
        }
    }
}
