using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddPaymentSystem : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 💳 Create Payment table
        migrationBuilder.CreateTable(
            name: "Payments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OnlineSaleId = table.Column<int>(type: "int", nullable: true),
                ExternalPaymentId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                MollieConsumerId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Requires3Ds = table.Column<bool>(type: "bit", nullable: false),
                LastWebhookAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                IsRefunded = table.Column<bool>(type: "bit", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Payments", x => x.Id);
                table.ForeignKey(
                    name: "FK_Payments_OnlineSales_OnlineSaleId",
                    column: x => x.OnlineSaleId,
                    principalTable: "OnlineSales",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_Payments_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        // 📋 Create PaymentAuditLogs table (INSERT-only)
        migrationBuilder.CreateTable(
            name: "PaymentAuditLogs",
            columns: table => new
            {
                Id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Event = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                ExternalPaymentId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                ClientIpHash = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                Details = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                IsSuccess = table.Column<bool>(type: "bit", nullable: false),
                Timestamp = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PaymentAuditLogs", x => x.Id);
            });

        // 🔑 Create IdempotencyKeys table
        migrationBuilder.CreateTable(
            name: "IdempotencyKeys",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Key = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                ClientIpHash = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                CachedResponse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_IdempotencyKeys", x => x.Id);
            });

        // ⚙️ Create PaymentProviderConfigs table
        migrationBuilder.CreateTable(
            name: "PaymentProviderConfigs",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                ApiKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                WebhookSecret = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                IsTestMode = table.Column<bool>(type: "bit", nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                SepaDiscountRate = table.Column<decimal>(type: "decimal(5,3)", nullable: false),
                PaypalSurchargeRate = table.Column<decimal>(type: "decimal(5,3)", nullable: false),
                KlarnaSurchargeRate = table.Column<decimal>(type: "decimal(5,3)", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PaymentProviderConfigs", x => x.Id);
            });

        // Create indices for performance
        migrationBuilder.CreateIndex(
            name: "IX_Payments_ExternalPaymentId",
            table: "Payments",
            column: "ExternalPaymentId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Payments_OnlineSaleId",
            table: "Payments",
            column: "OnlineSaleId");

        migrationBuilder.CreateIndex(
            name: "IX_Payments_UserId",
            table: "Payments",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_Payments_Status",
            table: "Payments",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_Payments_CreatedAt",
            table: "Payments",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_PaymentAuditLogs_PaymentId",
            table: "PaymentAuditLogs",
            column: "PaymentId");

        migrationBuilder.CreateIndex(
            name: "IX_PaymentAuditLogs_UserId",
            table: "PaymentAuditLogs",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_PaymentAuditLogs_Event",
            table: "PaymentAuditLogs",
            column: "Event");

        migrationBuilder.CreateIndex(
            name: "IX_PaymentAuditLogs_Timestamp",
            table: "PaymentAuditLogs",
            column: "Timestamp");

        migrationBuilder.CreateIndex(
            name: "IX_IdempotencyKeys_Key_ClientIpHash",
            table: "IdempotencyKeys",
            columns: new[] { "Key", "ClientIpHash" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_IdempotencyKeys_ExpiresAt",
            table: "IdempotencyKeys",
            column: "ExpiresAt");

        migrationBuilder.CreateIndex(
            name: "IX_PaymentProviderConfigs_Provider_IsActive",
            table: "PaymentProviderConfigs",
            columns: new[] { "Provider", "IsActive" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Payments");

        migrationBuilder.DropTable(
            name: "PaymentAuditLogs");

        migrationBuilder.DropTable(
            name: "IdempotencyKeys");

        migrationBuilder.DropTable(
            name: "PaymentProviderConfigs");
    }
}
