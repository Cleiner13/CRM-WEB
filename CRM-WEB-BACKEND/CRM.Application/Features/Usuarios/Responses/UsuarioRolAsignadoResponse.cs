namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioRolAsignadoResponse
{
    public long UsuarioRolId { get; set; }
    public long UsuarioId { get; set; }
    public long RolId { get; set; }
    public bool Activo { get; set; }
}