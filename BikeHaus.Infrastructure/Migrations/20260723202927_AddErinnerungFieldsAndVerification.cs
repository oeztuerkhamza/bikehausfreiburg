using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddErinnerungFieldsAndVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ort",
                table: "Erinnerungen");

            migrationBuilder.AddColumn<int>(
                name: "Alter",
                table: "Erinnerungen",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Aufrufe",
                table: "Erinnerungen",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Erinnerungen",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Land",
                table: "Erinnerungen",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ErinnerungVerifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Used = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErinnerungVerifications", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ErinnerungVerifications_Email_Code",
                table: "ErinnerungVerifications",
                columns: new[] { "Email", "Code" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ErinnerungVerifications");

            migrationBuilder.DropColumn(
                name: "Alter",
                table: "Erinnerungen");

            migrationBuilder.DropColumn(
                name: "Aufrufe",
                table: "Erinnerungen");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Erinnerungen");

            migrationBuilder.DropColumn(
                name: "Land",
                table: "Erinnerungen");

            migrationBuilder.AddColumn<string>(
                name: "Ort",
                table: "Erinnerungen",
                type: "TEXT",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }
    }
}
