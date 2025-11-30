using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.Team;

namespace TaskTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/team")]
public class TeamController([FromServices] ITeamService teamService) : ControllerBase
{
    [HttpPost("add")]
    [SwaggerOperation("Добавление команды")]
    public async Task<int> V1CreateTeam(
        [FromBody] V1CreateTeamRequest request,
        CancellationToken token)
    {
        return await teamService.CreateTeam(new Team
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = request.OwnerId,
            CreatedAt = request.CreatedAt,
        }, token);
    }

    [HttpPost("add/teammate")]
    [SwaggerOperation("Добавление пользователя в команду")]
    public async Task<bool> V1AddTeammateToTeam(
        [FromBody] V1AddTeammateToTeamRequest request,
        CancellationToken token)
    {
        return await teamService.AddTeammateToTeam(new Teammate
        {
            TeamId = request.TeamId,
            UserId = request.UserId,
            Role = request.Role,
            JoinedAt = DateTimeOffset.Now
        }, token);
    }

    [HttpDelete("close")]
    [SwaggerOperation("Закрытие команды по id")]
    public async Task<bool> V1CloseTeam([FromQuery] int id, CancellationToken token)
    {
        return await teamService.CloseTeam(id, token);
    }

    [HttpDelete("delete/teammate")]
    [SwaggerOperation("Удаление пользователя из команды")]
    public async Task<bool> V1DeleteTeammateFromTeam(
        [FromQuery] int teammateId,
        CancellationToken token)
    {
        return await teamService.DeleteTeammateFromTeam(teammateId, token);
    }

    [HttpPut("update")]
    [SwaggerOperation("Удаление пользователя из команды")]
    public async Task<bool> V1UpdateTeam(
        [FromBody] V1UpdateTeamRequest request,
        CancellationToken token)
    {
        return await teamService.UpdateTeam(request, token);
    }
}