using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixRentalPriceCorruption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Kaution",
                table: "RentalBookings");

            migrationBuilder.DropColumn(
                name: "Rahmennummer",
                table: "RentalBookings");

            migrationBuilder.DropColumn(
                name: "Farbe",
                table: "BicycleImages");

            migrationBuilder.AddColumn<string>(
                name: "Farbe",
                table: "RentalBookingBikes",
                type: "TEXT",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Kaution",
                table: "RentalBookingBikes",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rahmennummer",
                table: "RentalBookingBikes",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            // Fix corrupted rental price data where column names were stored as values
            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceAdditionalDayAfter7"" = NULL 
                  WHERE ""RentalPriceAdditionalDayAfter7"" = 'RentalPriceAdditionalDayAfter7'
                     OR ""RentalPriceAdditionalDayAfter7"" IS NOT NULL AND CAST(""RentalPriceAdditionalDayAfter7"" AS TEXT) LIKE 'RentalPrice%'");

            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceDay1"" = NULL 
                  WHERE ""RentalPriceDay1"" = 'RentalPriceDay1'
                     OR ""RentalPriceDay1"" IS NOT NULL AND CAST(""RentalPriceDay1"" AS TEXT) LIKE 'RentalPrice%'");

            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceDay2"" = NULL 
                  WHERE ""RentalPriceDay2"" = 'RentalPriceDay2'
                     OR ""RentalPriceDay2"" IS NOT NULL AND CAST(""RentalPriceDay2"" AS TEXT) LIKE 'RentalPrice%'");

            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceDay3"" = NULL 
                  WHERE ""RentalPriceDay3"" = 'RentalPriceDay3'
                     OR ""RentalPriceDay3"" IS NOT NULL AND CAST(""RentalPriceDay3"" AS TEXT) LIKE 'RentalPrice%'");

            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceDay4"" = NULL 
                  WHERE ""RentalPriceDay4"" = 'RentalPriceDay4'
                     OR ""RentalPriceDay4"" IS NOT NULL AND CAST(""RentalPriceDay4"" AS TEXT) LIKE 'RentalPrice%'");

            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceDay5"" = NULL 
                  WHERE ""RentalPriceDay5"" = 'RentalPriceDay5'
                     OR ""RentalPriceDay5"" IS NOT NULL AND CAST(""RentalPriceDay5"" AS TEXT) LIKE 'RentalPrice%'");

            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceDay6"" = NULL 
                  WHERE ""RentalPriceDay6"" = 'RentalPriceDay6'
                     OR ""RentalPriceDay6"" IS NOT NULL AND CAST(""RentalPriceDay6"" AS TEXT) LIKE 'RentalPrice%'");

            migrationBuilder.Sql(
                @"UPDATE ""Bicycles"" SET 
                  ""RentalPriceDay7"" = NULL 
                  WHERE ""RentalPriceDay7"" = 'RentalPriceDay7'
                     OR ""RentalPriceDay7"" IS NOT NULL AND CAST(""RentalPriceDay7"" AS TEXT) LIKE 'RentalPrice%'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Farbe",
                table: "RentalBookingBikes");

            migrationBuilder.DropColumn(
                name: "Kaution",
                table: "RentalBookingBikes");

            migrationBuilder.DropColumn(
                name: "Rahmennummer",
                table: "RentalBookingBikes");

            migrationBuilder.AddColumn<decimal>(
                name: "Kaution",
                table: "RentalBookings",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rahmennummer",
                table: "RentalBookings",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Farbe",
                table: "BicycleImages",
                type: "TEXT",
                maxLength: 150,
                nullable: true);
        }
    }
}
