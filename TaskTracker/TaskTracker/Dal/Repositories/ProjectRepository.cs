using Supabase;
using TaskTracker.Bll.Enum;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class ProjectRepository(Client client) : IProjectRepository
{
    private readonly Client _client = client;

    public async Task<int> AddProjectAsync(DbProject project, CancellationToken token)
    {
        var response = await _client
            .From<DbProject>()
            .Insert(project, cancellationToken: token);

        return response.Models.First().Id;
    }

    public async Task<bool> CloseProjectAsync(int projectId, CancellationToken token)
    {
        var updatePayload = new DbProject
        {
            Id = projectId,
            Status = (int)CommonStatus.Done,
        };

        var response = await _client
            .From<DbProject>()
            .Where(p => p.Id == projectId)
            .Update(updatePayload, cancellationToken: token);

        return response.Models.Count > 0;
    }

    public async Task<DbProject?> GetProjectAsync(int projectId, CancellationToken token)
    {
        var response = await _client
            .From<DbProject>()
            .Where(p => p.Id == projectId)
            .Single(cancellationToken: token);

        return response ?? null;
    }

    public async Task<bool> UpdateProjectAsync(DbProject project, CancellationToken token)
    {
        var response = await _client
            .From<DbProject>()
            .Where(p => p.Id == project.Id)
            .Update(project, cancellationToken: token);

        return response.Models.Count > 0;
    }
}
