using TaskTracker.Bll.Enum;

namespace TaskTracker.Bll.Models;

public class Task
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public CommonStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateOnly? DueDate { get; set; }

    public float? EstimateHours { get; set; }

    public float? ActualHours { get; set; }

    public int ProjectId { get; set; }

    public int? AssigneeId { get; set; }

    public int ReporterId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }
}

public enum TaskPriority
{
    Low,
    Medium,
    High
}
