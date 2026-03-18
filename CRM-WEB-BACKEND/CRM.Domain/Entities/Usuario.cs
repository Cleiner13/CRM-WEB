using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Usuario : AuditableEntity
{
    public long UsuarioId { get; set; }
    public long? EmpleadoId { get; set; }

    public string Username { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }

    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
    public string? NombreCompleto { get; set; }
    public string? EmailCoorporativo { get; set; }

    public bool RequiereCambioPassword { get; set; }
    public bool Bloqueado { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime? BloqueadoHasta { get; set; }
    public DateTime? FechaUltimoLogin { get; set; }

    public List<Rol> Roles { get; set; } = new();
    public List<Permiso> Permisos { get; set; } = new();
}