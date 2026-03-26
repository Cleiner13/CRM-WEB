namespace CRM.Application.Features.Auth.Dtos;
public class PasswordResetSolicitudResult
{
    public bool Procesado { get; set; }
    public bool UsuarioEncontrado { get; set; }
    public long? PasswordResetRequestId { get; set; }
    public DateTime? ExpiraEn { get; set; }
}