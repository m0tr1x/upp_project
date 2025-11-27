using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Models.Project;

namespace TaskTracker.Bll.Services;

public class ProjectService: IProjectService
{
    public Task<int> AddProject(Project project, CancellationToken token)
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

    public Task<bool> UpdateProject(V1CreateProjectRequest project, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
