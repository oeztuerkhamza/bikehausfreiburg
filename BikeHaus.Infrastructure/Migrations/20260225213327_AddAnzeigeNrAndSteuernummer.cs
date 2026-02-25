using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAnzeigeNrAndSteuernummer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnzeigeNr",
                table: "Purchases",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Steuernummer",
                table: "Customers",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnzeigeNr",
                table: "Purchases");

            migrationBuilder.DropColumn(
                name: "Steuernummer",
                table: "Customers");
        }
    }
}
