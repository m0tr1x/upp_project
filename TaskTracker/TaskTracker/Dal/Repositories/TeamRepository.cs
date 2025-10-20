using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class TeamRepository : ITeamRepository
{
    public Task<bool> AddTeam(DbTeam team, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> CloseTeam(int teamId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateTeam(DbTeam team, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    Task<DbTeam> ITeamRepository.GetTeam(int teamId, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
