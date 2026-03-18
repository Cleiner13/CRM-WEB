using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public long RefreshTokenId { get; set; }
    public long UsuarioId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime FechaExpiracion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public string? CreadoPorIp { get; set; }

    public DateTime? FechaRevocacion { get; set; }
    public string? RevocadoPorIp { get; set; }
    public string? TokenReemplazado { get; set; }
    public string? MotivoRevocacion { get; set; }

    public bool EstaActivo => FechaRevocacion is null && FechaExpiracion > DateTime.UtcNow;
}