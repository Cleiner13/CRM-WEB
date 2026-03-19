using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.AreasRolesDefault.Interfaces;
using CRM.Application.Features.AreasRolesDefault.Requests;
using CRM.Application.Features.AreasRolesDefault.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.AreasRolesDefault;

public class AreasRolesDefaultRepository : IAreasRolesDefaultRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AreasRolesDefaultRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<AreaRolDefaultResponse>> ListarAsync(
        long? areaId,
        long? rolId,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@AreaId", areaId, DbType.Int64);
        parameters.Add("@RolId", rolId, DbType.Int64);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "seg.usp_AreasRolesDefault_Listar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<AreaRolDefaultResponse>(command);
        return result.ToList();
    }

    public async Task<AreaRolDefaultGuardarResponse> GuardarAsync(
        GuardarAreaRolDefaultRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@AreaId", request.AreaId, DbType.Int64);
        parameters.Add("@RolId", request.RolId, DbType.Int64);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_AreasRolesDefault_Guardar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<AreaRolDefaultGuardarResponse>(command);
    }

    public async Task<AreaRolDefaultOperacionResponse> DesactivarAsync(
        long areaRolDefaultId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@AreaRolDefaultId", areaRolDefaultId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_AreasRolesDefault_Desactivar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<AreaRolDefaultOperacionResponse>(command);
    }
}