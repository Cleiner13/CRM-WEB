using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Roles.Interfaces;
using CRM.Application.Features.Roles.Requests;
using CRM.Application.Features.Roles.Responses;
using Dapper;
using Microsoft.Data.SqlClient;

namespace CRM.Infrastructure.Persistence.Repositories.Roles;

public class RolesRepository : IRolesRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public RolesRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<RolResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Buscar", buscar, DbType.String);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "seg.usp_Roles_Listar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<RolResponse>(command);
        return result.ToList();
    }

    public async Task<RolGuardarResponse> GuardarAsync(
        GuardarRolRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@RolId", request.RolId, DbType.Int64);
        parameters.Add("@Codigo", request.Codigo, DbType.String);
        parameters.Add("@Nombre", request.Nombre, DbType.String);
        parameters.Add("@Descripcion", request.Descripcion, DbType.String);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Roles_Guardar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<RolGuardarResponse>(command);
    }

    public async Task<RolOperacionResponse> EliminarAsync(
        long rolId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@RolId", rolId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Roles_Eliminar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<RolOperacionResponse>(command);
    }

    public async Task<List<RolPermisoResponse>> ListarPermisosAsync(
        long rolId,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@RolId", rolId, DbType.Int64);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "seg.usp_RolesPermisos_Listar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<RolPermisoResponse>(command);
        return result.ToList();
    }

    public async Task<RolPermisoMatrizResponse> ObtenerMatrizPermisosAsync(
        long rolId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string roleExistsSql = """
            SELECT COUNT(1)
            FROM seg.Roles
            WHERE RolId = @RolId;
            """;

        var roleExists = await connection.ExecuteScalarAsync<int>(
            new CommandDefinition(
                roleExistsSql,
                new { RolId = rolId },
                cancellationToken: cancellationToken));

        if (roleExists <= 0)
        {
            throw new AppException(404, "El rol no existe.");
        }

        const string matrixSql = """
            WITH ModulosBase AS
            (
                SELECT
                    M.ModuloId,
                    M.Codigo AS ModuloCodigo,
                    M.Nombre AS ModuloNombre
                FROM seg.Modulos M
                WHERE M.Activo = 1
            ),
            PermisosBase AS
            (
                SELECT
                    P.PermisoId,
                    P.Codigo AS PermisoCodigo,
                    P.Nombre AS PermisoNombre
                FROM seg.Permisos P
                WHERE P.Activo = 1
            )
            SELECT
                M.ModuloId,
                M.ModuloCodigo,
                M.ModuloNombre,
                P.PermisoId,
                P.PermisoCodigo,
                P.PermisoNombre,
                CAST(
                    CASE
                        WHEN RP.RolPermisoId IS NOT NULL AND RP.Activo = 1 THEN 1
                        ELSE 0
                    END
                AS BIT) AS Marcado
            FROM ModulosBase M
            CROSS JOIN PermisosBase P
            LEFT JOIN seg.RolesPermisos RP
                ON RP.RolId = @RolId
               AND RP.ModuloId = M.ModuloId
               AND RP.PermisoId = P.PermisoId
            ORDER BY
                M.ModuloNombre,
                P.PermisoNombre;
            """;

        var matrixRows = (await connection.QueryAsync<RolPermisoMatrizDbRow>(
                new CommandDefinition(
                    matrixSql,
                    new { RolId = rolId },
                    cancellationToken: cancellationToken)))
            .Select(item => new RolPermisoMatrizItemResponse
            {
                ModuloId = item.ModuloId,
                ModuloCodigo = item.ModuloCodigo,
                ModuloNombre = item.ModuloNombre,
                PermisoId = item.PermisoId,
                PermisoCodigo = item.PermisoCodigo,
                PermisoNombre = item.PermisoNombre,
                Asignado = item.Marcado
            })
            .ToList();

        return new RolPermisoMatrizResponse
        {
            RolId = rolId,
            Permisos = matrixRows
                .OrderBy(item => item.ModuloNombre)
                .ThenBy(item => item.PermisoCodigo)
                .ToList()
        };
    }

    public async Task<RolPermisoMatrizResponse> GuardarMatrizPermisosAsync(
        long rolId,
        GuardarMatrizRolPermisosRequest request,
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
                throw new AppException(500, "La conexion SQL no es compatible con guardado de matriz por rol.");
            }

            var desiredItems = request.Permisos
                .GroupBy(item => new { item.ModuloId, item.PermisoId })
                .Select(group => group.Last())
                .ToList();

            var currentMatrix = await ObtenerMatrizPermisosAsync(rolId, cancellationToken);
            var currentAssigned = currentMatrix.Permisos
                .Where(item => item.Asignado)
                .Select(item => (item.ModuloId, item.PermisoId))
                .ToHashSet();

            var desiredAssigned = desiredItems
                .Where(item => item.Asignado)
                .Select(item => (item.ModuloId, item.PermisoId))
                .ToHashSet();

            if (sqlConnection.State != ConnectionState.Open)
            {
                await sqlConnection.OpenAsync(cancellationToken);
            }

            await using var transaction = await sqlConnection.BeginTransactionAsync(cancellationToken);
            var now = DateTime.Now;

            const string disableSql = """
                UPDATE seg.RolesPermisos
                SET Activo = 0,
                    FechaModificacion = @Now,
                    UsuarioModificacionId = @UsuarioIdAccion
                WHERE RolId = @RolId
                  AND ModuloId = @ModuloId
                  AND PermisoId = @PermisoId
                  AND Activo = 1;
                """;

            const string reactivateSql = """
                UPDATE seg.RolesPermisos
                SET Activo = 1,
                    FechaModificacion = @Now,
                    UsuarioModificacionId = @UsuarioIdAccion
                WHERE RolId = @RolId
                  AND ModuloId = @ModuloId
                  AND PermisoId = @PermisoId;
                """;

            const string insertSql = """
                INSERT INTO seg.RolesPermisos
                (
                    RolId,
                    ModuloId,
                    PermisoId,
                    UsuarioAsignacionId,
                    DatosExtra,
                    Activo,
                    FechaCreacion,
                    UsuarioCreacionId
                )
                VALUES
                (
                    @RolId,
                    @ModuloId,
                    @PermisoId,
                    NULL,
                    NULL,
                    1,
                    @Now,
                    @UsuarioIdAccion
                );
                """;

            const string existsSql = """
                SELECT COUNT(1)
                FROM seg.RolesPermisos
                WHERE RolId = @RolId
                  AND ModuloId = @ModuloId
                  AND PermisoId = @PermisoId;
                """;

            foreach (var item in currentAssigned.Except(desiredAssigned))
            {
                await sqlConnection.ExecuteAsync(
                    new CommandDefinition(
                        disableSql,
                        new
                        {
                            RolId = rolId,
                            item.ModuloId,
                            item.PermisoId,
                            Now = now,
                            UsuarioIdAccion = usuarioIdAccion
                        },
                        transaction,
                        cancellationToken: cancellationToken));
            }

            foreach (var item in desiredAssigned)
            {
                var exists = await sqlConnection.ExecuteScalarAsync<int>(
                    new CommandDefinition(
                        existsSql,
                        new
                        {
                            RolId = rolId,
                            item.ModuloId,
                            item.PermisoId
                        },
                        transaction,
                        cancellationToken: cancellationToken));

                if (exists > 0)
                {
                    await sqlConnection.ExecuteAsync(
                        new CommandDefinition(
                            reactivateSql,
                            new
                            {
                                RolId = rolId,
                                item.ModuloId,
                                item.PermisoId,
                                Now = now,
                                UsuarioIdAccion = usuarioIdAccion
                            },
                            transaction,
                            cancellationToken: cancellationToken));
                }
                else
                {
                    await sqlConnection.ExecuteAsync(
                        new CommandDefinition(
                            insertSql,
                            new
                            {
                                RolId = rolId,
                                item.ModuloId,
                                item.PermisoId,
                                Now = now,
                                UsuarioIdAccion = usuarioIdAccion
                            },
                            transaction,
                            cancellationToken: cancellationToken));
                }
            }

            if (usuarioIdAccion.HasValue)
            {
                const string auditSql = """
                    INSERT INTO aud.LogAuditoria
                    (
                        UsuarioId, Accion, Entidad, ClaveEntidad,
                        AntesJson, DespuesJson, IpAddress, UserAgent, DatosExtra,
                        Activo, FechaCreacion, UsuarioCreacionId
                    )
                    VALUES
                    (
                        @UsuarioIdAccion,
                        N'ROL_PERMISOS_GUARDAR_MATRIZ',
                        N'seg.RolesPermisos',
                        CONVERT(NVARCHAR(100), @RolId),
                        NULL,
                        NULL,
                        @IpAddress,
                        @UserAgent,
                        @DatosExtra,
                        1,
                        @Now,
                        @UsuarioIdAccion
                    );
                    """;

                var normalizedUserAgent = string.IsNullOrWhiteSpace(userAgent)
                    ? null
                    : userAgent.Trim()[..Math.Min(userAgent.Trim().Length, 200)];

                await sqlConnection.ExecuteAsync(
                    new CommandDefinition(
                        auditSql,
                        new
                        {
                            RolId = rolId,
                            UsuarioIdAccion = usuarioIdAccion,
                            IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? null : ipAddress.Trim(),
                            UserAgent = normalizedUserAgent,
                            DatosExtra = $"{{\"RolId\":{rolId},\"TotalItems\":{desiredItems.Count}}}",
                            Now = now
                        },
                        transaction,
                        cancellationToken: cancellationToken));
            }

            await transaction.CommitAsync(cancellationToken);
            return await ObtenerMatrizPermisosAsync(rolId, cancellationToken);
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
            throw new AppException(500, "No se pudo guardar la matriz de permisos del rol.", new List<string> { ex.Message });
        }
    }

    public async Task<RolPermisoAsignadoResponse> AsignarPermisoAsync(
        long rolId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@RolId", rolId, DbType.Int64);
        parameters.Add("@PermisoId", permisoId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_RolesPermisos_Asignar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<RolPermisoAsignadoResponse>(command);
    }

    public async Task<RolOperacionResponse> QuitarPermisoAsync(
        long rolId,
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@RolId", rolId, DbType.Int64);
        parameters.Add("@PermisoId", permisoId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_RolesPermisos_Quitar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<RolOperacionResponse>(command);
    }

    private sealed class RolPermisoMatrizDbRow
    {
        public long ModuloId { get; set; }
        public long PermisoId { get; set; }
        public string? ModuloCodigo { get; set; }
        public string? ModuloNombre { get; set; }
        public string? PermisoCodigo { get; set; }
        public string? PermisoNombre { get; set; }
        public bool Marcado { get; set; }
    }
}
