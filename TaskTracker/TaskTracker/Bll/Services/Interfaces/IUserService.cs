using TaskTracker.Bll.Models;

namespace TaskTracker.Bll.Services.Interfaces;

public interface IUserService
{
    Task<bool> UpdateUser(User user, CancellationToken token);

    Task<User> GetUser(int userId, CancellationToken token);

    Task<bool> DeleteUser(int userId, CancellationToken token);
}
