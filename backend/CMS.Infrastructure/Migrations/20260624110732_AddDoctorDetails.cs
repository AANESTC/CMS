using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConsultationDays",
                table: "Doctors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "Doctors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxPatientsPerDay",
                table: "Doctors",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PatientsToday",
                table: "Doctors",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConsultationDays",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "MaxPatientsPerDay",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "PatientsToday",
                table: "Doctors");
        }
    }
}
