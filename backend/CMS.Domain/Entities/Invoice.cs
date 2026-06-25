using System;

namespace CMS.Domain.Entities
{
    public class Invoice
    {
        public Guid InvoiceId { get; set; } = Guid.NewGuid();
        public Guid PatientId { get; set; }
        public Guid? AppointmentId { get; set; }
        public string? InvoiceNumber { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceAmount => TotalAmount - PaidAmount;
        public string? Status { get; set; } = "Unpaid"; // Unpaid, Partial, Paid
        public string? Notes { get; set; }
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Patient? Patient { get; set; }
        public Appointment? Appointment { get; set; }
    }
}
