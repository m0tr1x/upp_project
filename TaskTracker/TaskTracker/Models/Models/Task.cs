namespace TaskTracker.Bll.Models;

public class Task
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public TaskStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateOnly? DueDate { get; set; }

    public float? EstimateHours { get; set; }

    public float? ActualHours { get; set; }

    public int ProjectId { get; set; }

    public int? AssigneeId { get; set; }

    public int ReporterId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

public enum TaskStatus
{
    Todo,
    InProgress,
    Done
}

public enum TaskPriority
{
    Low,
    Medium,
    High
}
