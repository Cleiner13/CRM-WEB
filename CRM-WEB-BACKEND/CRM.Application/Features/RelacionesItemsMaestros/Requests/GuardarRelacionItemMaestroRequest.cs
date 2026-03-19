namespace CRM.Application.Features.RelacionesItemsMaestros.Requests;

public class GuardarRelacionItemMaestroRequest
{
    public long? RelacionId { get; set; }
    public long ItemPadreId { get; set; }
    public long ItemHijoId { get; set; }
    public string TipoRelacion { get; set; } = string.Empty;
    public int? Orden { get; set; }
    public string? DatosExtra { get; set; }
}