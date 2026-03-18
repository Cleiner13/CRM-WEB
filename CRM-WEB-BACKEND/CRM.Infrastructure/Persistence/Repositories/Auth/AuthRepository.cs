using System.Data;
using System.Security.Cryptography;
using System.Text;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Auth.Interfaces;
using CRM.Domain.Entities;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.Auth;

public class AuthRepository : IAuthRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuthRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Usuario?> ValidarLoginAsync(
        string username,
        string password,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Usuario", username, DbType.String);
        parameters.Add("@Password", password, DbType.String);
        parameters.Add("@IpAddress", null, DbType.String);
        parameters.Add("@UserAgent", null, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Login_Validar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var usuarioDb = await multi.ReadFirstOrDefaultAsync<UsuarioLoginDbModel>();

        if (usuarioDb is null)
        {
            return null;
        }

        var rolesDb = (await multi.ReadAsync<RolLoginDbModel>()).ToList();
        var permisosDb = (await multi.ReadAsync<PermisoLoginDbModel>()).ToList();

        return new Usuario
        {
            UsuarioId = usuarioDb.UsuarioId,
            EmpleadoId = usuarioDb.EmpleadoId,
            Username = usuarioDb.Usuario ?? string.Empty,
            NombreCompleto = usuarioDb.NombreCompleto,
            RequiereCambioPassword = usuarioDb.DebeCambiarPassword,
            Activo = usuarioDb.Activo,
            EmailCoorporativo = usuarioDb.EmailCoorporativo,
            Roles = rolesDb
                .Select(x => new Rol
                {
                    RolId = x.RolId,
                    Codigo = x.Codigo ?? string.Empty,
                    Nombre = x.Nombre ?? string.Empty
                })
                .ToList(),
            Permisos = permisosDb
                .Select(x => new Permiso
                {
                    PermisoId = x.PermisoId,
                    ModuloId = x.ModuloId,
                    Codigo = x.PermisoCodigo ?? string.Empty,
                    Nombre = x.PermisoNombre ?? string.Empty
                })
                .ToList()
        };
    }

    public async Task RegistrarRefreshTokenAsync(
        long usuarioId,
        string refreshToken,
        DateTime expiraEn,
        string? dispositivo,
        string? ipAddress,
        long? usuarioIdAccion,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var tokenHash = ComputeSha256(refreshToken);

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@TokenHash", tokenHash, DbType.String);
        parameters.Add("@ExpiraEn", expiraEn, DbType.DateTime2);
        parameters.Add("@Dispositivo", dispositivo, DbType.String);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_RefreshTokens_Crear",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        await connection.ExecuteAsync(command);
    }

    private static string ComputeSha256(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }

    private sealed class UsuarioLoginDbModel
    {
        public long UsuarioId { get; set; }
        public long? EmpleadoId { get; set; }
        public string? Usuario { get; set; }
        public bool Activo { get; set; }
        public bool DebeCambiarPassword { get; set; }
        public DateTime? UltimoLogin { get; set; }
        public int IntentosFallidos { get; set; }
        public DateTime? BloqueoHasta { get; set; }
        public string? NombreCompleto { get; set; }
        public long? AreaId { get; set; }
        public string? AreaCodigo { get; set; }
        public string? AreaNombre { get; set; }
        public long? CargoId { get; set; }
        public string? CargoCodigo { get; set; }
        public string? CargoNombre { get; set; }
        public string? EmailCoorporativo { get; set; }
    }

    private sealed class RolLoginDbModel
    {
        public long RolId { get; set; }
        public string? Codigo { get; set; }
        public string? Nombre { get; set; }
    }

    private sealed class PermisoLoginDbModel
    {
        public long ModuloId { get; set; }
        public string? ModuloCodigo { get; set; }
        public string? ModuloNombre { get; set; }
        public long PermisoId { get; set; }
        public string? PermisoCodigo { get; set; }
        public string? PermisoNombre { get; set; }
    }
}