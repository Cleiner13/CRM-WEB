namespace CRM.Application.Features.Auth.Requests;

public class LogoutRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}