namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioResetEmpleadoResponse
{
    public long UsuarioId { get; set; }
    public long EmpleadoId { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public bool DebeCambiarPassword { get; set; }
}