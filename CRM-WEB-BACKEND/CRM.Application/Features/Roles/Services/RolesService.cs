using CRM.Application.Features.Roles.Interfaces;
using CRM.Application.Features.Roles.Requests;
using CRM.Application.Features.Roles.Responses;

namespace CRM.Application.Features.Roles.Services;

public class RolesService : IRolesService
{
    private readonly IRolesRepository _rolesRepository;

    public RolesService(IRolesRepository rolesRepository)
    {
        _rolesRepository = rolesRepository;
    }

    public Task<List<RolResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        return _rolesRepository.ListarAsync(buscar, soloActivos, cancellationToken);
    }

    public Task<RolGuardarResponse> GuardarAsync(
        GuardarRolRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _rolesRepository.GuardarAsync(
            request,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<RolOperacionResponse> EliminarAsync(
        long rolId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _rolesRepository.EliminarAsync(
            rolId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<List<RolPermisoResponse>> ListarPermisosAsync(
        long rolId,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        return _rolesRepository.ListarPermisosAsync(rolId, soloActivos, cancellationToken);
    }

    public Task<RolPermisoAsignadoResponse> AsignarPermisoAsync(
        long rolId,
        AsignarPermisoRolRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _rolesRepository.AsignarPermisoAsync(
            rolId,
            request.PermisoId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<RolOperacionResponse> QuitarPermisoAsync(
        long rolId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _rolesRepository.QuitarPermisoAsync(
            rolId,
            permisoId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }
}