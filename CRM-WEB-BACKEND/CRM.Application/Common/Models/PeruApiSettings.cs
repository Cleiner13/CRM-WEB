namespace CRM.Application.Common.Models;

public sealed class PeruApiSettings
{
    public string BaseUrl { get; set; } = "https://peruapi.com/api";
    public string ApiKey { get; set; } = string.Empty;
}