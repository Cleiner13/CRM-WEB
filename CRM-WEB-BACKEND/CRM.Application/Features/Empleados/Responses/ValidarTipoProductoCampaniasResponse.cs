namespace CRM.Application.Features.Empleados.Responses;

public class ValidarTipoProductoCampaniasResponse
{
    public bool EsValido { get; set; }
    public string? CodigoTipoProducto { get; set; }
    public int CantidadCampanias { get; set; }
    public string? Mensaje { get; set; }
}