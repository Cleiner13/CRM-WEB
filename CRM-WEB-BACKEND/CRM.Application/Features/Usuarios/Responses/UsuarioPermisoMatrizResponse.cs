namespace CRM.Application.Features.Usuarios.Responses;

public class UsuarioPermisoMatrizResponse
{
    public long UsuarioId { get; set; }
    public List<UsuarioPermisoMatrizItemResponse> Permisos { get; set; } = new();
}

public class UsuarioPermisoMatrizItemResponse
{
    public long ModuloId { get; set; }
    public string? ModuloCodigo { get; set; }
    public string? ModuloNombre { get; set; }
    public long PermisoId { get; set; }
    public string? PermisoCodigo { get; set; }
    public string? PermisoNombre { get; set; }
    public bool HeredadoPorRol { get; set; }
    public string EstadoOverride { get; set; } = "HEREDAR";
    public bool EsDenegado { get; set; }
    public bool PermitidoEfectivo { get; set; }
    public string? Motivo { get; set; }
}
