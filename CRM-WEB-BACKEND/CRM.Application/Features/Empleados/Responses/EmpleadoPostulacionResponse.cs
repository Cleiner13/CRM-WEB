namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoPostulacionResponse
{
    public long EmpleadoPostulacionId { get; set; }
    public long EmpleadoId { get; set; }
    public long? OrigenId { get; set; }
    public string? OrigenNombre { get; set; }
    public string? ReferenciaPost { get; set; }
    public long? AreaId { get; set; }
    public string? AreaNombre { get; set; }
    public long? CargoId { get; set; }
    public string? CargoNombre { get; set; }
    public long? CampaniaId { get; set; }
    public string? CampaniaNombre { get; set; }
    public long? ProductoId { get; set; }
    public string? ProductoNombre { get; set; }
    public DateTime? FechaPostulacion { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }
}