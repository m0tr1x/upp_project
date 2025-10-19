using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TaskTracker.Dal.Models;

[Table("roles")]
public class DbRole : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("name")]
    public int Name { get; set; }

    [Column("description")]
    public string? Description { get; set; }
}