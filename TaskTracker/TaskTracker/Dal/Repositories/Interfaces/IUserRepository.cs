using TaskTracker.Dal.Models;

namespace TaskTracker.Dal.Repositories.Interfaces;

public interface IUserRepository
{
    Task<bool> AddUser(DbUser user, CancellationToken token);

    Task<bool> UpdateUser(DbUser user, CancellationToken token);

    Task<DbUser> GetUser(int userId, CancellationToken token);

    Task<bool> DeleteUser(int userId, CancellationToken token);
}
