namespace CRM.Application.Features.Roles.Responses;

public class RolPermisoAsignadoResponse
{
    public long RolPermisoId { get; set; }
    public long RolId { get; set; }
    public long PermisoId { get; set; }
    public bool Activo { get; set; }
}