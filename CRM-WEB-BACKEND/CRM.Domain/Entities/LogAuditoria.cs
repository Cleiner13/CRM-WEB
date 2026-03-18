using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class LogAuditoria : BaseEntity
{
    public long LogAuditoriaId { get; set; }
    public long? UsuarioId { get; set; }

    public string Modulo { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public string? RegistroId { get; set; }

    public string? ValoresAnteriores { get; set; }
    public string? ValoresNuevos { get; set; }

    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    public DateTime Fecha { get; set; }
}