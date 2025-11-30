namespace TaskTracker.Bll.Models;

public class User
{
    public int Id { get; set; }

    public required string Email { get; set; }

    public string? PasswordHash { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public bool IsActive { get; set; }
}
