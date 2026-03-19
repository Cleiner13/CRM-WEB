namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioListItemResponse
{
    public long UsuarioId { get; set; }
    public long? EmpleadoId { get; set; }

    public string Usuario { get; set; } = string.Empty;
    public string? UsuarioNormalizado { get; set; }

    public bool DebeCambiarPassword { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime? BloqueoHasta { get; set; }
    public DateTime? UltimoLogin { get; set; }
    public bool Activo { get; set; }

    public string? NumeroDocumento { get; set; }
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? PrimerNombre { get; set; }
    public string? SegundoNombre { get; set; }
    public string? Celular { get; set; }
    public string? CorreoPersonal { get; set; }
    public bool? EmpleadoActivo { get; set; }

    public long? AreaId { get; set; }
    public string? AreaCodigo { get; set; }
    public string? AreaNombre { get; set; }

    public long? CargoId { get; set; }
    public string? CargoCodigo { get; set; }
    public string? CargoNombre { get; set; }

    public int? CantidadRoles { get; set; }
    public string? RolesNombres { get; set; }

    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}