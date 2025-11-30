namespace TaskTracker.Models.Team;

public class V1CreateTeamRequest
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public int OwnerId { get; set; }

    public DateTime CreatedAt { get; set; }
}
