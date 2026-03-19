namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioPermisoResponse
{
    public long UsuarioPermisoId { get; set; }
    public long UsuarioId { get; set; }
    public string Usuario { get; set; } = string.Empty;

    public long PermisoId { get; set; }
    public long ModuloId { get; set; }

    public string? ModuloCodigo { get; set; }
    public string? ModuloNombre { get; set; }

    public string? PermisoCodigo { get; set; }
    public string? PermisoNombre { get; set; }
    public string? PermisoDescripcion { get; set; }

    public bool EsDenegado { get; set; }
    public bool Activo { get; set; }
    public string? Motivo { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
}