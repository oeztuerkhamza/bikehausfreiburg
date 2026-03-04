using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddKleinanzeigenAnzeigeNr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KleinanzeigenAnzeigeNr",
                table: "Bicycles",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KleinanzeigenAnzeigeNr",
                table: "Bicycles");
        }
    }
}
