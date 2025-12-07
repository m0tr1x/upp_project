using TaskTracker.Bll.Enum;

namespace TaskTracker.Models.Project;

public class V1CreateProjectRequest
{
    public required string Name { get; set; }

    public string? Description { get; set; }

    public CommonStatus Status { get; set; }

    public int TeamId { get; set; }
}