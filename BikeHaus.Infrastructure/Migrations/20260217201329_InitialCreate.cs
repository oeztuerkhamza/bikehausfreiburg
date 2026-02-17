using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bicycles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Marke = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Modell = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Rahmennummer = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Farbe = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Reifengroesse = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Beschreibung = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bicycles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Vorname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Nachname = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Strasse = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Hausnummer = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    PLZ = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    Stadt = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Telefon = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Ausweisnummer = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Purchases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BicycleId = table.Column<int>(type: "INTEGER", nullable: false),
                    SellerId = table.Column<int>(type: "INTEGER", nullable: false),
                    Preis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Zahlungsart = table.Column<int>(type: "INTEGER", nullable: false),
                    Kaufdatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notizen = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    BelegNummer = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Purchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Purchases_Bicycles_BicycleId",
                        column: x => x.BicycleId,
                        principalTable: "Bicycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Purchases_Customers_SellerId",
                        column: x => x.SellerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Signatures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SignatureData = table.Column<string>(type: "TEXT", nullable: false),
                    SignerName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    SignatureType = table.Column<int>(type: "INTEGER", nullable: false),
                    SignedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PurchaseId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Signatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Signatures_Purchases_PurchaseId",
                        column: x => x.PurchaseId,
                        principalTable: "Purchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BicycleId = table.Column<int>(type: "INTEGER", nullable: false),
                    BuyerId = table.Column<int>(type: "INTEGER", nullable: false),
                    PurchaseId = table.Column<int>(type: "INTEGER", nullable: true),
                    Preis = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Zahlungsart = table.Column<int>(type: "INTEGER", nullable: false),
                    Verkaufsdatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Garantie = table.Column<bool>(type: "INTEGER", nullable: false),
                    GarantieBedingungen = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Notizen = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    BelegNummer = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    BuyerSignatureId = table.Column<int>(type: "INTEGER", nullable: true),
                    SellerSignatureId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sales_Bicycles_BicycleId",
                        column: x => x.BicycleId,
                        principalTable: "Bicycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sales_Customers_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sales_Purchases_PurchaseId",
                        column: x => x.PurchaseId,
                        principalTable: "Purchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Sales_Signatures_BuyerSignatureId",
                        column: x => x.BuyerSignatureId,
                        principalTable: "Signatures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Sales_Signatures_SellerSignatureId",
                        column: x => x.SellerSignatureId,
                        principalTable: "Signatures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FileName = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "INTEGER", nullable: false),
                    DocumentType = table.Column<int>(type: "INTEGER", nullable: false),
                    BicycleId = table.Column<int>(type: "INTEGER", nullable: true),
                    PurchaseId = table.Column<int>(type: "INTEGER", nullable: true),
                    SaleId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Bicycles_BicycleId",
                        column: x => x.BicycleId,
                        principalTable: "Bicycles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Documents_Purchases_PurchaseId",
                        column: x => x.PurchaseId,
                        principalTable: "Purchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Documents_Sales_SaleId",
                        column: x => x.SaleId,
                        principalTable: "Sales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bicycles_Rahmennummer",
                table: "Bicycles",
                column: "Rahmennummer");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_BicycleId",
                table: "Documents",
                column: "BicycleId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_PurchaseId",
                table: "Documents",
                column: "PurchaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_SaleId",
                table: "Documents",
                column: "SaleId");

            migrationBuilder.CreateIndex(
                name: "IX_Purchases_BelegNummer",
                table: "Purchases",
                column: "BelegNummer",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Purchases_BicycleId",
                table: "Purchases",
                column: "BicycleId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Purchases_SellerId",
                table: "Purchases",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_BelegNummer",
                table: "Sales",
                column: "BelegNummer",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_BicycleId",
                table: "Sales",
                column: "BicycleId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_BuyerId",
                table: "Sales",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Sales_BuyerSignatureId",
                table: "Sales",
                column: "BuyerSignatureId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_PurchaseId",
                table: "Sales",
                column: "PurchaseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_SellerSignatureId",
                table: "Sales",
                column: "SellerSignatureId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Signatures_PurchaseId",
                table: "Signatures",
                column: "PurchaseId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Sales");

            migrationBuilder.DropTable(
                name: "Signatures");

            migrationBuilder.DropTable(
                name: "Purchases");

            migrationBuilder.DropTable(
                name: "Bicycles");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}
