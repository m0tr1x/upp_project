using Supabase;
using TaskTracker.Bll.Exceptions;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Models.Team;

namespace TaskTracker.Bll.Services;

public class TeamService(
    ITeamRepository teamRepository,
    ITeammateRepository teammateRepository, Client client) : ITeamService
{
    public async Task<List<V1GetUsersForTeamResponse>> GetUsersForTeam(int teamId, CancellationToken token)
    {
        var teammates = await teammateRepository.GetUsersByTeamIdAsync(teamId, token);

        var results = new List<V1GetUsersForTeamResponse>();

        foreach (var teammate in teammates)
        {
            var user = await client
                .From<DbUser>()
                .Where(u => u.Id == teammate.UserId)
                .Single(cancellationToken: token);

            if (user != null)
            {
                results.Add(new V1GetUsersForTeamResponse
                {
                    TeammateId = teammate.Id,
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                });
            }
        }

        return results;
    }

    public async Task<List<V1GetTeamResponse>> GetTeams(CancellationToken token)
    {
        var teams = await teamRepository.GetAllTeams(token);

        return teams.Select(t => new V1GetTeamResponse
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            OwnerId = t.OwnerId
        }).ToList();
    }

    public async Task<bool> AddTeammateToTeam(Teammate teammate, CancellationToken token)
    {
        return await teammateRepository.AddTeammateAsync(new DbTeammate
        {
            TeamId = teammate.TeamId,
            JoinedAt = teammate.JoinedAt
        }, teammate.Email, token);
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
