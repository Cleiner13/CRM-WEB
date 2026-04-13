namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoReniecDniResponse
{
    public string Dni { get; set; } = string.Empty;
    public string? Nombres { get; set; }
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? NombreCompleto { get; set; }
    public bool Encontrado { get; set; }
}
