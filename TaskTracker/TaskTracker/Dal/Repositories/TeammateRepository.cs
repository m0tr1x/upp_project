using Supabase;
using TaskTracker.Bll.Exceptions;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class TeammateRepository(Client client) : ITeammateRepository
{
    private readonly Client _client = client;

    public async Task<List<DbTeammate>> GetUsersByTeamIdAsync(int teamId, CancellationToken token)
    {
        var response = await _client
        .From<DbTeammate>()
        .Where(t => t.TeamId == teamId)
        .Get(cancellationToken: token);

        return response.Models;
    }


    public async Task<int> AddTeammateAsync(DbTeammate teammate, string email, CancellationToken token)
    {
        var user = await _client
            .From<DbUser>()
            .Where(u => u.Email == email)
            .Single(cancellationToken: token);

        if (user == null)
            throw new NotFoundException();

        teammate.UserId = user.Id;

        var response = await _client
            .From<DbTeammate>()
            .Insert(teammate, cancellationToken: token);

        return response.Models.First().Id;
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

    public async Task<int> UpdateTeammateAsync(DbTeammate teammate, CancellationToken token)
    {
        var response = await _client
            .From<DbTeammate>()
            .Where(t => t.Id == teammate.Id)
            .Update(teammate, cancellationToken: token);

        return response.Models.First().Id;
    }
}
