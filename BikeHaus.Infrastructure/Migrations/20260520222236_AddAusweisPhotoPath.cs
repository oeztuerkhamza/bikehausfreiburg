using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAusweisPhotoPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AusweisPhotoPath",
                table: "Rentals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AusweisPhotoPath",
                table: "RentalBookings",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AusweisPhotoPath",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "AusweisPhotoPath",
                table: "RentalBookings");
        }
    }
}
