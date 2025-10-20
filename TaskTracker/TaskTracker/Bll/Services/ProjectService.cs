using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;

namespace TaskTracker.Bll.Services;

public class ProjectService: IProjectService
{
    public Task<bool> AddProject(Project project, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> CloseProject(int projectId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<Project> GetProject(int projectId, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
