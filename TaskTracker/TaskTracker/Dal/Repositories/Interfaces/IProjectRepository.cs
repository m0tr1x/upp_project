using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface IProjectRepository
{
    Task<int> AddProjectAsync(DbProject project, CancellationToken token);

    Task<bool> UpdateProjectAsync(DbProject project, CancellationToken token);

    Task<DbProject?> GetProjectAsync(int projectId, CancellationToken token);

    Task<bool> CloseProjectAsync(int projectId, CancellationToken token);
}
