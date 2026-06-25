using CMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<FollowUpReminder> FollowUpReminders { get; set; }
        public DbSet<WhatsAppMessageLog> WhatsAppMessageLogs { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Invoice> Invoices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<FollowUpReminder>().HasKey(e => e.ReminderId);
            modelBuilder.Entity<WhatsAppMessageLog>().HasKey(e => e.LogId);

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.ContactNumber)
                .IsUnique();

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.WhatsAppNumber);

            // Soft delete query filters
            modelBuilder.Entity<Patient>().HasQueryFilter(p => !p.IsDeleted);
            modelBuilder.Entity<Appointment>().HasQueryFilter(a => !a.IsDeleted);
            modelBuilder.Entity<Document>().HasQueryFilter(d => !d.IsDeleted);
            modelBuilder.Entity<Invoice>().HasQueryFilter(i => !i.IsDeleted);

            // BalanceAmount is a C# computed property, ignore from DB mapping
            modelBuilder.Entity<Invoice>().Ignore(i => i.BalanceAmount);
        }
    }
}
