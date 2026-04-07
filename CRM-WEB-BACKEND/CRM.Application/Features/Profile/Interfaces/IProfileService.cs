using CRM.Application.Features.Profile.Responses;

namespace CRM.Application.Features.Profile.Interfaces;

public interface IProfileService
{
    Task<MiPerfilResponse?> ObtenerMiPerfilAsync(
        long usuarioId,
        CancellationToken cancellationToken = default);
}
