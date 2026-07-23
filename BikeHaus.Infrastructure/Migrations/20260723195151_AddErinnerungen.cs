using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddErinnerungen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Erinnerungen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Ad = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Ort = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Geschichte = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Onaylandi = table.Column<bool>(type: "INTEGER", nullable: false),
                    AdminNotiz = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Erinnerungen", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ErinnerungFotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ErinnerungId = table.Column<int>(type: "INTEGER", nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErinnerungFotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ErinnerungFotos_Erinnerungen_ErinnerungId",
                        column: x => x.ErinnerungId,
                        principalTable: "Erinnerungen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Erinnerungen_Onaylandi",
                table: "Erinnerungen",
                column: "Onaylandi");

            migrationBuilder.CreateIndex(
                name: "IX_ErinnerungFotos_ErinnerungId",
                table: "ErinnerungFotos",
                column: "ErinnerungId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ErinnerungFotos");

            migrationBuilder.DropTable(
                name: "Erinnerungen");
        }
    }
}
