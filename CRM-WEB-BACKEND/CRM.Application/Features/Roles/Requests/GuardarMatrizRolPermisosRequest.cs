namespace CRM.Application.Features.Roles.Requests;

public class GuardarMatrizRolPermisosRequest
{
    public List<GuardarMatrizRolPermisoItemRequest> Permisos { get; set; } = new();
}

public class GuardarMatrizRolPermisoItemRequest
{
    public long ModuloId { get; set; }
    public long PermisoId { get; set; }
    public bool Asignado { get; set; }
}
