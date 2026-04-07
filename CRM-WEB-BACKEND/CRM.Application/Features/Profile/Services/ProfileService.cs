using CRM.Application.Features.Profile.Interfaces;
using CRM.Application.Features.Profile.Responses;

namespace CRM.Application.Features.Profile.Services;

public class ProfileService : IProfileService
{
    private readonly IProfileRepository _profileRepository;

    public ProfileService(IProfileRepository profileRepository)
    {
        _profileRepository = profileRepository;
    }

    public Task<MiPerfilResponse?> ObtenerMiPerfilAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        return _profileRepository.ObtenerMiPerfilAsync(usuarioId, cancellationToken);
    }
}
