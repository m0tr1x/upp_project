using TaskTracker.Bll.Models;
using TaskTracker.Models.Project;

namespace TaskTracker.Bll.Services.Interfaces;

public interface IProjectService
{
    Task<List<V1GetProjectResponse>> GetProjects(CancellationToken token);

    Task<int> AddProject(Project project, CancellationToken token);

    Task<int> UpdateProject(V1UpdateProjectRequest project, CancellationToken token);

    Task<Project> GetProject(int projectId, CancellationToken token);

    Task<bool> CloseProject(int projectId, CancellationToken token);
}
