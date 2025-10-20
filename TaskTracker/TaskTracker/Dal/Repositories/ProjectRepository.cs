using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class ProjectRepository : IProjectRepository
{
    public Task<bool> AddProject(DbProject project, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> CloseProject(int projectId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<DbProject> GetProject(int projectId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateProject(DbProject project, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
