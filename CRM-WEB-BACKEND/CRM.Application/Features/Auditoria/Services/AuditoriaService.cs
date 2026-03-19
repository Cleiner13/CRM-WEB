using CRM.Application.Common.Models;
using CRM.Application.Features.Auditoria.Interfaces;
using CRM.Application.Features.Auditoria.Requests;
using CRM.Application.Features.Auditoria.Responses;

namespace CRM.Application.Features.Auditoria.Services;

public class AuditoriaService : IAuditoriaService
{
    private readonly IAuditoriaRepository _repository;

    public AuditoriaService(IAuditoriaRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResponse<AuditoriaListItemResponse>> ListarAsync(
        ListarAuditoriaRequest request,
        CancellationToken cancellationToken = default)
        => _repository.ListarAsync(request, cancellationToken);

    public Task<AuditoriaDetalleResponse?> ObtenerAsync(
        long logAuditoriaId,
        CancellationToken cancellationToken = default)
        => _repository.ObtenerAsync(logAuditoriaId, cancellationToken);

    public Task<AuditoriaRegistrarResponse> RegistrarAsync(
        RegistrarAuditoriaRequest request,
        CancellationToken cancellationToken = default)
        => _repository.RegistrarAsync(request, cancellationToken);

    public Task<AuditoriaLimpiarResponse> LimpiarAntiguosAsync(
        int diasRetencion,
        CancellationToken cancellationToken = default)
        => _repository.LimpiarAntiguosAsync(diasRetencion, cancellationToken);
}