using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDetailedRentalPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceAdditionalDayAfter7",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay2",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay4",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay5",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay6",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RentalPriceAdditionalDayAfter7",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay2",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay4",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay5",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay6",
                table: "Bicycles");
        }
    }
}