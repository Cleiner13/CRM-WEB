namespace CRM.Application.Features.Auditoria.Responses;

public class AuditoriaListItemResponse
{
    public long LogAuditoriaId { get; set; }
    public DateTime FechaCreacion { get; set; }
    public long UsuarioId { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public string? ClaveEntidad { get; set; }
    public string? IpAddress { get; set; }
    public int TotalFilas { get; set; }
}