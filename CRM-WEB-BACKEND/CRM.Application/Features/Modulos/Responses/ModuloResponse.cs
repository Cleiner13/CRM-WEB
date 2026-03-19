namespace CRM.Application.Features.Modulos.Responses;

public class ModuloResponse
{
    public long ModuloId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }

    public DateTime FechaCreacion { get; set; }
    public long? UsuarioCreacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public long? UsuarioModificacionId { get; set; }
    public byte[]? RowVer { get; set; }

    public bool EsSubModulo => Codigo.Contains('.');
    public string? CodigoPadre => EsSubModulo ? Codigo[..Codigo.LastIndexOf('.')] : null;
    public int Nivel => Codigo.Count(c => c == '.') + 1;
}