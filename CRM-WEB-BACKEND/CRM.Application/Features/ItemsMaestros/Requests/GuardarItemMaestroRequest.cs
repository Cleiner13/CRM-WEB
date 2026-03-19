namespace CRM.Application.Features.ItemsMaestros.Requests;

public class GuardarItemMaestroRequest
{
    public long? ItemMaestroId { get; set; }
    public long TablaMaestraId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int? Orden { get; set; }
    public string? DatosExtra { get; set; }
}