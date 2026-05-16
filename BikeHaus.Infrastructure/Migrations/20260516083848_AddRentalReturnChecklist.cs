using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalReturnChecklist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AbzugNotizen",
                table: "RentalBikes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SchadenAbzug",
                table: "RentalBikes",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "TatsaechlichesRueckgabeDatum",
                table: "RentalBikes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "VerspaetungsAbzug",
                table: "RentalBikes",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ZustandBeiRueckgabe",
                table: "RentalBikes",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Zurueckgegeben",
                table: "RentalAccessoryItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AbzugNotizen",
                table: "RentalBikes");

            migrationBuilder.DropColumn(
                name: "SchadenAbzug",
                table: "RentalBikes");

            migrationBuilder.DropColumn(
                name: "TatsaechlichesRueckgabeDatum",
                table: "RentalBikes");

            migrationBuilder.DropColumn(
                name: "VerspaetungsAbzug",
                table: "RentalBikes");

            migrationBuilder.DropColumn(
                name: "ZustandBeiRueckgabe",
                table: "RentalBikes");

            migrationBuilder.DropColumn(
                name: "Zurueckgegeben",
                table: "RentalAccessoryItems");
        }
    }
}
