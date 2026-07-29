using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalBikeNumberAndRiderHeight : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Fahrradnummer",
                table: "Bicycles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "KoerpergroesseBisCm",
                table: "Bicycles",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "KoerpergroesseVonCm",
                table: "Bicycles",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fahrradnummer",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "KoerpergroesseBisCm",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "KoerpergroesseVonCm",
                table: "Bicycles");
        }
    }
}
