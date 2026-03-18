using CRM.Domain.Entities;

namespace CRM.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(Usuario usuario);
    string GenerateRefreshToken();
}