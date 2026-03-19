namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoValidacionEliminacionResponse
{
    public List<EmpleadoValidacionEliminacionResumenResponse> Resumen { get; set; } = new();
    public List<EmpleadoValidacionUsuarioRelacionadoResponse> Usuarios { get; set; } = new();
    public List<EmpleadoUsuarioRolResponse> RolesUsuario { get; set; } = new();
    public List<EmpleadoValidacionPermisoUsuarioResponse> PermisosUsuario { get; set; } = new();
    public List<EmpleadoValidacionRefreshTokenResponse> RefreshTokens { get; set; } = new();
    public List<EmpleadoCampaniaResponse> Campanias { get; set; } = new();

    public List<EmpleadoBasicoResponse> Empleados { get; set; } = new();
    public List<EmpleadoContratacionResponse> Contrataciones { get; set; } = new();
    public List<EmpleadoPostulacionResponse> Postulaciones { get; set; } = new();
    public List<EmpleadoDireccionResponse> Direcciones { get; set; } = new();
    public List<EmpleadoFamiliarResponse> Familiares { get; set; } = new();
    public List<EmpleadoFotoResponse> Fotos { get; set; } = new();
    public List<EmpleadoRegistroResponse> Registros { get; set; } = new();
}