namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoGuardarUsuarioResponse
{
    public long EmpleadoId { get; set; }
    public long? UsuarioId { get; set; }
    public string? EstadoCodigo { get; set; }
    public string? SubEstadoCodigo { get; set; }
    public long? AreaId { get; set; }
    public long? CargoId { get; set; }
    public long? TipoProductoId { get; set; }
    public int CantidadCampanias { get; set; }
}