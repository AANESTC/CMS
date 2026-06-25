using System;
using CMS.Domain.Enums;

namespace CMS.Domain.Entities
{
    public class Prescription
    {
        public Guid PrescriptionId { get; set; } = Guid.NewGuid();
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public string Medicines { get; set; } // JSON or structured string
        public string Dosage { get; set; }
        public string Instructions { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public PrescriptionType PrescriptionType { get; set; }
        public string PdfUrl { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public Patient Patient { get; set; }
        public Doctor Doctor { get; set; }
    }
}
