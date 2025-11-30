using TaskTracker.Bll.Models;
using TaskTracker.Models.Team;

namespace TaskTracker.Bll.Services.Interfaces;

public interface ITeamService
{
    Task<int> CreateTeam(Team team, CancellationToken token);

    Task<Team> GetTeam(int teamId, CancellationToken token);

    Task<bool> UpdateTeam(V1UpdateTeamRequest team, CancellationToken token);

    Task<bool> CloseTeam(int teamId, CancellationToken token);

    Task<bool> AddTeammateToTeam(Teammate teammate, CancellationToken token);

    Task<bool> DeleteTeammateFromTeam(int teammateId, CancellationToken token);
}
