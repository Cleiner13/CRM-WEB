using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.TablasMaestras.Interfaces;
using CRM.Application.Features.TablasMaestras.Requests;
using CRM.Application.Features.TablasMaestras.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/tablas-maestras")]
[Authorize]
public class TablasMaestrasController : ControllerBase
{
    private readonly ITablasMaestrasService _service;
    private readonly ICurrentUserService _currentUserService;

    public TablasMaestrasController(
        ITablasMaestrasService service,
        ICurrentUserService currentUserService)
    {
        _service = service;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] string? buscar,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.ListarAsync(buscar, soloActivos, cancellationToken);
        return Ok(ApiResponse<List<TablaMaestraResponse>>.Ok(result, "Tablas maestras obtenidas correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Guardar(
        [FromBody] GuardarTablaMaestraRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.GuardarAsync(request, _currentUserService.UsuarioId, cancellationToken);
        return Ok(ApiResponse<TablaMaestraGuardarResponse>.Ok(result, "Tabla maestra guardada correctamente."));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Eliminar(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _service.EliminarAsync(id, _currentUserService.UsuarioId, cancellationToken);
        return Ok(ApiResponse<TablaMaestraOperacionResponse>.Ok(result, "Tabla maestra eliminada correctamente."));
    }
}