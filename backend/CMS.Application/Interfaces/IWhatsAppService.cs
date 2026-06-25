using System;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces
{
    public interface IWhatsAppService
    {
        Task SendRegistrationConfirmationAsync(string patientNumber, string patientName, string qrCodeUrl, string bookingLink);
        Task SendAppointmentConfirmationAsync(string patientNumber, string appointmentDate, string bookingLink);
        Task SendAppointmentRescheduleAsync(string patientNumber, string newAppointmentDate);
        Task SendFollowUpReminderAsync(string patientNumber, string reminderDate);
        Task SendPrescriptionPdfAsync(string patientNumber, string pdfUrl);
    }
}
