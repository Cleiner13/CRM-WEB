namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoBasicoResponse
{
    public long EmpleadoId { get; set; }
    public long? TipoDocumentoId { get; set; }
    public string? NumeroDocumento { get; set; }
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? PrimerNombre { get; set; }
    public string? SegundoNombre { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Edad { get; set; }
    public string? Nacionalidad { get; set; }
    public bool? Hijos { get; set; }
    public int? CantidadHijos { get; set; }
    public string? Celular { get; set; }
    public string? CorreoPersonal { get; set; }
    public long? SexoId { get; set; }
    public long? NivelEstudiosId { get; set; }
    public long? EstadoCivilId { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
}