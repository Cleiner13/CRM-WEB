using CRM.Application.Common.Models;
using CRM.Application.Features.Usuarios.Interfaces;
using CRM.Application.Features.Usuarios.Requests;
using CRM.Application.Features.Usuarios.Responses;

namespace CRM.Application.Features.Usuarios.Services;

public class UsuariosService : IUsuariosService
{
    private readonly IUsuariosRepository _usuariosRepository;

    public UsuariosService(IUsuariosRepository usuariosRepository)
    {
        _usuariosRepository = usuariosRepository;
    }

    public Task<PagedResponse<UsuarioListItemResponse>> ListarAsync(
        ListarUsuariosRequest request,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.ListarAsync(request, cancellationToken);
    }

    public Task<UsuarioDetalleResponse?> ObtenerPorIdAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.ObtenerPorIdAsync(usuarioId, cancellationToken);
    }

    public Task<List<UsuarioPermisoResponse>> ListarPermisosPorUsuarioAsync(
        long usuarioId,
        bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.ListarPermisosPorUsuarioAsync(usuarioId, soloActivos, cancellationToken);
    }

    public Task<UsuarioPermisoMatrizResponse> ObtenerMatrizPermisosAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.ObtenerMatrizPermisosAsync(usuarioId, cancellationToken);
    }

    public Task<UsuarioPermisoMatrizResponse> GuardarMatrizPermisosAsync(
        long usuarioId,
        GuardarMatrizUsuarioPermisosRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.GuardarMatrizPermisosAsync(
            usuarioId,
            request,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<List<UsuarioRolResponse>> ListarRolesPorUsuarioAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.ListarRolesPorUsuarioAsync(usuarioId, cancellationToken);
    }

    public Task<UsuarioPermisoAsignadoResponse> AsignarPermisoAsync(
        long usuarioId,
        AsignarPermisoUsuarioRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.AsignarPermisoAsync(
            usuarioId,
            request.PermisoId,
            request.EsDenegado,
            request.Motivo,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<OperacionResponse> DesactivarPermisoAsync(
        long usuarioId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.DesactivarPermisoAsync(
            usuarioId,
            permisoId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<UsuarioRolAsignadoResponse> AsignarRolAsync(
        long usuarioId,
        AsignarRolUsuarioRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.AsignarRolAsync(
            usuarioId,
            request.RolId,
            request.UsuarioAsignacionId,
            request.DatosExtra,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<OperacionResponse> QuitarRolAsync(
        long usuarioId,
        long rolId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.QuitarRolAsync(
            usuarioId,
            rolId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<OperacionResponse> DesactivarUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.DesactivarUsuarioAsync(
            usuarioId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<OperacionResponse> ReactivarUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.ReactivarUsuarioAsync(
            usuarioId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<UsuarioResetEmpleadoResponse> CrearResetUsuarioEmpleadoAsync(
        CrearResetUsuarioEmpleadoRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.CrearResetUsuarioEmpleadoAsync(
            request.EmpleadoId,
            request.NumeroDocumento,
            usuarioIdAccion,
            cancellationToken);
    }

    public Task<UsuarioDesactivarEmpleadoResponse> DesactivarUsuarioPorEmpleadoAsync(
        DesactivarUsuarioEmpleadoRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        return _usuariosRepository.DesactivarUsuarioPorEmpleadoAsync(
            request.EmpleadoId,
            usuarioIdAccion,
            cancellationToken);
    }
}
