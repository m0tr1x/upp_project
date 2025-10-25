using System.ComponentModel.DataAnnotations;

namespace TaskTracker.Bll.DTOs
{
    public class LoginRequest
    {
        [Required(AllowEmptyStrings = false)]
        public string Email { get; set; } = null!;

        [Required(AllowEmptyStrings = false)]
        public string Password { get; set; } = null!;
    }
}
