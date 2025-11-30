using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace TaskTracker.Dal.Models;

[Table("users")]
public class DbUser : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = null!;

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; }

    [Column("delete_at")]
    public DateTimeOffset? DeleteAt { get; set; }
}
