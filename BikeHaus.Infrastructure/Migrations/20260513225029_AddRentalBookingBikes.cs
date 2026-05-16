using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalBookingBikes : Migration
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
                name: "RentalBookingBikes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RentalBookingId = table.Column<int>(type: "INTEGER", nullable: false),
                    BicycleId = table.Column<int>(type: "INTEGER", nullable: false),
                    StartDatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Gesamtpreis = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalBookingBikes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalBookingBikes_Bicycles_BicycleId",
                        column: x => x.BicycleId,
                        principalTable: "Bicycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RentalBookingBikes_RentalBookings_RentalBookingId",
                        column: x => x.RentalBookingId,
                        principalTable: "RentalBookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookingBikes_BicycleId",
                table: "RentalBookingBikes",
                column: "BicycleId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookingBikes_RentalBookingId",
                table: "RentalBookingBikes",
                column: "RentalBookingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RentalBookingBikes");

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
