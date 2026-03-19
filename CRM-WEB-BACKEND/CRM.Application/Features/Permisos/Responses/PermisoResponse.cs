namespace CRM.Application.Features.Permisos.Responses;

public class PermisoResponse
{
    public long PermisoId { get; set; }
    public long ModuloId { get; set; }

    public string? ModuloCodigo { get; set; }
    public string? ModuloNombre { get; set; }

    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DatosExtra { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
    public byte[]? RowVer { get; set; }
}