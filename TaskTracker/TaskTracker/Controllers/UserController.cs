using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.User;

namespace TaskTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/user")]
public class UserController([FromServices] IUserService userService) : ControllerBase
{
    [HttpDelete("delete")]
    [SwaggerOperation("Закрытие задачи по id")]
    public async Task<bool> V1DeleteUser([FromQuery] int id, CancellationToken token)
    {
        return await userService.DeleteUser(id, token);
    }

    [HttpGet("get")]
    [SwaggerOperation("Получение пользователя по id")]
    public async Task<V1GetUserResponse> V1GetUser([FromQuery] int id, CancellationToken token)
    {
        var user = await userService.GetUser(id, token);

        return new V1GetUserResponse
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive,
        };
    }

    [HttpGet("update")]
    [SwaggerOperation("Обновление пользователя")]
    public async Task<bool> V1UpdateUser([FromBody] V1UpdateUserRequest request, CancellationToken token)
    {
        return await userService.UpdateUser(request, token);
    }
}
