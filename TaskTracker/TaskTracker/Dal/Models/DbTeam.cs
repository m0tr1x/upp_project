using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace TaskTracker.Dal.Models;

[Table("teams")]
public class DbTeam : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("owner_id")]
    public int OwnerId { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}
