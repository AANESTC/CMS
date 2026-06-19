using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using CMS.Application.Interfaces;

namespace CMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QrController : ControllerBase
    {
        private readonly IQrCodeService _qrCodeService;
        private readonly IWhatsAppService _whatsappService;

        public QrController(IQrCodeService qrCodeService, IWhatsAppService whatsappService)
        {
            _qrCodeService = qrCodeService;
            _whatsappService = whatsappService;
        }

        [HttpPost("generate/{patientId}")]
        public async Task<IActionResult> GenerateQr(Guid patientId)
        {
            var url = await _qrCodeService.GenerateQrCodeAsync(patientId.ToString());
            return Ok(new { QrCodeUrl = url });
        }

        [HttpPost("resend/{patientId}")]
        public async Task<IActionResult> ResendQrViaWhatsApp(Guid patientId, [FromBody] string phoneNumber)
        {
            // In a real app, fetch patient details and QR code url from DB
            await _whatsappService.SendRegistrationConfirmationAsync(phoneNumber, "Patient Name", "http://example.com/qr", "http://example.com/book");
            return Ok(new { Message = "QR resent via WhatsApp" });
        }
    }
}
