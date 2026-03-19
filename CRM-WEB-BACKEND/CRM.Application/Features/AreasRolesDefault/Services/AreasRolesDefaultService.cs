using CRM.Application.Features.AreasRolesDefault.Interfaces;
using CRM.Application.Features.AreasRolesDefault.Requests;
using CRM.Application.Features.AreasRolesDefault.Responses;

namespace CRM.Application.Features.AreasRolesDefault.Services;

public class AreasRolesDefaultService : IAreasRolesDefaultService
{
    private readonly IAreasRolesDefaultRepository _areasRolesDefaultRepository;

    public AreasRolesDefaultService(IAreasRolesDefaultRepository areasRolesDefaultRepository)
    {
        _areasRolesDefaultRepository = areasRolesDefaultRepository;
    }

    public Task<List<AreaRolDefaultResponse>> ListarAsync(
        long? areaId,
        long? rolId,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        return _areasRolesDefaultRepository.ListarAsync(areaId, rolId, soloActivos, cancellationToken);
    }

    public Task<AreaRolDefaultGuardarResponse> GuardarAsync(
        GuardarAreaRolDefaultRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _areasRolesDefaultRepository.GuardarAsync(
            request,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<AreaRolDefaultOperacionResponse> DesactivarAsync(
        long areaRolDefaultId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _areasRolesDefaultRepository.DesactivarAsync(
            areaRolDefaultId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }
}