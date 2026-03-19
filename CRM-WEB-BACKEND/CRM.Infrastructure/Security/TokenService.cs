using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CRM.Infrastructure.Security;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(Usuario usuario)
    {
        var jwtSection = _configuration.GetSection("Jwt");

        var key = jwtSection["Key"];
        var issuer = jwtSection["Issuer"];
        var audience = jwtSection["Audience"];
        var expirationMinutes = int.TryParse(jwtSection["ExpirationMinutes"], out var minutes)
            ? minutes
            : 60;

        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Jwt:Key no está configurado.");

        var claims = new List<Claim>
        {
            new("UsuarioId", usuario.UsuarioId.ToString()),
            new("Username", usuario.Username),
            new("Activo", usuario.Activo.ToString()),
            new("RequiereCambioPassword", usuario.RequiereCambioPassword.ToString())
        };

        if (usuario.EmpleadoId.HasValue)
            claims.Add(new Claim("EmpleadoId", usuario.EmpleadoId.Value.ToString()));

        if (!string.IsNullOrWhiteSpace(usuario.NombreCompleto))
            claims.Add(new Claim("NombreCompleto", usuario.NombreCompleto));

        if (!string.IsNullOrWhiteSpace(usuario.EmailCoorporativo))
            claims.Add(new Claim("EmailCoorporativo", usuario.EmailCoorporativo));

        if (usuario.UltimoLogin.HasValue)
            claims.Add(new Claim("UltimoLogin", usuario.UltimoLogin.Value.ToString("O")));

        claims.Add(new Claim("IntentosFallidos", usuario.IntentosFallidos.ToString()));

        if (usuario.BloqueadoHasta.HasValue)
            claims.Add(new Claim("BloqueadoHasta", usuario.BloqueadoHasta.Value.ToString("O")));

        if (usuario.AreaId.HasValue)
            claims.Add(new Claim("AreaId", usuario.AreaId.Value.ToString()));

        if (!string.IsNullOrWhiteSpace(usuario.AreaCodigo))
            claims.Add(new Claim("AreaCodigo", usuario.AreaCodigo));

        if (!string.IsNullOrWhiteSpace(usuario.AreaNombre))
            claims.Add(new Claim("AreaNombre", usuario.AreaNombre));

        if (usuario.CargoId.HasValue)
            claims.Add(new Claim("CargoId", usuario.CargoId.Value.ToString()));

        if (!string.IsNullOrWhiteSpace(usuario.CargoCodigo))
            claims.Add(new Claim("CargoCodigo", usuario.CargoCodigo));

        if (!string.IsNullOrWhiteSpace(usuario.CargoNombre))
            claims.Add(new Claim("CargoNombre", usuario.CargoNombre));

        foreach (var rol in usuario.Roles)
        {
            if (!string.IsNullOrWhiteSpace(rol.Nombre))
                claims.Add(new Claim(ClaimTypes.Role, rol.Nombre));
        }

        foreach (var permiso in usuario.Permisos)
        {
            if (!string.IsNullOrWhiteSpace(permiso.Codigo))
                claims.Add(new Claim("Permiso", permiso.Codigo));
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }
}