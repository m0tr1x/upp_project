using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.Team;

namespace TaskTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/team")]
public class TeamController([FromServices] ITeamService teamService, IHttpContextAccessor accessor) : ControllerBase
{
    [HttpGet("teams")]
    [SwaggerOperation("Get all teams")]
    public async Task<List<V1GetTeamResponse>> V1GetTeams(CancellationToken token)
    {
        return await teamService.GetTeams(token);
    }

    [HttpGet("teams/{teamId}/users")]
    [SwaggerOperation("Get all users in a team")]
    public async Task<List<V1GetUsersForTeamResponse>> V1GetUsersByTeamId(
        int teamId,
        CancellationToken token)
    {
        var users = await teamService.GetUsersForTeam(teamId, token);

        return users;
    }

    [HttpPost("add")]
    [SwaggerOperation("Creates a new team")]
    public async Task<int> V1CreateTeam(
        [FromBody] V1CreateTeamRequest request,
        CancellationToken token)
    {
        var idStr = accessor.HttpContext?.User.FindFirst("userId")?.Value;

        int.TryParse(idStr, out var userId);
        return await teamService.CreateTeam(new Team
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = userId,
            CreatedAt = request.CreatedAt,
        }, token);
    }

    [HttpPost("add/teammate")]
    [SwaggerOperation("Adds a user to a team")]
    public async Task<int> V1AddTeammateToTeam(
        [FromBody] V1AddTeammateToTeamRequest request,
        CancellationToken token)
    {
        return await teamService.AddTeammateToTeam(new Teammate
        {
            TeamId = request.TeamId,
            Email = request.Email,
            Role = request.Role,
            JoinedAt = DateTime.Now
        }, token);
    }

    [HttpDelete("close")]
    [SwaggerOperation("Closes a team by ID")]
    public async Task<bool> V1CloseTeam([FromQuery] int id, CancellationToken token)
    {
        return await teamService.CloseTeam(id, token);
    }

    [HttpDelete("delete/teammate")]
    [SwaggerOperation("Removes a teammate from a team")]
    public async Task<bool> V1DeleteTeammateFromTeam(
        [FromQuery] int teammateId,
        CancellationToken token)
    {
        return await teamService.DeleteTeammateFromTeam(teammateId, token);
    }

    [HttpPut("update")]
    [SwaggerOperation("Updates team information")]
    public async Task<int> V1UpdateTeam(
        [FromBody] V1UpdateTeamRequest request,
        CancellationToken token)
    {
        return await teamService.UpdateTeam(request, token);
    }
}