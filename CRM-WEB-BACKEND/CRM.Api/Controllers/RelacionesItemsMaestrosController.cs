using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.RelacionesItemsMaestros.Interfaces;
using CRM.Application.Features.RelacionesItemsMaestros.Requests;
using CRM.Application.Features.RelacionesItemsMaestros.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/relaciones-items-maestros")]
[Authorize]
public class RelacionesItemsMaestrosController : ControllerBase
{
    private readonly IRelacionesItemsMaestrosService _service;
    private readonly ICurrentUserService _currentUserService;

    public RelacionesItemsMaestrosController(
        IRelacionesItemsMaestrosService service,
        ICurrentUserService currentUserService)
    {
        _service = service;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] string? tipoRelacion,
        [FromQuery] long? itemPadreId,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.ListarAsync(tipoRelacion, itemPadreId, soloActivos, cancellationToken);
        return Ok(ApiResponse<List<RelacionItemMaestroResponse>>.Ok(result, "Relaciones obtenidas correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Guardar(
        [FromBody] GuardarRelacionItemMaestroRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.GuardarAsync(request, _currentUserService.UsuarioId, cancellationToken);
        return Ok(ApiResponse<RelacionItemMaestroGuardarResponse>.Ok(result, "Relación guardada correctamente."));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Eliminar(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _service.EliminarAsync(id, _currentUserService.UsuarioId, cancellationToken);
        return Ok(ApiResponse<RelacionItemMaestroOperacionResponse>.Ok(result, "Relación eliminada correctamente."));
    }
}