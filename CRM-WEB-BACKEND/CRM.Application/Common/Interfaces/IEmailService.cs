using System.Threading;
using System.Threading.Tasks;

namespace CRM.Application.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetCodeAsync(string to, string code, DateTime expiraEn, CancellationToken cancellationToken = default);
    }
}