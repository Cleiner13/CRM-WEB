using System.Data;
using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using CRM.Application.Common.Interfaces;
using CRM.Application.Features.Auth.Dtos;
using CRM.Application.Features.Auth.Interfaces;
using CRM.Domain.Entities;
using Dapper;
using Microsoft.AspNetCore.Http;

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

        try
        {
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
                UltimoLogin = usuarioDb.UltimoLogin,
                IntentosFallidos = usuarioDb.IntentosFallidos,
                BloqueadoHasta = usuarioDb.BloqueoHasta,
                AreaId = usuarioDb.AreaId,
                AreaCodigo = usuarioDb.AreaCodigo,
                AreaNombre = usuarioDb.AreaNombre,
                CargoId = usuarioDb.CargoId,
                CargoCodigo = usuarioDb.CargoCodigo,
                CargoNombre = usuarioDb.CargoNombre,
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
        catch (SqlException ex) when (ex.Message.Contains("Credenciales inválidas", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }
        catch (SqlException ex) when (ex.Message.Contains("bloqueado", StringComparison.OrdinalIgnoreCase) || ex.Message.Contains("Usuario bloqueado", StringComparison.OrdinalIgnoreCase))
        {
            throw BuildBlockedException(await ObtenerUsuarioPorUsernameAsync(username, cancellationToken));
        }
        catch (SqlException ex) when (ex.Message.Contains("inactivo", StringComparison.OrdinalIgnoreCase) || ex.Message.Contains("desactivado", StringComparison.OrdinalIgnoreCase))
        {
            var usuario = await ObtenerUsuarioPorUsernameAsync(username, cancellationToken);
            if (usuario?.Activo == true && usuario.BloqueadoHasta.HasValue && usuario.BloqueadoHasta.Value > DateTime.UtcNow)
            {
                throw BuildBlockedException(usuario);
            }

            throw new CRM.Application.Common.Models.AppException(StatusCodes.Status403Forbidden, "Usuario inactivo. Contacte a sistemas.");
        }
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

    public async Task<RefreshTokenValidationResult?> ValidarRefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var tokenHash = ComputeSha256(refreshToken);

        var parameters = new DynamicParameters();
        parameters.Add("@TokenHash", tokenHash, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_RefreshTokens_Validar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstOrDefaultAsync<RefreshTokenValidationResult>(command);
    }

    public async Task RotarRefreshTokenAsync(
        string refreshTokenActual,
        string nuevoRefreshToken,
        DateTime nuevaExpiraEn,
        string? dispositivo,
        string? ipAddress,
        long? usuarioIdAccion,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var tokenHashActual = ComputeSha256(refreshTokenActual);
        var nuevoTokenHash = ComputeSha256(nuevoRefreshToken);

        var parameters = new DynamicParameters();
        parameters.Add("@TokenHashActual", tokenHashActual, DbType.String);
        parameters.Add("@NuevoTokenHash", nuevoTokenHash, DbType.String);
        parameters.Add("@NuevaExpiraEn", nuevaExpiraEn, DbType.DateTime2);
        parameters.Add("@Dispositivo", dispositivo, DbType.String);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_RefreshTokens_Rotar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        await connection.ExecuteAsync(command);
    }

    public async Task RevocarRefreshTokenAsync(
        string refreshToken,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var tokenHash = ComputeSha256(refreshToken);

        var parameters = new DynamicParameters();
        parameters.Add("@TokenHash", tokenHash, DbType.String);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_RefreshTokens_Revocar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        await connection.ExecuteAsync(command);
    }

    public async Task RevocarRefreshTokensPorUsuarioAsync(
        long usuarioId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_RefreshTokens_RevocarPorUsuario",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        await connection.ExecuteAsync(command);
    }

    public async Task<Usuario?> ObtenerUsuarioPorIdAsync(
        long usuarioId,
        CancellationToken cancellationToken = default)
    {
        return await ObtenerUsuarioAsync(usuarioId, null, cancellationToken);
    }

    public async Task<Usuario?> ObtenerUsuarioPorUsernameAsync(
        string username,
        CancellationToken cancellationToken = default)
    {
        return await ObtenerUsuarioAsync(null, username, cancellationToken);
    }

    private async Task<Usuario?> ObtenerUsuarioAsync(
        long? usuarioId,
        string? username,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@EmpleadoId", null, DbType.Int64);
        parameters.Add("@Usuario", username, DbType.String);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuarios_Obtener",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var header = await multi.ReadFirstOrDefaultAsync<UsuarioObtenerHeaderDbModel>();
        if (header is null || !header.Encontrado)
        {
            return null;
        }

        var usuarioDb = await multi.ReadFirstOrDefaultAsync<UsuarioObtenerDbModel>();
        var empleadoDb = await multi.ReadFirstOrDefaultAsync<EmpleadoPerfilDbModel>();
        var rolesDb = (await multi.ReadAsync<UsuarioRolDbModel>()).ToList();
        _ = (await multi.ReadAsync<UsuarioPermisoIndividualDbModel>()).ToList();
        var permisosEfectivosDb = (await multi.ReadAsync<PermisoEfectivoDbModel>()).ToList();

        return new Usuario
        {
            UsuarioId = usuarioDb?.UsuarioId ?? header.UsuarioId,
            EmpleadoId = usuarioDb?.EmpleadoId ?? empleadoDb?.EmpleadoId,
            Username = usuarioDb?.Usuario ?? string.Empty,
            RequiereCambioPassword = usuarioDb?.DebeCambiarPassword ?? false,
            Activo = usuarioDb?.Activo ?? false,
            UltimoLogin = usuarioDb?.UltimoLogin,
            IntentosFallidos = usuarioDb?.IntentosFallidos ?? 0,
            BloqueadoHasta = usuarioDb?.BloqueoHasta,
            NombreCompleto = empleadoDb?.NombreCompleto,
            EmailCoorporativo = empleadoDb?.EmailCoorporativo,
            AreaId = empleadoDb?.AreaId,
            AreaCodigo = empleadoDb?.AreaCodigo,
            AreaNombre = empleadoDb?.AreaNombre,
            CargoId = empleadoDb?.CargoId,
            CargoCodigo = empleadoDb?.CargoCodigo,
            CargoNombre = empleadoDb?.CargoNombre,
            Roles = rolesDb
                .Select(x => new Rol
                {
                    RolId = x.RolId,
                    Codigo = x.RolCodigo ?? string.Empty,
                    Nombre = x.RolNombre ?? string.Empty
                })
                .ToList(),
            Permisos = permisosEfectivosDb
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

    public async Task CambiarPasswordAsync(
        long usuarioId,
        string? passwordActual,
        string passwordNueva,
        long? usuarioAccionId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@UsuarioId", usuarioId, DbType.Int64);
        parameters.Add("@PasswordActual", passwordActual, DbType.String);
        parameters.Add("@PasswordNueva", passwordNueva, DbType.String);
        parameters.Add("@UsuarioAccionId", usuarioAccionId, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "seg.usp_Usuario_CambiarPassword",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        try
        {
            await connection.ExecuteAsync(command);
        }
        catch (SqlException ex) when (
            ex.Message.Contains("password actual", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("contraseña actual", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("contrasena actual", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("actual no coincide", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("actual es incorrect", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("actual incorrect", StringComparison.OrdinalIgnoreCase))
        {
            throw new CRM.Application.Common.Models.AppException(
                StatusCodes.Status400BadRequest,
                "La contrasena actual no es correcta.");
        }
        catch (SqlException ex) when (
            ex.Message.Contains("seguridad", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("mayúscula", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("mayuscula", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("minúscula", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("minuscula", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("símbolo", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("simbolo", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("número", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("numero", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("caracteres", StringComparison.OrdinalIgnoreCase) ||
            ex.Message.Contains("longitud", StringComparison.OrdinalIgnoreCase))
        {
            throw new CRM.Application.Common.Models.AppException(
                StatusCodes.Status400BadRequest,
                "La nueva contrasena no cumple la politica minima de seguridad.");
        }
    }

    private static string ComputeSha256(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }

    private static CRM.Application.Common.Models.AppException BuildBlockedException(Usuario? usuario)
    {
        var details = usuario?.BloqueadoHasta is DateTime bloqueadoHasta
            ? new { bloqueadoHasta }
            : null;

        return new CRM.Application.Common.Models.AppException(
            StatusCodes.Status403Forbidden,
            "Usuario bloqueado temporalmente. Intente más tarde.",
            details);
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

    private sealed class UsuarioObtenerHeaderDbModel
    {
        public bool Encontrado { get; set; }
        public long UsuarioId { get; set; }
    }

    private sealed class UsuarioObtenerDbModel
    {
        public long UsuarioId { get; set; }
        public long? EmpleadoId { get; set; }
        public string? Usuario { get; set; }
        public bool Activo { get; set; }
        public bool DebeCambiarPassword { get; set; }
        public int IntentosFallidos { get; set; }
        public DateTime? BloqueoHasta { get; set; }
        public DateTime? UltimoLogin { get; set; }
    }

    private sealed class EmpleadoPerfilDbModel
    {
        public long EmpleadoId { get; set; }
        public string? NombreCompleto { get; set; }
        public string? EmailCoorporativo { get; set; }
        public long? AreaId { get; set; }
        public string? AreaCodigo { get; set; }
        public string? AreaNombre { get; set; }
        public long? CargoId { get; set; }
        public string? CargoCodigo { get; set; }
        public string? CargoNombre { get; set; }
    }

    private sealed class UsuarioRolDbModel
    {
        public long RolId { get; set; }
        public string? RolCodigo { get; set; }
        public string? RolNombre { get; set; }
    }

    private sealed class UsuarioPermisoIndividualDbModel
    {
        public long PermisoId { get; set; }
    }

    private sealed class PermisoEfectivoDbModel
    {
        public long PermisoId { get; set; }
        public long ModuloId { get; set; }
        public string? ModuloCodigo { get; set; }
        public string? ModuloNombre { get; set; }
        public string? PermisoCodigo { get; set; }
        public string? PermisoNombre { get; set; }
    }
}
