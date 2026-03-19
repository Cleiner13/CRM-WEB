using CRM.Application.Common.Models;
using CRM.Application.Features.Empleados.Interfaces;
using CRM.Application.Features.Empleados.Requests;
using CRM.Application.Features.Empleados.Responses;

namespace CRM.Application.Features.Empleados.Services;

public class EmpleadosService : IEmpleadosService
{
    private readonly IEmpleadosRepository _empleadosRepository;

    public EmpleadosService(IEmpleadosRepository empleadosRepository)
    {
        _empleadosRepository = empleadosRepository;
    }

    public Task<EmpleadoGuardarUsuarioResponse> GuardarUsuarioAsync(
        EmpleadoGuardarUsuarioRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.GuardarUsuarioAsync(
            request,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<PagedResponse<EmpleadoListItemResponse>> ListarPaginadoAsync(
        EmpleadoListarPaginadoRequest request,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.ListarPaginadoAsync(request, cancellationToken);
    }

    public Task<EmpleadoBuscarPorDocumentoResponse?> BuscarPorDocumentoAsync(
        string numeroDocumento,
        long? tipoDocumentoId,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.BuscarPorDocumentoAsync(numeroDocumento, tipoDocumentoId, cancellationToken);
    }

    public Task<EmpleadoCompletoResponse?> ObtenerCompletoAsync(
        long? empleadoId,
        string? numeroDocumento,
        long? tipoDocumentoId,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.ObtenerCompletoAsync(empleadoId, numeroDocumento, tipoDocumentoId, cancellationToken);
    }

    public Task<EmpleadoOperacionResponse> DesactivarAsync(
        long empleadoId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.DesactivarAsync(empleadoId, usuarioIdAccion, cancellationToken);
    }

    public Task<EmpleadoValidacionEliminacionResponse> ValidarEliminacionFisicaAsync(
        long empleadoId,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.ValidarEliminacionFisicaAsync(empleadoId, cancellationToken);
    }

    public Task<EmpleadoOperacionResponse> EliminarFisicoAsync(
        long empleadoId,
        bool confirmar,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.EliminarFisicoAsync(empleadoId, confirmar, cancellationToken);
    }

    public Task<List<EmpleadoCampaniaResponse>> SincronizarCampaniasAsync(
        long empleadoId,
        EmpleadoSincronizarCampaniasRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.SincronizarCampaniasAsync(
            empleadoId,
            request.TipoProductoId,
            request.Campanias,
            usuarioIdAccion,
            cancellationToken);
    }

    public Task<ValidarTipoProductoCampaniasResponse> ValidarTipoProductoCampaniasAsync(
        ValidarTipoProductoCampaniasRequest request,
        CancellationToken cancellationToken = default)
    {
        return _empleadosRepository.ValidarTipoProductoCampaniasAsync(
            request.TipoProductoId,
            request.Campanias,
            cancellationToken);
    }
}