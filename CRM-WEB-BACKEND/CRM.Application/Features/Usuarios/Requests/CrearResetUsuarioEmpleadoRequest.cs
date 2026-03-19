namespace CRM.Application.Features.Usuarios.Requests;

public class CrearResetUsuarioEmpleadoRequest
{
    public long EmpleadoId { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
}