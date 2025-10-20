using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class UserRepository : IUserRepository
{
    public Task<bool> AddUser(DbUser user, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteUser(int userId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<DbUser> GetUser(int userId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateUser(DbUser user, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
