using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Modulos.Interfaces;
using CRM.Application.Features.Modulos.Requests;
using CRM.Application.Features.Modulos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/modulos")]
[Authorize]
public class ModulosController : ControllerBase
{
    private readonly IModulosService _modulosService;
    private readonly ICurrentUserService _currentUserService;

    public ModulosController(
        IModulosService modulosService,
        ICurrentUserService currentUserService)
    {
        _modulosService = modulosService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
    [FromQuery] string? buscar,
    [FromQuery] bool soloActivos = true,
    CancellationToken cancellationToken = default)
    {
        var result = await _modulosService.ListarAsync(buscar, soloActivos, cancellationToken);

        return Ok(ApiResponse<List<ModuloResponse>>.Ok(
            result,
            "Módulos obtenidos correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Guardar(
        [FromBody] GuardarModuloRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _modulosService.GuardarAsync(
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<ModuloGuardarResponse>.Ok(
            result,
            "Módulo guardado correctamente."));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Eliminar(
        long id,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _modulosService.EliminarAsync(
            id,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<ModuloOperacionResponse>.Ok(
            result,
            result.Mensaje));
    }
}