using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface ITeamRepository
{
    Task<bool> AddTeam(DbTeam team, CancellationToken token);

    Task<DbTeam> GetTeam(int teamId, CancellationToken token);

    Task<bool> UpdateTeam(DbTeam team, CancellationToken token);

    Task<bool> CloseTeam(int teamId, CancellationToken token);
}
