using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Permisos.Responses;
using CRM.Application.Features.Roles.Interfaces;
using CRM.Application.Features.Roles.Requests;
using CRM.Application.Features.Roles.Responses;
using Dapper;

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

        var permissionsCommand = new CommandDefinition(
            commandText: "seg.usp_Permisos_Listar",
            parameters: new
            {
                Buscar = (string?)null,
                SoloActivos = true
            },
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var rolePermissionsCommand = new CommandDefinition(
            commandText: "seg.usp_RolesPermisos_Listar",
            parameters: new
            {
                RolId = rolId,
                SoloActivos = true
            },
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var permissions = (await connection.QueryAsync<PermisoResponse>(permissionsCommand)).ToList();
        var rolePermissions = (await connection.QueryAsync<RolPermisoResponse>(rolePermissionsCommand)).ToList();
        var assignedPermissionIds = rolePermissions
            .Where(item => item.Activo)
            .Select(item => item.PermisoId)
            .ToHashSet();

        return new RolPermisoMatrizResponse
        {
            RolId = rolId,
            Permisos = permissions
                .OrderBy(item => item.Codigo)
                .ThenBy(item => item.Nombre)
                .Select(item => new RolPermisoMatrizItemResponse
                {
                    ModuloId = 0,
                    ModuloCodigo = string.Empty,
                    ModuloNombre = string.Empty,
                    PermisoId = item.PermisoId,
                    PermisoCodigo = item.Codigo,
                    PermisoNombre = item.Nombre,
                    Asignado = assignedPermissionIds.Contains(item.PermisoId)
                })
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
        var matrizActual = await ObtenerMatrizPermisosAsync(rolId, cancellationToken);
        var currentAssignedIds = matrizActual.Permisos
            .Where(item => item.Asignado)
            .Select(item => item.PermisoId)
            .ToHashSet();

        var desiredAssigned = request.Permisos
            .Where(item => item.Asignado)
            .Select(item => item.PermisoId)
            .ToHashSet();

        using var connection = _connectionFactory.CreateConnection();

        foreach (var permisoId in desiredAssigned.Except(currentAssignedIds))
        {
            var command = new CommandDefinition(
                commandText: "seg.usp_RolesPermisos_Asignar",
                parameters: new
                {
                    RolId = rolId,
                    PermisoId = permisoId,
                    UsuarioIdAccion = usuarioIdAccion,
                    IpAddress = ipAddress,
                    UserAgent = userAgent
                },
                commandType: CommandType.StoredProcedure,
                cancellationToken: cancellationToken);

            await connection.ExecuteAsync(command);
        }

        foreach (var permisoId in currentAssignedIds.Except(desiredAssigned))
        {
            var command = new CommandDefinition(
                commandText: "seg.usp_RolesPermisos_Quitar",
                parameters: new
                {
                    RolId = rolId,
                    PermisoId = permisoId,
                    UsuarioIdAccion = usuarioIdAccion,
                    IpAddress = ipAddress,
                    UserAgent = userAgent
                },
                commandType: CommandType.StoredProcedure,
                cancellationToken: cancellationToken);

            await connection.ExecuteAsync(command);
        }

        return await ObtenerMatrizPermisosAsync(rolId, cancellationToken);
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
}
