using System.Threading.Tasks;

namespace CMS.Application.Interfaces
{
    public interface IPdfGenerationService
    {
        Task<string> GeneratePrescriptionPdfAsync(object prescriptionData);
    }
}
