using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.ItemsMaestros.Interfaces;
using CRM.Application.Features.ItemsMaestros.Requests;
using CRM.Application.Features.ItemsMaestros.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/items-maestros")]
[Authorize]
public class ItemsMaestrosController : ControllerBase
{
    private readonly IItemsMaestrosService _service;
    private readonly ICurrentUserService _currentUserService;

    public ItemsMaestrosController(
        IItemsMaestrosService service,
        ICurrentUserService currentUserService)
    {
        _service = service;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] long? tablaMaestraId,
        [FromQuery] string? buscar,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.ListarAsync(tablaMaestraId, buscar, soloActivos, cancellationToken);
        return Ok(ApiResponse<List<ItemMaestroResponse>>.Ok(result, "Items maestros obtenidos correctamente."));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> Obtener(
        long id,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.ObtenerAsync(id, cancellationToken);

        if (result is null)
            return NotFound(ApiResponse<string>.Fail("Item maestro no encontrado."));

        return Ok(ApiResponse<ItemMaestroResponse>.Ok(result, "Item maestro obtenido correctamente."));
    }

    [HttpGet("{id:long}/hijos")]
    public async Task<IActionResult> ListarHijos(
        long id,
        [FromQuery] string tipoRelacion,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.ListarHijosAsync(tipoRelacion, id, cancellationToken);
        return Ok(ApiResponse<List<ItemMaestroHijoResponse>>.Ok(result, "Hijos obtenidos correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Guardar(
        [FromBody] GuardarItemMaestroRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.GuardarAsync(request, _currentUserService.UsuarioId, cancellationToken);
        return Ok(ApiResponse<ItemMaestroGuardarResponse>.Ok(result, "Item maestro guardado correctamente."));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Eliminar(
        long id,
        CancellationToken cancellationToken)
    {
        var result = await _service.EliminarAsync(id, _currentUserService.UsuarioId, cancellationToken);
        return Ok(ApiResponse<ItemMaestroOperacionResponse>.Ok(result, "Item maestro eliminado correctamente."));
    }
}