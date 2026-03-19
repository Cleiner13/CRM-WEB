using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Auth.Interfaces;
using CRM.Application.Features.Auth.Requests;
using CRM.Application.Features.Auth.Responses;
using CRM.Domain.Entities;

namespace CRM.Application.Features.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly ITokenService _tokenService;

    public AuthService(
        IAuthRepository authRepository,
        ITokenService tokenService)
    {
        _authRepository = authRepository;
        _tokenService = tokenService;
    }

    public async Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        string? ipAddress,
        string? userAgent,
        string? dispositivo,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        var usuario = await _authRepository.ValidarLoginAsync(
            request.Username.Trim(),
            request.Password,
            cancellationToken);

        if (usuario is null)
        {
            return null;
        }

        var accessToken = _tokenService.GenerateAccessToken(usuario);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var accessTokenExpiraEn = DateTime.UtcNow.AddMinutes(60);
        var refreshTokenExpiraEn = DateTime.UtcNow.AddDays(7);

        await _authRepository.RegistrarRefreshTokenAsync(
            usuarioId: usuario.UsuarioId,
            refreshToken: refreshToken,
            expiraEn: refreshTokenExpiraEn,
            dispositivo: dispositivo,
            ipAddress: ipAddress,
            usuarioIdAccion: usuario.UsuarioId,
            userAgent: userAgent,
            cancellationToken: cancellationToken);

        return MapLoginResponse(usuario, accessToken, refreshToken, accessTokenExpiraEn);
    }

    public async Task<LoginResponse?> RefreshTokenAsync(
        string refreshToken,
        string? ipAddress,
        string? userAgent,
        string? dispositivo,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return null;
        }

        var validacion = await _authRepository.ValidarRefreshTokenAsync(
            refreshToken,
            cancellationToken);

        if (validacion is null || !validacion.EsValido)
        {
            return null;
        }

        var usuario = await _authRepository.ObtenerUsuarioPorIdAsync(
            validacion.UsuarioId,
            cancellationToken);

        if (usuario is null || !usuario.Activo)
        {
            return null;
        }

        var nuevoAccessToken = _tokenService.GenerateAccessToken(usuario);
        var nuevoRefreshToken = _tokenService.GenerateRefreshToken();

        var accessTokenExpiraEn = DateTime.UtcNow.AddMinutes(60);
        var nuevaExpiraEn = DateTime.UtcNow.AddDays(7);

        await _authRepository.RotarRefreshTokenAsync(
            refreshTokenActual: refreshToken,
            nuevoRefreshToken: nuevoRefreshToken,
            nuevaExpiraEn: nuevaExpiraEn,
            dispositivo: dispositivo,
            ipAddress: ipAddress,
            usuarioIdAccion: usuario.UsuarioId,
            userAgent: userAgent,
            cancellationToken: cancellationToken);

        return MapLoginResponse(usuario, nuevoAccessToken, nuevoRefreshToken, accessTokenExpiraEn);
    }

    public async Task LogoutAsync(
        string refreshToken,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        await _authRepository.RevocarRefreshTokenAsync(
            refreshToken,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public async Task CambiarPasswordAsync(
        long usuarioId,
        string? passwordActual,
        string passwordNueva,
        long? usuarioAccionId,
        CancellationToken cancellationToken = default)
    {
        await _authRepository.CambiarPasswordAsync(
            usuarioId,
            passwordActual,
            passwordNueva,
            usuarioAccionId,
            cancellationToken);
    }

    private static LoginResponse MapLoginResponse(
        Usuario usuario,
        string accessToken,
        string refreshToken,
        DateTime accessTokenExpiraEn)
    {
        return new LoginResponse
        {
            UsuarioId = usuario.UsuarioId,
            EmpleadoId = usuario.EmpleadoId,
            Username = usuario.Username,
            NombreCompleto = usuario.NombreCompleto,
            EmailCoorporativo = usuario.EmailCoorporativo,
            RequiereCambioPassword = usuario.RequiereCambioPassword,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiraEn = accessTokenExpiraEn,
            Activo = usuario.Activo,
            UltimoLogin = usuario.UltimoLogin,
            IntentosFallidos = usuario.IntentosFallidos,
            BloqueoHasta = usuario.BloqueadoHasta,
            AreaId = usuario.AreaId,
            AreaCodigo = usuario.AreaCodigo,
            AreaNombre = usuario.AreaNombre,
            CargoId = usuario.CargoId,
            CargoCodigo = usuario.CargoCodigo,
            CargoNombre = usuario.CargoNombre,
            Roles = usuario.Roles
                .Select(x => x.Nombre)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList(),
            Permisos = usuario.Permisos
                .Select(x => x.Codigo)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList()
        };
    }
}