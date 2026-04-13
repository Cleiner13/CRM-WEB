using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Usuarios.Interfaces;
using CRM.Application.Features.Usuarios.Requests;
using CRM.Application.Features.Usuarios.Responses;
using Dapper;
using Microsoft.Data.SqlClient;

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

    public async Task<UsuarioPermisoMatrizResponse> ObtenerMatrizPermisosAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@SoloActivos", true, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "seg.usp_UsuariosPermisos_ListarMatriz",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var matrixRows = (await connection.QueryAsync<UsuarioPermisoMatrizDbModel>(command)).ToList();

        return new UsuarioPermisoMatrizResponse
        {
            UsuarioId = usuarioId,
            Permisos = matrixRows
                .OrderBy(item => item.ModuloNombre)
                .ThenBy(item => item.PermisoCodigo)
                .Select(item =>
                {
                    return new UsuarioPermisoMatrizItemResponse
                    {
                        ModuloId = item.ModuloId,
                        ModuloCodigo = item.ModuloCodigo,
                        ModuloNombre = item.ModuloNombre,
                        PermisoId = item.PermisoId,
                        PermisoCodigo = item.PermisoCodigo,
                        PermisoNombre = item.PermisoNombre,
                        HeredadoPorRol = item.HeredadoPorRol,
                        EstadoOverride = item.TieneOverrideUsuario
                            ? item.EsDenegadoUsuario ? "DENY" : "ALLOW"
                            : "HEREDAR",
                        EsDenegado = item.EsDenegadoUsuario,
                        PermitidoEfectivo = item.PermitidoEfectivo,
                        Motivo = item.Motivo
                    };
                })
                .ToList()
        };
    }

    public async Task<UsuarioPermisoMatrizResponse> GuardarMatrizPermisosAsync(
        long usuarioId,
        GuardarMatrizUsuarioPermisosRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _connectionFactory.CreateConnection();
            if (connection is not SqlConnection sqlConnection)
            {
                throw new AppException(500, "La conexion SQL no es compatible con guardado estructurado de matriz.");
            }

            var itemsTable = new DataTable();
            itemsTable.Columns.Add("ModuloId", typeof(long));
            itemsTable.Columns.Add("PermisoId", typeof(long));
            itemsTable.Columns.Add("Estado", typeof(string));
            itemsTable.Columns.Add("Motivo", typeof(string));

            foreach (var item in request.Permisos
                         .GroupBy(entry => new { entry.ModuloId, entry.PermisoId })
                         .Select(group => group.Last()))
            {
                var estado = string.IsNullOrWhiteSpace(item.Estado)
                    ? "HEREDAR"
                    : item.Estado.Trim().ToUpperInvariant();

                itemsTable.Rows.Add(
                    item.ModuloId,
                    item.PermisoId,
                    estado,
                    string.IsNullOrWhiteSpace(item.Motivo) ? DBNull.Value : item.Motivo!.Trim());
            }

            if (sqlConnection.State != ConnectionState.Open)
            {
                await sqlConnection.OpenAsync(cancellationToken);
            }

            using var command = new SqlCommand("seg.usp_UsuariosPermisos_GuardarMatriz", sqlConnection)
            {
                CommandType = CommandType.StoredProcedure,
                CommandTimeout = 120
            };

            command.Parameters.Add(new SqlParameter("@UsuarioId", SqlDbType.BigInt) { Value = usuarioId });
            command.Parameters.Add(new SqlParameter("@UsuarioIdAccion", SqlDbType.BigInt) { Value = (object?)usuarioIdAccion ?? DBNull.Value });
            command.Parameters.Add(new SqlParameter("@IpAddress", SqlDbType.NVarChar, 80)
            {
                Value = string.IsNullOrWhiteSpace(ipAddress) ? DBNull.Value : ipAddress.Trim()
            });

            var normalizedUserAgent = string.IsNullOrWhiteSpace(userAgent)
                ? null
                : userAgent.Trim()[..Math.Min(userAgent.Trim().Length, 200)];

            command.Parameters.Add(new SqlParameter("@UserAgent", SqlDbType.NVarChar, 200)
            {
                Value = (object?)normalizedUserAgent ?? DBNull.Value
            });
            command.Parameters.Add(new SqlParameter("@Items", SqlDbType.Structured)
            {
                TypeName = "seg.TVP_UsuariosPermisosMatriz",
                Value = itemsTable
            });

            using var reader = await command.ExecuteReaderAsync(cancellationToken);
            do
            {
                while (await reader.ReadAsync(cancellationToken))
                {
                }
            } while (await reader.NextResultAsync(cancellationToken));

            return await ObtenerMatrizPermisosAsync(usuarioId, cancellationToken);
        }
        catch (SqlException ex)
        {
            throw new AppException(400, ex.Message, ex.Errors.Cast<SqlError>().Select(error => error.Message).ToList());
        }
        catch (InvalidOperationException ex)
        {
            throw new AppException(500, ex.Message);
        }
        catch (Exception ex) when (ex is not AppException)
        {
            throw new AppException(500, "No se pudo guardar la matriz de permisos del usuario.", new List<string> { ex.Message });
        }
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
        try
        {
            using var connection = _connectionFactory.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
            parameters.Add("@Motivo", null, DbType.String);
            parameters.Add("@UsuarioAccionId", usuarioIdAccion, DbType.Int64);
            parameters.Add("@IpAddress", string.IsNullOrWhiteSpace(ipAddress) ? null : ipAddress.Trim()[..Math.Min(ipAddress.Trim().Length, 80)], DbType.String);
            parameters.Add("@UserAgent", string.IsNullOrWhiteSpace(userAgent) ? null : userAgent.Trim()[..Math.Min(userAgent.Trim().Length, 200)], DbType.String);

            var command = new CommandDefinition(
                commandText: "seg.usp_Usuarios_Desactivar",
                parameters: parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: cancellationToken);

            return await connection.QueryFirstAsync<OperacionResponse>(command);
        }
        catch (SqlException ex)
        {
            return await DesactivarUsuarioFallbackAsync(
                usuarioId,
                usuarioIdAccion,
                ipAddress,
                userAgent,
                ex,
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            throw new AppException(500, ex.Message);
        }
        catch (Exception ex) when (ex is not AppException)
        {
            throw new AppException(500, "No se pudo desactivar el usuario.", new List<string> { ex.Message });
        }
    }

    public async Task<OperacionResponse> ReactivarUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _connectionFactory.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
            parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
            parameters.Add("@IpAddress", string.IsNullOrWhiteSpace(ipAddress) ? null : ipAddress.Trim()[..Math.Min(ipAddress.Trim().Length, 50)], DbType.String);
            parameters.Add("@UserAgent", string.IsNullOrWhiteSpace(userAgent) ? null : userAgent.Trim()[..Math.Min(userAgent.Trim().Length, 300)], DbType.String);

            var command = new CommandDefinition(
                commandText: "seg.usp_Usuarios_Reactivar",
                parameters: parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: cancellationToken);

            return await connection.QueryFirstAsync<OperacionResponse>(command);
        }
        catch (SqlException ex)
        {
            throw new AppException(400, ex.Message, ex.Errors.Cast<SqlError>().Select(error => error.Message).ToList());
        }
        catch (InvalidOperationException ex)
        {
            throw new AppException(500, ex.Message);
        }
        catch (Exception ex) when (ex is not AppException)
        {
            throw new AppException(500, "No se pudo reactivar el usuario.", new List<string> { ex.Message });
        }
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

    private sealed class UsuarioPermisoMatrizDbModel
    {
        public long UsuarioId { get; set; }
        public long ModuloId { get; set; }
        public string? ModuloCodigo { get; set; }
        public string? ModuloNombre { get; set; }
        public long PermisoId { get; set; }
        public string? PermisoCodigo { get; set; }
        public string? PermisoNombre { get; set; }
        public bool HeredadoPorRol { get; set; }
        public bool TieneOverrideUsuario { get; set; }
        public bool EsDenegadoUsuario { get; set; }
        public bool PermitidoUsuario { get; set; }
        public bool PermitidoEfectivo { get; set; }
        public string? Fuente { get; set; }
        public long? UsuarioPermisoId { get; set; }
        public string? Motivo { get; set; }
    }

    private async Task<OperacionResponse> DesactivarUsuarioFallbackAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        SqlException originalException,
        CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        if (connection is not SqlConnection sqlConnection)
        {
            throw new AppException(400, originalException.Message, originalException.Errors.Cast<SqlError>().Select(error => error.Message).ToList());
        }

        if (sqlConnection.State != ConnectionState.Open)
        {
            await sqlConnection.OpenAsync(cancellationToken);
        }

        await using var transaction = await sqlConnection.BeginTransactionAsync(cancellationToken);

        try
        {
            const string currentUserSql = """
                SELECT TOP (1)
                    UsuarioId,
                    Activo
                FROM seg.Usuarios
                WHERE UsuarioId = @UsuarioId;
                """;

            var current = await sqlConnection.QueryFirstOrDefaultAsync<UsuarioEstadoDbModel>(
                new CommandDefinition(
                    currentUserSql,
                    new { UsuarioId = usuarioId },
                    transaction,
                    cancellationToken: cancellationToken));

            if (current is null)
            {
                throw new AppException(404, "El UsuarioId no existe.");
            }

            if (!current.Activo)
            {
                throw new AppException(400, "El usuario ya se encuentra inactivo.");
            }

            var now = DateTime.Now;

            const string disableUserSql = """
                UPDATE seg.Usuarios
                SET Activo = 0,
                    IntentosFallidos = 0,
                    BloqueoHasta = NULL,
                    FechaModificacion = @Now,
                    UsuarioModificacionId = @UsuarioAccionId
                WHERE UsuarioId = @UsuarioId;
                """;

            await sqlConnection.ExecuteAsync(
                new CommandDefinition(
                    disableUserSql,
                    new
                    {
                        UsuarioId = usuarioId,
                        UsuarioAccionId = usuarioIdAccion,
                        Now = now
                    },
                    transaction,
                    cancellationToken: cancellationToken));

            const string refreshTokenExistsSql = """
                SELECT COUNT(1)
                FROM sys.objects
                WHERE object_id = OBJECT_ID(N'seg.RefreshTokens')
                  AND type = 'U';
                """;

            var refreshTokensExists = await sqlConnection.ExecuteScalarAsync<int>(
                new CommandDefinition(
                    refreshTokenExistsSql,
                    transaction: transaction,
                    cancellationToken: cancellationToken));

            if (refreshTokensExists > 0)
            {
                const string revokeTokensSql = """
                    UPDATE seg.RefreshTokens
                    SET Activo = CASE WHEN COL_LENGTH('seg.RefreshTokens', 'Activo') IS NOT NULL THEN 0 ELSE Activo END
                    WHERE UsuarioId = @UsuarioId;
                    """;

                try
                {
                    await sqlConnection.ExecuteAsync(
                        new CommandDefinition(
                            revokeTokensSql,
                            new { UsuarioId = usuarioId },
                            transaction,
                            cancellationToken: cancellationToken));
                }
                catch
                {
                }
            }

            var normalizedIp = string.IsNullOrWhiteSpace(ipAddress)
                ? null
                : ipAddress.Trim()[..Math.Min(ipAddress.Trim().Length, 50)];

            var normalizedUserAgent = string.IsNullOrWhiteSpace(userAgent)
                ? null
                : userAgent.Trim()[..Math.Min(userAgent.Trim().Length, 300)];

            if (usuarioIdAccion.HasValue)
            {
                const string auditSql = """
                    INSERT INTO aud.LogAuditoria
                    (
                        UsuarioId,
                        Accion,
                        Entidad,
                        ClaveEntidad,
                        AntesJson,
                        DespuesJson,
                        IpAddress,
                        UserAgent,
                        DatosExtra,
                        Activo,
                        FechaCreacion,
                        UsuarioCreacionId
                    )
                    VALUES
                    (
                        @UsuarioIdAccion,
                        N'USUARIO_DESACTIVAR',
                        N'seg.Usuarios',
                        CONVERT(NVARCHAR(100), @UsuarioId),
                        NULL,
                        NULL,
                        @IpAddress,
                        @UserAgent,
                        N'{"SoloAccesoTecnico":true}',
                        1,
                        @Now,
                        @UsuarioIdAccion
                    );
                    """;

                try
                {
                    await sqlConnection.ExecuteAsync(
                        new CommandDefinition(
                            auditSql,
                            new
                            {
                                UsuarioId = usuarioId,
                                UsuarioIdAccion = usuarioIdAccion,
                                IpAddress = normalizedIp,
                                UserAgent = normalizedUserAgent,
                                Now = now
                            },
                            transaction,
                            cancellationToken: cancellationToken));
                }
                catch
                {
                }
            }

            await transaction.CommitAsync(cancellationToken);

            return new OperacionResponse
            {
                Ok = true,
                Mensaje = "Usuario desactivado correctamente."
            };
        }
        catch (AppException)
        {
            if (transaction.Connection is not null)
            {
                await transaction.RollbackAsync(cancellationToken);
            }
            throw;
        }
        catch (Exception fallbackException)
        {
            if (transaction.Connection is not null)
            {
                await transaction.RollbackAsync(cancellationToken);
            }

            throw new AppException(
                400,
                originalException.Message,
                new List<string> { originalException.Message, fallbackException.Message });
        }
    }

    private sealed class UsuarioEstadoDbModel
    {
        public long UsuarioId { get; set; }
        public bool Activo { get; set; }
    }

}
