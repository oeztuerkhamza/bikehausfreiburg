using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAusweisPhotoRueckseite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AusweisPhotoRueckseitePath",
                table: "Rentals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AusweisPhotoRueckseitePath",
                table: "RentalBookings",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AusweisPhotoRueckseitePath",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "AusweisPhotoRueckseitePath",
                table: "RentalBookings");
        }
    }
}
