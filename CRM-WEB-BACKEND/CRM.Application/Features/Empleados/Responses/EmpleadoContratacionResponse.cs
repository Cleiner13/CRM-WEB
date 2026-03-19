namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoContratacionResponse
{
    public long EmpleadoContratacionId { get; set; }
    public long EmpleadoId { get; set; }
    public long? JefeEmpleadoId { get; set; }
    public string? JefePrimerNombre { get; set; }
    public string? JefeApellidoPaterno { get; set; }
    public string? JefeApellidoMaterno { get; set; }
    public string? CodigoEjecutivo { get; set; }
    public string? CodigoDial { get; set; }
    public string? CodigoPropio { get; set; }
    public long? GeneracionId { get; set; }
    public long? JornadaId { get; set; }
    public string? JornadaNombre { get; set; }
    public long? TurnoId { get; set; }
    public string? TurnoNombre { get; set; }
    public long? TipoContratoId { get; set; }
    public string? TipoContratoNombre { get; set; }
    public long? AreaId { get; set; }
    public string? AreaNombre { get; set; }
    public long? CargoId { get; set; }
    public string? CargoNombre { get; set; }
    public long? TipoProductoId { get; set; }
    public string? TipoProductoNombre { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public long? BancoId { get; set; }
    public string? BancoNombre { get; set; }
    public string? NumeroCuenta { get; set; }
    public DateTime? FechaInicioContrato { get; set; }
    public DateTime? FechaFinContrato { get; set; }
    public long? EmpresaId { get; set; }
    public string? EmpresaNombre { get; set; }
    public decimal? Sueldo { get; set; }
    public DateTime? FechaCambio { get; set; }
    public DateTime? FechaCese { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }
}