using System.ComponentModel.DataAnnotations;

namespace TaskTracker.Bll.DTOs;

public class RegisterRequest
{
    [Required(AllowEmptyStrings = false)]
    public string Email { get; set; } = null!;

    [Required(AllowEmptyStrings = false)]
    public string Password { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }
}
