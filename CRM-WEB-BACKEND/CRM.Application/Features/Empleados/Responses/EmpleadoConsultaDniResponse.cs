namespace CRM.Application.Features.Empleados.Responses;

public sealed class EmpleadoConsultaDniResponse
{
    public string NumeroDocumento { get; set; } = string.Empty;
    public string? Cliente { get; set; }
    public string? Nombres { get; set; }
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? NombreCompleto { get; set; }
}