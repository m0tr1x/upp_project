namespace TaskTracker.Models.Team;

public class V1CreateTeamRequest
{

    public required string Name { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }
}
