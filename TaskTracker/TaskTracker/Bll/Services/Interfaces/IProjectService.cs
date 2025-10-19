using TaskTracker.Bll.Models;

namespace TaskTracker.Bll.Services.Interfaces;

public interface IProjectService
{
    Task<bool> AddProject(Project project, CancellationToken token);

    Task<Project> GetProject(int projectId, CancellationToken token);

    Task<bool> CloseProject(int projectId, CancellationToken token);
}
