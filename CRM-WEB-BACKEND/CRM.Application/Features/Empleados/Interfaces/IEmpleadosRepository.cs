using CRM.Application.Common.Models;
using CRM.Application.Features.Empleados.Requests;
using CRM.Application.Features.Empleados.Responses;

namespace CRM.Application.Features.Empleados.Interfaces;

public interface IEmpleadosRepository
{
    Task<EmpleadoGuardarUsuarioResponse> GuardarUsuarioAsync(
        EmpleadoGuardarUsuarioRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<EmpleadoListItemResponse>> ListarPaginadoAsync(
        EmpleadoListarPaginadoRequest request,
        CancellationToken cancellationToken = default);

    Task<EmpleadoBuscarPorDocumentoResponse?> BuscarPorDocumentoAsync(
        string numeroDocumento,
        long? tipoDocumentoId,
        CancellationToken cancellationToken = default);

    Task<EmpleadoCompletoResponse?> ObtenerCompletoAsync(
        long? empleadoId,
        string? numeroDocumento,
        long? tipoDocumentoId,
        CancellationToken cancellationToken = default);

    Task<EmpleadoOperacionResponse> DesactivarAsync(
        long empleadoId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);

    Task<EmpleadoValidacionEliminacionResponse> ValidarEliminacionFisicaAsync(
        long empleadoId,
        CancellationToken cancellationToken = default);

    Task<EmpleadoOperacionResponse> EliminarFisicoAsync(
        long empleadoId,
        bool confirmar,
        CancellationToken cancellationToken = default);

    Task<List<EmpleadoCampaniaResponse>> SincronizarCampaniasAsync(
        long empleadoId,
        long tipoProductoId,
        List<long> campanias,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);

    Task<ValidarTipoProductoCampaniasResponse> ValidarTipoProductoCampaniasAsync(
        long tipoProductoId,
        List<long> campanias,
        CancellationToken cancellationToken = default);
}