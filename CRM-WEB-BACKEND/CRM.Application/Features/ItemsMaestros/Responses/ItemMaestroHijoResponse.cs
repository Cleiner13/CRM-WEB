namespace CRM.Application.Features.ItemsMaestros.Responses;

public class ItemMaestroHijoResponse
{
    public long ItemMaestroId { get; set; }
    public long TablaMaestraId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int? Orden { get; set; }
}