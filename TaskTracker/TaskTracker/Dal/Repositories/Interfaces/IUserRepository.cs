using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface IUserRepository
{
    Task<bool> AddUserAsync(DbUser user, CancellationToken token);

    Task<int> UpdateUserAsync(DbUser user, CancellationToken token);

    Task<DbUser?> GetUserAsync(int userId, CancellationToken token);

    Task<bool> DeleteUserAsync(int userId, CancellationToken token);

    Task<DbUser?> GetUserByEmailAsync(string email, CancellationToken token);
}
