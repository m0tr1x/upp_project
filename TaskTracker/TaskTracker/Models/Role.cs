using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace TaskTracker.Models
{
    [Table("roles")]
    public class Role : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("name")]
        public RoleName Name { get; set; } = RoleName.Member; // Admin, Member, Viewer

        [Column("description")]
        public string? Description { get; set; }
    }
}
public enum RoleName
{
    Admin,
    Member,
    Viewer
}
