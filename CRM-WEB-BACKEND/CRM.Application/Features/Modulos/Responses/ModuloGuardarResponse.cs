namespace CRM.Application.Features.Modulos.Responses;

public class ModuloGuardarResponse
{
    public long ModuloId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}