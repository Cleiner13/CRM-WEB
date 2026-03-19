namespace CRM.Application.Features.Empleados.Requests;

public class ValidarTipoProductoCampaniasRequest
{
    public long TipoProductoId { get; set; }
    public List<long> Campanias { get; set; } = new();
}