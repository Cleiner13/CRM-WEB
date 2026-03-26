namespace CRM.Application.Features.Auth.Requests
{
    public class PasswordResetConfirmarRequest
    {
        public string CorreoPersonal { get; set; } = string.Empty;
        public string Codigo { get; set; } = string.Empty;
        public string PasswordNueva { get; set; } = string.Empty;
    }
}