using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface IProjectRepository
{
    Task<List<DbProject>> GetAllProjects(CancellationToken token);
    Task<int> AddProjectAsync(DbProject project, CancellationToken token);

    Task<int> UpdateProjectAsync(DbProject project, CancellationToken token);

    Task<DbProject?> GetProjectAsync(int projectId, CancellationToken token);

    Task<bool> CloseProjectAsync(int projectId, CancellationToken token);
}
