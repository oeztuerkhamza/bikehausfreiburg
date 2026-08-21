using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalFunnelEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RentalFunnelEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Step = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    SessionKey = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Sprache = table.Column<string>(type: "TEXT", maxLength: 8, nullable: true),
                    Info = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalFunnelEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalFunnelEvents_SessionKey_CreatedAt",
                table: "RentalFunnelEvents",
                columns: new[] { "SessionKey", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_RentalFunnelEvents_Step",
                table: "RentalFunnelEvents",
                column: "Step");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RentalFunnelEvents");
        }
    }
}
