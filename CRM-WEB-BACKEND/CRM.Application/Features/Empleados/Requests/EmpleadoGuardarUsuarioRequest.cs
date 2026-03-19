namespace CRM.Application.Features.Empleados.Requests;

public class EmpleadoGuardarUsuarioRequest
{
    // =========================
    // EMPLEADO
    // =========================
    public long TipoDocumentoId { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;

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

    public string? DatosExtraEmpleado { get; set; }

    // =========================
    // DIRECCIÓN
    // =========================
    public string? Departamento { get; set; }
    public string? Provincia { get; set; }
    public string? Distrito { get; set; }
    public string? Direccion { get; set; }
    public string? ReferenciaDir { get; set; }
    public string? CorreoCorporativo { get; set; }
    public string? CelularEmergencia { get; set; }
    public string? DatosExtraDireccion { get; set; }

    // =========================
    // POSTULACIÓN
    // =========================
    public long? OrigenId { get; set; }
    public string? ReferenciaPost { get; set; }
    public long? AreaPostId { get; set; }
    public long? CargoPostId { get; set; }
    public long? CampaniaPostId { get; set; }
    public long? ProductoPostId { get; set; }
    public DateTime? FechaPostulacion { get; set; }
    public string? DatosExtraPost { get; set; }

    // =========================
    // CONTRATACIÓN
    // =========================
    public long? JefeEmpleadoId { get; set; }
    public string? CodigoEjecutivo { get; set; }
    public string? CodigoDial { get; set; }
    public string? CodigoPropio { get; set; }
    public long? GeneracionId { get; set; }
    public long? JornadaId { get; set; }
    public long? TurnoId { get; set; }
    public long? TipoContratoId { get; set; }
    public long? AreaId { get; set; }
    public long? CargoId { get; set; }
    public long? TipoProductoId { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public long? BancoId { get; set; }
    public string? NumeroCuenta { get; set; }
    public DateTime? FechaInicioContrato { get; set; }
    public DateTime? FechaFinContrato { get; set; }
    public long? EmpresaId { get; set; }
    public decimal? Sueldo { get; set; }
    public DateTime? FechaCambio { get; set; }
    public DateTime? FechaCese { get; set; }
    public string? DatosExtraCont { get; set; }

    // =========================
    // REGISTRO
    // =========================
    public long? EstadoId { get; set; }
    public long? SubEstadoId { get; set; }
    public string? Comentario { get; set; }
    public long? AuditorUsuarioId { get; set; }
    public string? DatosExtraRegistro { get; set; }

    // =========================
    // FAMILIAR SIMPLE
    // =========================
    public long? ParentescoId { get; set; }
    public long? FamTipoDocumentoId { get; set; }
    public string? FamNumeroDocumento { get; set; }
    public string? FamPrimerNombre { get; set; }
    public string? FamSegundoNombre { get; set; }
    public string? FamApellidoPaterno { get; set; }
    public string? FamApellidoMaterno { get; set; }
    public long? FamSexoId { get; set; }
    public string? FamCelular { get; set; }
    public string? FamDatosExtra { get; set; }

    // =========================
    // CAMPAÑAS
    // =========================
    public List<long> Campanias { get; set; } = new();
}