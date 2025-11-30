using TaskTracker.Bll.Models;
using TaskTracker.Bll.Services.Interfaces;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Bll.Services;

public class UserService(IUserRepository userRepository) : IUserService
{
    public async Task<bool> DeleteUser(int userId, CancellationToken token)
    {
        return await userRepository.DeleteUserAsync(userId, token);
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
