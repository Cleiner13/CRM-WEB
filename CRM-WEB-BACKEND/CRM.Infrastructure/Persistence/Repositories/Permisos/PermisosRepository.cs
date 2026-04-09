using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Permisos.Interfaces;
using CRM.Application.Features.Permisos.Requests;
using CRM.Application.Features.Permisos.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.Permisos;

public class PermisosRepository : IPermisosRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PermisosRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<PermisoResponse>> ListarAsync(
        long? moduloId,
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Buscar", buscar, DbType.String);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "seg.usp_Permisos_Listar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<PermisoResponse>(command);
        return result.ToList();
    }

    public async Task<PermisoGuardarResponse> GuardarAsync(
        GuardarPermisoRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@PermisoId", request.PermisoId, DbType.Int64);
        parameters.Add("@Codigo", request.Codigo, DbType.String);
        parameters.Add("@Nombre", request.Nombre, DbType.String);
        parameters.Add("@Descripcion", request.Descripcion, DbType.String);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Permisos_Guardar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<PermisoGuardarResponse>(command);
    }

    public async Task<PermisoOperacionResponse> EliminarAsync(
        long permisoId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@PermisoId", permisoId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Permisos_Eliminar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<PermisoOperacionResponse>(command);
    }
}
