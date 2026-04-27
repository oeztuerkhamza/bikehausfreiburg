using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalAccessoryItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RentalAccessoryItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RentalId = table.Column<int>(type: "INTEGER", nullable: false),
                    RentalAccessoryId = table.Column<int>(type: "INTEGER", nullable: true),
                    Bezeichnung = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Tagespreis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Menge = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalAccessoryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalAccessoryItems_RentalAccessories_RentalAccessoryId",
                        column: x => x.RentalAccessoryId,
                        principalTable: "RentalAccessories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RentalAccessoryItems_Rentals_RentalId",
                        column: x => x.RentalId,
                        principalTable: "Rentals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalAccessoryItems_RentalAccessoryId",
                table: "RentalAccessoryItems",
                column: "RentalAccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalAccessoryItems_RentalId",
                table: "RentalAccessoryItems",
                column: "RentalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RentalAccessoryItems");
        }
    }
}
