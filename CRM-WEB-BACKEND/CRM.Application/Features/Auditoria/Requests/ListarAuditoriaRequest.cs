namespace CRM.Application.Features.Auditoria.Requests;

public class ListarAuditoriaRequest
{
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public long? UsuarioId { get; set; }
    public string? Accion { get; set; }
    public string? Entidad { get; set; }
    public string? ClaveEntidad { get; set; }

    public int Pagina { get; set; } = 1;
    public int TamPagina { get; set; } = 50;
}