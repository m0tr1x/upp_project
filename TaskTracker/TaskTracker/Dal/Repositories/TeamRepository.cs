using Supabase;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class TeamRepository(Client client) : ITeamRepository
{
    private readonly Client _client = client;

    public async Task<int> CreateTeamAsync(DbTeam team, CancellationToken token)
    {
        var response = await _client
            .From<DbTeam>()
            .Insert(team, cancellationToken: token);

        return response.Models.First().Id;
    }

    public async Task<bool> CloseTeamAsync(int teamId, CancellationToken token)
    {
        await _client
            .From<DbTeam>()
            .Where(t => t.Id == teamId)
            .Delete(cancellationToken: token);

        return true;
    }

    public async Task<bool> UpdateTeamAsync(DbTeam team, CancellationToken token)
    {
        var response = await _client
            .From<DbTeam>()
            .Where(t => t.Id == team.Id)
            .Update(team, cancellationToken: token);

        return response.Models.Count > 0;
    }

    public async Task<DbTeam?> GetTeamAsync(int teamId, CancellationToken token)
    {
        var response = await _client
            .From<DbTeam>()
            .Where(t => t.Id == teamId)
            .Single(cancellationToken: token);

        return response ?? null;
    }
}
