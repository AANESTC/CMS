using System.Threading.Tasks;

namespace CMS.Application.Interfaces
{
    public interface IQrCodeService
    {
        Task<string> GenerateQrCodeAsync(string patientId);
    }
}
