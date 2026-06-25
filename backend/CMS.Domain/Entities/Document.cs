using System;
using CMS.Domain.Enums;

namespace CMS.Domain.Entities
{
    public class Document
    {
        public Guid DocumentId { get; set; } = Guid.NewGuid();
        public Guid PatientId { get; set; }
        public string? FileUrl { get; set; }
        public string? FilePath { get; set; }
        public DocumentType DocumentType { get; set; }
        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
        public string? UploadedBy { get; set; }
        public string? CreatedBy { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public bool IsDeleted { get; set; } = false;
        
        public Patient? Patient { get; set; }
    }
}
