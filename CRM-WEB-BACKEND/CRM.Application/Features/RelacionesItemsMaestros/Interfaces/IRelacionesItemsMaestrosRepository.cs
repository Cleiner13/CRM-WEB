using CRM.Application.Features.RelacionesItemsMaestros.Requests;
using CRM.Application.Features.RelacionesItemsMaestros.Responses;

namespace CRM.Application.Features.RelacionesItemsMaestros.Interfaces;

public interface IRelacionesItemsMaestrosRepository
{
    Task<List<RelacionItemMaestroResponse>> ListarAsync(
        string? tipoRelacion,
        long? itemPadreId,
        bool soloActivos,
        CancellationToken cancellationToken = default);

    Task<RelacionItemMaestroGuardarResponse> GuardarAsync(
        GuardarRelacionItemMaestroRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);

    Task<RelacionItemMaestroOperacionResponse> EliminarAsync(
        long relacionId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);
}