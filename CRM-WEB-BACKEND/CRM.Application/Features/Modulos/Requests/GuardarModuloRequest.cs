namespace CRM.Application.Features.Modulos.Requests;

public class GuardarModuloRequest
{
    public long? ModuloId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DatosExtra { get; set; }
}