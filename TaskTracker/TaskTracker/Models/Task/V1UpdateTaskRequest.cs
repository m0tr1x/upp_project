using TaskTracker.Bll.Enum;

namespace TaskTracker.Models.Task;

public class V1UpdateTaskRequest
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public CommonStatus? Status { get; set; }

    public TaskPriority? Priority { get; set; }

    public DateOnly? DueDate { get; set; }

    public int? ProjectId { get; set; }
}