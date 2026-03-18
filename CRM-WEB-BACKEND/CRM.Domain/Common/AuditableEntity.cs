namespace CRM.Domain.Common;

public abstract class AuditableEntity : BaseEntity
{
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
}