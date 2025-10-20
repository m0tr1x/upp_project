using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface IProjectRepository
{
    Task<bool> AddProject(DbProject project, CancellationToken token);

    Task<bool> UpdateProject(DbProject project, CancellationToken token);

    Task<DbProject> GetProject(int projectId, CancellationToken token);

    Task<bool> CloseProject(int projectId, CancellationToken token);
}
