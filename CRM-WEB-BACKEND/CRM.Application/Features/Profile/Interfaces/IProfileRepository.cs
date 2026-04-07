using CRM.Application.Features.Profile.Responses;

namespace CRM.Application.Features.Profile.Interfaces;

public interface IProfileRepository
{
    Task<MiPerfilResponse?> ObtenerMiPerfilAsync(
        long usuarioId,
        CancellationToken cancellationToken = default);
}
