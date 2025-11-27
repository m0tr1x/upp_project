using Microsoft.AspNetCore.Identity.Data;
using TaskTracker.Models.Auth;
using LoginRequest = TaskTracker.Models.Auth.LoginRequest;
using RegisterRequest = TaskTracker.Models.Auth.RegisterRequest;

namespace TaskTracker.Bll.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken token);
        Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken token);
        Task<AuthResult> RefreshTokenAsync(string refreshToken, CancellationToken token);
    }
}
