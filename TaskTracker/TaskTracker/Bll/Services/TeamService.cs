using TaskTracker.Bll.Exceptions;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Models.Team;

namespace TaskTracker.Bll.Services;

public class TeamService(
    ITeamRepository teamRepository,
    ITeammateRepository teammateRepository) : ITeamService
{
    public async Task<bool> AddTeammateToTeam(Teammate teammate, CancellationToken token)
    {
        return await teammateRepository.AddTeammateAsync(new DbTeammate
        {
            UserId = teammate.UserId,
            TeamId = teammate.TeamId,
            Role = (int)teammate.Role,
            JoinedAt = teammate.JoinedAt
        }, token);
    }

    public async Task<int> CreateTeam(Team team, CancellationToken token)
    {
        return await teamRepository.CreateTeamAsync(new DbTeam
        {
            Name = team.Name,
            Description = team.Description,
            OwnerId = team.OwnerId,
            CreatedAt = team.CreatedAt,
        }, token);
    }

    public async Task<bool> CloseTeam(int teamId, CancellationToken token)
    {
        return await teamRepository.CloseTeamAsync(teamId, token);
    }

    public async Task<bool> DeleteTeammateFromTeam(int teammateId, CancellationToken token)
    {
        return await teammateRepository.DeactivateAsync(teammateId, token);
    }

    public async Task<Team> GetTeam(int teamId, CancellationToken token)
    {
        var dbTeam = await teamRepository.GetTeamAsync(teamId, token)
            ?? throw new NotFoundException();

        return new Team
        {
            Id = dbTeam.Id,
            Name = dbTeam.Name,
            Description = dbTeam.Description,
            OwnerId = dbTeam.OwnerId,
            CreatedAt = dbTeam.CreatedAt,
        };
    }

    public async Task<bool> UpdateTeam(V1UpdateTeamRequest team, CancellationToken token)
    {
        var dbTeam = await teamRepository.GetTeamAsync(team.Id, token)
            ?? throw new NotFoundException();

        if (team.Name != null)
            dbTeam.Name = team.Name;

        if (team.Description != null)
            dbTeam.Description = team.Description;

        if (team.OwnerId != null)
            dbTeam.OwnerId = (int)team.OwnerId;

        return await teamRepository.UpdateTeamAsync(dbTeam, token);
    }
}
