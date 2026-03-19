using CRM.Application.Features.AreasRolesDefault.Requests;
using CRM.Application.Features.AreasRolesDefault.Responses;

namespace CRM.Application.Features.AreasRolesDefault.Interfaces;

public interface IAreasRolesDefaultService
{
    Task<List<AreaRolDefaultResponse>> ListarAsync(
        long? areaId,
        long? rolId,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<AreaRolDefaultGuardarResponse> GuardarAsync(
        GuardarAreaRolDefaultRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<AreaRolDefaultOperacionResponse> DesactivarAsync(
        long areaRolDefaultId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);
}