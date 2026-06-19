using Microsoft.AspNetCore.Mvc;
using CMS.Domain.Entities;
using CMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;

        public DocumentController(ApplicationDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // Upload via multipart/form-data
        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] Guid patientId, [FromForm] string documentType, [FromForm] string uploadedBy)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { Message = "No file provided" });

            // Save file to wwwroot/uploads
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var document = new Document
            {
                DocumentId = Guid.NewGuid(),
                PatientId = patientId,
                FileUrl = $"/uploads/{uniqueFileName}",
                FilePath = filePath,
                DocumentType = Enum.TryParse<CMS.Domain.Enums.DocumentType>(documentType, out var dt) ? dt : CMS.Domain.Enums.DocumentType.Other,
                UploadedDate = DateTime.UtcNow,
                UploadedBy = uploadedBy ?? "Receptionist",
                IsDeleted = false
            };

            _db.Documents.Add(document);
            await _db.SaveChangesAsync();

            return Ok(document);
        }

        [HttpGet]
        public async Task<IActionResult> GetDocuments([FromQuery] Guid? patientId, [FromQuery] string? type)
        {
            var query = _db.Documents
                .Include(d => d.Patient)
                .AsQueryable();

            if (patientId.HasValue)
                query = query.Where(d => d.PatientId == patientId.Value);

            if (!string.IsNullOrEmpty(type) && Enum.TryParse<CMS.Domain.Enums.DocumentType>(type, out var dt))
                query = query.Where(d => d.DocumentType == dt);

            var docs = await query.OrderByDescending(d => d.UploadedDate).ToListAsync();
            return Ok(docs);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetPatientDocuments(Guid patientId)
        {
            var docs = await _db.Documents
                .Where(d => d.PatientId == patientId)
                .OrderByDescending(d => d.UploadedDate)
                .ToListAsync();
            return Ok(docs);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteDocument(Guid id)
        {
            var doc = await _db.Documents.FindAsync(id);
            if (doc == null) return NotFound();
            doc.IsDeleted = true;
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Document deleted" });
        }
    }
}
