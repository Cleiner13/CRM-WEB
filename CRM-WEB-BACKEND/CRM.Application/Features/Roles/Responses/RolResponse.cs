namespace CRM.Application.Features.Roles.Responses;

public class RolResponse
{
    public long RolId { get; set; }
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