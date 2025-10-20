using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class TeammateRepository : ITeammateRepository
{
    public Task<bool> AddTeammate(DbTeammate team, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> Deactivate(int teamId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<DbTeam> GetTeammate(int id, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateTeammate(DbTeammate team, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
