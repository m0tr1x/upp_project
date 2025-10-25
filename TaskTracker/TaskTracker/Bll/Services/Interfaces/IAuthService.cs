using Microsoft.AspNetCore.Identity.Data;
using TaskTracker.Bll.DTOs;
using LoginRequest = TaskTracker.Bll.DTOs.LoginRequest;
using RegisterRequest = TaskTracker.Bll.DTOs.RegisterRequest;

namespace TaskTracker.Bll.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken token);
        Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken token);
        Task<AuthResult> RefreshTokenAsync(string refreshToken, CancellationToken token);
    }
}
