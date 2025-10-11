using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace TaskTracker.Models
{
    [Table("time_entries")]
    public class TimeEntry : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("task_id")]
        public int TaskId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime EndTime { get; set; }

        [Column("duration_minutes")]
        public int DurationMinutes { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("is_manual")]
        public bool IsManual { get; set; }
    }
}
