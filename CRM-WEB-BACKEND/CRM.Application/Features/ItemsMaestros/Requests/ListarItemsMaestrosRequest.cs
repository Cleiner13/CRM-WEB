namespace CRM.Application.Features.ItemsMaestros.Requests;

public class ListarItemsMaestrosRequest
{
    public long? TablaMaestraId { get; set; }
    public string? Buscar { get; set; }
    public bool SoloActivos { get; set; } = true;
}