namespace TaskTracker.Models.Auth;

public class AuthResult
{
    public bool Success { get; set; }

    public string? AccessToken { get; set; } = null!;

    public string? RefreshToken { get; set; } = null!;

    public string? ErrorMessage { get; set; } = null!;
}
