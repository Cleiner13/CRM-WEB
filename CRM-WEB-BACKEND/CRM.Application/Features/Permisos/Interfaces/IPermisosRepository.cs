using CRM.Application.Features.Permisos.Requests;
using CRM.Application.Features.Permisos.Responses;

namespace CRM.Application.Features.Permisos.Interfaces;

public interface IPermisosRepository
{
    Task<List<PermisoResponse>> ListarAsync(
        long? moduloId,
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<PermisoGuardarResponse> GuardarAsync(
        GuardarPermisoRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<PermisoOperacionResponse> EliminarAsync(
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);
}