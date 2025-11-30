using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace TaskTracker.Dal.Models;

[Table("tasks")]
public class DbTask : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("title")]
    public string Title { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("status")]
    public int Status { get; set; }

    [Column("priority")]
    public int Priority { get; set; }

    [Column("due_date")]
    public DateOnly? DueDate { get; set; }

    [Column("project_id")]
    public int ProjectId { get; set; }

    [Column("assignee_id")]
    public int? AssigneeId { get; set; }

    [Column("reporter_id")]
    public int ReporterId { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTimeOffset? UpdatedAt { get; set; }
}