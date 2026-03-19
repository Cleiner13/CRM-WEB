namespace CRM.Application.Features.RelacionesItemsMaestros.Responses;

public class RelacionItemMaestroResponse
{
    public long RelacionId { get; set; }
    public long ItemPadreId { get; set; }
    public long ItemHijoId { get; set; }
    public string TipoRelacion { get; set; } = string.Empty;
    public int? Orden { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
    public byte[]? RowVer { get; set; }
}