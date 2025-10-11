using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace TaskTracker.Models
{
    [Table("tasks")]
    public class Task : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("title")]
        public string Title { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        [Column("status")]
        public TaskStatus Status { get; set; } = TaskStatus.Todo;

        [Column("priority")]
        public TaskPriority Priority { get; set; } = TaskPriority.Low;

        [Column("due_date")]
        public DateOnly? DueDate { get; set; }

        [Column("estimate_hours")]
        public float? EstimateHours { get; set; }

        [Column("actual_hours")]
        public float? ActualHours { get; set; }

        [Column("project_id")]
        public int ProjectId { get; set; }

        [Column("assignee_id")]
        public int? AssigneeId { get; set; }

        [Column("reporter_id")]
        public int? ReporterId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
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
