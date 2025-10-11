using Supabase.Postgrest.Attributes;
using System.ComponentModel.DataAnnotations;

namespace TaskTracker.DTOs
{
    public class CreateUserDTO
    {
        [Required(AllowEmptyStrings = false)]
        public string Email { get; set; } = null!;

        [Required(AllowEmptyStrings = false)]
        public string Password{ get; set; } = null!;
    }
}
