using Supabase;
using TaskTracker.Bll.Enum;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class ProjectRepository(Client client) : IProjectRepository
{
    private readonly Client _client = client;

    public async Task<List<DbProject>> GetAllProjects(CancellationToken token)
    {
        var response = await _client
            .From<DbProject>()
            .Get(token);

        return response.Models;
    }

    public async Task<int> AddProjectAsync(DbProject project, CancellationToken token)
    {
        var response = await _client
            .From<DbProject>()
            .Insert(project, cancellationToken: token);

        return response.Models.First().Id;
    }

    public async Task<bool> CloseProjectAsync(int projectId, CancellationToken token)
    {
        var project = await _client
            .From<DbProject>()
            .Where(p => p.Id == projectId)
            .Single(cancellationToken: token);

        if (project == null)
            return false;

        var updatePayload = new DbProject
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = (int)CommonStatus.Done,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            TeamId = project.TeamId,
            CreatedAt = project.CreatedAt,
            CreatedByUserId = project.CreatedByUserId
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

    public async Task<int> UpdateProjectAsync(DbProject project, CancellationToken token)
    {
        var response = await _client
            .From<DbProject>()
            .Where(p => p.Id == project.Id)
            .Update(project, cancellationToken: token);

        return response.Models.First().Id;
    }
}
