using CRM.Application.Features.TablasMaestras.Requests;
using CRM.Application.Features.TablasMaestras.Responses;

namespace CRM.Application.Features.TablasMaestras.Interfaces;

public interface ITablasMaestrasRepository
{
    Task<List<TablaMaestraResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<TablaMaestraGuardarResponse> GuardarAsync(
        GuardarTablaMaestraRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);

    Task<TablaMaestraOperacionResponse> EliminarAsync(
        long tablaMaestraId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);
}