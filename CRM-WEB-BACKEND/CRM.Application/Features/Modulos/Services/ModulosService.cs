using CRM.Application.Features.Modulos.Interfaces;
using CRM.Application.Features.Modulos.Requests;
using CRM.Application.Features.Modulos.Responses;

namespace CRM.Application.Features.Modulos.Services;

public class ModulosService : IModulosService
{
    private readonly IModulosRepository _modulosRepository;

    public ModulosService(IModulosRepository modulosRepository)
    {
        _modulosRepository = modulosRepository;
    }

    public Task<List<ModuloResponse>> ListarAsync(
        string? buscar,
        bool soloActivos,
        CancellationToken cancellationToken = default)
    {
        return _modulosRepository.ListarAsync(buscar, soloActivos, cancellationToken);
    }
    public Task<ModuloGuardarResponse> GuardarAsync(
        GuardarModuloRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _modulosRepository.GuardarAsync(
            request,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }

    public Task<ModuloOperacionResponse> EliminarAsync(
        long moduloId,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        return _modulosRepository.EliminarAsync(
            moduloId,
            usuarioIdAccion,
            ipAddress,
            userAgent,
            cancellationToken);
    }
}