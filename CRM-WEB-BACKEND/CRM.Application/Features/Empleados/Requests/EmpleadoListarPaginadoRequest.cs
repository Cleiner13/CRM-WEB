namespace CRM.Application.Features.Empleados.Requests;

public class EmpleadoListarPaginadoRequest
{
    public int Pagina { get; set; } = 1;
    public int Tamanio { get; set; } = 20;
    public string? Texto { get; set; }
    public bool SoloActivos { get; set; } = true;

    public long? EstadoId { get; set; }
    public long? SubEstadoId { get; set; }

    public long? AreaId { get; set; }
    public long? CargoId { get; set; }
    public long? TipoProductoId { get; set; }

    public long? CampaniaId { get; set; }
}