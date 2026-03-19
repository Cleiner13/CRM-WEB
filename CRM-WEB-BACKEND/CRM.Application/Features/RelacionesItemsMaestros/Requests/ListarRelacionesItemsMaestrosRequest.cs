namespace CRM.Application.Features.RelacionesItemsMaestros.Requests;

public class ListarRelacionesItemsMaestrosRequest
{
    public string? TipoRelacion { get; set; }
    public long? ItemPadreId { get; set; }
    public bool SoloActivos { get; set; } = true;
}