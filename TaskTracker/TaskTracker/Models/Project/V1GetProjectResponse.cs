using TaskTracker.Bll.Enum;

namespace TaskTracker.Models.Project;

public class V1GetProjectResponse
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public CommonStatus Status { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int TeamId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public int CreatedByUserId { get; set; }
}

