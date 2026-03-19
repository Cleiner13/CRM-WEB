namespace CRM.Application.Features.TablasMaestras.Requests;

public class GuardarTablaMaestraRequest
{
    public long? TablaMaestraId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DatosExtra { get; set; }
}