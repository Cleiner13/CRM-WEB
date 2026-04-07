using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Auth.Interfaces;
using CRM.Application.Features.Auth.Requests;
using CRM.Application.Features.Auth.Responses;
using CRM.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;
using System.Text;

namespace CRM.Application.Features.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public AuthService(
        IAuthRepository authRepository,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _authRepository = authRepository;
        _tokenService = tokenService;
        _emailService = emailService;
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

        if (!usuario.Activo)
        {
            // Usuario inactivo, no emitimos token
            return new LoginResponse
            {
                Activo = false,
                UsuarioId = usuario.UsuarioId,
                Username = usuario.Username,
                RequiereCambioPassword = usuario.RequiereCambioPassword
            };
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

    public async Task<CurrentUserResponse?> ObtenerUsuarioActualAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _authRepository.ObtenerUsuarioPorIdAsync(usuarioId, cancellationToken);
        if (usuario is null)
        {
            return null;
        }

        return new CurrentUserResponse
        {
            UsuarioId = usuario.UsuarioId,
            EmpleadoId = usuario.EmpleadoId,
            Username = usuario.Username,
            NombreCompleto = usuario.NombreCompleto,
            EmailCoorporativo = usuario.EmailCoorporativo,
            Activo = usuario.Activo,
            RequiereCambioPassword = usuario.RequiereCambioPassword,
            UltimoLogin = usuario.UltimoLogin,
            IntentosFallidos = usuario.IntentosFallidos,
            BloqueadoHasta = usuario.BloqueadoHasta,
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

    public async Task SolicitarPasswordResetAsync(
    string correoPersonal,
    string? ipAddress,
    string? userAgent,
    CancellationToken cancellationToken = default)
    {
        // Generar un código de 6 dígitos
        var codigo = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var codigoHash = ComputeSha256(codigo);

        // Registrar la solicitud en BD
        var result = await _authRepository.SolicitarPasswordResetAsync(
            correoPersonal,
            codigoHash,
            expiraMinutos: 10,
            ipAddress,
            userAgent,
            cancellationToken);

        // Si el correo pertenece a un usuario, envía el código por correo (microservicio)
        if (result.UsuarioEncontrado)
        {
            await _emailService.SendPasswordResetCodeAsync(
                correoPersonal,
                codigo,
                result.ExpiraEn!.Value,
                cancellationToken);
                }
                // Siempre devolver genérico al frontend para no revelar si existe el usuario.
    }

    public async Task<bool> ValidarPasswordResetCodigoAsync(
        string correoPersonal,
        string codigo,
        CancellationToken cancellationToken = default)
    {
        var codigoHash = ComputeSha256(codigo);
        var result = await _authRepository.ValidarPasswordResetCodigoAsync(
            correoPersonal,
            codigoHash,
            cancellationToken);

        if (result is null || !result.EsValido)
            return false;

        return true;
    }

    public async Task RestablecerPasswordAsync(
        string correoPersonal,
        string codigo,
        string passwordNueva,
        CancellationToken cancellationToken = default)
    {
        var codigoHash = ComputeSha256(codigo);
        var result = await _authRepository.ConfirmarPasswordResetAsync(
            correoPersonal,
            codigoHash,
            passwordNueva,
            cancellationToken);

        if (result is null || !result.CambioRealizado)
        {
            throw new AppException(StatusCodes.Status400BadRequest, result?.Mensaje ?? "No se pudo actualizar la contraseña.");
        }
    }

    private static string ComputeSha256(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }
}
