namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioDesactivarEmpleadoResponse
{
    public bool UsuarioEncontrado { get; set; }
    public bool? Desactivado { get; set; }
    public long? UsuarioId { get; set; }
    public long EmpleadoId { get; set; }
}