namespace CRM.Application.Features.AreasRolesDefault.Requests;

public class ListarAreasRolesDefaultRequest
{
    public long? AreaId { get; set; }
    public long? RolId { get; set; }
    public bool SoloActivos { get; set; } = true;
}