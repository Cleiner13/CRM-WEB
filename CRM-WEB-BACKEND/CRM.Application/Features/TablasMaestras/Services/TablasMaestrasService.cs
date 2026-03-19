using CRM.Application.Features.TablasMaestras.Interfaces;
using CRM.Application.Features.TablasMaestras.Requests;
using CRM.Application.Features.TablasMaestras.Responses;

namespace CRM.Application.Features.TablasMaestras.Services;

public class TablasMaestrasService : ITablasMaestrasService
{
    private readonly ITablasMaestrasRepository _repository;

    public TablasMaestrasService(ITablasMaestrasRepository repository)
    {
        _repository = repository;
    }

    public Task<List<TablaMaestraResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
        => _repository.ListarAsync(buscar, soloActivos, cancellationToken);

    public Task<TablaMaestraGuardarResponse> GuardarAsync(
        GuardarTablaMaestraRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
        => _repository.GuardarAsync(request, usuarioIdAccion, cancellationToken);

    public Task<TablaMaestraOperacionResponse> EliminarAsync(
        long tablaMaestraId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
        => _repository.EliminarAsync(tablaMaestraId, usuarioIdAccion, cancellationToken);
}