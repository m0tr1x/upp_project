namespace TaskTracker.Models.Team;

public class V1UpdateTeamRequest
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public int? OwnerId { get; set; }
}
