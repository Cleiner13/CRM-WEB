namespace CRM.Application.Features.Roles.Requests;

public class ListarRolesRequest
{
    public string? Buscar { get; set; }
    public bool SoloActivos { get; set; } = true;
}