using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Bll.Services;

public class TeamService(
    ITeamRepository teamRepository,
    ITeammateRepository teammateRepository) : ITeamService
{
    public Task<bool> AddTeammateToTeam(int teamId, int userId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> AddTeam(Team team, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> CloseTeam(int teamId, CancellationToken token)
    {
        return await teamRepository.CloseTeamAsync(teamId, token);
    }

    public async Task<bool> DeleteTeammateFromTeam(int teammateId, CancellationToken token)
    {
        return await teammateRepository.DeactivateAsync(teammateId, token);
    }

    public Task<Team> GetTeam(int teamId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateTeam(Team team, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
