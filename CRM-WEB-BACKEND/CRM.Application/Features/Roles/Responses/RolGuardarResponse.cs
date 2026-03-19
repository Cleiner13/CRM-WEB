namespace CRM.Application.Features.Roles.Responses;

public class RolGuardarResponse
{
    public long RolId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}