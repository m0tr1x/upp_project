namespace TaskTracker.Models.User;

public class V1GetUserResponse
{
    public int Id { get; set; }

    public required string Email { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public bool IsActive { get; set; }
}
