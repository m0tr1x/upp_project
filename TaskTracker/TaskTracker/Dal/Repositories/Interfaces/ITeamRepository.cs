using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface ITeamRepository
{
    Task<List<DbTeam>> GetAllTeams(CancellationToken token);

    Task<int> CreateTeamAsync(DbTeam team, CancellationToken token);

    Task<DbTeam?> GetTeamAsync(int teamId, CancellationToken token);

    Task<bool> UpdateTeamAsync(DbTeam team, CancellationToken token);

    Task<bool> CloseTeamAsync(int teamId, CancellationToken token);
}
