using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AllowMultipleSalesForBicycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sales_BicycleId",
                table: "Sales");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_BicycleId",
                table: "Sales",
                column: "BicycleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sales_BicycleId",
                table: "Sales");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_BicycleId",
                table: "Sales",
                column: "BicycleId",
                unique: true);
        }
    }
}
