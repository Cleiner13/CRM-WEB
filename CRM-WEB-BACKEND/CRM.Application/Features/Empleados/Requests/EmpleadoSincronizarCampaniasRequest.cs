namespace CRM.Application.Features.Empleados.Requests;

public class EmpleadoSincronizarCampaniasRequest
{
    public long TipoProductoId { get; set; }
    public List<long> Campanias { get; set; } = new();
}