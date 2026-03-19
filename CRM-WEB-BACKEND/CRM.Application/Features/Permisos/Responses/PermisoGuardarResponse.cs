namespace CRM.Application.Features.Permisos.Responses;

public class PermisoGuardarResponse
{
    public long PermisoId { get; set; }
    public long ModuloId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}