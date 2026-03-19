namespace CRM.Application.Features.Modulos.Requests;

public class ListarModulosRequest
{
    public string? Buscar { get; set; }
    public bool SoloActivos { get; set; } = true;
}