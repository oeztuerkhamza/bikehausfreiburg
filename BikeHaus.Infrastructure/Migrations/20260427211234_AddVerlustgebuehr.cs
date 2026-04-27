using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVerlustgebuehr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Verlustgebuehr",
                table: "RentalAccessoryItems",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Verlustgebuehr",
                table: "RentalAccessories",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Verlustgebuehr",
                table: "RentalAccessoryItems");

            migrationBuilder.DropColumn(
                name: "Verlustgebuehr",
                table: "RentalAccessories");
        }
    }
}
