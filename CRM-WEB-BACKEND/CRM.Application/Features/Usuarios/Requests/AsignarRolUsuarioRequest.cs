namespace CRM.Application.Features.Usuarios.Requests;

public class AsignarRolUsuarioRequest
{
    public long RolId { get; set; }
    public long? UsuarioAsignacionId { get; set; }
    public string? DatosExtra { get; set; }
}