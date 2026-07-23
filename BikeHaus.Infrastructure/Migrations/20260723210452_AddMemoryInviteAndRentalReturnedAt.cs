using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMemoryInviteAndRentalReturnedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RueckgabeAt",
                table: "Rentals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MemoryInvites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Vorname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    SentAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Source = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemoryInvites", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MemoryInvites_Email",
                table: "MemoryInvites",
                column: "Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemoryInvites");

            migrationBuilder.DropColumn(
                name: "RueckgabeAt",
                table: "Rentals");
        }
    }
}
