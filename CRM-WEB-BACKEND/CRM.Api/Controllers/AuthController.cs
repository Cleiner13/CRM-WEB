using System.Security.Claims;
using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Auth.Interfaces;
using CRM.Application.Features.Auth.Requests;
using CRM.Application.Features.Auth.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(
        IAuthService authService,
        ICurrentUserService currentUserService)
    {
        _authService = authService;
        _currentUserService = currentUserService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();
        var dispositivo = Request.Headers.UserAgent.ToString();

        var result = await _authService.LoginAsync(
            request,
            ipAddress,
            userAgent,
            dispositivo,
            cancellationToken);

        if (result is null)
        {
            return Unauthorized(ApiResponse<string>.Fail("Usuario o contraseña inválidos."));
        }

        if (!result.Activo)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Fail("Usuario desactivado. Contacte a sistemas."));
        }

        return Ok(ApiResponse<LoginResponse>.Ok(result, "Login exitoso."));
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();
        var dispositivo = Request.Headers.UserAgent.ToString();

        var result = await _authService.RefreshTokenAsync(
            request.RefreshToken,
            ipAddress,
            userAgent,
            dispositivo,
            cancellationToken);

        if (result is null)
        {
            return Unauthorized(ApiResponse<string>.Fail("Refresh token inválido o expirado."));
        }

        return Ok(ApiResponse<LoginResponse>.Ok(result, "Token renovado correctamente."));
    }

    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        await _authService.LogoutAsync(
            request.RefreshToken,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<string>.Ok("OK", "Logout exitoso."));
    }

    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.UsuarioId.HasValue)
        {
            return Unauthorized(ApiResponse<string>.Fail("Usuario no autenticado."));
        }

        await _authService.CambiarPasswordAsync(
            _currentUserService.UsuarioId.Value,
            request.PasswordActual,
            request.PasswordNueva,
            _currentUserService.UsuarioId,
            cancellationToken);

        return Ok(ApiResponse<string>.Ok("OK", "Password actualizado correctamente."));
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<CurrentUserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status401Unauthorized)]
    public IActionResult Me()
    {
        if (!_currentUserService.IsAuthenticated)
        {
            return Unauthorized(ApiResponse<string>.Fail("No autenticado."));
        }

        var response = new CurrentUserResponse
        {
            UsuarioId = _currentUserService.UsuarioId,
            EmpleadoId = _currentUserService.EmpleadoId,
            Username = _currentUserService.Username,
            NombreCompleto = GetClaim("NombreCompleto"),
            EmailCoorporativo = GetClaim("EmailCoorporativo"),
            Activo = GetBoolClaim("Activo"),
            RequiereCambioPassword = GetBoolClaim("RequiereCambioPassword"),
            UltimoLogin = GetDateTimeClaim("UltimoLogin"),
            IntentosFallidos = GetIntClaim("IntentosFallidos"),
            BloqueadoHasta = GetDateTimeClaim("BloqueadoHasta"),
            AreaId = GetLongClaim("AreaId"),
            AreaCodigo = GetClaim("AreaCodigo"),
            AreaNombre = GetClaim("AreaNombre"),
            CargoId = GetLongClaim("CargoId"),
            CargoCodigo = GetClaim("CargoCodigo"),
            CargoNombre = GetClaim("CargoNombre"),
            Roles = _currentUserService.Roles,
            Permisos = _currentUserService.Permisos
        };

        return Ok(ApiResponse<CurrentUserResponse>.Ok(response, "Perfil actual obtenido correctamente."));
    }

    [AllowAnonymous]
    [HttpPost("forgot-password/request")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPasswordRequest(
    [FromBody] PasswordResetSolicitudRequest request,
    CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        await _authService.SolicitarPasswordResetAsync(
            request.CorreoPersonal,
            ipAddress,
            userAgent,
            cancellationToken);

        // Respuesta genérica
        return Ok(ApiResponse<string>.Ok("OK", "Si el correo existe, hemos enviado un código de verificación."));
    }

    [AllowAnonymous]
    [HttpPost("forgot-password/verify")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPasswordVerify(
        [FromBody] PasswordResetVerificarRequest request,
        CancellationToken cancellationToken)
    {
        var esValido = await _authService.ValidarPasswordResetCodigoAsync(
            request.CorreoPersonal,
            request.Codigo,
            cancellationToken);

        if (!esValido)
        {
            return BadRequest(ApiResponse<string>.Fail("El código es inválido o ha expirado."));
        }

        return Ok(ApiResponse<string>.Ok("OK", "Código válido."));
    }

    [AllowAnonymous]
    [HttpPost("forgot-password/reset")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPasswordReset(
        [FromBody] PasswordResetConfirmarRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _authService.RestablecerPasswordAsync(
                request.CorreoPersonal,
                request.Codigo,
                request.PasswordNueva,
                cancellationToken);
            return Ok(ApiResponse<string>.Ok("OK", "Contraseña actualizada correctamente."));
        }
        catch (AppException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }

    private string? GetClaim(string claimType)
    {
        return User.FindFirst(claimType)?.Value;
    }

    private long? GetLongClaim(string claimType)
    {
        var value = User.FindFirst(claimType)?.Value;
        return long.TryParse(value, out var result) ? result : null;
    }

    private int GetIntClaim(string claimType)
    {
        var value = User.FindFirst(claimType)?.Value;
        return int.TryParse(value, out var result) ? result : 0;
    }

    private bool GetBoolClaim(string claimType)
    {
        var value = User.FindFirst(claimType)?.Value;
        return bool.TryParse(value, out var result) && result;
    }

    private DateTime? GetDateTimeClaim(string claimType)
    {
        var value = User.FindFirst(claimType)?.Value;
        return DateTime.TryParse(value, out var result) ? result : null;
    }
}