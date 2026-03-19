using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Modulos.Interfaces;
using CRM.Application.Features.Modulos.Requests;
using CRM.Application.Features.Modulos.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.Modulos;

public class ModulosRepository : IModulosRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ModulosRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<ModuloResponse>> ListarAsync(
     string? buscar,
     bool soloActivos,
     CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Buscar", buscar, DbType.String);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "seg.usp_Modulos_Listar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<ModuloResponse>(command);
        return result.ToList();
    }

    public async Task<ModuloGuardarResponse> GuardarAsync(
        GuardarModuloRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@ModuloId", request.ModuloId, DbType.Int64);
        parameters.Add("@Codigo", request.Codigo, DbType.String);
        parameters.Add("@Nombre", request.Nombre, DbType.String);
        parameters.Add("@Descripcion", request.Descripcion, DbType.String);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Modulos_Guardar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<ModuloGuardarResponse>(command);
    }

    public async Task<ModuloOperacionResponse> EliminarAsync(
        long moduloId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@ModuloId", moduloId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Modulos_Eliminar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<ModuloOperacionResponse>(command);
    }
}