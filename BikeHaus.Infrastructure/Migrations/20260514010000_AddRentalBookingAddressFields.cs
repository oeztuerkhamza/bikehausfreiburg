using BikeHaus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(BikeHausDbContext))]
    [Migration("20260514010000_AddRentalBookingAddressFields")]
    public partial class AddRentalBookingAddressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Strasse",
                table: "RentalBookings",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HausNr",
                table: "RentalBookings",
                type: "TEXT",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PLZ",
                table: "RentalBookings",
                type: "TEXT",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ort",
                table: "RentalBookings",
                type: "TEXT",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Strasse", table: "RentalBookings");
            migrationBuilder.DropColumn(name: "HausNr", table: "RentalBookings");
            migrationBuilder.DropColumn(name: "PLZ", table: "RentalBookings");
            migrationBuilder.DropColumn(name: "Ort", table: "RentalBookings");
        }
    }
}
