using CRM.Application.Features.Empleados.Responses;

namespace CRM.Application.Common.Interfaces;

public interface IPeruApiDniService
{
    Task<EmpleadoConsultaDniResponse?> ConsultarDniAsync(
        string numeroDocumento,
        CancellationToken cancellationToken = default);
}