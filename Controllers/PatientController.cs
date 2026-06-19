using Microsoft.AspNetCore.Mvc;
using CMS.Domain.Entities;
using CMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PatientController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> RegisterPatient([FromBody] Patient patient)
        {
            patient.PatientId = Guid.NewGuid();
            patient.CreatedDate = DateTime.UtcNow;
            patient.IsDeleted = false;
            patient.CreatedBy ??= "Receptionist";
            patient.ModifiedBy ??= "";
            patient.QrCodeUrl ??= "";

            try
            {
                _db.Patients.Add(patient);
                await _db.SaveChangesAsync();
                return Ok(patient);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerMessage = ex.InnerException?.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatient(Guid id)
        {
            var patient = await _db.Patients
                .Include(p => p.Documents)
                .Include(p => p.Appointments)
                .FirstOrDefaultAsync(p => p.PatientId == id);

            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpGet]
        public async Task<IActionResult> GetPatients([FromQuery] string? search)
        {
            var query = _db.Patients.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lower = search.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(lower) ||
                    p.ContactNumber.Contains(lower));
            }

            var patients = await query
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();

            return Ok(patients);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditPatient(Guid id, [FromBody] Patient patientData)
        {
            var patient = await _db.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            patient.Name = patientData.Name;
            patient.Age = patientData.Age;
            patient.Gender = patientData.Gender;
            patient.ContactNumber = patientData.ContactNumber;
            patient.WhatsAppNumber = patientData.WhatsAppNumber;
            patient.Address = patientData.Address;
            patient.Email = patientData.Email;
            patient.ModifiedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(patient);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(Guid id)
        {
            var patient = await _db.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            patient.IsDeleted = true;
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Patient deleted" });
        }
    }
}
