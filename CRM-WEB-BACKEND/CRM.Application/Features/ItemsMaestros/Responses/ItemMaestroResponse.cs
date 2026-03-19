namespace CRM.Application.Features.ItemsMaestros.Responses;

public class ItemMaestroResponse
{
    public long ItemMaestroId { get; set; }
    public long TablaMaestraId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int? Orden { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
    public byte[]? RowVer { get; set; }
}