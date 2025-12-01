using Microsoft.AspNetCore.Http;
using TaskTracker.Bll.Enum;
using TaskTracker.Bll.Exceptions;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Models.Project;

namespace TaskTracker.Bll.Services;

public class ProjectService(IProjectRepository projectRepository, IHttpContextAccessor context) : IProjectService
{
    public async Task<List<V1GetProjectResponse>> GetProjects(CancellationToken token)
    {
        var projects = await projectRepository.GetAllProjects(token);

        return projects.Select(p => new V1GetProjectResponse
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Status = (CommonStatus)p.Status,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            TeamId = p.TeamId,
            CreatedAt = p.CreatedAt,
            CreatedByUserId = p.CreatedByUserId
        }).ToList();
    }

    public async Task<int> AddProject(Project project, CancellationToken token)
    {
        var userIdClaim = context.HttpContext?.User?.FindFirst("userId")?.Value;
        int.TryParse(userIdClaim, out var userId);

        return await projectRepository.AddProjectAsync(new DbProject
        {
            Name = project.Name,
            Description = project.Description,
            Status = (int)project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            TeamId = project.TeamId,
            CreatedAt = project.CreatedAt,
            CreatedByUserId = userId,
        }, token);
    }

    public async Task<bool> CloseProject(int projectId, CancellationToken token)
    {
        return await projectRepository.CloseProjectAsync(projectId, token);
    }

    public async Task<Project> GetProject(int projectId, CancellationToken token)
    {
        var dbProject = await projectRepository.GetProjectAsync(projectId, token)
            ?? throw new NotFoundException();

        return new Project
        {
            Id = dbProject.Id,
            Name = dbProject.Name!,
            Description = dbProject.Description,
            Status = (CommonStatus)dbProject.Status,
            StartDate = dbProject.StartDate,
            EndDate = dbProject.EndDate,
            TeamId = dbProject.TeamId,
            CreatedAt= dbProject.CreatedAt,
            CreatedByUserId = dbProject.CreatedByUserId,
        };
    }

    public async Task<bool> UpdateProject(V1UpdateProjectRequest project, CancellationToken token)
    {
        var dbProject = await projectRepository.GetProjectAsync(project.Id, token)
            ?? throw new NotFoundException();

        if (project.Name != null)
            dbProject.Name = project.Name;

        if (project.Description != null)
            dbProject.Description = project.Description;

        if (project.Status != null)
            dbProject.Status = (int)project.Status;

        if (project.TeamId != null)
            dbProject.TeamId = (int)project.TeamId;

        return await projectRepository.UpdateProjectAsync(dbProject, token);
    }
}
