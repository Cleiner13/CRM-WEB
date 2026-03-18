namespace CRM.Application.Common.Interfaces;

public interface ICurrentUserService
{
    long? UsuarioId { get; }
    long? EmpleadoId { get; }
    string? Username { get; }
    List<string> Roles { get; }
    List<string> Permisos { get; }
    bool IsAuthenticated { get; }
}