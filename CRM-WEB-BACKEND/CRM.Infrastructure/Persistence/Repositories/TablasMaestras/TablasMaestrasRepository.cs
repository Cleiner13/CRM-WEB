using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.TablasMaestras.Interfaces;
using CRM.Application.Features.TablasMaestras.Requests;
using CRM.Application.Features.TablasMaestras.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.TablasMaestras;

public class TablasMaestrasRepository : ITablasMaestrasRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public TablasMaestrasRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<TablaMaestraResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Buscar", buscar, DbType.String);
        parameters.Add("@SoloActivos", soloActivos, DbType.Boolean);

        var command = new CommandDefinition(
            "ref.usp_TablasMaestras_Listar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<TablaMaestraResponse>(command);
        return result.ToList();
    }

    public async Task<TablaMaestraGuardarResponse> GuardarAsync(
        GuardarTablaMaestraRequest request,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@TablaMaestraId", request.TablaMaestraId, DbType.Int64);
        parameters.Add("@Codigo", request.Codigo, DbType.String);
        parameters.Add("@Nombre", request.Nombre, DbType.String);
        parameters.Add("@Descripcion", request.Descripcion, DbType.String);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);
        parameters.Add("@UsuarioId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_TablasMaestras_Guardar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<TablaMaestraGuardarResponse>(command);
    }

    public async Task<TablaMaestraOperacionResponse> EliminarAsync(
        long tablaMaestraId,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@TablaMaestraId", tablaMaestraId, DbType.Int64);
        parameters.Add("@UsuarioId", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            "ref.usp_TablasMaestras_Eliminar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<TablaMaestraOperacionResponse>(command);
    }
}