using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Profile.Interfaces;
using CRM.Application.Features.Profile.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly ICurrentUserService _currentUserService;

    public ProfileController(
        IProfileService profileService,
        ICurrentUserService currentUserService)
    {
        _profileService = profileService;
        _currentUserService = currentUserService;
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<MiPerfilResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerMiPerfil(CancellationToken cancellationToken)
    {
        if (!_currentUserService.UsuarioId.HasValue)
        {
            return Unauthorized(ApiResponse<string>.Fail("Usuario no autenticado."));
        }

        var result = await _profileService.ObtenerMiPerfilAsync(
            _currentUserService.UsuarioId.Value,
            cancellationToken);

        if (result is null)
        {
            return NotFound(ApiResponse<string>.Fail("No se encontro informacion del perfil actual."));
        }

        return Ok(ApiResponse<MiPerfilResponse>.Ok(result, "Perfil obtenido correctamente."));
    }
}
