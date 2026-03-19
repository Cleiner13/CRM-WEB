using CRM.Application.Common.Models;
using CRM.Application.Features.Auditoria.Requests;
using CRM.Application.Features.Auditoria.Responses;

namespace CRM.Application.Features.Auditoria.Interfaces;

public interface IAuditoriaRepository
{
    Task<PagedResponse<AuditoriaListItemResponse>> ListarAsync(
        ListarAuditoriaRequest request,
        CancellationToken cancellationToken = default);

    Task<AuditoriaDetalleResponse?> ObtenerAsync(
        long logAuditoriaId,
        CancellationToken cancellationToken = default);

    Task<AuditoriaRegistrarResponse> RegistrarAsync(
        RegistrarAuditoriaRequest request,
        CancellationToken cancellationToken = default);

    Task<AuditoriaLimpiarResponse> LimpiarAntiguosAsync(
        int diasRetencion,
        CancellationToken cancellationToken = default);
}