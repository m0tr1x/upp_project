using Supabase;
using TaskTracker.DTOs;
using TaskTracker.Models;

namespace TaskTracker.Services
{
    public class TestService
    {
        private readonly Client _supabaseClient;

        public TestService(Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<bool> CreateUserAsync(CreateUserDTO user)
        {
            var createUserDto = new User
            {
                Email = user.Email,
                PasswordHash = user.Password
            };

            var insertResponse = await _supabaseClient
                .From<User>()
                .Insert(createUserDto);

            return insertResponse.Models.Any();
        }
    }
}
