using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Usuarios.Interfaces;
using CRM.Application.Features.Usuarios.Requests;
using CRM.Application.Features.Usuarios.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.Usuarios;

public class UsuariosRepository : IUsuariosRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UsuariosRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResponse<UsuarioListItemResponse>> ListarAsync(
        ListarUsuariosRequest request,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Pagina", request.Pagina, DbType.Int32);
        parameters.Add("@Tamanio", request.Tamanio, DbType.Int32);
        parameters.Add("@Texto", request.Texto, DbType.String);
        parameters.Add("@SoloActivos", request.SoloActivos, DbType.Boolean);
        parameters.Add("@AreaId", request.AreaId, DbType.Int64);
        parameters.Add("@RolId", request.RolId, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuarios_Listar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var items = (await multi.ReadAsync<UsuarioListItemResponse>()).ToList();
        var meta = await multi.ReadFirstOrDefaultAsync<PaginacionDbModel>();

        var total = meta?.Total ?? 0;
        var pagina = meta?.Pagina ?? request.Pagina;
        var tamanio = meta?.Tamanio ?? request.Tamanio;

        return new PagedResponse<UsuarioListItemResponse>
        {
            Items = items,
            PageNumber = pagina,
            PageSize = tamanio,
            TotalRecords = total,
            TotalPages = tamanio <= 0 ? 1 : (int)Math.Ceiling(total / (double)tamanio)
        };
    }

    public async Task<UsuarioDetalleResponse?> ObtenerPorIdAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@EmpleadoId", null, DbType.Int64);
        parameters.Add("@Usuario", null, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuarios_Obtener",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var header = await multi.ReadFirstOrDefaultAsync<UsuarioObtenerHeaderDbModel>();
        if (header is null || !header.Encontrado)
        {
            return null;
        }

        var usuario = await multi.ReadFirstOrDefaultAsync<UsuarioDbModel>();
        var empleado = await multi.ReadFirstOrDefaultAsync<EmpleadoDbModel>();

        _ = (await multi.ReadAsync<UsuarioRolResponse>()).ToList();
        _ = (await multi.ReadAsync<UsuarioPermisoResponse>()).ToList();
        _ = (await multi.ReadAsync<PermisoEfectivoDbModel>()).ToList();
        _ = (await multi.ReadAsync<CampaniaDbModel>()).ToList();

        if (usuario is null)
        {
            return null;
        }

        return new UsuarioDetalleResponse
        {
            UsuarioId = usuario.UsuarioId,
            EmpleadoId = usuario.EmpleadoId,
            Usuario = usuario.Usuario ?? string.Empty,
            DebeCambiarPassword = usuario.DebeCambiarPassword,
            IntentosFallidos = usuario.IntentosFallidos,
            BloqueoHasta = usuario.BloqueoHasta,
            UltimoLogin = usuario.UltimoLogin,
            Activo = usuario.Activo,
            NumeroDocumento = empleado?.NumeroDocumento,
            ApellidoPaterno = empleado?.ApellidoPaterno,
            ApellidoMaterno = empleado?.ApellidoMaterno,
            PrimerNombre = empleado?.PrimerNombre,
            SegundoNombre = empleado?.SegundoNombre,
            Celular = empleado?.Celular,
            CorreoPersonal = empleado?.CorreoPersonal,
            EmailCoorporativo = empleado?.EmailCoorporativo,
            AreaId = empleado?.AreaId,
            AreaCodigo = empleado?.AreaCodigo,
            AreaNombre = empleado?.AreaNombre,
            CargoId = empleado?.CargoId,
            CargoCodigo = empleado?.CargoCodigo,
            CargoNombre = empleado?.CargoNombre,
            TipoProductoId = empleado?.TipoProductoId,
            TipoProductoCodigo = empleado?.TipoProductoCodigo,
            TipoProductoNombre = empleado?.TipoProductoNombre,
            FechaCreacion = usuario.FechaCreacion,
            FechaModificacion = usuario.FechaModificacion
        };
    }

    public async Task<List<UsuarioPermisoResponse>> ListarPermisosPorUsuarioAsync(
        long usuarioId,
        bool soloActivos = true,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "seg.usp_UsuariosPermisos_ListarPorUsuario",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var items = await connection.QueryAsync<UsuarioPermisoResponse>(command);
        return items.ToList();
    }

    public async Task<List<UsuarioRolResponse>> ListarRolesPorUsuarioAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@EmpleadoId", null, DbType.Int64);
        parameters.Add("@Usuario", null, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuarios_Obtener",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var header = await multi.ReadFirstOrDefaultAsync<UsuarioObtenerHeaderDbModel>();
        if (header is null || !header.Encontrado)
        {
            return new List<UsuarioRolResponse>();
        }

        _ = await multi.ReadFirstOrDefaultAsync<UsuarioDbModel>();
        _ = await multi.ReadFirstOrDefaultAsync<EmpleadoDbModel>();

        var roles = (await multi.ReadAsync<UsuarioRolResponse>()).ToList();

        _ = (await multi.ReadAsync<UsuarioPermisoResponse>()).ToList();
        _ = (await multi.ReadAsync<PermisoEfectivoDbModel>()).ToList();
        _ = (await multi.ReadAsync<CampaniaDbModel>()).ToList();

        return roles;
    }

    public async Task<UsuarioPermisoAsignadoResponse> AsignarPermisoAsync(
        long usuarioId,
        long permisoId,
        bool esDenegado,
        string? motivo,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@PermisoId", permisoId, DbType.Int64);
        parameters.Add("@EsDenegado", esDenegado, DbType.Boolean);
        parameters.Add("@Motivo", motivo, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_UsuariosPermisos_Asignar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryFirstAsync<UsuarioPermisoAsignadoResponse>(command);
        return result;
    }

    public async Task<OperacionResponse> DesactivarPermisoAsync(
        long usuarioId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@PermisoId", permisoId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_UsuariosPermisos_Desactivar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryFirstAsync<OperacionResponse>(command);
        return result;
    }

    public async Task<UsuarioRolAsignadoResponse> AsignarRolAsync(
        long usuarioId,
        long rolId,
        long? usuarioAsignacionId,
        string? datosExtra,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@RolId", rolId, DbType.Int64);
        parameters.Add("@UsuarioAsignacionId", usuarioAsignacionId, DbType.Int64);
        parameters.Add("@DatosExtra", datosExtra, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_UsuariosRoles_Asignar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryFirstAsync<UsuarioRolAsignadoResponse>(command);
        return result;
    }

    public async Task<OperacionResponse> QuitarRolAsync(
        long usuarioId,
        long rolId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@RolId", rolId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_UsuariosRoles_Quitar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryFirstAsync<OperacionResponse>(command);
        return result;
    }

    public async Task<OperacionResponse> DesactivarUsuarioAsync(
    long usuarioId,
    long? usuarioIdAccion,
    string? ipAddress,
    string? userAgent,
    CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuarios_Desactivar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<OperacionResponse>(command);
    }

    public async Task<OperacionResponse> ReactivarUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuarios_Reactivar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<OperacionResponse>(command);
    }

    public async Task<UsuarioResetEmpleadoResponse> CrearResetUsuarioEmpleadoAsync(
        long empleadoId,
        string numeroDocumento,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@EmpleadoId", empleadoId, DbType.Int64);
        parameters.Add("@NumeroDocumento", numeroDocumento, DbType.String);
        parameters.Add("@UsuarioAccionId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuario_Crear_Reset_Empleado",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<UsuarioResetEmpleadoResponse>(command);
    }

    public async Task<UsuarioDesactivarEmpleadoResponse> DesactivarUsuarioPorEmpleadoAsync(
        long empleadoId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@EmpleadoId", empleadoId, DbType.Int64);
        parameters.Add("@UsuarioAccionId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuario_Desactivar_Empleado",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<UsuarioDesactivarEmpleadoResponse>(command);
    }

    private sealed class PaginacionDbModel
    {
        public int Total { get; set; }
        public int Pagina { get; set; }
        public int Tamanio { get; set; }
    }

    private sealed class UsuarioObtenerHeaderDbModel
    {
        public bool Encontrado { get; set; }
        public long UsuarioId { get; set; }
    }

    private sealed class UsuarioDbModel
    {
        public long UsuarioId { get; set; }
        public long? EmpleadoId { get; set; }
        public string? Usuario { get; set; }
        public bool DebeCambiarPassword { get; set; }
        public int IntentosFallidos { get; set; }
        public DateTime? BloqueoHasta { get; set; }
        public DateTime? UltimoLogin { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }

    private sealed class EmpleadoDbModel
    {
        public long EmpleadoId { get; set; }
        public string? NumeroDocumento { get; set; }
        public string? ApellidoPaterno { get; set; }
        public string? ApellidoMaterno { get; set; }
        public string? PrimerNombre { get; set; }
        public string? SegundoNombre { get; set; }
        public string? Celular { get; set; }
        public string? CorreoPersonal { get; set; }
        public string? EmailCoorporativo { get; set; }
        public long? AreaId { get; set; }
        public string? AreaCodigo { get; set; }
        public string? AreaNombre { get; set; }
        public long? CargoId { get; set; }
        public string? CargoCodigo { get; set; }
        public string? CargoNombre { get; set; }
        public long? TipoProductoId { get; set; }
        public string? TipoProductoCodigo { get; set; }
        public string? TipoProductoNombre { get; set; }
    }

    private sealed class PermisoEfectivoDbModel
    {
        public long PermisoId { get; set; }
    }

    private sealed class CampaniaDbModel
    {
        public long EmpleadoCampaniaId { get; set; }
    }
}