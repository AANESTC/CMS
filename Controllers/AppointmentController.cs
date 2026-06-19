using Microsoft.AspNetCore.Mvc;
using CMS.Domain.Entities;
using CMS.Domain.Enums;
using CMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AppointmentController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> BookAppointment([FromBody] Appointment appointment)
        {
            appointment.AppointmentId = Guid.NewGuid();
            appointment.CreatedDate = DateTime.UtcNow;
            appointment.Status = AppointmentStatus.Scheduled;
            appointment.IsDeleted = false;

            _db.Appointments.Add(appointment);
            await _db.SaveChangesAsync();

            // Reload with patient + doctor
            var created = await _db.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == appointment.AppointmentId);

            return Ok(created);
        }

        [HttpGet]
        public async Task<IActionResult> GetAppointments([FromQuery] DateTime? date, [FromQuery] Guid? patientId)
        {
            var query = _db.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.IsDeleted == false)
                .AsQueryable();

            if (date.HasValue)
            {
                var day = date.Value.Date;
                query = query.Where(a => a.AppointmentDate.Date == day);
            }

            if (patientId.HasValue)
                query = query.Where(a => a.PatientId == patientId.Value);

            var list = await query
                .OrderBy(a => a.AppointmentDate)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodaysAppointments()
        {
            var today = DateTime.UtcNow.Date;
            var list = await _db.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.Documents)
                .Include(a => a.Doctor)
                .Where(a => a.AppointmentDate.Date == today && a.IsDeleted == false)
                .OrderBy(a => a.AppointmentDate)
                .ToListAsync();

            return Ok(list);
        }

        [HttpPut("{id}/reschedule")]
        public async Task<IActionResult> RescheduleAppointment(Guid id, [FromBody] RescheduleRequest request)
        {
            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            appointment.AppointmentDate = request.NewDate;
            appointment.Status = AppointmentStatus.Scheduled;
            appointment.ModifiedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var updated = await _db.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            return Ok(updated);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelAppointment(Guid id)
        {
            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            appointment.Status = AppointmentStatus.Cancelled;
            appointment.ModifiedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(appointment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(Guid id)
        {
            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            appointment.IsDeleted = true;
            appointment.ModifiedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Appointment deleted" });
        }
    }

    public class RescheduleRequest
    {
        public DateTime NewDate { get; set; }
    }
}
