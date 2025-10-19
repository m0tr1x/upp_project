namespace TaskTracker.Bll.Models;

public class Board
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public int ProjectId { get; set; }

    public bool IsDefault { get; set; }

    public required string Columns { get; set; }

    public DateTime CreatedAt { get; set; }
}