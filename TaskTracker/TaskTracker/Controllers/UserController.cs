using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskTracker.Bll.Services.Interfaces;

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
}
