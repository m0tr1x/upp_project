using System.ComponentModel.DataAnnotations;

namespace TaskTracker.Models.Auth;

public class LoginRequest
{
    [Required(AllowEmptyStrings = false)]
    public string Email { get; set; } = null!;

    [Required(AllowEmptyStrings = false)]
    public string Password { get; set; } = null!;
}
