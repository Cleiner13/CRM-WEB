namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoValidacionRefreshTokenResponse
{
    public long RefreshTokenId { get; set; }
    public long UsuarioId { get; set; }
    public string? TokenHash { get; set; }
    public DateTime ExpiraEn { get; set; }
    public DateTime? RevocadoEn { get; set; }
    public bool Activo { get; set; }
    public string? Dispositivo { get; set; }
    public string? IpAddress { get; set; }
}