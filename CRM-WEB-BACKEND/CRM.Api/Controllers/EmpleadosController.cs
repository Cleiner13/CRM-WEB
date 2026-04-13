using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Empleados.Interfaces;
using CRM.Application.Features.Empleados.Requests;
using CRM.Application.Features.Empleados.Responses;
using CRM.Application.Features.Usuarios.Interfaces;
using CRM.Application.Features.Usuarios.Requests;
using CRM.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/empleados")]
[Authorize]
public class EmpleadosController : ControllerBase
{
    private readonly IEmpleadosService _empleadosService;
    private readonly IUsuariosService _usuariosService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHubContext<PermissionHub> _permissionHubContext;

    public EmpleadosController(
        IEmpleadosService empleadosService,
        IUsuariosService usuariosService,
        ICurrentUserService currentUserService,
        IHubContext<PermissionHub> permissionHubContext)
    {
        _empleadosService = empleadosService;
        _usuariosService = usuariosService;
        _currentUserService = currentUserService;
        _permissionHubContext = permissionHubContext;
    }

    [HttpGet]
    [HttpGet("paginado")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<EmpleadoListItemResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarPaginado(
        [FromQuery] EmpleadoListarPaginadoRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.ListarPaginadoAsync(request, cancellationToken);

        return Ok(ApiResponse<PagedResponse<EmpleadoListItemResponse>>.Ok(
            result,
            "Empleados obtenidos correctamente."));
    }

    [HttpGet("buscar-por-documento")]
    [ProducesResponseType(typeof(ApiResponse<EmpleadoBuscarPorDocumentoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BuscarPorDocumento(
        [FromQuery] string numeroDocumento,
        [FromQuery] long? tipoDocumentoId,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.BuscarPorDocumentoAsync(
            numeroDocumento,
            tipoDocumentoId,
            cancellationToken);

        if (result is null)
        {
            return NotFound(ApiResponse<string>.Fail("Empleado no encontrado."));
        }

        return Ok(ApiResponse<EmpleadoBuscarPorDocumentoResponse>.Ok(
            result,
            "Empleado encontrado correctamente."));
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<EmpleadoCompletoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerCompleto(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.ObtenerCompletoAsync(
            id,
            null,
            null,
            cancellationToken);

        if (result is null)
        {
            return NotFound(ApiResponse<string>.Fail("Empleado no encontrado."));
        }

        return Ok(ApiResponse<EmpleadoCompletoResponse>.Ok(
            result,
            "Empleado obtenido correctamente."));
    }

    [HttpPost("guardar-usuario")]
    [ProducesResponseType(typeof(ApiResponse<EmpleadoGuardarUsuarioResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GuardarUsuario(
        [FromBody] EmpleadoGuardarUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _empleadosService.GuardarUsuarioAsync(
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<EmpleadoGuardarUsuarioResponse>.Ok(
            result,
            "Empleado guardado correctamente."));
    }

    [HttpPost("{id:long}/desactivar")]
    [ProducesResponseType(typeof(ApiResponse<EmpleadoOperacionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Desactivar(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.DesactivarAsync(
            id,
            _currentUserService.UsuarioId,
            cancellationToken);

        var usuarioResult = await _usuariosService.DesactivarUsuarioPorEmpleadoAsync(
            new DesactivarUsuarioEmpleadoRequest { EmpleadoId = id },
            _currentUserService.UsuarioId,
            cancellationToken);

        if (usuarioResult.UsuarioId.HasValue && usuarioResult.Desactivado == true)
        {
            await _permissionHubContext
                .Clients
                .Group($"user-{usuarioResult.UsuarioId.Value}")
                .SendAsync("UserStatusChanged", new { UserId = usuarioResult.UsuarioId.Value, IsActive = false });
        }

        return Ok(ApiResponse<EmpleadoOperacionResponse>.Ok(
            result,
            result.Mensaje));
    }

    [HttpGet("{id:long}/validar-eliminacion")]
    [ProducesResponseType(typeof(ApiResponse<EmpleadoValidacionEliminacionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidarEliminacion(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.ValidarEliminacionFisicaAsync(
            id,
            cancellationToken);

        return Ok(ApiResponse<EmpleadoValidacionEliminacionResponse>.Ok(
            result,
            "Validación obtenida correctamente."));
    }

    [HttpDelete("{id:long}/eliminar-fisico")]
    [ProducesResponseType(typeof(ApiResponse<EmpleadoOperacionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> EliminarFisico(
        long id,
        [FromBody] EmpleadoEliminarFisicoRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.EliminarFisicoAsync(
            id,
            request.Confirmar,
            cancellationToken);

        return Ok(ApiResponse<EmpleadoOperacionResponse>.Ok(
            result,
            result.Mensaje));
    }

    [HttpPost("{id:long}/sincronizar-campanias")]
    [ProducesResponseType(typeof(ApiResponse<List<EmpleadoCampaniaResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SincronizarCampanias(
        long id,
        [FromBody] EmpleadoSincronizarCampaniasRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.SincronizarCampaniasAsync(
            id,
            request,
            _currentUserService.UsuarioId,
            cancellationToken);

        return Ok(ApiResponse<List<EmpleadoCampaniaResponse>>.Ok(
            result,
            "Campañas sincronizadas correctamente."));
    }

    [HttpPost("validar-tipo-producto-campanias")]
    [ProducesResponseType(typeof(ApiResponse<ValidarTipoProductoCampaniasResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidarTipoProductoCampanias(
        [FromBody] ValidarTipoProductoCampaniasRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _empleadosService.ValidarTipoProductoCampaniasAsync(
            request,
            cancellationToken);

        return Ok(ApiResponse<ValidarTipoProductoCampaniasResponse>.Ok(
            result,
            result.Mensaje ?? "Validación correcta."));
    }

    [HttpGet("consultar-dni")]
    [ProducesResponseType(typeof(ApiResponse<EmpleadoConsultaDniResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConsultarDni(
    [FromQuery] string numeroDocumento,
    CancellationToken cancellationToken)
    {
        var result = await _empleadosService.ConsultarDniAsync(numeroDocumento, cancellationToken);

        if (result is null)
        {
            return NotFound(ApiResponse<string>.Fail("DNI no encontrado en RENIEC."));
        }

        return Ok(ApiResponse<EmpleadoConsultaDniResponse>.Ok(
            result,
            "DNI consultado correctamente."));
    }
}
