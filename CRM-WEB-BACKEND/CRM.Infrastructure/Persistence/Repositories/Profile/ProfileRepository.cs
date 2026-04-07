using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Profile.Interfaces;
using CRM.Application.Features.Profile.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.Profile;

public class ProfileRepository : IProfileRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ProfileRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<MiPerfilResponse?> ObtenerMiPerfilAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuario_ObtenerMiPerfil",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var resumenDb = await multi.ReadFirstOrDefaultAsync<MiPerfilResumenResponse>();
        if (resumenDb is null)
        {
            return null;
        }

        var roles = (await multi.ReadAsync<MiPerfilRolResponse>()).ToList();
        var permisosDb = (await multi.ReadAsync<MiPerfilPermisoDbModel>()).ToList();

        return new MiPerfilResponse
        {
            Resumen = resumenDb,
            Roles = roles,
            Permisos = permisosDb.Select((permiso) => new MiPerfilPermisoResponse
            {
                ModuloId = permiso.ModuloId,
                ModuloCodigo = permiso.ModuloCodigo,
                ModuloNombre = permiso.ModuloNombre,
                PermisoId = permiso.PermisoId,
                PermisoCodigo = permiso.PermisoCodigo,
                PermisoNombre = permiso.PermisoNombre,
                Permitido = permiso.Permitido == 1
            }).ToList()
        };
    }

    private sealed class MiPerfilPermisoDbModel
    {
        public long ModuloId { get; set; }
        public string? ModuloCodigo { get; set; }
        public string? ModuloNombre { get; set; }
        public long PermisoId { get; set; }
        public string? PermisoCodigo { get; set; }
        public string? PermisoNombre { get; set; }
        public int Permitido { get; set; }
    }
}
