namespace CRM.Application.Features.Roles.Responses;

public class RolPermisoMatrizResponse
{
    public long RolId { get; set; }
    public List<RolPermisoMatrizItemResponse> Permisos { get; set; } = new();
}

public class RolPermisoMatrizItemResponse
{
    public long ModuloId { get; set; }
    public string? ModuloCodigo { get; set; }
    public string? ModuloNombre { get; set; }
    public long PermisoId { get; set; }
    public string? PermisoCodigo { get; set; }
    public string? PermisoNombre { get; set; }
    public bool Asignado { get; set; }
}
