using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CMS.Application.Interfaces;

namespace CMS.Infrastructure.Services
{
    public class WhatsAppService : IWhatsAppService
    {
        private readonly ILogger<WhatsAppService> _logger;

        public WhatsAppService(ILogger<WhatsAppService> logger)
        {
            _logger = logger;
        }

        public Task SendRegistrationConfirmationAsync(string patientNumber, string patientName, string qrCodeUrl, string bookingLink)
        {
            _logger.LogInformation("Sending Registration WhatsApp to {PatientNumber}", patientNumber);
            return Task.CompletedTask;
        }

        public Task SendAppointmentConfirmationAsync(string patientNumber, string appointmentDate, string bookingLink)
        {
            _logger.LogInformation("Sending Appointment Confirmation WhatsApp to {PatientNumber}", patientNumber);
            return Task.CompletedTask;
        }

        public Task SendAppointmentRescheduleAsync(string patientNumber, string newAppointmentDate)
        {
            _logger.LogInformation("Sending Appointment Reschedule WhatsApp to {PatientNumber}", patientNumber);
            return Task.CompletedTask;
        }

        public Task SendFollowUpReminderAsync(string patientNumber, string reminderDate)
        {
            _logger.LogInformation("Sending Follow-up Reminder WhatsApp to {PatientNumber}", patientNumber);
            return Task.CompletedTask;
        }

        public Task SendPrescriptionPdfAsync(string patientNumber, string pdfUrl)
        {
            _logger.LogInformation("Sending Prescription PDF WhatsApp to {PatientNumber}", patientNumber);
            return Task.CompletedTask;
        }
    }
}
