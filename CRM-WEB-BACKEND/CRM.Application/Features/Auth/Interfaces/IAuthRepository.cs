using CRM.Application.Features.Auth.Dtos;
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

    Task<RefreshTokenValidationResult?> ValidarRefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default);

    Task RotarRefreshTokenAsync(
        string refreshTokenActual,
        string nuevoRefreshToken,
        DateTime nuevaExpiraEn,
        string? dispositivo,
        string? ipAddress,
        long? usuarioIdAccion,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task RevocarRefreshTokenAsync(
        string refreshToken,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task RevocarRefreshTokensPorUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<Usuario?> ObtenerUsuarioPorIdAsync(
        long usuarioId,
        CancellationToken cancellationToken = default);

    Task CambiarPasswordAsync(
        long usuarioId,
        string? passwordActual,
        string passwordNueva,
        long? usuarioAccionId,
        CancellationToken cancellationToken = default);
}