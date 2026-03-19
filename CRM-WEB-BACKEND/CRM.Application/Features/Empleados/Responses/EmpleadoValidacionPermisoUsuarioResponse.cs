namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoValidacionPermisoUsuarioResponse
{
    public long UsuarioPermisoId { get; set; }
    public long UsuarioId { get; set; }
    public long PermisoId { get; set; }
    public string? PermisoCodigo { get; set; }
    public string? PermisoNombre { get; set; }
    public bool EsDenegado { get; set; }
    public bool Activo { get; set; }
}