using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using CRM.Application.Common.Interfaces;
using CRM.Application.Common.Models;
using CRM.Application.Features.Empleados.Responses;
using Microsoft.Extensions.Options;

namespace CRM.Infrastructure.Integrations.PeruApi;

public sealed class PeruApiDniService : IPeruApiDniService
{
    private static readonly Regex DniRegex = new(@"^\d{8}$", RegexOptions.Compiled);

    private readonly HttpClient _httpClient;
    private readonly PeruApiSettings _settings;

    public PeruApiDniService(
        HttpClient httpClient,
        IOptions<PeruApiSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public async Task<EmpleadoConsultaDniResponse?> ConsultarDniAsync(
        string numeroDocumento,
        CancellationToken cancellationToken = default)
    {
        numeroDocumento = numeroDocumento?.Trim() ?? string.Empty;

        if (!DniRegex.IsMatch(numeroDocumento))
        {
            throw new InvalidOperationException("El DNI debe tener exactamente 8 dígitos.");
        }

        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            throw new InvalidOperationException("PeruApi:ApiKey no está configurado.");
        }

        var baseUrl = string.IsNullOrWhiteSpace(_settings.BaseUrl)
            ? "https://peruapi.com/api"
            : _settings.BaseUrl.TrimEnd('/');

        var url = $"{baseUrl}/dni/{numeroDocumento}?summary=0&plan=0";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("X-API-KEY", _settings.ApiKey);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            var apiMessage = TryReadMessage(content);

            throw new InvalidOperationException(
                string.IsNullOrWhiteSpace(apiMessage)
                    ? $"No se pudo consultar PeruAPI. HTTP {(int)response.StatusCode}."
                    : apiMessage);
        }

        var payload = JsonSerializer.Deserialize<PeruApiDniRawResponse>(
            content,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (payload is null)
        {
            throw new InvalidOperationException("PeruAPI devolvió una respuesta vacía o inválida.");
        }

        if (!string.Equals(payload.Code, "200", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(payload.Mensaje ?? "PeruAPI no devolvió una respuesta válida.");
        }

        var nombres = payload.Nombres?.Trim();
        var apellidoPaterno = payload.ApellidoPaterno?.Trim();
        var apellidoMaterno = payload.ApellidoMaterno?.Trim();

        return new EmpleadoConsultaDniResponse
        {
            NumeroDocumento = payload.Dni?.Trim() ?? numeroDocumento,
            Cliente = payload.Cliente?.Trim(),
            Nombres = nombres,
            ApellidoPaterno = apellidoPaterno,
            ApellidoMaterno = apellidoMaterno,
            NombreCompleto = payload.Cliente?.Trim()
                ?? string.Join(" ", new[] { nombres, apellidoPaterno, apellidoMaterno }.Where(x => !string.IsNullOrWhiteSpace(x)))
        };
    }

    private static string? TryReadMessage(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(content);

            if (document.RootElement.TryGetProperty("mensaje", out var mensaje))
            {
                return mensaje.GetString();
            }

            if (document.RootElement.TryGetProperty("message", out var message))
            {
                return message.GetString();
            }
        }
        catch
        {
            // Ignorar
        }

        return content;
    }

    private sealed class PeruApiDniRawResponse
    {
        [JsonPropertyName("dni")]
        public string? Dni { get; set; }

        [JsonPropertyName("cliente")]
        public string? Cliente { get; set; }

        [JsonPropertyName("nombres")]
        public string? Nombres { get; set; }

        [JsonPropertyName("apellido_paterno")]
        public string? ApellidoPaterno { get; set; }

        [JsonPropertyName("apellido_materno")]
        public string? ApellidoMaterno { get; set; }

        [JsonPropertyName("mensaje")]
        public string? Mensaje { get; set; }

        [JsonPropertyName("code")]
        public string? Code { get; set; }
    }
}