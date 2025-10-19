using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;

namespace TaskTracker.Bll.Services;

public class UserService : IUserService
{
    public Task<bool> DeleteUser(int userId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<User> GetUser(int userId, CancellationToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateUser(User user, CancellationToken token)
    {
        throw new NotImplementedException();
    }
}
