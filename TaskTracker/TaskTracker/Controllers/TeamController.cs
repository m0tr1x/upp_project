using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskTracker.Bll.Services.Interfaces;

namespace TaskTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/team")]
public class TeamController([FromServices] ITeamService teamService) : ControllerBase
{
    [HttpPost("add/teammate")]
    [SwaggerOperation("Добавление пользователя в команду")]
    public async Task<bool> V1AddTeammateToTeam(
        [FromQuery] int teamId,
        [FromQuery] int userId,
        CancellationToken token)
    {
        return await teamService.AddTeammateToTeam(teamId, userId, token);
    }

    [HttpDelete("close")]
    [SwaggerOperation("Закрытие команды по id")]
    public async Task<bool> V1CloseTeam([FromQuery] int id, CancellationToken token)
    {
        return await teamService.CloseTeam(id, token);
    }

    [HttpDelete("delete/user")]
    [SwaggerOperation("Удаление пользователя из команды")]
    public async Task<bool> V1DeleteTeammateFromTeam(
        [FromQuery] int teammateId,
        CancellationToken token)
    {
        return await teamService.DeleteTeammateFromTeam(teammateId, token);
    }
}
