namespace CRM.Application.Features.Auth.Requests;

public class ChangePasswordRequest
{
    public string? PasswordActual { get; set; }
    public string PasswordNueva { get; set; } = string.Empty;
}