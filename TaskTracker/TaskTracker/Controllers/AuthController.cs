using Microsoft.AspNetCore.Mvc;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.Auth;

namespace TaskTracker.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<AuthResult> RegisterAsync(
        [FromBody] RegisterRequest request,
        CancellationToken token)
    {
        return await authService.RegisterAsync(request, token);
    }

    [HttpPost("login")]
    public async Task<AuthResult> LoginAsync(
        [FromBody] LoginRequest request,
         CancellationToken token)
    {
        return await authService.LoginAsync(request, token);
    }

    [HttpPost("refresh")]
    public async Task<AuthResult> RefreshAsync(
        [FromBody] string refreshToken,
        CancellationToken token)
    {
        return await authService.RefreshTokenAsync(refreshToken, token);
    }
}