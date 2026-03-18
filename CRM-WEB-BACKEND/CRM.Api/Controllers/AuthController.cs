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

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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

        return Ok(ApiResponse<LoginResponse>.Ok(result, "Login exitoso."));
    }
}