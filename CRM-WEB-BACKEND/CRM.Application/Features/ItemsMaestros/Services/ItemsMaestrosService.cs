using CRM.Application.Features.ItemsMaestros.Interfaces;
using CRM.Application.Features.ItemsMaestros.Requests;
using CRM.Application.Features.ItemsMaestros.Responses;

namespace CRM.Application.Features.ItemsMaestros.Services;

public class ItemsMaestrosService : IItemsMaestrosService
{
    private readonly IItemsMaestrosRepository _repository;

    public ItemsMaestrosService(IItemsMaestrosRepository repository)
    {
        _repository = repository;
    }

    public Task<List<ItemMaestroResponse>> ListarAsync(
        long? tablaMaestraId,
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
        => _repository.ListarAsync(tablaMaestraId, buscar, soloActivos, cancellationToken);

    public Task<ItemMaestroResponse?> ObtenerAsync(
        long itemMaestroId,
        CancellationToken cancellationToken = default)
        => _repository.ObtenerAsync(itemMaestroId, cancellationToken);

    public Task<List<ItemMaestroHijoResponse>> ListarHijosAsync(
        string tipoRelacion,
        long itemPadreId,
        CancellationToken cancellationToken = default)
        => _repository.ListarHijosAsync(tipoRelacion, itemPadreId, cancellationToken);

    public Task<ItemMaestroGuardarResponse> GuardarAsync(
        GuardarItemMaestroRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
        => _repository.GuardarAsync(request, usuarioIdAccion, cancellationToken);

    public Task<ItemMaestroOperacionResponse> EliminarAsync(
        long itemMaestroId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
        => _repository.EliminarAsync(itemMaestroId, usuarioIdAccion, cancellationToken);
}