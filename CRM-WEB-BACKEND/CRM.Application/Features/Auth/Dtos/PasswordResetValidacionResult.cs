namespace CRM.Application.Features.Auth.Dtos;
public class PasswordResetValidacionResult
{
    public bool EsValido { get; set; }
    public string? Mensaje { get; set; }
    public long? PasswordResetRequestId { get; set; }
    public DateTime? ExpiraEn { get; set; }
}
