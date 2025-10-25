using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace TaskTracker.Dal.Models;

[Table("teammates")]
public class DbTeammate : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("team_id")]
    public int TeamId { get; set; }

    [Column("joined_at")]
    public DateTime JoinedAt { get; set; }
}
