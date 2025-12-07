using TaskTracker.Bll.Models;
using TaskTracker.Models.Team;

namespace TaskTracker.Bll.Services.Interfaces;

public interface ITeamService
{
    Task<List<V1GetUsersForTeamResponse>> GetUsersForTeam(int teamId, CancellationToken token);

    Task<List<V1GetTeamResponse>> GetTeams(CancellationToken token);

    Task<int> CreateTeam(Team team, CancellationToken token);

    Task<Team> GetTeam(int teamId, CancellationToken token);

    Task<int> UpdateTeam(V1UpdateTeamRequest team, CancellationToken token);

    Task<bool> CloseTeam(int teamId, CancellationToken token);

    Task<int> AddTeammateToTeam(Teammate teammate, CancellationToken token);

    Task<bool> DeleteTeammateFromTeam(int teammateId, CancellationToken token);
}
