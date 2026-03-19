using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Auditoria.Interfaces;
using CRM.Application.Features.Auditoria.Requests;
using CRM.Application.Features.Auditoria.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.Auditoria;

public class AuditoriaRepository : IAuditoriaRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuditoriaRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResponse<AuditoriaListItemResponse>> ListarAsync(
        ListarAuditoriaRequest request,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@FechaInicio", request.FechaInicio, DbType.DateTime2);
        parameters.Add("@FechaFin", request.FechaFin, DbType.DateTime2);
        parameters.Add("@UsuarioId", request.UsuarioId, DbType.Int64);
        parameters.Add("@Accion", request.Accion, DbType.String);
        parameters.Add("@Entidad", request.Entidad, DbType.String);
        parameters.Add("@ClaveEntidad", request.ClaveEntidad, DbType.String);
        parameters.Add("@Pagina", request.Pagina, DbType.Int32);
        parameters.Add("@TamPagina", request.TamPagina, DbType.Int32);

        var command = new CommandDefinition(
            "aud.usp_LogAuditoria_Listar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var items = (await connection.QueryAsync<AuditoriaListItemResponse>(command)).ToList();

        var total = items.FirstOrDefault()?.TotalFilas ?? 0;

        return new PagedResponse<AuditoriaListItemResponse>
        {
            Items = items,
            PageNumber = request.Pagina,
            PageSize = request.TamPagina,
            TotalRecords = total,
            TotalPages = request.TamPagina <= 0 ? 1 : (int)Math.Ceiling(total / (double)request.TamPagina)
        };
    }

    public async Task<AuditoriaDetalleResponse?> ObtenerAsync(
        long logAuditoriaId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@LogAuditoriaId", logAuditoriaId, DbType.Int64);

        var command = new CommandDefinition(
            "aud.usp_LogAuditoria_Obtener",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstOrDefaultAsync<AuditoriaDetalleResponse>(command);
    }

    public async Task<AuditoriaRegistrarResponse> RegistrarAsync(
        RegistrarAuditoriaRequest request,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", request.UsuarioId, DbType.Int64);
        parameters.Add("@Accion", request.Accion, DbType.String);
        parameters.Add("@Entidad", request.Entidad, DbType.String);
        parameters.Add("@ClaveEntidad", request.ClaveEntidad, DbType.String);
        parameters.Add("@AntesJson", request.AntesJson, DbType.String);
        parameters.Add("@DespuesJson", request.DespuesJson, DbType.String);
        parameters.Add("@IpAddress", request.IpAddress, DbType.String);
        parameters.Add("@UserAgent", request.UserAgent, DbType.String);
        parameters.Add("@DatosExtra", request.DatosExtra, DbType.String);

        var command = new CommandDefinition(
            "aud.usp_LogAuditoria_Registrar",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<AuditoriaRegistrarResponse>(command);
    }

    public async Task<AuditoriaLimpiarResponse> LimpiarAntiguosAsync(
        int diasRetencion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@DiasRetencion", diasRetencion, DbType.Int32);

        var command = new CommandDefinition(
            "aud.usp_LogAuditoria_LimpiarAntiguos",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<AuditoriaLimpiarResponse>(command);
    }
}