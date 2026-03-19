namespace CRM.Application.Features.Roles.Responses;

public class RolPermisoResponse
{
    public long RolPermisoId { get; set; }
    public long RolId { get; set; }
    public long PermisoId { get; set; }
    public long ModuloId { get; set; }

    public string? ModuloCodigo { get; set; }
    public string? ModuloNombre { get; set; }

    public string? PermisoCodigo { get; set; }
    public string? PermisoNombre { get; set; }
    public string? PermisoDescripcion { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
}