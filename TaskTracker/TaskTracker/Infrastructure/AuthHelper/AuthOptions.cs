using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TaskTracker.Infrastructure.AuthHelper;

public static class AuthOptions
{
    public const string ISSUER = "UPPAuthServer";
    public const string AUDIENCE = "UPPAuthClient";
    const string KEY = "this_is_a_secure_32_byte_minimum_key!";
    public static SymmetricSecurityKey GetSymSecurityKey() =>
        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY));

    public static ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = AuthOptions.GetSymSecurityKey(),
            ValidateLifetime = false // игнорируем срок жизни
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
