namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioRolResponse
{
    public long UsuarioRolId { get; set; }
    public long UsuarioId { get; set; }
    public long RolId { get; set; }

    public string? RolCodigo { get; set; }
    public string? RolNombre { get; set; }

    public long? UsuarioAsignacionId { get; set; }
    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
}