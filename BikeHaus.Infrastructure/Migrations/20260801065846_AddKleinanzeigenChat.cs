using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddKleinanzeigenChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "KleinanzeigenChatDrafts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ConversationKey = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Draft = table.Column<string>(type: "TEXT", nullable: false),
                    DraftTr = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KleinanzeigenChatDrafts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KleinanzeigenChatTranslations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GmailMessageId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    TranslationTr = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KleinanzeigenChatTranslations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_KleinanzeigenChatDrafts_ConversationKey",
                table: "KleinanzeigenChatDrafts",
                column: "ConversationKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KleinanzeigenChatTranslations_GmailMessageId",
                table: "KleinanzeigenChatTranslations",
                column: "GmailMessageId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KleinanzeigenChatDrafts");

            migrationBuilder.DropTable(
                name: "KleinanzeigenChatTranslations");
        }
    }
}
