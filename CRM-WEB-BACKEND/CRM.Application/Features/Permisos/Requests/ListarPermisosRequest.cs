namespace CRM.Application.Features.Permisos.Requests;

public class ListarPermisosRequest
{
    public long? ModuloId { get; set; }
    public string? Buscar { get; set; }
    public bool SoloActivos { get; set; } = true;
}