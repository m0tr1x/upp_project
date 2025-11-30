using System.Security.Claims;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Infrastructure.AuthHelper;
using TaskTracker.Models.Auth;

namespace TaskTracker.Bll.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly TokenManager _tokenManager;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
        _tokenManager = new TokenManager(AuthOptions.GetSymSecurityKey(), AuthOptions.ISSUER, AuthOptions.AUDIENCE);
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken token)
    {
        var existingUser = await _userRepository.GetUserByEmailAsync(request.Email, token);
        if (existingUser != null)
            return new AuthResult { Success = false, ErrorMessage = "Пользователь уже существует" };

        var passwordHash = HasherPassword.HashPassword(request.Password);

        var user = new DbUser
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var success = await _userRepository.AddUserAsync(user, token);
        if (!success) return new AuthResult { Success = false, ErrorMessage = "Ошибка создания пользователя" };

        var (accessToken, refreshToken) = GenerateTokens(user);

        return new AuthResult { Success = true, AccessToken = accessToken, RefreshToken = refreshToken };
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken token)
    {
        var user = await _userRepository.GetUserByEmailAsync(request.Email, token);
        if (user == null || !HasherPassword.VerifyPassword(request.Password, user.PasswordHash))
            return new AuthResult { Success = false, ErrorMessage = "Неверный email или пароль" };

        var (accessToken, refreshToken) = GenerateTokens(user);

        return new AuthResult { Success = true, AccessToken = accessToken, RefreshToken = refreshToken };
    }

    public async Task<AuthResult> RefreshTokenAsync(string refreshToken, CancellationToken token)
    {
        var principal = AuthOptions.GetPrincipalFromExpiredToken(refreshToken);

        if (principal == null)
            return new AuthResult { Success = false, ErrorMessage = "Неверный токен" };

        var email = principal.Identity!.Name!;
        var user = await _userRepository.GetUserByEmailAsync(email, token);

        if (user == null)
            return new AuthResult { Success = false, ErrorMessage = "Пользователь не найден" };

        var tokens = GenerateTokens(user);

        return new AuthResult { Success = true, AccessToken = tokens.accessToken, RefreshToken = tokens.refreshToken };
    }

    private (string accessToken, string refreshToken) GenerateTokens(DbUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Email),
            new("userId", user.Id.ToString())
        };

        var accessToken = _tokenManager.GenerateAccessToken(claims);
        var refreshToken = _tokenManager.GenerateRefreshToken(claims);

        return (accessToken, refreshToken);
    }
}
