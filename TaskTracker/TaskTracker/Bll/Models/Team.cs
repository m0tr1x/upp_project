namespace TaskTracker.Bll.Models;

public class Team
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public int OwnerId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
