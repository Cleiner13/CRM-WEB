using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Empleado : AuditableEntity
{
    public long EmpleadoId { get; set; }

    public long? TipoDocumentoId { get; set; }
    public string? NumeroDocumento { get; set; }

    public string? Nombres { get; set; }
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? NombreCompleto { get; set; }

    public string? Email { get; set; }
    public string? Celular { get; set; }
    public string? Cargo { get; set; }
    public string? Area { get; set; }

    public DateTime? FechaIngreso { get; set; }
    public DateTime? FechaCese { get; set; }

    public Usuario? Usuario { get; set; }
}