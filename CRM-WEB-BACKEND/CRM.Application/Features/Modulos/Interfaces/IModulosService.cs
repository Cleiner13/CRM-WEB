using CRM.Application.Features.Modulos.Requests;
using CRM.Application.Features.Modulos.Responses;

namespace CRM.Application.Features.Modulos.Interfaces;

public interface IModulosService
{
    Task<List<ModuloResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<ModuloGuardarResponse> GuardarAsync(
        GuardarModuloRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<ModuloOperacionResponse> EliminarAsync(
        long moduloId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);
}