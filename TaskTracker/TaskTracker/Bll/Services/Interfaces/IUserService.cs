using TaskTracker.Bll.Models;
using TaskTracker.Models.User;

namespace TaskTracker.Bll.Services.Interfaces;

public interface IUserService
{
    Task<int> UpdateUser(V1UpdateUserRequest user, CancellationToken token);

    Task<User> GetUser(int userId, CancellationToken token);

    Task<bool> DeleteUser(int userId, CancellationToken token);

    Task<Teammate> GetTeammate(int teammateId, CancellationToken token);

    Task<int> UpdateTeammate(V1UpdateTeammateRequest team, CancellationToken token);
}
