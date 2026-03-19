namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoValidacionUsuarioRelacionadoResponse
{
    public long UsuarioId { get; set; }
    public long? EmpleadoId { get; set; }
    public string? Usuario { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}