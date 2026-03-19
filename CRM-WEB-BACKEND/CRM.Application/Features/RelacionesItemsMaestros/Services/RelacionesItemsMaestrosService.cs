using CRM.Application.Features.RelacionesItemsMaestros.Interfaces;
using CRM.Application.Features.RelacionesItemsMaestros.Requests;
using CRM.Application.Features.RelacionesItemsMaestros.Responses;

namespace CRM.Application.Features.RelacionesItemsMaestros.Services;

public class RelacionesItemsMaestrosService : IRelacionesItemsMaestrosService
{
    private readonly IRelacionesItemsMaestrosRepository _repository;

    public RelacionesItemsMaestrosService(IRelacionesItemsMaestrosRepository repository)
    {
        _repository = repository;
    }

    public Task<List<RelacionItemMaestroResponse>> ListarAsync(
        string? tipoRelacion,
        long? itemPadreId,
        bool soloActivos,
        CancellationToken cancellationToken = default)
        => _repository.ListarAsync(tipoRelacion, itemPadreId, soloActivos, cancellationToken);

    public Task<RelacionItemMaestroGuardarResponse> GuardarAsync(
        GuardarRelacionItemMaestroRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
        => _repository.GuardarAsync(request, usuarioIdAccion, cancellationToken);

    public Task<RelacionItemMaestroOperacionResponse> EliminarAsync(
        long relacionId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
        => _repository.EliminarAsync(relacionId, usuarioIdAccion, cancellationToken);
}