namespace TaskTracker.Bll.Models;

public class TimeEntry
{
    public int Id { get; set; }

    public int TaskId { get; set; }

    public int UserId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public int DurationMinutes { get; set; }

    public string? Description { get; set; }

    public bool IsManual { get; set; }
}
