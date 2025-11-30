using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace TaskTracker.Infrastructure.AuthHelper;

public static class JwtExtensions
{
    public static AuthenticationBuilder AddJwt(this IServiceCollection services)
    {
        return services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer("Access", options =>
            {
                ConfigureJwt(options, validateIssuer: true, validateAudience: true);
            })
            .AddJwtBearer("Refresh", options =>
            {
                ConfigureJwt(options, validateIssuer: false, validateAudience: false);
            });
    }

    private static void ConfigureJwt(JwtBearerOptions options, bool validateIssuer, bool validateAudience)
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ClockSkew = TimeSpan.FromMinutes(1),
            ValidateIssuer = validateIssuer,
            ValidIssuer = validateIssuer ? AuthOptions.ISSUER : null,
            ValidateAudience = validateAudience,
            ValidAudience = validateAudience ? AuthOptions.AUDIENCE : null,
            ValidateLifetime = true,
            IssuerSigningKey = AuthOptions.GetSymSecurityKey(),
            ValidateIssuerSigningKey = true,
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context => Task.CompletedTask,
            OnTokenValidated = context => Task.CompletedTask
        };
    }
}
