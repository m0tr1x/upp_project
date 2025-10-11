using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.ComponentModel.DataAnnotations;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;


namespace TaskTracker.Models
{
    [Table("boards")]
    public class Board : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("name"), Required]
        public string Name { get; set; } = null!;

        [Column("project_id")]
        public int ProjectId { get; set; }

        [Column("is_default")]
        public bool IsDefault { get; set; }

        [Column("columns")]
        public string Columns { get; set; } = "[]"; // JSON хранится строкой

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
