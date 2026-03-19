namespace CRM.Application.Features.Auth.Responses;

public class LoginResponse
{
    public long UsuarioId { get; set; }
    public long? EmpleadoId { get; set; }

    public string Username { get; set; } = string.Empty;
    public string? NombreCompleto { get; set; }
    public string? EmailCoorporativo { get; set; }

    public bool RequiereCambioPassword { get; set; }

    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiraEn { get; set; }

    public bool Activo { get; set; }
    public DateTime? UltimoLogin { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime? BloqueoHasta { get; set; }

    public long? AreaId { get; set; }
    public string? AreaCodigo { get; set; }
    public string? AreaNombre { get; set; }

    public long? CargoId { get; set; }
    public string? CargoCodigo { get; set; }
    public string? CargoNombre { get; set; }

    public List<string> Roles { get; set; } = new();
    public List<string> Permisos { get; set; } = new();
}