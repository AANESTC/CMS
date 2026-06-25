using System;
using CMS.Domain.Enums;

namespace CMS.Domain.Entities
{
    public class FollowUpReminder
    {
        public Guid ReminderId { get; set; } = Guid.NewGuid();
        public Guid PatientId { get; set; }
        public Guid PrescriptionId { get; set; }
        public DateTime ReminderDate { get; set; }
        public ReminderStatus Status { get; set; }
        public DateTime? SentAt { get; set; }

        public Patient Patient { get; set; }
        public Prescription Prescription { get; set; }
    }
}
