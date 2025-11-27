using TaskTracker.Bll.Models;

namespace TaskTracker.Models.Project;

public class V1GetProjectRequest
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public TaskStatus Status { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int TeamId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public int CreatedByUserId { get; set; }
}

