namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioPermisoAsignadoResponse
{
    public long UsuarioPermisoId { get; set; }
    public long UsuarioId { get; set; }
    public long PermisoId { get; set; }
    public bool EsDenegado { get; set; }
    public bool Activo { get; set; }
}