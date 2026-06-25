using System;

namespace CMS.Domain.Entities
{
    public class WhatsAppMessageLog
    {
        public Guid LogId { get; set; } = Guid.NewGuid();
        public Guid PatientId { get; set; }
        public string MessageType { get; set; }
        public string Status { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public string ErrorMessage { get; set; }
        
        public Patient Patient { get; set; }
    }
}
