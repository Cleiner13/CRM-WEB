namespace CRM.Application.Features.Empleados.Responses;

public class EmpleadoFamiliarResponse
{
    public long FamiliarId { get; set; }
    public long EmpleadoId { get; set; }
    public long? ParentescoId { get; set; }
    public long? TipoDocumentoId { get; set; }
    public string? NumeroDocumento { get; set; }
    public string? PrimerNombre { get; set; }
    public string? SegundoNombre { get; set; }
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public long? SexoId { get; set; }
    public string? Celular { get; set; }
    public string? DatosExtra { get; set; }
    public bool Activo { get; set; }
}