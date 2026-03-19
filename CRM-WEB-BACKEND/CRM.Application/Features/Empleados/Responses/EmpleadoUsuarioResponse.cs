namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoUsuarioResponse
{
    public long UsuarioId { get; set; }
    public long? EmpleadoId { get; set; }
    public string? Usuario { get; set; }
    public string? UsuarioNormalizado { get; set; }
    public bool DebeCambiarPassword { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime? BloqueoHasta { get; set; }
    public DateTime? UltimoLogin { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}