namespace CRM.Application.Features.Auditoria.Requests;

public class RegistrarAuditoriaRequest
{
    public long? UsuarioId { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public string? ClaveEntidad { get; set; }
    public string? AntesJson { get; set; }
    public string? DespuesJson { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DatosExtra { get; set; }
}