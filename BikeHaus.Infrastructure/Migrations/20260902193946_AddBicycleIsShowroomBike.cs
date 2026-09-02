using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeHaus.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBicycleIsShowroomBike : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsShowroomBike",
                table: "Bicycles",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            // Bestandsdaten: was heute auf der Website steht, war eine bewusste
            // Entscheidung und bleibt im Showroom. Ohne diesen Nachzug waere der
            // Showroom nach dem Deploy schlagartig leer, weil die oeffentliche
            // Abfrage ab jetzt BEIDE Flags verlangt.
            //
            // Die Grenze gilt damit ab hier: ein Rad aus dem Tagesgeschaeft
            // kommt nur noch in den Katalog, wenn es ausdruecklich dorthin
            // gestellt wird.
            migrationBuilder.Sql(
                "UPDATE Bicycles SET IsShowroomBike = 1 WHERE IsPublishedOnWebsite = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsShowroomBike",
                table: "Bicycles");
        }
    }
}
