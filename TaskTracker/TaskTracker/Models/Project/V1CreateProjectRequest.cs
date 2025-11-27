using TaskTracker.Bll.Models;

namespace TaskTracker.Models.Project;

public class V1CreateProjectRequest
{
    public required string Name { get; set; }

    public string? Description { get; set; }

    public TaskStatus Status { get; set; }

    public int TeamId { get; set; }

    public int CreatedByUserId { get; set; }
}