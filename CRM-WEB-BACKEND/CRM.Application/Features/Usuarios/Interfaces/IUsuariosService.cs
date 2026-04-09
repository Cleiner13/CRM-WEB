using CRM.Application.Common.Models;
using CRM.Application.Features.Usuarios.Requests;
using CRM.Application.Features.Usuarios.Responses;

namespace CRM.Application.Features.Usuarios.Interfaces;

public interface IUsuariosService
{
    Task<PagedResponse<UsuarioListItemResponse>> ListarAsync(
        ListarUsuariosRequest request,
        CancellationToken cancellationToken = default);

    Task<UsuarioDetalleResponse?> ObtenerPorIdAsync(
        long usuarioId,
        CancellationToken cancellationToken = default);

    Task<List<UsuarioPermisoResponse>> ListarPermisosPorUsuarioAsync(
        long usuarioId,
        bool soloActivos = true,
        CancellationToken cancellationToken = default);

    Task<UsuarioPermisoMatrizResponse> ObtenerMatrizPermisosAsync(
        long usuarioId,
        CancellationToken cancellationToken = default);

    Task<UsuarioPermisoMatrizResponse> GuardarMatrizPermisosAsync(
        long usuarioId,
        GuardarMatrizUsuarioPermisosRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<List<UsuarioRolResponse>> ListarRolesPorUsuarioAsync(
        long usuarioId,
        CancellationToken cancellationToken = default);

    Task<UsuarioPermisoAsignadoResponse> AsignarPermisoAsync(
        long usuarioId,
        AsignarPermisoUsuarioRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<OperacionResponse> DesactivarPermisoAsync(
        long usuarioId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<UsuarioRolAsignadoResponse> AsignarRolAsync(
        long usuarioId,
        AsignarRolUsuarioRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<OperacionResponse> QuitarRolAsync(
        long usuarioId,
        long rolId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<OperacionResponse> DesactivarUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<OperacionResponse> ReactivarUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<UsuarioResetEmpleadoResponse> CrearResetUsuarioEmpleadoAsync(
        CrearResetUsuarioEmpleadoRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);

    Task<UsuarioDesactivarEmpleadoResponse> DesactivarUsuarioPorEmpleadoAsync(
        DesactivarUsuarioEmpleadoRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default);
}
