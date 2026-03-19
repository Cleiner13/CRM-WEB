using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Roles.Interfaces;
using CRM.Application.Features.Roles.Requests;
using CRM.Application.Features.Roles.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRolesService _rolesService;
    private readonly ICurrentUserService _currentUserService;

    public RolesController(
        IRolesService rolesService,
        ICurrentUserService currentUserService)
    {
        _rolesService = rolesService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] string? buscar,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _rolesService.ListarAsync(
            buscar,
            soloActivos,
            cancellationToken);

        return Ok(ApiResponse<List<RolResponse>>.Ok(
            result,
            "Roles obtenidos correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Guardar(
        [FromBody] GuardarRolRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _rolesService.GuardarAsync(
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<RolGuardarResponse>.Ok(
            result,
            "Rol guardado correctamente."));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Eliminar(
        long id,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _rolesService.EliminarAsync(
            id,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<RolOperacionResponse>.Ok(
            result,
            result.Mensaje));
    }

    [HttpGet("{id:long}/permisos")]
    public async Task<IActionResult> ListarPermisos(
        long id,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _rolesService.ListarPermisosAsync(
            id,
            soloActivos,
            cancellationToken);

        return Ok(ApiResponse<List<RolPermisoResponse>>.Ok(
            result,
            "Permisos del rol obtenidos correctamente."));
    }

    [HttpPost("{id:long}/permisos")]
    public async Task<IActionResult> AsignarPermiso(
        long id,
        [FromBody] AsignarPermisoRolRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _rolesService.AsignarPermisoAsync(
            id,
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<RolPermisoAsignadoResponse>.Ok(
            result,
            "Permiso asignado al rol correctamente."));
    }

    [HttpDelete("{id:long}/permisos/{permisoId:long}")]
    public async Task<IActionResult> QuitarPermiso(
        long id,
        long permisoId,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _rolesService.QuitarPermisoAsync(
            id,
            permisoId,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<RolOperacionResponse>.Ok(
            result,
            result.Mensaje));
    }
}