using Microsoft.AspNetCore.Mvc;
using CMS.Domain.Entities;
using CMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public InvoiceController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> CreateInvoice([FromBody] Invoice invoice)
        {
            invoice.InvoiceId = Guid.NewGuid();
            invoice.CreatedDate = DateTime.UtcNow;
            invoice.InvoiceDate = DateTime.UtcNow;
            invoice.IsDeleted = false;
            
            // Fix null constraints for PostgreSQL
            invoice.CreatedBy = invoice.CreatedBy ?? string.Empty;
            invoice.Notes = invoice.Notes ?? string.Empty;

            // Auto-generate invoice number
            var count = await _db.Invoices.CountAsync() + 1;
            invoice.InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMM}-{count:D4}";

            // Auto set status
            if (invoice.PaidAmount >= invoice.TotalAmount)
                invoice.Status = "Paid";
            else if (invoice.PaidAmount > 0)
                invoice.Status = "Partial";
            else
                invoice.Status = "Unpaid";

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            return Ok(invoice);
        }

        [HttpGet]
        public async Task<IActionResult> GetInvoices([FromQuery] Guid? patientId)
        {
            var query = _db.Invoices
                .Include(i => i.Patient)
                .AsQueryable();

            if (patientId.HasValue)
                query = query.Where(i => i.PatientId == patientId.Value);

            var invoices = await query
                .OrderByDescending(i => i.InvoiceDate)
                .Select(i => new
                {
                    i.InvoiceId,
                    i.InvoiceNumber,
                    i.PatientId,
                    PatientName = i.Patient.Name,
                    i.TotalAmount,
                    i.PaidAmount,
                    BalanceAmount = i.TotalAmount - i.PaidAmount,
                    i.Status,
                    i.Notes,
                    i.InvoiceDate
                })
                .ToListAsync();

            return Ok(invoices);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoice(Guid id)
        {
            var invoice = await _db.Invoices
                .Include(i => i.Patient)
                .Include(i => i.Appointment)
                .Where(i => i.InvoiceId == id)
                .Select(i => new
                {
                    i.InvoiceId,
                    i.InvoiceNumber,
                    i.PatientId,
                    PatientName = i.Patient.Name,
                    PatientContact = i.Patient.ContactNumber,
                    i.TotalAmount,
                    i.PaidAmount,
                    BalanceAmount = i.TotalAmount - i.PaidAmount,
                    i.Status,
                    i.Notes,
                    i.InvoiceDate
                })
                .FirstOrDefaultAsync();

            if (invoice == null) return NotFound();
            return Ok(invoice);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInvoice(Guid id, [FromBody] Invoice invoiceData)
        {
            var invoice = await _db.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            invoice.TotalAmount = invoiceData.TotalAmount;
            invoice.PaidAmount = invoiceData.PaidAmount;
            invoice.Notes = invoiceData.Notes ?? string.Empty;

            if (invoice.PaidAmount >= invoice.TotalAmount)
                invoice.Status = "Paid";
            else if (invoice.PaidAmount > 0)
                invoice.Status = "Partial";
            else
                invoice.Status = "Unpaid";

            await _db.SaveChangesAsync();
            return Ok(invoice);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(Guid id)
        {
            var invoice = await _db.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();
            invoice.IsDeleted = true;
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Invoice deleted" });
        }
    }
}
