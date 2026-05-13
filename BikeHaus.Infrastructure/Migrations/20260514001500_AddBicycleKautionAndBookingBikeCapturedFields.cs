using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(BikeHausDbContext))]
    [Migration("20260514001500_AddBicycleKautionAndBookingBikeCapturedFields")]
    public partial class AddBicycleKautionAndBookingBikeCapturedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Kaution",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Farbe",
                table: "RentalBookingBikes",
                type: "TEXT",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Kaution",
                table: "RentalBookingBikes",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rahmennummer",
                table: "RentalBookingBikes",
                type: "TEXT",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Kaution",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "Farbe",
                table: "RentalBookingBikes");

            migrationBuilder.DropColumn(
                name: "Kaution",
                table: "RentalBookingBikes");

            migrationBuilder.DropColumn(
                name: "Rahmennummer",
                table: "RentalBookingBikes");
        }
    }
}
