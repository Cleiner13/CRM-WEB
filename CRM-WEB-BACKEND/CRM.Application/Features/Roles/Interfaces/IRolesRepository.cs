using CRM.Application.Features.Roles.Requests;
using CRM.Application.Features.Roles.Responses;

namespace CRM.Application.Features.Roles.Interfaces;

public interface IRolesRepository
{
    Task<List<RolResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<RolGuardarResponse> GuardarAsync(
        GuardarRolRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<RolOperacionResponse> EliminarAsync(
        long rolId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<List<RolPermisoResponse>> ListarPermisosAsync(
        long rolId,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<RolPermisoAsignadoResponse> AsignarPermisoAsync(
        long rolId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<RolOperacionResponse> QuitarPermisoAsync(
        long rolId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);
}