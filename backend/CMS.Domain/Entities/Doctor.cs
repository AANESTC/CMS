using System;
using System.Collections.Generic;

namespace CMS.Domain.Entities
{
    public class Doctor
    {
        public Guid DoctorId { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string Specialization { get; set; }
        public string? Department { get; set; }
        public string? Email { get; set; }
        public string? ContactNumber { get; set; }
        public string? Gender { get; set; }
        public int? ExperienceYears { get; set; }
        public string? LicenseNumber { get; set; }
        public string? ConsultationDays { get; set; } = "Mon-Fri";
        public int? MaxPatientsPerDay { get; set; }
        public int PatientsToday { get; set; } = 0;

        public Guid UserId { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
