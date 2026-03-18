using CRM.Application.Features.Auth.Requests;
using CRM.Application.Features.Auth.Responses;

namespace CRM.Application.Features.Auth.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        string? ipAddress,
        string? userAgent,
        string? dispositivo,
        CancellationToken cancellationToken = default);
}