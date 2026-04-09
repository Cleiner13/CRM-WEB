using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Usuarios.Interfaces;
using CRM.Application.Features.Usuarios.Requests;
using CRM.Application.Features.Usuarios.Responses;
using CRM.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly IUsuariosService _usuariosService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHubContext<PermissionHub> _permissionHubContext;

    public UsuariosController(
        IUsuariosService usuariosService,
        ICurrentUserService currentUserService,
        IHubContext<PermissionHub> permissionHubContext)
    {
        _usuariosService = usuariosService;
        _currentUserService = currentUserService;
        _permissionHubContext = permissionHubContext;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] ListarUsuariosRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _usuariosService.ListarAsync(request, cancellationToken);
        return Ok(ApiResponse<PagedResponse<UsuarioListItemResponse>>.Ok(result, "Usuarios obtenidos correctamente."));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> ObtenerPorId(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _usuariosService.ObtenerPorIdAsync(id, cancellationToken);

        if (result is null)
        {
            return NotFound(ApiResponse<string>.Fail("Usuario no encontrado."));
        }

        return Ok(ApiResponse<UsuarioDetalleResponse>.Ok(result, "Usuario obtenido correctamente."));
    }

    [HttpGet("{id:long}/permisos")]
    public async Task<IActionResult> ListarPermisos(
        long id,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _usuariosService.ListarPermisosPorUsuarioAsync(id, soloActivos, cancellationToken);
        return Ok(ApiResponse<List<UsuarioPermisoResponse>>.Ok(result, "Permisos del usuario obtenidos correctamente."));
    }

    [HttpGet("{id:long}/permisos/matriz")]
    public async Task<IActionResult> ObtenerMatrizPermisos(
        long id,
        CancellationToken cancellationToken = default)
    {
        var result = await _usuariosService.ObtenerMatrizPermisosAsync(id, cancellationToken);
        return Ok(ApiResponse<UsuarioPermisoMatrizResponse>.Ok(result, "Matriz de permisos del usuario obtenida correctamente."));
    }

    [HttpPost("{id:long}/permisos/matriz")]
    public async Task<IActionResult> GuardarMatrizPermisos(
        long id,
        [FromBody] GuardarMatrizUsuarioPermisosRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();
        var usuarioAccionId = _currentUserService.UsuarioId ?? id;

        var result = await _usuariosService.GuardarMatrizPermisosAsync(
            id,
            request,
            usuarioAccionId,
            ipAddress,
            userAgent,
            cancellationToken);

        await _permissionHubContext
            .Clients
            .Group($"user-{id}")
            .SendAsync("PermissionChanged", new { UserId = id, Action = "MatrizPermisosActualizada" });

        return Ok(ApiResponse<UsuarioPermisoMatrizResponse>.Ok(result, "Matriz de permisos del usuario guardada correctamente."));
    }

    [HttpGet("{id:long}/roles")]
    public async Task<IActionResult> ListarRoles(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _usuariosService.ListarRolesPorUsuarioAsync(id, cancellationToken);
        return Ok(ApiResponse<List<UsuarioRolResponse>>.Ok(result, "Roles del usuario obtenidos correctamente."));
    }

    [HttpPost("{id:long}/permisos")]
    public async Task<IActionResult> AsignarPermiso(
        long id,
        [FromBody] AsignarPermisoUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _usuariosService.AsignarPermisoAsync(
            id,
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        await _permissionHubContext
            .Clients
            .Group($"user-{id}")
            .SendAsync("PermissionChanged", new { UserId = id, Action = "PermisoAsignado" });

        return Ok(ApiResponse<UsuarioPermisoAsignadoResponse>.Ok(result, "Permiso asignado correctamente."));
    }

    [HttpDelete("{id:long}/permisos/{permisoId:long}")]
    public async Task<IActionResult> DesactivarPermiso(
        long id,
        long permisoId,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _usuariosService.DesactivarPermisoAsync(
            id,
            permisoId,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        await _permissionHubContext
            .Clients
            .Group($"user-{id}")
            .SendAsync("PermissionChanged", new { UserId = id, Action = "PermisoDesactivado" });

        return Ok(ApiResponse<OperacionResponse>.Ok(result, result.Mensaje));
    }

    [HttpPost("{id:long}/roles")]
    public async Task<IActionResult> AsignarRol(
        long id,
        [FromBody] AsignarRolUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _usuariosService.AsignarRolAsync(
            id,
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        await _permissionHubContext
            .Clients
            .Group($"user-{id}")
            .SendAsync("PermissionChanged", new { UserId = id, Action = "RolAsignado" });

        return Ok(ApiResponse<UsuarioRolAsignadoResponse>.Ok(result, "Rol asignado correctamente."));
    }

    [HttpDelete("{id:long}/roles/{rolId:long}")]
    public async Task<IActionResult> QuitarRol(
        long id,
        long rolId,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _usuariosService.QuitarRolAsync(
            id,
            rolId,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        await _permissionHubContext
            .Clients
            .Group($"user-{id}")
            .SendAsync("PermissionChanged", new { UserId = id, Action = "RolQuitado" });

        return Ok(ApiResponse<OperacionResponse>.Ok(result, result.Mensaje));
    }

    [HttpPost("{id:long}/desactivar")]
    public async Task<IActionResult> DesactivarUsuario(
        long id,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _usuariosService.DesactivarUsuarioAsync(
            id,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        await _permissionHubContext
            .Clients
            .Group($"user-{id}")
            .SendAsync("UserStatusChanged", new { UserId = id, IsActive = false });

        return Ok(ApiResponse<OperacionResponse>.Ok(result, result.Mensaje));
    }

    [HttpPost("{id:long}/bloquear-acceso")]
    public Task<IActionResult> BloquearAccesoUsuario(
        long id,
        CancellationToken cancellationToken)
    {
        return DesactivarUsuario(id, cancellationToken);
    }

    [HttpPost("{id:long}/reactivar")]
    public async Task<IActionResult> ReactivarUsuario(
        long id,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _usuariosService.ReactivarUsuarioAsync(
            id,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        await _permissionHubContext
            .Clients
            .Group($"user-{id}")
            .SendAsync("UserStatusChanged", new { UserId = id, IsActive = true });

        return Ok(ApiResponse<OperacionResponse>.Ok(result, result.Mensaje));
    }

    [HttpPost("{id:long}/reactivar-acceso")]
    public Task<IActionResult> ReactivarAccesoUsuario(
        long id,
        CancellationToken cancellationToken)
    {
        return ReactivarUsuario(id, cancellationToken);
    }

    [HttpPost("crear-reset-empleado")]
    public async Task<IActionResult> CrearResetUsuarioEmpleado(
        [FromBody] CrearResetUsuarioEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _usuariosService.CrearResetUsuarioEmpleadoAsync(
            request,
            _currentUserService.UsuarioId,
            cancellationToken);

        return Ok(ApiResponse<UsuarioResetEmpleadoResponse>.Ok(result, "Usuario creado o reseteado correctamente."));
    }

    [HttpPost("desactivar-por-empleado")]
    public async Task<IActionResult> DesactivarUsuarioPorEmpleado(
        [FromBody] DesactivarUsuarioEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _usuariosService.DesactivarUsuarioPorEmpleadoAsync(
            request,
            _currentUserService.UsuarioId,
            cancellationToken);

        if (result.UsuarioId.HasValue && result.Desactivado == true)
        {
            await _permissionHubContext
                .Clients
                .Group($"user-{result.UsuarioId.Value}")
                .SendAsync("UserStatusChanged", new { UserId = result.UsuarioId.Value, IsActive = false });
        }

        return Ok(ApiResponse<UsuarioDesactivarEmpleadoResponse>.Ok(result, "Proceso ejecutado correctamente."));
    }
}
