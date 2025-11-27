using TaskTracker.Bll.Models;

namespace TaskTracker.Models.Project;

public class V1UpdateProjectRequest
{
    public required string Name { get; set; }

    public string? Description { get; set; }

    public TaskStatus Status { get; set; }

    public int TeamId { get; set; }
}