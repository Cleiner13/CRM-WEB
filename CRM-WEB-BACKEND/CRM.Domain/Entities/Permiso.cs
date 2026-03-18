using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Permiso : AuditableEntity
{
    public long PermisoId { get; set; }
    public long ModuloId { get; set; }

    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Accion { get; set; }

    public Modulo? Modulo { get; set; }
}