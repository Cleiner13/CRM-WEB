using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.ItemsMaestros.Interfaces;
using CRM.Application.Features.ItemsMaestros.Requests;
using CRM.Application.Features.ItemsMaestros.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.ItemsMaestros;

public class ItemsMaestrosRepository : IItemsMaestrosRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ItemsMaestrosRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<ItemMaestroResponse>> ListarAsync(
        long? tablaMaestraId,
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@TablaMaestraId", tablaMaestraId, DbType.Int64);
        parameters.Add("@Buscar", buscar, DbType.String);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            "ref.usp_ItemsMaestros_Listar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<ItemMaestroResponse>(command);
        return result.ToList();
    }

    public async Task<ItemMaestroResponse?> ObtenerAsync(
        long itemMaestroId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@ItemMaestroId", itemMaestroId, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_ItemsMaestros_Obtener",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstOrDefaultAsync<ItemMaestroResponse>(command);
    }

    public async Task<List<ItemMaestroHijoResponse>> ListarHijosAsync(
        string tipoRelacion,
        long itemPadreId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@TipoRelacion", tipoRelacion, DbType.String);
        parameters.Add("@ItemPadreId", itemPadreId, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_ItemsMaestros_ListarHijos",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<ItemMaestroHijoResponse>(command);
        return result.ToList();
    }

    public async Task<ItemMaestroGuardarResponse> GuardarAsync(
        GuardarItemMaestroRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@ItemMaestroId", request.ItemMaestroId, DbType.Int64);
        parameters.Add("@TablaMaestraId", request.TablaMaestraId, DbType.Int64);
        parameters.Add("@Codigo", request.Codigo, DbType.String);
        parameters.Add("@Nombre", request.Nombre, DbType.String);
        parameters.Add("@Orden", request.Orden, DbType.Int32);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);
        parameters.Add("@UsuarioId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_ItemsMaestros_Guardar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<ItemMaestroGuardarResponse>(command);
    }

    public async Task<ItemMaestroOperacionResponse> EliminarAsync(
        long itemMaestroId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@ItemMaestroId", itemMaestroId, DbType.Int64);
        parameters.Add("@UsuarioId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_ItemsMaestros_Eliminar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<ItemMaestroOperacionResponse>(command);
    }
}