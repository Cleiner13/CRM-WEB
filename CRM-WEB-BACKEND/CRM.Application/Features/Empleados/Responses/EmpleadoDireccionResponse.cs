namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoDireccionResponse
{
    public long EmpleadoDireccionId { get; set; }
    public long EmpleadoId { get; set; }
    public string? Departamento { get; set; }
    public string? Provincia { get; set; }
    public string? Distrito { get; set; }
    public string? Direccion { get; set; }
    public string? ReferenciaDir { get; set; }
    public string? CorreoCorporativo { get; set; }
    public string? CelularEmergencia { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }
}