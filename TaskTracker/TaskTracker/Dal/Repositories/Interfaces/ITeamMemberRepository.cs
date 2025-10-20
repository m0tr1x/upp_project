using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface ITeammateRepository
{
    Task<bool> AddTeammate(DbTeammate team, CancellationToken token);

    Task<DbTeam> GetTeammate(int id, CancellationToken token);

    Task<bool> UpdateTeammate(DbTeammate team, CancellationToken token);

    Task<bool> Deactivate(int teamId, CancellationToken token);
}
