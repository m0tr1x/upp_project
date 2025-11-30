using TaskTracker.Bll.Enum;
using TaskTracker.Bll.Exceptions;
using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Repositories.Interfaces;
using TaskTracker.Models.User;

namespace TaskTracker.Bll.Services;

public class UserService(
    IUserRepository userRepository,
    ITeammateRepository teammateRepository) : IUserService
{
    public async Task<bool> DeleteUser(int userId, CancellationToken token)
    {
        return await userRepository.DeleteUserAsync(userId, token);
    }

    public async Task<Teammate> GetTeammate(int teammateId, CancellationToken token)
    {
        var teammate = await teammateRepository.GetTeammateAsync(teammateId, token)
            ?? throw new NotFoundException();

        return new Teammate
        {
            Id = teammate.Id,
            UserId = teammate.UserId,
            TeamId = teammate.TeamId,
            Role = (Role)teammate.Role,
            JoinedAt = teammate.JoinedAt,
        };
    }

    public async Task<User> GetUser(int userId, CancellationToken token)
    {
        var user = await userRepository.GetUserAsync(userId, token)
            ?? throw new NotFoundException();

        return new User
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsActive = user.IsActive,
        };
    }

    public async Task<bool> UpdateTeammate(V1UpdateTeammateRequest teammate, CancellationToken token)
    {
        var dbTeammate = await teammateRepository.GetTeammateAsync(teammate.Id, token)
            ?? throw new NotFoundException();

        if (teammate.Role != null)
            dbTeammate.Role = (int)teammate.Role;

        return await teammateRepository.UpdateTeammateAsync(dbTeammate, token);
    }

    public async Task<bool> UpdateUser(V1UpdateUserRequest user, CancellationToken token)
    {
        var dbUser = await userRepository.GetUserAsync(user.Id, token)
            ?? throw new NotFoundException();

        if (user.FirstName != null)
            dbUser.FirstName = user.FirstName;

        if (user.LastName != null)
            dbUser.LastName = user.LastName;

        return await userRepository.UpdateUserAsync(dbUser, token);
    }
}
