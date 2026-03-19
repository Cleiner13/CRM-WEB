using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Auditoria.Interfaces;
using CRM.Application.Features.Auditoria.Requests;
using CRM.Application.Features.Auditoria.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/auditoria")]
[Authorize]
public class AuditoriaController : ControllerBase
{
    private readonly IAuditoriaService _service;
    private readonly ICurrentUserService _currentUserService;

    public AuditoriaController(
        IAuditoriaService service,
        ICurrentUserService currentUserService)
    {
        _service = service;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] ListarAuditoriaRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.ListarAsync(request, cancellationToken);

        return Ok(ApiResponse<PagedResponse<AuditoriaListItemResponse>>.Ok(
            result,
            "Auditoría obtenida correctamente."));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> Obtener(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _service.ObtenerAsync(id, cancellationToken);

        if (result is null)
            return NotFound(ApiResponse<string>.Fail("Registro de auditoría no encontrado."));

        return Ok(ApiResponse<AuditoriaDetalleResponse>.Ok(
            result,
            "Registro de auditoría obtenido correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Registrar(
        [FromBody] RegistrarAuditoriaRequest request,
        CancellationToken cancellationToken)
    {
        request.UsuarioId ??= _currentUserService.UsuarioId;
        request.IpAddress ??= HttpContext.Connection.RemoteIpAddress?.ToString();
        request.UserAgent ??= Request.Headers.UserAgent.ToString();

        var result = await _service.RegistrarAsync(request, cancellationToken);

        return Ok(ApiResponse<AuditoriaRegistrarResponse>.Ok(
            result,
            "Registro de auditoría creado correctamente."));
    }

    [HttpPost("limpiar-antiguos")]
    public async Task<IActionResult> LimpiarAntiguos(
        [FromBody] LimpiarAuditoriaRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.LimpiarAntiguosAsync(request.DiasRetencion, cancellationToken);

        return Ok(ApiResponse<AuditoriaLimpiarResponse>.Ok(
            result,
            "Limpieza de auditoría ejecutada correctamente."));
    }
}