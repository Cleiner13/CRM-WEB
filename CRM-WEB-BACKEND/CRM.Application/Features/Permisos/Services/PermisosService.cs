using CRM.Application.Features.Permisos.Interfaces;
using CRM.Application.Features.Permisos.Requests;
using CRM.Application.Features.Permisos.Responses;

namespace CRM.Application.Features.Permisos.Services;

public class PermisosService : IPermisosService
{
    private readonly IPermisosRepository _permisosRepository;

    public PermisosService(IPermisosRepository permisosRepository)
    {
        _permisosRepository = permisosRepository;
    }

    public Task<List<PermisoResponse>> ListarAsync(
        long? moduloId,
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        return _permisosRepository.ListarAsync(moduloId, buscar, soloActivos, cancellationToken);
    }

    public Task<PermisoGuardarResponse> GuardarAsync(
        GuardarPermisoRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _permisosRepository.GuardarAsync(
            request,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<PermisoOperacionResponse> EliminarAsync(
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _permisosRepository.EliminarAsync(
            permisoId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }
}