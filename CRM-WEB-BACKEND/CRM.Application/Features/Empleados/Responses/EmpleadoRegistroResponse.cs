namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoRegistroResponse
{
    public long EmpleadoRegistroId { get; set; }
    public long EmpleadoId { get; set; }
    public long? EstadoId { get; set; }
    public long? SubEstadoId { get; set; }
    public string? Comentario { get; set; }
    public long? AuditorUsuarioId { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }
}