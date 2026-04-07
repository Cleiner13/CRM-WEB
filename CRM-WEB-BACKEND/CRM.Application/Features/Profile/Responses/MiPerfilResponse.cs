namespace CRM.Application.Features.Profile.Responses;

public class MiPerfilResponse
{
    public MiPerfilResumenResponse? Resumen { get; set; }
    public List<MiPerfilRolResponse> Roles { get; set; } = new();
    public List<MiPerfilPermisoResponse> Permisos { get; set; } = new();
}

public class MiPerfilResumenResponse
{
    public long UsuarioId { get; set; }
    public long EmpleadoId { get; set; }
    public string? Usuario { get; set; }
    public DateTime? UltimoLogin { get; set; }
    public string? TipoDocumentoNombre { get; set; }
    public string? NombreCompleto { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Edad { get; set; }
    public string? SexoNombre { get; set; }
    public string? NivelEstudiosNombre { get; set; }
    public string? Nacionalidad { get; set; }
    public string? EstadoCivilNombre { get; set; }
    public bool? Hijos { get; set; }
    public int? CantidadHijos { get; set; }
    public string? CelularPersonal { get; set; }
    public string? CorreoPersonal { get; set; }
    public string? Departamento { get; set; }
    public string? Provincia { get; set; }
    public string? Distrito { get; set; }
    public string? Direccion { get; set; }
    public string? DireccionReferencia { get; set; }
    public string? CorreoCorporativo { get; set; }
    public string? FotoUrl { get; set; }
    public byte[]? FotoBytes { get; set; }
    public DateTime? FechaPostulacion { get; set; }
    public string? OrigenNombre { get; set; }
    public string? PostulacionReferencia { get; set; }
    public string? PostulacionAreaNombre { get; set; }
    public string? PostulacionCargoNombre { get; set; }
    public string? ProductoNombre { get; set; }
    public string? CampaniaNombre { get; set; }
    public string? JefeNombreCompleto { get; set; }
    public string? CodigoEjecutivo { get; set; }
    public string? CodigoDial { get; set; }
    public string? CodigoPropio { get; set; }
    public string? GeneracionNombre { get; set; }
    public string? JornadaNombre { get; set; }
    public string? TurnoNombre { get; set; }
    public string? TipoContratoNombre { get; set; }
    public string? ContratacionAreaNombre { get; set; }
    public string? ContratacionCargoNombre { get; set; }
    public string? TipoProductoNombre { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public string? BancoNombre { get; set; }
    public string? NumeroCuenta { get; set; }
    public DateTime? FechaInicioContrato { get; set; }
    public DateTime? FechaFinContrato { get; set; }
    public string? EmpresaNombre { get; set; }
    public decimal? Sueldo { get; set; }
    public DateTime? FechaCambio { get; set; }
    public DateTime? FechaCese { get; set; }
    public string? EstadoNombre { get; set; }
    public string? SubEstadoNombre { get; set; }
    public string? Comentario { get; set; }
}

public class MiPerfilRolResponse
{
    public long UsuarioRolId { get; set; }
    public long UsuarioId { get; set; }
    public long RolId { get; set; }
    public string? RolCodigo { get; set; }
    public string? RolNombre { get; set; }
    public string? RolDescripcion { get; set; }
    public bool RolActivo { get; set; }
    public bool UsuarioRolActivo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
}

public class MiPerfilPermisoResponse
{
    public long ModuloId { get; set; }
    public string? ModuloCodigo { get; set; }
    public string? ModuloNombre { get; set; }
    public long PermisoId { get; set; }
    public string? PermisoCodigo { get; set; }
    public string? PermisoNombre { get; set; }
    public bool Permitido { get; set; }
}
