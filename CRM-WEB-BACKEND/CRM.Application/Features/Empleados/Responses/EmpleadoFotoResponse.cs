namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoFotoResponse
{
    public long EmpleadoFotoId { get; set; }
    public long EmpleadoId { get; set; }
    public string? NombreArchivo { get; set; }
    public string? RutaArchivo { get; set; }
    public string? ContentType { get; set; }
    public string? Observacion { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
}