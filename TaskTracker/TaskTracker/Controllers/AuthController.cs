using Microsoft.AspNetCore.Mvc;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.Auth;

namespace TaskTracker.Controllers
{
    /// <summary>
    /// Контроллер аутентификации: регистрация, логин, обновление токена
    /// </summary>
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Регистрация нового пользователя
        /// </summary>
        /// <param name="request">Данные для регистрации</param>
        /// <returns>Объект AuthResult с токенами или ошибкой</returns>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResult), 200)]
        [ProducesResponseType(typeof(AuthResult), 400)]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
        {
            var token = HttpContext.RequestAborted;
            AuthResult result = await _authService.RegisterAsync(request, token);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Логин пользователя
        /// </summary>
        /// <param name="request">Email и пароль</param>
        /// <returns>Объект AuthResult с токенами или ошибкой</returns>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResult), 200)]
        [ProducesResponseType(typeof(AuthResult), 401)]
        public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
        {
            var token = HttpContext.RequestAborted;
            AuthResult result = await _authService.LoginAsync(request, token);
            if (!result.Success) return Unauthorized(result);
            return Ok(result);
        }

        /// <summary>
        /// Обновление access-токена по refresh-токену
        /// </summary>
        /// <param name="refreshToken">Refresh-токен</param>
        /// <returns>Новые токены или ошибка</returns>
        [HttpPost("refresh")]
        [ProducesResponseType(typeof(AuthResult), 200)]
        [ProducesResponseType(typeof(AuthResult), 401)]
        public async Task<IActionResult> RefreshAsync([FromBody] string refreshToken)
        {
            var token = HttpContext.RequestAborted;
            AuthResult result = await _authService.RefreshTokenAsync(refreshToken, token);
            if (!result.Success) return Unauthorized(result);
            return Ok(result);
        }
    }
}
