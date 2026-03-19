namespace CRM.Application.Features.Auth.Dtos;

public class RefreshTokenValidationResult
{
    public long RefreshTokenId { get; set; }
    public long UsuarioId { get; set; }
    public long? EmpleadoId { get; set; }
    public string? Usuario { get; set; }

    public string? TokenHash { get; set; }
    public DateTime ExpiraEn { get; set; }
    public DateTime? RevocadoEn { get; set; }
    public bool Activo { get; set; }

    public string? Dispositivo { get; set; }
    public string? IpAddress { get; set; }

    public bool UsuarioActivo { get; set; }
    public bool EsValido { get; set; }
    public string? Motivo { get; set; }
}