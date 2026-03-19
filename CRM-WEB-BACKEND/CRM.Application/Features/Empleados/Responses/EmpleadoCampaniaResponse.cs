namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoCampaniaResponse
{
    public long EmpleadoCampaniaId { get; set; }
    public long EmpleadoId { get; set; }
    public long CampaniaItemMaestroId { get; set; }
    public string? CampaniaCodigo { get; set; }
    public string? CampaniaNombre { get; set; }
    public bool Activo { get; set; }
}