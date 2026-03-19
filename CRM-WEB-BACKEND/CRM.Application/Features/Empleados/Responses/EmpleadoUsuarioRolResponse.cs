namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoUsuarioRolResponse
{
    public long UsuarioRolId { get; set; }
    public long UsuarioId { get; set; }
    public long RolId { get; set; }
    public string? RolCodigo { get; set; }
    public string? RolNombre { get; set; }
    public bool Activo { get; set; }
}