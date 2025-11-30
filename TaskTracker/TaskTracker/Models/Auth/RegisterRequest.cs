using System.ComponentModel.DataAnnotations;

namespace TaskTracker.Models.Auth;

public class RegisterRequest
{
    [Required(AllowEmptyStrings = false)]
    public required string Email { get; set; }

    [Required(AllowEmptyStrings = false)]
    public required string Password { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }
}
