using System.Data;
using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Empleados.Interfaces;
using CRM.Application.Features.Empleados.Requests;
using CRM.Application.Features.Empleados.Responses;
using Dapper;

namespace CRM.Infrastructure.Persistence.Repositories.Empleados;

public class EmpleadosRepository : IEmpleadosRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public EmpleadosRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<EmpleadoGuardarUsuarioResponse> GuardarUsuarioAsync(
        EmpleadoGuardarUsuarioRequest request,
        long? usuarioIdAccion,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();

        parameters.Add("@TipoDocumentoId", request.TipoDocumentoId, DbType.Int64);
        parameters.Add("@NumeroDocumento", request.NumeroDocumento, DbType.String);

        parameters.Add("@ApellidoPaterno", request.ApellidoPaterno, DbType.String);
        parameters.Add("@ApellidoMaterno", request.ApellidoMaterno, DbType.String);
        parameters.Add("@PrimerNombre", request.PrimerNombre, DbType.String);
        parameters.Add("@SegundoNombre", request.SegundoNombre, DbType.String);
        parameters.Add("@FechaNacimiento", request.FechaNacimiento, DbType.Date);
        parameters.Add("@Edad", request.Edad, DbType.String);
        parameters.Add("@Nacionalidad", request.Nacionalidad, DbType.String);

        parameters.Add("@Hijos", request.Hijos, DbType.Boolean);
        parameters.Add("@CantidadHijos", request.CantidadHijos, DbType.Int32);

        parameters.Add("@Celular", request.Celular, DbType.String);
        parameters.Add("@CorreoPersonal", request.CorreoPersonal, DbType.String);

        parameters.Add("@SexoId", request.SexoId, DbType.Int64);
        parameters.Add("@NivelEstudiosId", request.NivelEstudiosId, DbType.Int64);
        parameters.Add("@EstadoCivilId", request.EstadoCivilId, DbType.Int64);

        parameters.Add("@DatosExtraEmpleado", request.DatosExtraEmpleado, DbType.String);

        parameters.Add("@Departamento", request.Departamento, DbType.String);
        parameters.Add("@Provincia", request.Provincia, DbType.String);
        parameters.Add("@Distrito", request.Distrito, DbType.String);
        parameters.Add("@Direccion", request.Direccion, DbType.String);
        parameters.Add("@ReferenciaDir", request.ReferenciaDir, DbType.String);
        parameters.Add("@CorreoCorporativo", request.CorreoCorporativo, DbType.String);
        parameters.Add("@CelularEmergencia", request.CelularEmergencia, DbType.String);
        parameters.Add("@DatosExtraDireccion", request.DatosExtraDireccion, DbType.String);

        parameters.Add("@OrigenId", request.OrigenId, DbType.Int64);
        parameters.Add("@ReferenciaPost", request.ReferenciaPost, DbType.String);
        parameters.Add("@AreaPostId", request.AreaPostId, DbType.Int64);
        parameters.Add("@CargoPostId", request.CargoPostId, DbType.Int64);
        parameters.Add("@CampaniaPostId", request.CampaniaPostId, DbType.Int64);
        parameters.Add("@ProductoPostId", request.ProductoPostId, DbType.Int64);
        parameters.Add("@FechaPostulacion", request.FechaPostulacion, DbType.DateTime2);
        parameters.Add("@DatosExtraPost", request.DatosExtraPost, DbType.String);

        parameters.Add("@JefeEmpleadoId", request.JefeEmpleadoId, DbType.Int64);
        parameters.Add("@CodigoEjecutivo", request.CodigoEjecutivo, DbType.String);
        parameters.Add("@CodigoDial", request.CodigoDial, DbType.String);
        parameters.Add("@CodigoPropio", request.CodigoPropio, DbType.String);
        parameters.Add("@GeneracionId", request.GeneracionId, DbType.Int64);
        parameters.Add("@JornadaId", request.JornadaId, DbType.Int64);
        parameters.Add("@TurnoId", request.TurnoId, DbType.Int64);
        parameters.Add("@TipoContratoId", request.TipoContratoId, DbType.Int64);
        parameters.Add("@AreaId", request.AreaId, DbType.Int64);
        parameters.Add("@CargoId", request.CargoId, DbType.Int64);
        parameters.Add("@TipoProductoId", request.TipoProductoId, DbType.Int64);
        parameters.Add("@FechaIngreso", request.FechaIngreso, DbType.Date);
        parameters.Add("@BancoId", request.BancoId, DbType.Int64);
        parameters.Add("@NumeroCuenta", request.NumeroCuenta, DbType.String);
        parameters.Add("@FechaInicioContrato", request.FechaInicioContrato, DbType.Date);
        parameters.Add("@FechaFinContrato", request.FechaFinContrato, DbType.Date);
        parameters.Add("@EmpresaId", request.EmpresaId, DbType.Int64);
        parameters.Add("@Sueldo", request.Sueldo, DbType.Decimal);
        parameters.Add("@FechaCambio", request.FechaCambio, DbType.Date);
        parameters.Add("@FechaCese", request.FechaCese, DbType.Date);
        parameters.Add("@DatosExtraCont", request.DatosExtraCont, DbType.String);

        parameters.Add("@EstadoId", request.EstadoId, DbType.Int64);
        parameters.Add("@SubEstadoId", request.SubEstadoId, DbType.Int64);
        parameters.Add("@Comentario", request.Comentario, DbType.String);
        parameters.Add("@AuditorUsuarioId", request.AuditorUsuarioId, DbType.Int64);
        parameters.Add("@DatosExtraRegistro", request.DatosExtraRegistro, DbType.String);

        parameters.Add("@ParentescoId", request.ParentescoId, DbType.Int64);
        parameters.Add("@FamTipoDocumentoId", request.FamTipoDocumentoId, DbType.Int64);
        parameters.Add("@FamNumeroDocumento", request.FamNumeroDocumento, DbType.String);
        parameters.Add("@FamPrimerNombre", request.FamPrimerNombre, DbType.String);
        parameters.Add("@FamSegundoNombre", request.FamSegundoNombre, DbType.String);
        parameters.Add("@FamApellidoPaterno", request.FamApellidoPaterno, DbType.String);
        parameters.Add("@FamApellidoMaterno", request.FamApellidoMaterno, DbType.String);
        parameters.Add("@FamSexoId", request.FamSexoId, DbType.Int64);
        parameters.Add("@FamCelular", request.FamCelular, DbType.String);
        parameters.Add("@FamDatosExtra", request.FamDatosExtra, DbType.String);

        var campaniasTable = BuildCampaniasTable(request.Campanias);
        parameters.Add("@Campanias", campaniasTable.AsTableValuedParameter("rrhh.TVP_Campanias"));

        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);
        parameters.Add("@IpAddress", ipAddress, DbType.String);
        parameters.Add("@UserAgent", userAgent, DbType.String);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_Empleado_Guardar_Usuario",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<EmpleadoGuardarUsuarioResponse>(command);
    }

    public async Task<PagedResponse<EmpleadoListItemResponse>> ListarPaginadoAsync(
        EmpleadoListarPaginadoRequest request,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@Pagina", request.Pagina, DbType.Int32);
        parameters.Add("@Tamanio", request.Tamanio, DbType.Int32);
        parameters.Add("@Texto", request.Texto, DbType.String);
        parameters.Add("@SoloActivos", request.SoloActivos, DbType.Boolean);
        parameters.Add("@EstadoId", request.EstadoId, DbType.Int64);
        parameters.Add("@SubEstadoId", request.SubEstadoId, DbType.Int64);
        parameters.Add("@AreaId", request.AreaId, DbType.Int64);
        parameters.Add("@CargoId", request.CargoId, DbType.Int64);
        parameters.Add("@TipoProductoId", request.TipoProductoId, DbType.Int64);
        parameters.Add("@CampaniaId", request.CampaniaId, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_Empleado_ListarPaginado",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var items = (await multi.ReadAsync<EmpleadoListItemResponse>()).ToList();
        var meta = await multi.ReadFirstOrDefaultAsync<PaginacionDbModel>();

        var total = meta?.Total ?? 0;
        var pagina = meta?.Pagina ?? request.Pagina;
        var tamanio = meta?.Tamanio ?? request.Tamanio;

        return new PagedResponse<EmpleadoListItemResponse>
        {
            Items = items,
            PageNumber = pagina,
            PageSize = tamanio,
            TotalRecords = total,
            TotalPages = tamanio <= 0 ? 1 : (int)Math.Ceiling(total / (double)tamanio)
        };
    }

    public async Task<EmpleadoBuscarPorDocumentoResponse?> BuscarPorDocumentoAsync(
        string numeroDocumento,
        long? tipoDocumentoId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@NumeroDocumento", numeroDocumento, DbType.String);
        parameters.Add("@TipoDocumentoId", tipoDocumentoId, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_Empleado_BuscarPorDocumento",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var header = await multi.ReadFirstOrDefaultAsync<EmpleadoBuscarPorDocumentoResponse>();
        if (header is null || !header.Encontrado)
        {
            return null;
        }

        var campanias = (await multi.ReadAsync<EmpleadoCampaniaResponse>()).ToList();
        header.Campanias = campanias;

        return header;
    }

    public async Task<EmpleadoCompletoResponse?> ObtenerCompletoAsync(
        long? empleadoId,
        string? numeroDocumento,
        long? tipoDocumentoId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@EmpleadoId", empleadoId, DbType.Int64);
        parameters.Add("@NumeroDocumento", numeroDocumento, DbType.String);
        parameters.Add("@TipoDocumentoId", tipoDocumentoId, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_Empleado_ObtenerCompleto",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var header = await multi.ReadFirstOrDefaultAsync<EmpleadoCompletoHeaderDbModel>();
        if (header is null || !header.Encontrado)
        {
            return null;
        }

        var empleado = await multi.ReadFirstOrDefaultAsync<EmpleadoBasicoResponse>();
        var direccion = await multi.ReadFirstOrDefaultAsync<EmpleadoDireccionResponse>();
        var fotos = (await multi.ReadAsync<EmpleadoFotoResponse>()).ToList();
        var postulacion = await multi.ReadFirstOrDefaultAsync<EmpleadoPostulacionResponse>();
        var contratacion = await multi.ReadFirstOrDefaultAsync<EmpleadoContratacionResponse>();
        var registro = await multi.ReadFirstOrDefaultAsync<EmpleadoRegistroResponse>();
        var familiares = (await multi.ReadAsync<EmpleadoFamiliarResponse>()).ToList();
        var campanias = (await multi.ReadAsync<EmpleadoCampaniaResponse>()).ToList();
        var usuario = await multi.ReadFirstOrDefaultAsync<EmpleadoUsuarioResponse>();
        var roles = (await multi.ReadAsync<EmpleadoUsuarioRolResponse>()).ToList();

        return new EmpleadoCompletoResponse
        {
            Encontrado = true,
            EmpleadoId = header.EmpleadoId,
            Empleado = empleado,
            Direccion = direccion,
            Fotos = fotos,
            Postulacion = postulacion,
            Contratacion = contratacion,
            Registro = registro,
            Familiares = familiares,
            Campanias = campanias,
            Usuario = usuario,
            RolesUsuario = roles
        };
    }

    private static DataTable BuildCampaniasTable(IEnumerable<long> campanias)
    {
        var table = new DataTable();
        table.Columns.Add("CampaniaItemMaestroId", typeof(long));

        foreach (var campaniaId in campanias.Distinct())
        {
            table.Rows.Add(campaniaId);
        }

        return table;
    }

    public async Task<EmpleadoOperacionResponse> DesactivarAsync(
    long empleadoId,
    long? usuarioIdAccion,
    CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@EmpleadoId", empleadoId, DbType.Int64);
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_Empleado_Desactivar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        await connection.ExecuteAsync(command);

        return new EmpleadoOperacionResponse
        {
            Ok = true,
            Mensaje = "Empleado desactivado correctamente."
        };
    }

    public async Task<EmpleadoValidacionEliminacionResponse> ValidarEliminacionFisicaAsync(
        long empleadoId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@EmpleadoId", empleadoId, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_Empleado_ValidarEliminacionFisica",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        using var multi = await connection.QueryMultipleAsync(command);

        var resumen = (await multi.ReadAsync<EmpleadoValidacionEliminacionResumenResponse>()).ToList();
        var usuarios = (await multi.ReadAsync<EmpleadoValidacionUsuarioRelacionadoResponse>()).ToList();
        var roles = (await multi.ReadAsync<EmpleadoUsuarioRolResponse>()).ToList();
        var permisos = (await multi.ReadAsync<EmpleadoValidacionPermisoUsuarioResponse>()).ToList();
        var refreshTokens = (await multi.ReadAsync<EmpleadoValidacionRefreshTokenResponse>()).ToList();
        var campanias = (await multi.ReadAsync<EmpleadoCampaniaResponse>()).ToList();

        var empleados = (await multi.ReadAsync<EmpleadoBasicoResponse>()).ToList();
        var contrataciones = (await multi.ReadAsync<EmpleadoContratacionResponse>()).ToList();
        var postulaciones = (await multi.ReadAsync<EmpleadoPostulacionResponse>()).ToList();
        var direcciones = (await multi.ReadAsync<EmpleadoDireccionResponse>()).ToList();
        var familiares = (await multi.ReadAsync<EmpleadoFamiliarResponse>()).ToList();
        var fotos = (await multi.ReadAsync<EmpleadoFotoResponse>()).ToList();
        var registros = (await multi.ReadAsync<EmpleadoRegistroResponse>()).ToList();

        return new EmpleadoValidacionEliminacionResponse
        {
            Resumen = resumen,
            Usuarios = usuarios,
            RolesUsuario = roles,
            PermisosUsuario = permisos,
            RefreshTokens = refreshTokens,
            Campanias = campanias,
            Empleados = empleados,
            Contrataciones = contrataciones,
            Postulaciones = postulaciones,
            Direcciones = direcciones,
            Familiares = familiares,
            Fotos = fotos,
            Registros = registros
        };
    }

    public async Task<EmpleadoOperacionResponse> EliminarFisicoAsync(
        long empleadoId,
        bool confirmar,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@EmpleadoId", empleadoId, DbType.Int64);
        parameters.Add("@Confirmar", confirmar, DbType.Boolean);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_Empleado_EliminarFisico",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<EmpleadoOperacionResponse>(command);
    }

    public async Task<List<EmpleadoCampaniaResponse>> SincronizarCampaniasAsync(
        long empleadoId,
        long tipoProductoId,
        List<long> campanias,
        long? usuarioIdAccion,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@EmpleadoId", empleadoId, DbType.Int64);
        parameters.Add("@TipoProductoId", tipoProductoId, DbType.Int64);
        parameters.Add("@Campanias", BuildCampaniasTable(campanias).AsTableValuedParameter("rrhh.TVP_Campanias"));
        parameters.Add("@UsuarioIdAccion", usuarioIdAccion, DbType.Int64);

        var command = new CommandDefinition(
            commandText: "rrhh.usp_EmpleadoCampania_Sincronizar",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        var result = await connection.QueryAsync<EmpleadoCampaniaResponse>(command);
        return result.ToList();
    }

    public async Task<ValidarTipoProductoCampaniasResponse> ValidarTipoProductoCampaniasAsync(
        long tipoProductoId,
        List<long> campanias,
        CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();

        var parameters = new DynamicParameters();
        parameters.Add("@TipoProductoId", tipoProductoId, DbType.Int64);
        parameters.Add("@Campanias", BuildCampaniasTable(campanias).AsTableValuedParameter("rrhh.TVP_Campanias"));

        var command = new CommandDefinition(
            commandText: "rrhh.usp_ValidarTipoProductoCampanias",
            parameters: parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken);

        return await connection.QueryFirstAsync<ValidarTipoProductoCampaniasResponse>(command);
    }

    private sealed class PaginacionDbModel
    {
        public int Total { get; set; }
        public int Pagina { get; set; }
        public int Tamanio { get; set; }
    }

    private sealed class EmpleadoCompletoHeaderDbModel
    {
        public bool Encontrado { get; set; }
        public long EmpleadoId { get; set; }
    }
}