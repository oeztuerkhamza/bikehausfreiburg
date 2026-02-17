using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBikeCondition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReturnId",
                table: "Documents",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Fahrradtyp",
                table: "Bicycles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Zustand",
                table: "Bicycles",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Returns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SaleId = table.Column<int>(type: "INTEGER", nullable: false),
                    BicycleId = table.Column<int>(type: "INTEGER", nullable: false),
                    CustomerId = table.Column<int>(type: "INTEGER", nullable: false),
                    Rueckgabedatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Grund = table.Column<int>(type: "INTEGER", nullable: false),
                    GrundDetails = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Erstattungsbetrag = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Zahlungsart = table.Column<int>(type: "INTEGER", nullable: false),
                    Notizen = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    BelegNummer = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CustomerSignatureId = table.Column<int>(type: "INTEGER", nullable: true),
                    ShopSignatureId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Returns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Returns_Bicycles_BicycleId",
                        column: x => x.BicycleId,
                        principalTable: "Bicycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Returns_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Returns_Sales_SaleId",
                        column: x => x.SaleId,
                        principalTable: "Sales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Returns_Signatures_CustomerSignatureId",
                        column: x => x.CustomerSignatureId,
                        principalTable: "Signatures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Returns_Signatures_ShopSignatureId",
                        column: x => x.ShopSignatureId,
                        principalTable: "Signatures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ReturnId",
                table: "Documents",
                column: "ReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_Returns_BelegNummer",
                table: "Returns",
                column: "BelegNummer",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Returns_BicycleId",
                table: "Returns",
                column: "BicycleId");

            migrationBuilder.CreateIndex(
                name: "IX_Returns_CustomerId",
                table: "Returns",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Returns_CustomerSignatureId",
                table: "Returns",
                column: "CustomerSignatureId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Returns_SaleId",
                table: "Returns",
                column: "SaleId");

            migrationBuilder.CreateIndex(
                name: "IX_Returns_ShopSignatureId",
                table: "Returns",
                column: "ShopSignatureId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Returns_ReturnId",
                table: "Documents",
                column: "ReturnId",
                principalTable: "Returns",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Returns_ReturnId",
                table: "Documents");

            migrationBuilder.DropTable(
                name: "Returns");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ReturnId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ReturnId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Fahrradtyp",
                table: "Bicycles");

            migrationBuilder.DropColumn(
                name: "Zustand",
                table: "Bicycles");
        }
    }
}
