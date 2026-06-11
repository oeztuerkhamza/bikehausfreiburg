using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBicycleLagernummer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Lagernummer",
                table: "Bicycles",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bicycles_Lagernummer",
                table: "Bicycles",
                column: "Lagernummer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bicycles_Lagernummer",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "Lagernummer",
                table: "Bicycles");
        }
    }
}
