using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Rol : AuditableEntity
{
    public long RolId { get; set; }

    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public List<Permiso> Permisos { get; set; } = new();
}