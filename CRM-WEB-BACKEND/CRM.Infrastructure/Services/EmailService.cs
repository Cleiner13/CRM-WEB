using CRM.Application.Common.Interfaces;
using DocuSign.eSign.Model;
using Microsoft.Extensions.Options;
using OpenQA.Selenium;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendPasswordResetCodeAsync(string to, string code, DateTime expiraEn, CancellationToken cancellationToken = default)
    {
        var body = $"Su código de recuperación es {code}. Expira el {expiraEn:dd/MM/yyyy HH:mm}";
        using var smtp = new SmtpClient(_settings.Host, _settings.Port)
        {
            Credentials = new NetworkCredential(_settings.Username, _settings.Password),
            EnableSsl = _settings.UseSsl
        };
        var message = new MailMessage(_settings.From, to, "Recuperación de contraseña", body);
        await smtp.SendMailAsync(message, cancellationToken);
    }
}