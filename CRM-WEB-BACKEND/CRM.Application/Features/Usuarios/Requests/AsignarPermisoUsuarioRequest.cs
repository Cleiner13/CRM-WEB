namespace CRM.Application.Features.Usuarios.Requests;

public class AsignarPermisoUsuarioRequest
{
    public long PermisoId { get; set; }
    public bool EsDenegado { get; set; } = false;
    public string? Motivo { get; set; }
}