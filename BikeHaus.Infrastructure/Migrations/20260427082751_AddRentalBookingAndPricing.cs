using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalBookingAndPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRentable",
                table: "Bicycles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay1",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay14",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay3",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay30",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPriceDay7",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentalPricePerDayFrom10",
                table: "Bicycles",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RentalAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Bezeichnung = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Tagespreis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Aktiv = table.Column<bool>(type: "INTEGER", nullable: false),
                    Beschreibung = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalAccessories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RentalBookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BicycleId = table.Column<int>(type: "INTEGER", nullable: false),
                    BuchungsNummer = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    StartDatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Vorname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Nachname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Telefon = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Sprache = table.Column<string>(type: "TEXT", maxLength: 5, nullable: true),
                    Notizen = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    AdminNotizen = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Gesamtpreis = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalBookings_Bicycles_BicycleId",
                        column: x => x.BicycleId,
                        principalTable: "Bicycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RentalBookingAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RentalBookingId = table.Column<int>(type: "INTEGER", nullable: false),
                    RentalAccessoryId = table.Column<int>(type: "INTEGER", nullable: true),
                    Bezeichnung = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Tagespreis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Menge = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalBookingAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalBookingAccessories_RentalAccessories_RentalAccessoryId",
                        column: x => x.RentalAccessoryId,
                        principalTable: "RentalAccessories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RentalBookingAccessories_RentalBookings_RentalBookingId",
                        column: x => x.RentalBookingId,
                        principalTable: "RentalBookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookingAccessories_RentalAccessoryId",
                table: "RentalBookingAccessories",
                column: "RentalAccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookingAccessories_RentalBookingId",
                table: "RentalBookingAccessories",
                column: "RentalBookingId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookings_BicycleId",
                table: "RentalBookings",
                column: "BicycleId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBookings_BuchungsNummer",
                table: "RentalBookings",
                column: "BuchungsNummer",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RentalBookingAccessories");

            migrationBuilder.DropTable(
                name: "RentalAccessories");

            migrationBuilder.DropTable(
                name: "RentalBookings");

            migrationBuilder.DropColumn(
                name: "IsRentable",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay1",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay14",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay3",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay30",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPriceDay7",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "RentalPricePerDayFrom10",
                table: "Bicycles");
        }
    }
}
