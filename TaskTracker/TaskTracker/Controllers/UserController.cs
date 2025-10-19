using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTracker.Bll.Services.Interfaces;

namespace TaskTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/user")]
public class UserController([FromServices] IUserService userService) : ControllerBase
{

}
