using CRM.Domain.Entities;

namespace CRM.Application.Features.Auth.Interfaces;

public interface IAuthRepository
{
    Task<Usuario?> ValidarLoginAsync(
        string username,
        string password,
        CancellationToken cancellationToken = default);

    Task RegistrarRefreshTokenAsync(
        long usuarioId,
        string refreshToken,
        DateTime expiraEn,
        string? dispositivo,
        string? ipAddress,
        long? usuarioIdAccion,
        string? userAgent,
        CancellationToken cancellationToken = default);
}