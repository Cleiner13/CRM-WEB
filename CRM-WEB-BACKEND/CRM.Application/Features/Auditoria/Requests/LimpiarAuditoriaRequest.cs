namespace CRM.Application.Features.Auditoria.Requests;

public class LimpiarAuditoriaRequest
{
    public int DiasRetencion { get; set; } = 180;
}