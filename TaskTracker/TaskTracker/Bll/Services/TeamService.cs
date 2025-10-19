using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;

namespace TaskTracker.Bll.Services;

public class TeamService : ITeamService
{
    public Task<bool> AddMemberForTeam(int teamId, int userId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> AddTeam(Team team, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> CloseTeam(int teamId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteMemberFromTeam(int teamId, int userId, CancellationToken token)
    {
        throw new NotImplementedException();
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
