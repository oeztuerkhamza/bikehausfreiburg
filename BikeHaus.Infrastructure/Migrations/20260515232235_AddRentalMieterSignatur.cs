using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalMieterSignatur : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AgbAkzeptiert",
                table: "Rentals",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MieterUnterschrift",
                table: "Rentals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UnterschriftOrt",
                table: "Rentals",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgbAkzeptiert",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "MieterUnterschrift",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "UnterschriftOrt",
                table: "Rentals");
        }
    }
}
