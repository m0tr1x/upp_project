using Supabase;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class TeammateRepository : ITeammateRepository
{
    private readonly Client _client;

    public TeammateRepository(Client client)
    {
        _client = client;
    }

    public async Task<bool> AddTeammateAsync(DbTeammate teammate, CancellationToken token)
    {
        var response = await _client
            .From<DbTeammate>()
            .Insert(teammate, cancellationToken: token);

        return response.Models.Count > 0;
    }

    public async Task<bool> DeactivateAsync(int teammateId, CancellationToken token)
    {
        await _client
            .From<DbTeammate>()
            .Where(t => t.Id == teammateId)
            .Delete(cancellationToken: token);

        return true;
    }

    public async Task<DbTeammate?> GetTeammateAsync(int id, CancellationToken token)
    {
        var response = await _client
            .From<DbTeammate>()
            .Where(t => t.Id == id)
            .Single(cancellationToken: token);

        return response ?? null;
    }

    public async Task<bool> UpdateTeammateAsync(DbTeammate teammate, CancellationToken token)
    {
        var response = await _client
            .From<DbTeammate>()
            .Where(t => t.Id == teammate.Id)
            .Update(teammate, cancellationToken: token);

        return response.Models.Count > 0;
    }
}
