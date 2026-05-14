using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOnlineSales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RentalPriceDay14",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay30",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPricePerDayFrom10",
                table: "Bicycles");

            migrationBuilder.CreateTable(
                name: "OnlineSales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BikeId = table.Column<int>(type: "INTEGER", nullable: false),
                    BikeTitle = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Preis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Vorname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Nachname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Adresse = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Abholtag = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    MolliePaymentId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    IsVerarbeitet = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnlineSales", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OnlineSales_IsVerarbeitet",
                table: "OnlineSales",
                column: "IsVerarbeitet");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OnlineSales");

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay14",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay30",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPricePerDayFrom10",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
