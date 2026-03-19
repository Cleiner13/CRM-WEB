namespace CRM.Application.Features.AreasRolesDefault.Responses;

public class AreaRolDefaultResponse
{
    public long AreaRolDefaultId { get; set; }

    public long AreaId { get; set; }
    public string? AreaCodigo { get; set; }
    public string? AreaNombre { get; set; }

    public long RolId { get; set; }
    public string? RolCodigo { get; set; }
    public string? RolNombre { get; set; }

    public bool Activo { get; set; }
    public string? DatosExtra { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
}