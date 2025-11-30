using TaskTracker.Bll.Exceptions;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Models.Project;

namespace TaskTracker.Bll.Services;

public class ProjectService(IProjectRepository projectRepository) : IProjectService
{
    public async Task<int> AddProject(Project project, CancellationToken token)
    {
        return await projectRepository.AddProjectAsync(new DbProject
        {
            Name = project.Name,
            Description = project.Description,
            Status = (int)project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            TeamId = project.TeamId,
            CreatedAt = project.CreatedAt,
            CreatedByUserId = project.CreatedByUserId,
        }, token);
    }

    public async Task<bool> CloseProject(int projectId, CancellationToken token)
    {
        return await projectRepository.CloseProjectAsync(projectId, token);
    }

    public async Task<Project> GetProject(int projectId, CancellationToken token)
    {
        var dbProject = await projectRepository.GetProjectAsync(projectId, token)
            ?? throw new NotFound();

        return new Project
        {
            Id = dbProject.Id,
            Name = dbProject.Name!,
            Description = dbProject.Description,

        };
    }

    public async Task<bool> UpdateProject(V1UpdateProjectRequest project, CancellationToken token)
    {
        var dbProject = await projectRepository.GetProjectAsync(project.Id, token)
            ?? throw new NotFound();

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
