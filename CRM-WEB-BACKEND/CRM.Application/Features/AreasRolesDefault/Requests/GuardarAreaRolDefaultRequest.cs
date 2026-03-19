namespace CRM.Application.Features.AreasRolesDefault.Requests;

public class GuardarAreaRolDefaultRequest
{
    public long AreaId { get; set; }
    public long RolId { get; set; }
    public string? DatosExtra { get; set; }
}