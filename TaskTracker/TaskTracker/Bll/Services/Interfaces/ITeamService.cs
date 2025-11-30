using TaskTracker.Bll.Models;

namespace TaskTracker.Bll.Services.Interfaces;

public interface ITeamService
{
    Task<bool> AddTeam(Team team, CancellationToken token);

    Task<Team> GetTeam(int teamId, CancellationToken token);

    Task<bool> UpdateTeam(Team team, CancellationToken token);

    Task<bool> CloseTeam(int teamId, CancellationToken token);

    Task<bool> AddTeammateToTeam(int teamId, int userId, CancellationToken token);

    Task<bool> DeleteTeammateFromTeam(int teammateId, CancellationToken token);
}
