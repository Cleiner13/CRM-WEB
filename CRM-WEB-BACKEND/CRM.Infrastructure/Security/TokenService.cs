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
            new Claim("UsuarioId", usuario.UsuarioId.ToString()),
            new Claim("Username", usuario.Username)
        };

        if (usuario.EmpleadoId.HasValue)
        {
            claims.Add(new Claim("EmpleadoId", usuario.EmpleadoId.Value.ToString()));
        }

        foreach (var rol in usuario.Roles)
        {
            if (!string.IsNullOrWhiteSpace(rol.Nombre))
            {
                claims.Add(new Claim(ClaimTypes.Role, rol.Nombre));
            }
        }

        foreach (var permiso in usuario.Permisos)
        {
            if (!string.IsNullOrWhiteSpace(permiso.Codigo))
            {
                claims.Add(new Claim("Permiso", permiso.Codigo));
            }
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