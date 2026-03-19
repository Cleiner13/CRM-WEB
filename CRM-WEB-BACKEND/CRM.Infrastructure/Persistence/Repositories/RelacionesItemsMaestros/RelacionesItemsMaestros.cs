using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.RelacionesItemsMaestros.Interfaces;
using CRM.Application.Features.RelacionesItemsMaestros.Requests;
using CRM.Application.Features.RelacionesItemsMaestros.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.RelacionesItemsMaestros;

public class RelacionesItemsMaestrosRepository : IRelacionesItemsMaestrosRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public RelacionesItemsMaestrosRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<RelacionItemMaestroResponse>> ListarAsync(
        string? tipoRelacion,
        long? itemPadreId,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@TipoRelacion", tipoRelacion, DbType.String);
        parameters.Add("@ItemPadreId", itemPadreId, DbType.Int64);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            "ref.usp_RelacionesItemsMaestros_Listar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<RelacionItemMaestroResponse>(command);
        return result.ToList();
    }

    public async Task<RelacionItemMaestroGuardarResponse> GuardarAsync(
        GuardarRelacionItemMaestroRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@RelacionId", request.RelacionId, DbType.Int64);
        parameters.Add("@ItemPadreId", request.ItemPadreId, DbType.Int64);
        parameters.Add("@ItemHijoId", request.ItemHijoId, DbType.Int64);
        parameters.Add("@TipoRelacion", request.TipoRelacion, DbType.String);
        parameters.Add("@Orden", request.Orden, DbType.Int32);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);
        parameters.Add("@UsuarioId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_RelacionesItemsMaestros_Guardar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<RelacionItemMaestroGuardarResponse>(command);
    }

    public async Task<RelacionItemMaestroOperacionResponse> EliminarAsync(
        long relacionId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@RelacionId", relacionId, DbType.Int64);
        parameters.Add("@UsuarioId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_RelacionesItemsMaestros_Eliminar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<RelacionItemMaestroOperacionResponse>(command);
    }
}