using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.Project;

namespace TaskTracker.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/project")]
public class ProjectController([FromServices] IProjectService projectService) : ControllerBase
{
    [HttpPost("create")]
    [SwaggerOperation("Creates a new project")]
    public async Task<long> V1CreateProject([FromBody] V1CreateProjectRequest request, CancellationToken token)
    {
        return await projectService.AddProject(new Project
        {
            Name = request.Name,
            Description = request.Description,
            Status = request.Status,
            TeamId = request.TeamId,
            CreatedAt = DateTimeOffset.Now,
            CreatedByUserId = request.CreatedByUserId
        }, token);
    }

    [HttpPut("update")]
    [SwaggerOperation("Updates a project")]
    public async Task<bool> V1UpdateProject([FromBody] V1UpdateProjectRequest request, CancellationToken token)
    {
        return await projectService.UpdateProject(request, token);
    }

    [HttpDelete("close")]
    [SwaggerOperation("Closes a project by ID")]
    public async Task<bool> V1CloseProject([FromQuery] int id, CancellationToken token)
    {
        return await projectService.CloseProject(id, token);
    }

    [HttpGet("get")]
    [SwaggerOperation("Gets a project by ID")]
    public async Task<V1GetProjectResponse> V1GetProject([FromQuery] int id, CancellationToken token)
    {
        var project = await projectService.GetProject(id, token);

        return new V1GetProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            TeamId = project.TeamId,
            CreatedAt = project.CreatedAt,
            CreatedByUserId = project.CreatedByUserId
        };
    }
}
