namespace CRM.Application.Features.Auth.Responses;

public class CurrentUserResponse
{
    public long? UsuarioId { get; set; }
    public long? EmpleadoId { get; set; }

    public string? Username { get; set; }
    public string? NombreCompleto { get; set; }
    public string? EmailCoorporativo { get; set; }

    public bool Activo { get; set; }
    public bool RequiereCambioPassword { get; set; }

    public DateTime? UltimoLogin { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime? BloqueadoHasta { get; set; }

    public long? AreaId { get; set; }
    public string? AreaCodigo { get; set; }
    public string? AreaNombre { get; set; }

    public long? CargoId { get; set; }
    public string? CargoCodigo { get; set; }
    public string? CargoNombre { get; set; }

    public List<string> Roles { get; set; } = new();
    public List<string> Permisos { get; set; } = new();
}