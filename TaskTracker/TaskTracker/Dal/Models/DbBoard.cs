using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.ComponentModel.DataAnnotations;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace TaskTracker.Dal.Models;

[Table("boards")]
public class DbBoard : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("name"), Required]
    public required string Name { get; set; }

    [Column("project_id")]
    public int ProjectId { get; set; }

    [Column("is_default")]
    public bool IsDefault { get; set; }

    [Column("columns")]
    public required string Columns { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
