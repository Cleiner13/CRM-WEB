namespace CRM.Application.Features.Auth.Requests
{
    public class PasswordResetVerificarRequest
    {
        public string CorreoPersonal { get; set; } = string.Empty;
        public string Codigo { get; set; } = string.Empty;
    }
}