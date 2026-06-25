using System;
using CMS.Domain.Enums;

namespace CMS.Domain.Entities
{
    public class Appointment
    {
        public Guid AppointmentId { get; set; } = Guid.NewGuid();
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public AppointmentStatus Status { get; set; }
        public string? BookingLink { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Patient? Patient { get; set; }
        public Doctor? Doctor { get; set; }
    }
}
