using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Modulo : AuditableEntity
{
    public long ModuloId { get; set; }
    public long? ModuloPadreId { get; set; }

    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public string? Ruta { get; set; }
    public string? Icono { get; set; }
    public int Orden { get; set; }

    public List<Permiso> Permisos { get; set; } = new();
}