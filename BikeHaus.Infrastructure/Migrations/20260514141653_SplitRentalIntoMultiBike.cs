using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SplitRentalIntoMultiBike : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create RentalBikes table first so we can copy data into it
            migrationBuilder.CreateTable(
                name: "RentalBikes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RentalId = table.Column<int>(type: "INTEGER", nullable: false),
                    BicycleId = table.Column<int>(type: "INTEGER", nullable: false),
                    Rahmennummer = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Farbe = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    StartDatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Mietpreis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Kaution = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    KautionZurueckgegeben = table.Column<bool>(type: "INTEGER", nullable: false),
                    KautionRueckgabeUnterschrift = table.Column<string>(type: "TEXT", nullable: true),
                    ZustandBeiUebergabe = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalBikes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalBikes_Bicycles_BicycleId",
                        column: x => x.BicycleId,
                        principalTable: "Bicycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RentalBikes_Rentals_RentalId",
                        column: x => x.RentalId,
                        principalTable: "Rentals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalBikes_BicycleId",
                table: "RentalBikes",
                column: "BicycleId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalBikes_RentalId",
                table: "RentalBikes",
                column: "RentalId");

            // 2. Copy existing single-bike rentals into RentalBikes
            //    Each existing Rental becomes one RentalBike preserving its bike, dates, deposit,
            //    deposit-return flag, signature, and condition.
            migrationBuilder.Sql(@"
                INSERT INTO RentalBikes
                    (RentalId, BicycleId, Rahmennummer, Farbe, StartDatum, EndDatum,
                     Mietpreis, Kaution, KautionZurueckgegeben, KautionRueckgabeUnterschrift,
                     ZustandBeiUebergabe, CreatedAt, UpdatedAt)
                SELECT
                    r.Id,
                    r.BicycleId,
                    NULL,
                    NULL,
                    r.StartDatum,
                    r.EndDatum,
                    r.Gesamtmiete,
                    r.Kaution,
                    r.KautionZurueckgegeben,
                    r.KautionRueckgabeUnterschrift,
                    r.ZustandBeiUebergabe,
                    r.CreatedAt,
                    r.UpdatedAt
                FROM Rentals r;
            ");

            // 3. Now drop the obsolete columns from Rentals
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_Bicycles_BicycleId",
                table: "Rentals");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_BicycleId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "BicycleId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "KautionRueckgabeUnterschrift",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "KautionZurueckgegeben",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "ZustandBeiUebergabe",
                table: "Rentals");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore the columns on Rentals first
            migrationBuilder.AddColumn<int>(
                name: "BicycleId",
                table: "Rentals",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "KautionRueckgabeUnterschrift",
                table: "Rentals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "KautionZurueckgegeben",
                table: "Rentals",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ZustandBeiUebergabe",
                table: "Rentals",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // Pull single-bike data back (best-effort: takes the first RentalBike per Rental).
            // Multi-bike rentals lose their additional bikes here — irreversible by design.
            migrationBuilder.Sql(@"
                UPDATE Rentals
                SET
                    BicycleId = (
                        SELECT rb.BicycleId
                        FROM RentalBikes rb
                        WHERE rb.RentalId = Rentals.Id
                        ORDER BY rb.Id
                        LIMIT 1
                    ),
                    KautionZurueckgegeben = COALESCE((
                        SELECT rb.KautionZurueckgegeben
                        FROM RentalBikes rb
                        WHERE rb.RentalId = Rentals.Id
                        ORDER BY rb.Id
                        LIMIT 1
                    ), 0),
                    KautionRueckgabeUnterschrift = (
                        SELECT rb.KautionRueckgabeUnterschrift
                        FROM RentalBikes rb
                        WHERE rb.RentalId = Rentals.Id
                        ORDER BY rb.Id
                        LIMIT 1
                    ),
                    ZustandBeiUebergabe = COALESCE((
                        SELECT rb.ZustandBeiUebergabe
                        FROM RentalBikes rb
                        WHERE rb.RentalId = Rentals.Id
                        ORDER BY rb.Id
                        LIMIT 1
                    ), 0);
            ");

            migrationBuilder.DropTable(
                name: "RentalBikes");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_BicycleId",
                table: "Rentals",
                column: "BicycleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_Bicycles_BicycleId",
                table: "Rentals",
                column: "BicycleId",
                principalTable: "Bicycles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
