using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Auth.Interfaces;
using CRM.Application.Features.Auth.Requests;
using CRM.Application.Features.Auth.Responses;

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