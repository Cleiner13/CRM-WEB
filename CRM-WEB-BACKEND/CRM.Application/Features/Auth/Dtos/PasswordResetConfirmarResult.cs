namespace CRM.Application.Features.Auth.Dtos;
public class PasswordResetConfirmarResult
{
    public bool CambioRealizado { get; set; }
    public string? Mensaje { get; set; }
    public long? UsuarioId { get; set; }
}