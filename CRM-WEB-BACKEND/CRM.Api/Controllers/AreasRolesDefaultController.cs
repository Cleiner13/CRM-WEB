using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.AreasRolesDefault.Interfaces;
using CRM.Application.Features.AreasRolesDefault.Requests;
using CRM.Application.Features.AreasRolesDefault.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.Api.Controllers;

[ApiController]
[Route("api/areas-roles-default")]
[Authorize]
public class AreasRolesDefaultController : ControllerBase
{
    private readonly IAreasRolesDefaultService _areasRolesDefaultService;
    private readonly ICurrentUserService _currentUserService;

    public AreasRolesDefaultController(
        IAreasRolesDefaultService areasRolesDefaultService,
        ICurrentUserService currentUserService)
    {
        _areasRolesDefaultService = areasRolesDefaultService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] long? areaId,
        [FromQuery] long? rolId,
        [FromQuery] bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _areasRolesDefaultService.ListarAsync(
            areaId,
            rolId,
            soloActivos,
            cancellationToken);

        return Ok(ApiResponse<List<AreaRolDefaultResponse>>.Ok(
            result,
            "Áreas con roles default obtenidas correctamente."));
    }

    [HttpPost]
    public async Task<IActionResult> Guardar(
        [FromBody] GuardarAreaRolDefaultRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _areasRolesDefaultService.GuardarAsync(
            request,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<AreaRolDefaultGuardarResponse>.Ok(
            result,
            "Asignación área/rol default guardada correctamente."));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Desactivar(
        long id,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _areasRolesDefaultService.DesactivarAsync(
            id,
            _currentUserService.UsuarioId,
            ipAddress,
            userAgent,
            cancellationToken);

        return Ok(ApiResponse<AreaRolDefaultOperacionResponse>.Ok(
            result,
            result.Mensaje));
    }
}