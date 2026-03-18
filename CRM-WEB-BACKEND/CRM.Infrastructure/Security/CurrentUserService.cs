using System.Security.Claims;
using CRM.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CRM.Infrastructure.Security;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public long? UsuarioId
    {
        get
        {
            var value = User?.FindFirst("UsuarioId")?.Value;
            return long.TryParse(value, out var id) ? id : null;
        }
    }

    public long? EmpleadoId
    {
        get
        {
            var value = User?.FindFirst("EmpleadoId")?.Value;
            return long.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Username => User?.FindFirst("Username")?.Value;

    public List<string> Roles =>
        User?.FindAll(ClaimTypes.Role).Select(x => x.Value).ToList() ?? new List<string>();

    public List<string> Permisos =>
        User?.FindAll("Permiso").Select(x => x.Value).ToList() ?? new List<string>();

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated ?? false;
}