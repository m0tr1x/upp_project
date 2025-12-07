using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface ITeammateRepository
{
    Task<List<DbTeammate>> GetUsersByTeamIdAsync(int teamId, CancellationToken token);

    Task<bool> AddTeammateAsync(DbTeammate team, string email, CancellationToken token);

    Task<DbTeammate?> GetTeammateAsync(int id, CancellationToken token);

    Task<bool> UpdateTeammateAsync(DbTeammate team, CancellationToken token);

    Task<bool> DeactivateAsync(int teammateId, CancellationToken token);
}
