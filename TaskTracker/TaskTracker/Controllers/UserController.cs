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
    [SwaggerOperation("�������� ������ �� id")]
    public async Task<bool> V1DeleteUser([FromQuery] int id, CancellationToken token)
    {
        return await userService.DeleteUser(id, token);
    }

    [HttpGet("get")]
    [SwaggerOperation("��������� ������������ �� id")]
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

    [HttpPut("update")]
    [SwaggerOperation("���������� ������������")]
    public async Task<bool> V1UpdateUser([FromBody] V1UpdateUserRequest request, CancellationToken token)
    {
        return await userService.UpdateUser(request, token);
    }

    [HttpGet("get/teammate")]
    [SwaggerOperation("��������� ��������� ������� �� id")]
    public async Task<V1GetTeammateResponse> V1GetTeammate([FromQuery] int teammateId, CancellationToken token)
    {
        var teammate = await userService.GetTeammate(teammateId, token);

        return new V1GetTeammateResponse
        {
            Id = teammate.Id,
            UserId = teammate.UserId,
            TeamId = teammate.TeamId,
            Role = teammate.Role,
            JoinedAt = teammate.JoinedAt,
        };
    }

    [HttpPut("update/teammate")]
    [SwaggerOperation("���������� ��������� �������")]
    public async Task<bool> V1UpdateTeammate([FromBody] V1UpdateTeammateRequest request, CancellationToken token)
    {
        return await userService.UpdateTeammate(request, token);
    }
}
