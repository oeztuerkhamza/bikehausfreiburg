using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalZahlungsartAndRabatt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KautionInWorten",
                table: "Rentals");

            migrationBuilder.AddColumn<decimal>(
                name: "Rabatt",
                table: "Rentals",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Zahlungsart",
                table: "Rentals",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rabatt",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "Zahlungsart",
                table: "Rentals");

            migrationBuilder.AddColumn<string>(
                name: "KautionInWorten",
                table: "Rentals",
                type: "TEXT",
                maxLength: 200,
                nullable: true);
        }
    }
}
