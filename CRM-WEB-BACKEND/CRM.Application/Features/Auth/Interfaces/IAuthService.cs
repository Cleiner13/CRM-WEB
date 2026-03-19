using CRM.Application.Features.Auth.Requests;
using CRM.Application.Features.Auth.Responses;

namespace CRM.Application.Features.Auth.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        string? ipAddress,
        string? userAgent,
        string? dispositivo,
        CancellationToken cancellationToken = default);

    Task<LoginResponse?> RefreshTokenAsync(
        string refreshToken,
        string? ipAddress,
        string? userAgent,
        string? dispositivo,
        CancellationToken cancellationToken = default);

    Task LogoutAsync(
        string refreshToken,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task CambiarPasswordAsync(
        long usuarioId,
        string? passwordActual,
        string passwordNueva,
        long? usuarioAccionId,
        CancellationToken cancellationToken = default);
}