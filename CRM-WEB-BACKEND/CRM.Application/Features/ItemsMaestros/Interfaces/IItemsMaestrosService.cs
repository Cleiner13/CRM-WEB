using CRM.Application.Features.ItemsMaestros.Requests;
using CRM.Application.Features.ItemsMaestros.Responses;

namespace CRM.Application.Features.ItemsMaestros.Interfaces;

public interface IItemsMaestrosService
{
    Task<List<ItemMaestroResponse>> ListarAsync(
        long? tablaMaestraId,
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<ItemMaestroResponse?> ObtenerAsync(
        long itemMaestroId,
        CancellationToken cancellationToken = default);

    Task<List<ItemMaestroHijoResponse>> ListarHijosAsync(
        string tipoRelacion,
        long itemPadreId,
        CancellationToken cancellationToken = default);

    Task<ItemMaestroGuardarResponse> GuardarAsync(
        GuardarItemMaestroRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);

    Task<ItemMaestroOperacionResponse> EliminarAsync(
        long itemMaestroId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);
}