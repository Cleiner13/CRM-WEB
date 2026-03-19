namespace CRM.Application.Features.Usuarios.Requests;

public class ListarUsuariosRequest
{
    public int Pagina { get; set; } = 1;
    public int Tamanio { get; set; } = 20;
    public string? Texto { get; set; }
    public bool SoloActivos { get; set; } = true;
    public long? AreaId { get; set; }
    public long? RolId { get; set; }
}