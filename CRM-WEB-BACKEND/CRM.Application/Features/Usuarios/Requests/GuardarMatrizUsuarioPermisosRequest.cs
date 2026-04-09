namespace CRM.Application.Features.Usuarios.Requests;

public class GuardarMatrizUsuarioPermisosRequest
{
    public List<GuardarMatrizUsuarioPermisoItemRequest> Permisos { get; set; } = new();
}

public class GuardarMatrizUsuarioPermisoItemRequest
{
    public long ModuloId { get; set; }
    public long PermisoId { get; set; }
    public string Estado { get; set; } = "HEREDAR";
    public string? Motivo { get; set; }
}
