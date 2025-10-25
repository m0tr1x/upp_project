using Supabase;
using TaskTracker.Dal.Models;
using TaskTracker.Dal.Repositories.Interfaces;

namespace TaskTracker.Dal.Repositories;

public class UserRepository : IUserRepository
{
    private readonly Client _client;

    public UserRepository(Client client)
    {
        _client = client;
    }

    public async Task<bool> AddUserAsync(DbUser user, CancellationToken token)
    {
        var response = await _client
            .From<DbUser>()
            .Insert(user, cancellationToken: token);

        return response.Models.Count > 0;
    }

    public async Task<bool> DeleteUserAsync(int userId, CancellationToken token)
    {
        await _client
            .From<DbUser>()
            .Where(u => u.Id == userId)
            .Delete(cancellationToken: token);

        return true;
    }

    public async Task<DbUser?> GetUserAsync(int userId, CancellationToken token)
    {
        var response = await _client
            .From<DbUser>()
            .Where(u => u.Id == userId)
            .Single(cancellationToken: token);

        return response ?? null;
    }

    public async Task<bool> UpdateUserAsync(DbUser user, CancellationToken token)
    {
        var response = await _client
            .From<DbUser>()
            .Where(u => u.Id == user.Id)
            .Update(user, cancellationToken: token);

        return response.Models.Count > 0;
    }
    public async Task<DbUser?> GetUserByEmailAsync(string email, CancellationToken token)
    {
        var response = await _client
            .From<DbUser>()
            .Where(u => u.Email == email)
            .Single(cancellationToken: token);

        return response ?? null;
    }
}
