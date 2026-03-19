namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoCompletoResponse
{
    public bool Encontrado { get; set; }
    public long EmpleadoId { get; set; }

    public EmpleadoBasicoResponse? Empleado { get; set; }
    public EmpleadoDireccionResponse? Direccion { get; set; }
    public List<EmpleadoFotoResponse> Fotos { get; set; } = new();
    public EmpleadoPostulacionResponse? Postulacion { get; set; }
    public EmpleadoContratacionResponse? Contratacion { get; set; }
    public EmpleadoRegistroResponse? Registro { get; set; }
    public List<EmpleadoFamiliarResponse> Familiares { get; set; } = new();
    public List<EmpleadoCampaniaResponse> Campanias { get; set; } = new();
    public EmpleadoUsuarioResponse? Usuario { get; set; }
    public List<EmpleadoUsuarioRolResponse> RolesUsuario { get; set; } = new();
}