namespace CRM.Application.Features.Roles.Requests;

public class GuardarRolRequest
{
    public long? RolId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DatosExtra { get; set; }
}