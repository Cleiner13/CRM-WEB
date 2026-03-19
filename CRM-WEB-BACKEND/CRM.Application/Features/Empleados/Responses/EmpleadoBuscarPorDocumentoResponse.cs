namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoBuscarPorDocumentoResponse
{
    public bool Encontrado { get; set; }

    public long EmpleadoId { get; set; }
    public long? TipoDocumentoId { get; set; }
    public string? NumeroDocumento { get; set; }

    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? PrimerNombre { get; set; }
    public string? SegundoNombre { get; set; }

    public string? Celular { get; set; }
    public string? CorreoPersonal { get; set; }
    public bool Activo { get; set; }

    public long? EstadoId { get; set; }
    public long? SubEstadoId { get; set; }

    public long? AreaId { get; set; }
    public string? AreaCodigo { get; set; }
    public string? AreaNombre { get; set; }

    public long? CargoId { get; set; }
    public string? CargoCodigo { get; set; }
    public string? CargoNombre { get; set; }

    public long? TipoProductoId { get; set; }
    public string? TipoProductoCodigo { get; set; }
    public string? TipoProductoNombre { get; set; }

    public long? JefeEmpleadoId { get; set; }
    public string? JefePrimerNombre { get; set; }
    public string? JefeApellidoPaterno { get; set; }
    public string? JefeApellidoMaterno { get; set; }

    public long? UsuarioId { get; set; }
    public string? UsuarioLogin { get; set; }
    public bool? UsuarioActivo { get; set; }

    public int? CantidadCampanias { get; set; }
    public string? CampaniasNombres { get; set; }

    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }

    public List<EmpleadoCampaniaResponse> Campanias { get; set; } = new();
}