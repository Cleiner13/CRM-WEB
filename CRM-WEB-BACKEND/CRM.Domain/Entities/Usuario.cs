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

    /// <summary>
    /// Indica si el usuario está activo según el SP de login.
    /// </summary>
    public bool Activo { get; set; }

    /// <summary>
    /// Fecha y hora del último acceso registrado.
    /// </summary>
    public DateTime? UltimoLogin { get; set; }

    // Información del área a la que pertenece el usuario
    public long? AreaId { get; set; }
    public string? AreaCodigo { get; set; }
    public string? AreaNombre { get; set; }

    // Información del cargo del usuario
    public long? CargoId { get; set; }
    public string? CargoCodigo { get; set; }
    public string? CargoNombre { get; set; }

    public List<Rol> Roles { get; set; } = new();
    public List<Permiso> Permisos { get; set; } = new();
}