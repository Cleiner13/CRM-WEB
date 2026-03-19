using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Permisos.Interfaces;
using CRM.Application.Features.Permisos.Requests;
using CRM.Application.Features.Permisos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/permisos")]
[Authorize]
public class PermisosController : ControllerBase
{
    private readonly IPermisosService _permisosService;
    private readonly ICurrentUserService _currentUserService;

    public PermisosController(
        IPermisosService permisosService,
        ICurrentUserService currentUserService)
    {
        _permisosService = permisosService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] long? moduloId,
        [FromQuery] string? buscar,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _permisosService.ListarAsync(
            moduloId,
            buscar,
            soloActivos,
            cancellationToken);

        return Ok(ApiResponse<List<PermisoResponse>>.Ok(
            result,
            "Permisos obtenidos correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Guardar(
        [FromBody] GuardarPermisoRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _permisosService.GuardarAsync(
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<PermisoGuardarResponse>.Ok(
            result,
            "Permiso guardado correctamente."));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Eliminar(
        long id,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _permisosService.EliminarAsync(
            id,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<PermisoOperacionResponse>.Ok(
            result,
            result.Mensaje));
    }
}