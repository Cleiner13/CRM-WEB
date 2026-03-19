namespace CRM.Application.Features.TablasMaestras.Requests;

public class ListarTablasMaestrasRequest
{
    public string? Buscar { get; set; }
    public bool SoloActivos { get; set; } = true;
}